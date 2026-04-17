"""
PH Job Matcher API — v2
Siamese Bi-Encoder + Cross-Encoder architecture
PostgreSQL + pgvector backend
FastAPI + uvicorn
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path
from typing import List, Optional

sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, File, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from config.settings import settings
from models.cross_encoder import PHJobCrossEncoder, CHECKPOINT_DIR
from models.bi_encoder import PHJobBiEncoder
from models.text_formatter import format_resume, format_job, verdict_from_confidence
from models.resume_parser import ResumeParser, ParsedResume
from pipeline.normalizers.skill_normalizer import SkillNormalizer
from services.gemini_analyzer import GeminiResumeAnalyzer
from services.linkedin_scraper import LinkedInScraper

# ---------------------------------------------------------------------------
# App init
# ---------------------------------------------------------------------------

app = FastAPI(
    title="PH Job Matcher AI v2",
    description="Siamese Bi-Encoder + Cross-Encoder resume-to-job matching for the Philippines",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global instances
# ---------------------------------------------------------------------------

cross_encoder: Optional[PHJobCrossEncoder] = None
bi_encoder: Optional[PHJobBiEncoder] = None
resume_parser: Optional[ResumeParser] = None
skill_normalizer: Optional[SkillNormalizer] = None
gemini_analyzer: Optional[GeminiResumeAnalyzer] = None
linkedin_scraper: Optional[LinkedInScraper] = None
db_available: bool = False


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class MatchRequest(BaseModel):
    resume: dict  # {skills, experience_yrs, education, certifications, industry, region}
    job_id: Optional[str] = None
    job: Optional[dict] = None  # Direct job dict if no job_id
    city: Optional[str] = None
    target_industry: Optional[str] = None
    limit: int = 20
    linkedin_url: Optional[str] = None


class MatchResponse(BaseModel):
    confidence: float
    skill_match: List[str]
    skill_gaps: List[str]
    verdict: str  # 'Strong Match' | 'Partial Match' | 'Low Match'
    job_title: Optional[str] = None
    company: Optional[str] = None


class BulkMatchRequest(BaseModel):
    resume: dict
    city: Optional[str] = None
    target_industry: Optional[str] = None
    limit: int = 20
    linkedin_url: Optional[str] = None


class TrainingConfig(BaseModel):
    epochs: int = 10
    batch_size: int = 16
    encoder_lr: float = 2e-5
    head_lr: float = 1e-4
    warmup_steps: int = 500
    patience: int = 3
    jsonl_path: Optional[str] = None
    use_deepseek_judge: bool = False
    deepseek_epoch_sample: int = 30
    deepseek_bias_alpha: float = 0.25
    deepseek_model: str = "deepseek-r1:7b"
    # Fresh training options
    fresh: bool = False
    confidence_ceiling: float = 0.75
    baseline_confidence: float = 0.60
    # Embedding auxiliary loss (bi-encoder cosine similarity regularization)
    embed_aux_weight: float = 0.10


class FeedbackRequest(BaseModel):
    resume_id: Optional[str] = None
    job_id: Optional[str] = None
    was_successful: bool
    feedback_type: str = "application"


class LinkedInRequest(BaseModel):
    linkedin_url: str


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    global cross_encoder, bi_encoder, resume_parser, skill_normalizer
    global gemini_analyzer, linkedin_scraper, db_available

    print("[Startup] Initializing PH Job Matcher v2...")

    # Skill normalizer (always available)
    try:
        skill_normalizer = SkillNormalizer()
        print("[OK] Skill normalizer initialized")
    except Exception as e:
        print(f"[WARN] Skill normalizer: {e}")

    # Resume parser (original — kept for compatibility)
    try:
        resume_parser = ResumeParser()
        print("[OK] Resume parser initialized")
    except Exception as e:
        print(f"[WARN] Resume parser: {e}")

    # Cross-Encoder (load checkpoint if available)
    try:
        checkpoint = CHECKPOINT_DIR / "cross_encoder.pt"
        if checkpoint.exists():
            cross_encoder = PHJobCrossEncoder.load(checkpoint)
            print(f"[OK] Cross-Encoder loaded from {checkpoint}")
        else:
            cross_encoder = PHJobCrossEncoder()
            print("[INFO] Cross-Encoder initialized (no checkpoint — run /train first)")
    except Exception as e:
        print(f"[WARN] Cross-Encoder: {e}")

    # Bi-Encoder
    try:
        bi_checkpoint = CHECKPOINT_DIR / "bi_encoder.pt"
        if bi_checkpoint.exists():
            bi_encoder = PHJobBiEncoder.load(bi_checkpoint)
        else:
            bi_encoder = PHJobBiEncoder()
        print("[OK] Bi-Encoder initialized")
    except Exception as e:
        print(f"[WARN] Bi-Encoder: {e}")

    # PostgreSQL
    try:
        from database.db import ping
        db_available = ping()
        if db_available:
            print("[OK] PostgreSQL connected")
        else:
            print("[WARN] PostgreSQL not reachable — set DATABASE_URL in .env.local")
    except Exception as e:
        print(f"[WARN] PostgreSQL: {e}")

    # Gemini
    if settings.GEMINI_API_KEY:
        try:
            gemini_analyzer = GeminiResumeAnalyzer(settings.GEMINI_API_KEY)
            print("[OK] Gemini analyzer initialized")
        except Exception as e:
            print(f"[WARN] Gemini: {e}")

    # LinkedIn scraper
    if settings.APIFY_API_KEY:
        try:
            linkedin_scraper = LinkedInScraper(settings.APIFY_API_KEY)
            print("[OK] LinkedIn scraper initialized")
        except Exception as e:
            print(f"[WARN] LinkedIn scraper: {e}")

    print("[Startup] Done.")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    checkpoint = CHECKPOINT_DIR / "cross_encoder.pt"
    return {
        "status": "healthy",
        "version": "2.0.0",
        "model": "PHJobCrossEncoder (paraphrase-multilingual-MiniLM-L12-v2)",
        "checkpoint_exists": checkpoint.exists(),
        "db_connected": db_available,
        "gemini_available": gemini_analyzer is not None,
        "linkedin_available": linkedin_scraper is not None,
        "timestamp": datetime.now().isoformat(),
    }


# ---------------------------------------------------------------------------
# Model info
# ---------------------------------------------------------------------------

@app.get("/model-info")
async def model_info():
    checkpoint = CHECKPOINT_DIR / "cross_encoder.pt"
    metrics_path = CHECKPOINT_DIR / "metrics.json"
    training_path = CHECKPOINT_DIR / "training_metrics.json"

    latest_metrics = {}
    if metrics_path.exists():
        with open(metrics_path) as f:
            latest_metrics = json.load(f)

    training_metrics = {}
    if training_path.exists():
        with open(training_path) as f:
            training_metrics = json.load(f)

    latest_run = None
    if db_available:
        try:
            from database.db import get_latest_training_run
            latest_run = get_latest_training_run()
        except Exception:
            pass

    return {
        "architecture": "Siamese Bi-Encoder + Cross-Encoder Reranker",
        "base_model": settings.BI_ENCODER_BASE,
        "embedding_dim": 384,
        "projection_dim": 128,
        "checkpoint": str(checkpoint),
        "checkpoint_exists": checkpoint.exists(),
        "evaluation_metrics": latest_metrics,
        "training_metrics": training_metrics,
        "latest_training_run": latest_run,
    }


# ---------------------------------------------------------------------------
# Resume parsing
# ---------------------------------------------------------------------------

@app.post("/parse-resume")
async def parse_resume_file(file: UploadFile = File(...)):
    allowed = {".pdf", ".docx", ".txt"}
    ext = Path(file.filename or "resume.txt").suffix.lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type. Allowed: {', '.join(allowed)}")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        parsed = resume_parser.parse(tmp_path)
        os.unlink(tmp_path)
        return {"success": True, "data": parsed.to_dict()}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.post("/parse-resume-text")
async def parse_resume_text_endpoint(text: str):
    try:
        parsed = resume_parser.parse_text(text)
        return {"success": True, "data": parsed.to_dict()}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------------------------------------------------------
# Core matching
# ---------------------------------------------------------------------------

@app.post("/match", response_model=MatchResponse)
async def match_single(request: MatchRequest):
    """Match a resume against a specific job dict or job_id."""
    if cross_encoder is None:
        raise HTTPException(503, "Model not initialized")

    # Resolve job
    job = request.job
    if job is None and request.job_id and db_available:
        try:
            from database.db import get_jobs
            jobs = get_jobs(limit=1)
            job = jobs[0] if jobs else None
        except Exception:
            pass
    if job is None:
        raise HTTPException(400, "Provide either job_id or job dict")

    resume = request.resume
    resume_text = format_resume(resume)
    job_text = format_job(job)

    confidence = cross_encoder.score(resume_text, job_text)

    # LinkedIn boost
    if request.linkedin_url and linkedin_scraper:
        try:
            boost = await linkedin_scraper.get_confidence_boost(request.linkedin_url)
            confidence = min(1.0, confidence + boost * 0.15)
        except Exception:
            pass

    resume_skills = set(s.lower() for s in resume.get("skills", []))
    job_skills = list(job.get("required_skills", []))
    skill_match = [s for s in job_skills if s.lower() in resume_skills]
    skill_gaps = [s for s in job_skills if s.lower() not in resume_skills]

    return MatchResponse(
        confidence=round(confidence, 3),
        skill_match=skill_match,
        skill_gaps=skill_gaps,
        verdict=verdict_from_confidence(confidence),
        job_title=job.get("title"),
        company=job.get("company"),
    )


@app.post("/match-bulk")
async def match_bulk(request: BulkMatchRequest):
    """Match a resume against multiple jobs from the database."""
    if cross_encoder is None:
        raise HTTPException(503, "Model not initialized")

    resume = request.resume
    resume_text = format_resume(resume)

    # Get jobs from DB or use synthetic fallback
    jobs = []
    if db_available:
        try:
            from database.db import get_jobs, vector_search_jobs
            # Try vector search first if bi-encoder available
            if bi_encoder is not None:
                import torch
                emb = bi_encoder.encode_texts_384([resume_text])
                emb_list = emb[0].tolist()
                jobs = vector_search_jobs(emb_list, limit=request.limit * 2)
            else:
                jobs = get_jobs(
                    industry=request.target_industry,
                    region=request.city,
                    limit=request.limit * 2,
                )
        except Exception as e:
            print(f"[WARN] DB query: {e}")

    if not jobs:
        raise HTTPException(503, "No jobs available. Run /pipeline/run to fetch data.")

    # Rerank with cross-encoder
    resume_texts = [resume_text] * len(jobs)
    job_texts = [format_job(j) for j in jobs]
    scores = cross_encoder.score_batch(resume_texts, job_texts)

    results = []
    resume_skills = set(s.lower() for s in resume.get("skills", []))
    for job, score in sorted(zip(jobs, scores), key=lambda x: x[1], reverse=True)[:request.limit]:
        job_skills = job.get("required_skills") or []
        if isinstance(job_skills, str):
            job_skills = json.loads(job_skills)
        results.append({
            "job": {
                "id": str(job.get("id", "")),
                "title": job.get("title", ""),
                "company": job.get("company", ""),
                "location": job.get("location", ""),
                "industry": job.get("industry", ""),
                "required_skills": job_skills,
                "min_experience": job.get("min_experience", 0),
                "source_url": job.get("source_url", ""),
            },
            "confidence": round(score, 3),
            "skill_match": [s for s in job_skills if s.lower() in resume_skills],
            "skill_gaps": [s for s in job_skills if s.lower() not in resume_skills],
            "verdict": verdict_from_confidence(score),
        })

    return {"matches": results, "total": len(results)}


@app.post("/match-resume")
async def match_resume_upload(
    file: UploadFile = File(...),
    city: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    limit: int = Query(20),
):
    """Upload resume file → parse → bulk match. One-step endpoint."""
    allowed = {".pdf", ".docx", ".txt"}
    ext = Path(file.filename or "resume.txt").suffix.lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        parsed = resume_parser.parse(tmp_path)
        os.unlink(tmp_path)

        resume_dict = parsed.to_dict()
        req = BulkMatchRequest(
            resume=resume_dict,
            city=city,
            target_industry=industry,
            limit=limit,
        )
        return await match_bulk(req)
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------------------------------------------------------
# Resume AI analysis (Gemini / DeepSeek fallback)
# ---------------------------------------------------------------------------

_INDUSTRY_LIST = [
    "Technology", "Finance", "Healthcare", "Retail", "Manufacturing",
    "Education", "Marketing", "Consulting", "BPO", "Engineering",
    "Hospitality", "Legal", "Human Resources", "Administrative",
    "Fine Arts & Design"
]


def _analyze_resume_with_deepseek(resume_text: str) -> dict:
    """
    Use DeepSeek-r1 (via Ollama) to extract skills, keywords, and industry
    from resume text. Returns the same shape as GeminiResumeAnalyzer.
    Falls back to rule-based parser if Ollama is unavailable.
    """
    import requests as _req
    import json as _json

    text_excerpt = resume_text[:3000]
    prompt = f"""You are an expert Filipino HR recruiter and resume analyst.

Analyze this resume and extract structured information.

Resume text:
\"\"\"
{text_excerpt}
\"\"\"

Reply ONLY with valid JSON matching this exact structure (no extra text):
{{
  "detected_skills": ["skill1", "skill2"],
  "detected_industry": "Technology",
  "industry_confidence": 85,
  "suggested_industries": [{{"industry": "Finance", "confidence": 60}}],
  "experience_years": 3,
  "education_level": "Bachelor",
  "certifications": [],
  "search_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}

Rules:
- detected_skills: up to 20 technical and soft skills, lowercase, no duplicates
- detected_industry: must be exactly one of: {", ".join(_INDUSTRY_LIST)}
- industry_confidence: 0-100
- experience_years: total years of work experience as a number
- search_keywords: 5 optimal job search keywords for this resume
- Include PH credentials (PRC, TESDA, BAR, LET, CPA) in certifications if found"""

    try:
        resp = _req.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "deepseek-r1:7b",
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 400},
            },
            timeout=60,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")
        # Strip chain-of-thought
        think_end = raw.find("</think>")
        if think_end >= 0:
            raw = raw[think_end + 8:]
        start = raw.find("{")
        end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            result = _json.loads(raw[start:end])
            if result.get("detected_industry") not in _INDUSTRY_LIST:
                result["detected_industry"] = "Technology"
            result.setdefault("detected_skills", [])
            result.setdefault("industry_confidence", 70)
            result.setdefault("suggested_industries", [])
            result.setdefault("experience_years", 0)
            result.setdefault("certifications", [])
            result.setdefault("search_keywords", [])
            print(
                f"[DeepSeek Resume] {result['detected_industry']} "
                f"({result['industry_confidence']}%) | "
                f"Skills: {len(result['detected_skills'])} | "
                f"Keywords: {result['search_keywords']}",
                flush=True,
            )
            return result
    except Exception as e:
        print(f"[DeepSeek Resume] Fallback to rule-based: {e}", flush=True)

    parsed = resume_parser.parse_text(resume_text)
    return parsed.to_dict()


@app.post("/analyze-resume")
async def analyze_resume_text(text: str):
    if gemini_analyzer and gemini_analyzer.is_available():
        result = await gemini_analyzer.analyze_resume_text(text)
    else:
        import asyncio
        result = await asyncio.get_event_loop().run_in_executor(
            None, _analyze_resume_with_deepseek, text
        )
    return {"success": True, "data": result}


@app.post("/analyze-resume-deepseek")
async def analyze_resume_deepseek(request: Request):
    """Explicit DeepSeek-powered resume analysis endpoint."""
    body = await request.json()
    text = body.get("resume_text", "")
    if not text:
        raise HTTPException(400, "resume_text required")
    import asyncio
    result = await asyncio.get_event_loop().run_in_executor(
        None, _analyze_resume_with_deepseek, text
    )
    return {"success": True, "data": result, "analyzer": "deepseek-r1:7b"}


@app.post("/analyze-resume-file")
async def analyze_resume_file(file: UploadFile = File(...)):
    allowed = {".pdf", ".docx", ".txt"}
    ext = Path(file.filename or "resume.txt").suffix.lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        if gemini_analyzer and gemini_analyzer.is_available():
            result = await gemini_analyzer.analyze_resume_file(tmp_path)
        else:
            parsed = resume_parser.parse(tmp_path)
            extracted_text = getattr(parsed, "raw_text", "") or str(parsed.to_dict())
            import asyncio
            result = await asyncio.get_event_loop().run_in_executor(
                None, _analyze_resume_with_deepseek, extracted_text
            )
            result["extracted_text"] = extracted_text

        os.unlink(tmp_path)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/gemini-status")
async def gemini_status():
    return {
        "available": gemini_analyzer is not None and gemini_analyzer.is_available(),
        "model": "gemini-2.0-flash",
    }


# ---------------------------------------------------------------------------
# LinkedIn
# ---------------------------------------------------------------------------

@app.post("/scrape-linkedin")
async def scrape_linkedin(request: LinkedInRequest):
    if not linkedin_scraper:
        raise HTTPException(503, "LinkedIn scraper not configured")
    try:
        data = await linkedin_scraper.scrape_profile(request.linkedin_url)
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/linkedin-status")
async def linkedin_status():
    return {"available": linkedin_scraper is not None}


# ---------------------------------------------------------------------------
# Jobs CRUD
# ---------------------------------------------------------------------------

@app.get("/jobs")
async def list_jobs(
    city: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    limit: int = Query(50),
):
    if not db_available:
        raise HTTPException(503, "Database not connected")
    from database.db import get_jobs
    jobs = get_jobs(industry=industry, region=city, limit=limit)
    return {"jobs": jobs, "total": len(jobs)}


@app.get("/industries")
async def list_industries():
    from data.synthetic.combinatorial_generator import INDUSTRY_MATRIX
    return {"industries": list(INDUSTRY_MATRIX.keys())}


@app.get("/cities")
async def list_cities():
    return {"cities": settings.PHILIPPINE_CITIES}


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    if not db_available:
        return {"success": False, "message": "Database not connected"}
    try:
        from database.db import insert_feedback
        fb_id = insert_feedback(
            resume_id=request.resume_id or "",
            job_id=request.job_id or "",
            was_successful=request.was_successful,
            feedback_type=request.feedback_type,
        )
        return {"success": True, "feedback_id": fb_id}
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------------------------------------------------------------------
# Training
# ---------------------------------------------------------------------------

@app.post("/train")
async def trigger_training(config: TrainingConfig):
    """Trigger model training. Runs as background subprocess."""
    cmd = [
        sys.executable,
        str(Path(__file__).parents[1] / "training" / "train.py"),
        "--epochs", str(config.epochs),
        "--batch-size", str(config.batch_size),
        "--encoder-lr", str(config.encoder_lr),
        "--head-lr", str(config.head_lr),
        "--warmup-steps", str(config.warmup_steps),
        "--patience", str(config.patience),
    ]

    if config.jsonl_path:
        cmd += ["--jsonl", config.jsonl_path, "--no-db"]

    if config.use_deepseek_judge:
        cmd += [
            "--use-deepseek-judge",
            "--deepseek-epoch-sample", str(config.deepseek_epoch_sample),
            "--deepseek-bias-alpha", str(config.deepseek_bias_alpha),
            "--deepseek-model", config.deepseek_model,
        ]

    if config.fresh:
        cmd += [
            "--fresh",
            "--confidence-ceiling", str(config.confidence_ceiling),
            "--baseline-confidence", str(config.baseline_confidence),
        ]

    cmd += ["--embed-aux-weight", str(config.embed_aux_weight)]

    run_id = None
    if db_available:
        try:
            from database.db import start_training_run
            run_id = start_training_run(
                epochs=config.epochs,
                batch_size=config.batch_size,
                learning_rate=config.encoder_lr,
            )
        except Exception:
            pass

    try:
        log_path = CHECKPOINT_DIR / "train.log"
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_file = open(log_path, "w", encoding="utf-8", buffering=1)
        proc = subprocess.Popen(
            cmd,
            stdout=log_file,
            stderr=log_file,
            cwd=str(Path(__file__).parents[1]),
            text=True,
        )
        return {
            "success": True,
            "message": "Training started",
            "pid": proc.pid,
            "run_id": run_id,
            "log": str(log_path),
            "config": config.dict(),
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to start training: {e}")


@app.get("/train/status")
async def training_status():
    """Get latest training run status."""
    metrics_path = CHECKPOINT_DIR / "training_metrics.json"
    latest = {}
    if metrics_path.exists():
        with open(metrics_path) as f:
            latest = json.load(f)

    latest_run = None
    if db_available:
        try:
            from database.db import get_latest_training_run
            latest_run = get_latest_training_run()
        except Exception:
            pass

    return {"latest_metrics": latest, "latest_run": latest_run}


@app.get("/train/logs")
async def get_train_logs(tail: int = Query(200)):
    """Return the last N lines of the training log file."""
    log_path = CHECKPOINT_DIR / "train.log"
    if not log_path.exists():
        return {"lines": [], "exists": False, "size": 0}
    with open(log_path, encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return {
        "lines": [l.rstrip() for l in lines[-tail:]],
        "exists": True,
        "size": len(lines),
    }


@app.get("/pipeline/logs")
async def get_pipeline_logs(tail: int = Query(200)):
    """Return the last N lines of the pipeline/DeepSeek log file."""
    log_path = CHECKPOINT_DIR / "pipeline.log"
    if not log_path.exists():
        return {"lines": [], "exists": False, "size": 0}
    with open(log_path, encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return {
        "lines": [l.rstrip() for l in lines[-tail:]],
        "exists": True,
        "size": len(lines),
    }


@app.get("/train/history")
async def training_history():
    if not db_available:
        return {"history": []}
    from database.db import get_training_history
    return {"history": get_training_history(limit=10)}


@app.post("/build-dataset")
async def build_dataset_endpoint(
    use_embed: bool = Query(True, description="Use sentence-transformer embeddings to label pairs (fast, no API key)"),
    use_ollama: bool = Query(False, description="Use Ollama LLM ensemble instead of embeddings (slow)"),
    ollama_limit: int = Query(2000, description="Max pairs to label with Ollama per dataset"),
):
    """
    Build unified training dataset from all CSV/JSONL sources under python_ai/datasets/.

    Labeling priority: embed_labeler (default, GPU-batched) > ollama_ensemble > rule-based.
    Runs dataset_builder.py as a background subprocess. Logs to build_dataset.log.
    """
    log_path = CHECKPOINT_DIR / "build_dataset.log"
    log_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        sys.executable,
        str(Path(__file__).parents[1] / "training" / "dataset_builder.py"),
        "--ollama-limit", str(ollama_limit),
    ]
    if use_ollama:
        cmd.append("--use-ollama")
    elif not use_embed:
        cmd.append("--no-embed")

    try:
        log_file = open(log_path, "w", encoding="utf-8", buffering=1)
        proc = subprocess.Popen(
            cmd,
            stdout=log_file,
            stderr=log_file,
            cwd=str(Path(__file__).parents[1]),
            text=True,
        )
        return {
            "success": True,
            "message": "Dataset builder started",
            "pid": proc.pid,
            "log": str(log_path),
            "labeling_mode": "ollama" if use_ollama else ("embed" if use_embed else "rules"),
            "ollama_limit": ollama_limit,
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to start dataset builder: {e}")


@app.get("/build-dataset/logs")
async def get_build_dataset_logs(tail: int = Query(200)):
    """Return the last N lines of the dataset builder log."""
    log_path = CHECKPOINT_DIR / "build_dataset.log"
    if not log_path.exists():
        return {"lines": [], "exists": False, "size": 0}
    with open(log_path, encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return {
        "lines": [l.rstrip() for l in lines[-tail:]],
        "exists": True,
        "size": len(lines),
    }


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

@app.post("/evaluate")
async def trigger_evaluation(
    jsonl_path: Optional[str] = Query(None),
    split: str = Query("test"),
    use_deepseek: bool = Query(False, description="Use DeepSeek as independent judge"),
    deepseek_sample: int = Query(100, description="Number of pairs to judge with DeepSeek"),
    deepseek_model: str = Query("deepseek-r1:7b"),
):
    """
    Launch evaluation as a background subprocess writing to evaluate.log.
    Returns immediately with {launched: true}. Poll /evaluate/logs for progress,
    then GET /evaluate/metrics when 'Metrics saved' appears in the log.
    """
    eval_log_path = CHECKPOINT_DIR / "evaluate.log"
    cmd = [
        sys.executable,
        str(Path(__file__).parents[1] / "training" / "evaluate.py"),
        "--split", split,
        "--output", str(CHECKPOINT_DIR / "metrics.json"),
        "--log", str(eval_log_path),
    ]
    if jsonl_path:
        cmd += ["--jsonl", jsonl_path, "--no-db"]
    if use_deepseek:
        cmd += ["--use-deepseek", "--deepseek-sample", str(deepseek_sample),
                "--deepseek-model", deepseek_model]

    try:
        eval_log_path.parent.mkdir(parents=True, exist_ok=True)
        # Clear old log
        eval_log_path.write_text("", encoding="utf-8")
        subprocess.Popen(
            cmd,
            cwd=str(Path(__file__).parents[1]),
            # stdout/stderr go to the --log file via evaluate.py's own redirect
            stdout=subprocess.DEVNULL,
            stderr=open(eval_log_path, "a", encoding="utf-8", buffering=1),
        )
        return {
            "launched": True,
            "use_deepseek": use_deepseek,
            "deepseek_sample": deepseek_sample if use_deepseek else 0,
            "message": "Evaluation started — poll /evaluate/logs for progress",
        }
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/evaluate/metrics")
async def get_latest_metrics():
    metrics_path = CHECKPOINT_DIR / "metrics.json"
    if not metrics_path.exists():
        return {"metrics": None, "message": "No evaluation run yet. POST /evaluate first."}
    with open(metrics_path) as f:
        return {"metrics": json.load(f)}


@app.get("/evaluate/logs")
async def get_evaluate_logs(tail: int = Query(300)):
    """Return the last N lines of the evaluate.log file."""
    log_path = CHECKPOINT_DIR / "evaluate.log"
    if not log_path.exists():
        return {"lines": [], "exists": False, "size": 0}
    with open(log_path, encoding="utf-8", errors="replace") as f:
        lines = f.readlines()
    return {
        "lines": [l.rstrip() for l in lines[-tail:]],
        "exists": True,
        "size": len(lines),
    }


@app.post("/evaluate/analyze")
async def analyze_metrics_with_deepseek():
    """Send evaluation metrics to DeepSeek for a plain-English interpretation."""
    metrics_path = CHECKPOINT_DIR / "metrics.json"
    if not metrics_path.exists():
        raise HTTPException(404, "No evaluation metrics found. Run /evaluate first.")
    with open(metrics_path) as f:
        m = json.load(f)

    targets_met = m.get('targets_met', {})
    n_met = sum(targets_met.values())
    n_total = len(targets_met)
    dj = m.get("deepseek_judge", {})
    judge_line = ""
    if dj and not dj.get("error"):
        judge_line = (
            f"\n- DeepSeek Judge (independent): model vs DeepSeek Pearson={dj.get('model_vs_deepseek', {}).get('pearson', '?')}, "
            f"label bias={dj.get('label_bias', {}).get('direction', '?')}"
        )

    prompt = f"""You are an AI evaluation expert for a Philippine job-matching system.

Evaluation results ({m.get('n_pairs', '?')} resume-job pairs):
- Pearson: {m.get('pearson', 0):.4f} (target >0.80) — {'PASS' if m.get('pearson', 0) > 0.80 else 'FAIL'}
- RMSE: {m.get('rmse', 1):.4f} (target <0.12) — {'PASS' if m.get('rmse', 1) < 0.12 else 'FAIL'}
- NDCG@10: {m.get('ndcg_at_10', 0):.4f} (target >0.75) — {'PASS' if m.get('ndcg_at_10', 0) > 0.75 else 'FAIL'}
- Precision@5: {m.get('precision_at_5', 0):.4f} (target >0.70) — {'PASS' if m.get('precision_at_5', 0) > 0.70 else 'FAIL'}
- Targets met: {n_met}/{n_total}{judge_line}

Write 3-5 sentences explaining: overall quality, strongest metric, weakest metric, and one specific action to improve. Use plain language for a non-technical audience. Write directly without any headers or labels."""

    try:
        import requests as req
        resp = req.post(
            "http://localhost:11434/api/generate",
            json={"model": "deepseek-r1:7b", "prompt": prompt, "stream": False,
                  "options": {"temperature": 0.2, "num_predict": 500}},
            timeout=120,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")

        # Split <think> reasoning from final answer
        think_start = raw.find("<think>")
        think_end = raw.find("</think>")
        reasoning = ""
        answer = ""

        if think_start >= 0 and think_end > think_start:
            reasoning = raw[think_start + 7:think_end].strip()
            answer = raw[think_end + 8:].strip()

        # Strip any stray section headers DeepSeek emits (ANALYSIS:, **ANALYSIS**, etc.)
        import re as _re
        answer = _re.sub(r"^[\*_]*ANALYSIS[\*_]*:?\s*", "", answer, flags=_re.IGNORECASE).strip()

        # If answer is empty or very short, extract the best paragraph from <think>
        if len(answer) < 40:
            # Find the final substantive paragraph in the reasoning
            paragraphs = [p.strip() for p in reasoning.split("\n\n") if len(p.strip()) > 60]
            if paragraphs:
                # Use the last paragraph that doesn't start with "Let me" / "I need to"
                for p in reversed(paragraphs):
                    if not _re.match(r"^(let me|i need|i should|i will|first|okay|so,)", p, _re.IGNORECASE):
                        answer = p
                        break
                if not answer:
                    answer = paragraphs[-1]
            else:
                answer = reasoning[:600] if reasoning else "DeepSeek returned an empty response."

        return {"analysis": answer, "reasoning": reasoning, "model": "deepseek-r1:7b"}
    except Exception as e:
        raise HTTPException(503, f"DeepSeek unavailable: {e}")


# ---------------------------------------------------------------------------
# Data pipeline
# ---------------------------------------------------------------------------

@app.get("/pipeline/ollama-status")
async def ollama_status():
    """Check if Ollama + DeepSeek is available for LLM labeling."""
    try:
        import requests as req
        resp = req.get("http://localhost:11434/api/tags", timeout=3)
        if resp.status_code == 200:
            models = [m["name"] for m in resp.json().get("models", [])]
            deepseek = [m for m in models if "deepseek" in m.lower()]
            return {"available": True, "models": models, "deepseek_models": deepseek}
    except Exception:
        pass
    return {"available": False, "models": [], "deepseek_models": []}


@app.post("/pipeline/run")
async def run_pipeline(
    stage: str = Query("full"),
    use_llm: bool = Query(False),
    llm_model: str = Query("deepseek-r1:7b"),
    pairs_limit: int = Query(5000, description="Max pairs to generate"),
):
    """Trigger a data pipeline run. Set use_llm=true to label with DeepSeek."""
    valid_stages = {"full", "ingestion", "parsing", "normalization", "labeling", "storage"}
    if stage not in valid_stages:
        raise HTTPException(400, f"Invalid stage. Valid: {valid_stages}")

    run_id = None
    if db_available:
        try:
            from database.db import start_pipeline_run
            run_id = start_pipeline_run(stage)
        except Exception:
            pass

    # For 'full' pipeline: generate synthetic data and store
    if stage in ("full", "storage"):
        try:
            cmd = [
                sys.executable,
                str(Path(__file__).parents[1] / "data" / "synthetic" / "combinatorial_generator.py"),
                "--limit", str(pairs_limit),
                "--output", str(Path(__file__).parents[1] / "data" / "labeled" / "synthetic_pairs.jsonl"),
            ]
            if use_llm:
                cmd += ["--use-llm", "--llm-model", llm_model]
            log_path = CHECKPOINT_DIR / "pipeline.log"
            log_path.parent.mkdir(parents=True, exist_ok=True)
            log_file = open(log_path, "w", encoding="utf-8", buffering=1)
            subprocess.Popen(cmd, stdout=log_file, stderr=log_file, cwd=str(Path(__file__).parents[1]), text=True)
        except Exception as e:
            print(f"[WARN] Pipeline: {e}")

    return {
        "success": True,
        "stage": stage,
        "run_id": run_id,
        "pairs_limit": pairs_limit,
        "message": f"Pipeline stage '{stage}' started (limit={pairs_limit} pairs)",
    }


@app.get("/pipeline/status")
async def pipeline_status():
    if not db_available:
        return {
            "db_connected": False,
            "message": "DATABASE_URL not configured",
        }
    from database.db import get_pipeline_status
    return get_pipeline_status()


# ---------------------------------------------------------------------------
# Admin (legacy compat)
# ---------------------------------------------------------------------------

@app.post("/refresh-jobs")
async def refresh_jobs():
    """Legacy endpoint — triggers pipeline ingestion."""
    return await run_pipeline(stage="ingestion")
