"""
HuggingFace Inference API labeler — optional calibration layer on top of embed_labeler.

Uses the HF Inference API (huggingface_hub.InferenceClient) to get embeddings
from a hosted model, then computes cosine similarity. Requires HF_TOKEN env var
or ~/.cache/huggingface token.

Recommended model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
(free tier, no GPU required server-side)

Usage:
    from pipeline.labeling.hf_api_labeler import hf_api_label_batch

    pairs = [("resume text...", "job description..."), ...]
    labels = hf_api_label_batch(pairs, hf_token="hf_...")
    # → [{"confidence": 0.52, "method": "hf_api"}, ...]
"""
from __future__ import annotations

import os
import time
from typing import List, Optional, Tuple

_DEFAULT_HF_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
_LABEL_FLOOR = 0.05
_LABEL_CEILING = 0.75
_COSINE_SCALE = 0.70
_RATE_LIMIT_DELAY = 0.5  # seconds between API calls to avoid 429s


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def _cosine_to_confidence(cos_sim: float) -> float:
    cos_sim = max(0.0, min(1.0, float(cos_sim)))
    conf = cos_sim * _COSINE_SCALE + _LABEL_FLOOR
    return round(min(_LABEL_CEILING, max(_LABEL_FLOOR, conf)), 4)


def hf_api_label_batch(
    pairs: List[Tuple[str, str]],
    hf_token: Optional[str] = None,
    model: str = _DEFAULT_HF_MODEL,
    max_pairs: int = 500,
    log_interval: int = 50,
) -> List[dict]:
    """
    Label (resume, job) pairs using HuggingFace Inference API embeddings.

    Slower than local embed_labeler (~0.5s per pair on free tier), so cap at
    max_pairs. Best used for calibration of a smaller validation subset.

    Args:
        pairs: List of (resume_text, job_text) tuples.
        hf_token: HuggingFace API token. Falls back to HF_TOKEN env var.
        model: HF model repo ID for feature extraction (embeddings).
        max_pairs: Max pairs to label (API rate limits; free tier ~300 calls/hr).
        log_interval: Print progress every N pairs.

    Returns:
        List of dicts: {"confidence": float, "method": "hf_api"}
    """
    try:
        from huggingface_hub import InferenceClient
    except ImportError as e:
        raise ImportError(
            "huggingface_hub is required. Install with: pip install huggingface_hub"
        ) from e

    token = hf_token or os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_TOKEN")
    if not token:
        raise ValueError(
            "HuggingFace token required. Set HF_TOKEN env var or pass hf_token=..."
        )

    client = InferenceClient(token=token)
    pairs = pairs[:max_pairs]
    total = len(pairs)
    results = []

    print(f"[HFAPILabeler] Labeling {total} pairs via {model}", flush=True)

    for i, (resume_text, job_text) in enumerate(pairs):
        try:
            resume_emb = client.feature_extraction(
                resume_text[:512], model=model
            )
            time.sleep(_RATE_LIMIT_DELAY)
            job_emb = client.feature_extraction(
                job_text[:512], model=model
            )
            time.sleep(_RATE_LIMIT_DELAY)

            # feature_extraction returns nested list — take mean pool if needed
            if isinstance(resume_emb[0], list):
                resume_vec = [sum(token[j] for token in resume_emb) / len(resume_emb)
                              for j in range(len(resume_emb[0]))]
                job_vec = [sum(token[j] for token in job_emb) / len(job_emb)
                           for j in range(len(job_emb[0]))]
            else:
                resume_vec = resume_emb
                job_vec = job_emb

            sim = _cosine_similarity(resume_vec, job_vec)
            conf = _cosine_to_confidence(sim)
            results.append({"confidence": conf, "cosine_similarity": round(sim, 4), "method": "hf_api"})

            if log_interval > 0 and (i + 1) % log_interval == 0:
                print(f"[HFAPILabeler] {i + 1}/{total} (conf={conf:.3f})", flush=True)

        except Exception as e:
            print(f"[HFAPILabeler] Error on pair {i}: {e}. Using default 0.40.", flush=True)
            results.append({"confidence": 0.40, "cosine_similarity": None, "method": "hf_api_fallback"})

    confs = [r["confidence"] for r in results]
    if confs:
        print(
            f"[HFAPILabeler] Done. conf range: [{min(confs):.3f}, {max(confs):.3f}] "
            f"mean={sum(confs)/len(confs):.3f}",
            flush=True,
        )

    return results
