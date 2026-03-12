"""
LLM-based labeler using a local Ollama instance (Mistral / LLaMA 3.2).
Falls back to rule-based Jaccard labeling if Ollama is unavailable.

Install Ollama: https://ollama.com
Pull model:     ollama pull mistral
"""
from __future__ import annotations

import json
import sys
import time
from typing import Dict, List, Optional, Tuple

import requests

from pipeline.labeling.rule_labeler import label_pair as rule_label_pair

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"  # or 'llama3.2', 'deepseek-r1'
OLLAMA_TIMEOUT = 30
MAX_RETRIES = 3


def _is_ollama_available() -> bool:
    try:
        resp = requests.get("http://localhost:11434/api/tags", timeout=5)
        return resp.status_code == 200
    except Exception:
        return False


def _build_prompt(resume: dict, job: dict) -> str:
    return f"""You are a Filipino HR expert evaluating candidate-job fit.

Resume:
- Skills: {", ".join(resume.get("skills", [])[:20])}
- Experience: {resume.get("experience_yrs", 0)} years
- Education: {resume.get("education", {}).get("degree", "Not specified")}
- Certifications: {", ".join(resume.get("certifications", []))}
- Industry: {resume.get("industry", "Not specified")}

Job:
- Title: {job.get("title", "")}
- Required Skills: {", ".join(job.get("required_skills", [])[:20])}
- Min Experience: {job.get("min_experience", 0)} years
- Industry: {job.get("industry", "")}

Rate how well this candidate matches the job on a scale of 0.0 to 1.0.
Consider PH-specific credentials (PRC, TESDA, BAR, STCW) as strong positives.

Respond ONLY with valid JSON:
{{"confidence": 0.0, "reasoning": "brief explanation"}}"""


def label_pair_with_llm(
    resume: dict,
    job: dict,
    model: str = OLLAMA_MODEL,
    retries: int = MAX_RETRIES,
) -> Tuple[float, str]:
    """
    Get LLM confidence score for a resume–job pair.
    Falls back to rule-based if Ollama is unavailable.
    Returns (confidence: float, method: str).
    """
    for attempt in range(retries):
        try:
            resp = requests.post(
                OLLAMA_URL,
                json={
                    "model": model,
                    "prompt": _build_prompt(resume, job),
                    "stream": False,
                    "options": {"temperature": 0.1, "num_predict": 100},
                },
                timeout=OLLAMA_TIMEOUT,
            )
            resp.raise_for_status()
            raw = resp.json().get("response", "")
            # Print chain-of-thought if present
            think_start = raw.find("<think>")
            think_end = raw.find("</think>")
            if think_start >= 0 and think_end > think_start:
                think_content = raw[think_start + 7:think_end].strip()
                for chunk in [think_content[i:i+160] for i in range(0, len(think_content), 160)]:
                    print(f"[DeepSeek Think] {chunk}", flush=True)
                raw = raw[think_end + 8:]
            # Extract JSON from response
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start >= 0 and end > start:
                data = json.loads(raw[start:end])
                confidence = float(data.get("confidence", 0.5))
                confidence = min(1.0, max(0.0, confidence))
                reasoning = data.get("reasoning", "")
                role = job.get("title", "?")
                print(
                    f"[DeepSeek] {role} | conf={confidence:.3f} | {reasoning[:160]}",
                    flush=True,
                )
                return round(confidence, 4), "llm"
        except (requests.RequestException, json.JSONDecodeError, ValueError) as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                print(f"[LLM Labeler] Falling back to rule-based: {e}", file=sys.stderr)

    # Fallback
    confidence, _ = rule_label_pair(resume, job)
    return confidence, "rule_based"


def label_batch(
    pairs: List[Tuple[dict, dict]],
    model: str = OLLAMA_MODEL,
    use_llm: bool = True,
) -> List[Dict]:
    """Label a batch of (resume, job) tuples."""
    available = use_llm and _is_ollama_available()
    if use_llm and not available:
        print("[LLM Labeler] Ollama not available, using rule-based fallback")

    results = []
    for i, (resume, job) in enumerate(pairs):
        if available:
            confidence, method = label_pair_with_llm(resume, job, model=model)
        else:
            confidence, method = rule_label_pair(resume, job)

        results.append({
            "resume_id": resume.get("id"),
            "job_id": job.get("id"),
            "confidence": confidence,
            "label_method": method,
        })

        if (i + 1) % 10 == 0:
            print(f"  Labeled {i + 1}/{len(pairs)} pairs...")

    return results
