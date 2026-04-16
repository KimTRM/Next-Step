"""
Ollama Ensemble Labeler — multi-model consensus scoring for resume-job pairs.

Detects available Ollama models at runtime and uses up to 3 for ensemble scoring.
Conservative by design: defaults to 0.50, only exceeds 0.65 with explicit evidence.

High disagreement between models → lower confidence output (uncertainty penalty).

Usage:
    from pipeline.labeling.ollama_ensemble import ensemble_label_pair, ensemble_label_batch
"""
from __future__ import annotations

import re
import sys
import time
from typing import List, Optional, Tuple

import requests

OLLAMA_BASE = "http://localhost:11434"
OLLAMA_GENERATE_URL = f"{OLLAMA_BASE}/api/generate"
OLLAMA_TAGS_URL = f"{OLLAMA_BASE}/api/tags"

# Preferred model order — use whichever are available, up to 3
PREFERRED_MODELS = ["deepseek-r1:7b", "mistral", "llama3.2", "llama3", "gemma2", "phi3"]

OLLAMA_TIMEOUT = 60
MAX_OUTPUT_TOKENS = 200

# If std of scores across models exceeds this, apply disagreement penalty
DISAGREEMENT_THRESHOLD = 0.15
DISAGREEMENT_PENALTY = 0.85  # multiply mean by this factor

# Hard label ceiling for ensemble outputs
LABEL_CEILING = 0.75


def get_available_models() -> List[str]:
    """Return list of Ollama model names currently available on this machine."""
    try:
        resp = requests.get(OLLAMA_TAGS_URL, timeout=5)
        resp.raise_for_status()
        models = [m["name"] for m in resp.json().get("models", [])]
        # Normalize: strip tags like ":latest" for matching, then pick preferred
        available = []
        for preferred in PREFERRED_MODELS:
            for m in models:
                # Match on base name (before colon) or exact
                base = m.split(":")[0]
                if base == preferred.split(":")[0] or m == preferred:
                    if m not in available:
                        available.append(m)
                    break
        # If none matched preferred list, include any available model up to 3
        if not available:
            available = models[:3]
        return available[:3]
    except Exception:
        return []


def _build_scoring_prompt(resume_text: str, job_text: str) -> str:
    """Conservative scoring prompt. Defaults to 0.50; higher requires explicit evidence."""
    resume_snippet = resume_text[:600].strip()
    job_snippet = job_text[:400].strip()
    return f"""/no_think
Resume-job fit scoring. DEFAULT = 0.50. Be conservative — when in doubt, score LOWER.

Score guide:
0.05-0.25 = completely wrong field or zero relevant skills
0.25-0.45 = weak — most required skills missing or major experience gap
0.45-0.60 = average — partial skill match, basic field relevance
0.60-0.70 = good — most required skills explicitly present, experience roughly met
0.70-0.75 = strong — reserved for near-complete explicit skill + experience match
0.75+     = DO NOT USE — reserved for post-training feedback only

RULES:
- Only exceed 0.60 if you can identify 3+ required skills BY NAME in the resume.
- Only exceed 0.70 if experience AND education AND 4+ skills ALL explicitly match.
- Assume the resume excerpt may be incomplete. Do not fill in gaps charitably.

Resume:
{resume_snippet}

Job:
{job_snippet}

Reply with ONLY a decimal number between 0.05 and 0.75 (e.g. 0.50). No text."""


def _query_model(model: str, resume_text: str, job_text: str) -> Optional[float]:
    """Query a single Ollama model. Returns score [0,1] or None on failure."""
    prompt = _build_scoring_prompt(resume_text, job_text)
    try:
        resp = requests.post(
            OLLAMA_GENERATE_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": MAX_OUTPUT_TOKENS,
                    "num_ctx": 2048,
                },
            },
            timeout=OLLAMA_TIMEOUT,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")

        # Strip chain-of-thought tags if present (DeepSeek R1)
        think_end = raw.find("</think>")
        if think_end >= 0:
            raw = raw[think_end + 8:].strip()

        # Extract first valid decimal
        match = re.search(r"\b(0\.\d{1,4}|0|1\.0)\b", raw)
        if match:
            score = float(match.group(1))
            return min(LABEL_CEILING, max(0.05, score))

        print(f"[Ensemble] {model}: no score in response: '{raw[:80]}'", file=sys.stderr)
        return None
    except Exception as e:
        print(f"[Ensemble] {model} error: {e}", file=sys.stderr)
        return None


def ensemble_label_pair(
    resume_text: str,
    job_text: str,
    models: Optional[List[str]] = None,
    fallback_to_rule: bool = True,
) -> Tuple[float, str]:
    """
    Score a resume-job pair using available Ollama models in ensemble.

    Returns:
        (confidence: float [0.05, 0.75], method: str)
    """
    if models is None:
        models = get_available_models()

    if not models:
        if fallback_to_rule:
            try:
                from pipeline.labeling.rule_labeler import label_pair as rule_label_pair
                # rule_labeler expects dicts, but we only have text here
                # Return a conservative default
                return 0.50, "rule_based_default"
            except Exception:
                pass
        return 0.50, "default"

    scores = []
    for model in models:
        score = _query_model(model, resume_text, job_text)
        if score is not None:
            scores.append(score)

    if not scores:
        return 0.50, "fallback_no_response"

    if len(scores) == 1:
        # Single model: use directly, cap at 0.70 (slightly lower ceiling for single-model)
        final = min(0.70, scores[0])
        return round(final, 4), f"ensemble_1:{models[0]}"

    # Multi-model ensemble
    mean_score = sum(scores) / len(scores)
    variance = sum((s - mean_score) ** 2 for s in scores) / len(scores)
    std_score = variance ** 0.5

    if std_score > DISAGREEMENT_THRESHOLD:
        # Models disagree — lower confidence
        final = min(LABEL_CEILING, mean_score * DISAGREEMENT_PENALTY)
        method = f"ensemble_{len(scores)}_penalized"
    else:
        final = min(LABEL_CEILING, mean_score)
        method = f"ensemble_{len(scores)}"

    return round(final, 4), method


def ensemble_label_batch(
    pairs: List[Tuple[str, str]],
    models: Optional[List[str]] = None,
    log_interval: int = 25,
) -> List[dict]:
    """
    Label a batch of (resume_text, job_text) tuples.

    Returns list of dicts:
        {"confidence": float, "method": str}
    """
    if models is None:
        models = get_available_models()

    if not models:
        print("[Ensemble] No Ollama models available. Assigning default 0.50 labels.", file=sys.stderr)
        return [{"confidence": 0.50, "method": "default"} for _ in pairs]

    print(f"[Ensemble] Using models: {models}", flush=True)
    results = []

    for i, (resume_text, job_text) in enumerate(pairs):
        confidence, method = ensemble_label_pair(resume_text, job_text, models=models)
        results.append({"confidence": confidence, "method": method})

        if (i + 1) % log_interval == 0:
            print(f"[Ensemble] Labeled {i + 1}/{len(pairs)} | last={confidence:.3f} ({method})", flush=True)
        elif i == 0:
            print(f"[Ensemble] First label: {confidence:.3f} ({method})", flush=True)

        # Small delay to avoid overwhelming Ollama
        time.sleep(0.1)

    return results


if __name__ == "__main__":
    # Quick smoke test
    available = get_available_models()
    print(f"Available Ollama models: {available}")

    test_resume = (
        "Software Engineer with 4 years of experience in Python, Django, PostgreSQL, "
        "and REST API development. Bachelor's in Computer Science. AWS Certified Developer."
    )
    test_job = (
        "Backend Engineer: Python, Django, PostgreSQL required. "
        "3+ years experience. AWS experience a plus."
    )

    score, method = ensemble_label_pair(test_resume, test_job, models=available)
    print(f"Score: {score:.3f} (method: {method})")
