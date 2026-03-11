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

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
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
    batch_size: int = 32
    encoder_lr: float = 2e-5
    head_lr: float = 1e-4
    warmup_steps: int = 500
    patience: int = 3
    jsonl_path: Optional[str] = None


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
# Resume AI analysis (Gemini)
# ---------------------------------------------------------------------------

@app.post("/analyze-resume")
async def analyze_resume_text(text: str):
    if gemini_analyzer and gemini_analyzer.is_available():
        result = await gemini_analyzer.analyze_resume_text(text)
    else:
        parsed = resume_parser.parse_text(text)
        result = parsed.to_dict()
    return {"success": True, "data": result}


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
            result = parsed.to_dict()

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
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            cwd=str(Path(__file__).parents[1]),
            text=True,
        )
        return {
            "success": True,
            "message": "Training started",
            "pid": proc.pid,
            "run_id": run_id,
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


@app.get("/train/history")
async def training_history():
    if not db_available:
        return {"history": []}
    from database.db import get_training_history
    return {"history": get_training_history(limit=10)}


# ---------------------------------------------------------------------------
# Evaluation
# ---------------------------------------------------------------------------

@app.post("/evaluate")
async def trigger_evaluation(
    jsonl_path: Optional[str] = Query(None),
    split: str = Query("test"),
):
    """Run evaluation and return metrics."""
    cmd = [
        sys.executable,
        str(Path(__file__).parents[1] / "training" / "evaluate.py"),
        "--split", split,
        "--output", str(CHECKPOINT_DIR / "metrics.json"),
    ]
    if jsonl_path:
        cmd += ["--jsonl", jsonl_path, "--no-db"]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
            cwd=str(Path(__file__).parents[1]),
        )
        metrics_path = CHECKPOINT_DIR / "metrics.json"
        if metrics_path.exists():
            with open(metrics_path) as f:
                return {"success": True, "metrics": json.load(f)}
        return {"success": False, "stdout": result.stdout, "stderr": result.stderr}
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Evaluation timed out")
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/evaluate/metrics")
async def get_latest_metrics():
    metrics_path = CHECKPOINT_DIR / "metrics.json"
    if not metrics_path.exists():
        return {"metrics": None, "message": "No evaluation run yet. POST /evaluate first."}
    with open(metrics_path) as f:
        return {"metrics": json.load(f)}


# ---------------------------------------------------------------------------
# Data pipeline
# ---------------------------------------------------------------------------

@app.post("/pipeline/run")
async def run_pipeline(stage: str = Query("full")):
    """Trigger a data pipeline run."""
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
                "--limit", "5000",
                "--output", str(Path(__file__).parents[1] / "data" / "labeled" / "synthetic_pairs.jsonl"),
            ]
            subprocess.Popen(cmd, cwd=str(Path(__file__).parents[1]))
        except Exception as e:
            print(f"[WARN] Pipeline: {e}")

    return {
        "success": True,
        "stage": stage,
        "run_id": run_id,
        "message": f"Pipeline stage '{stage}' started",
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
