"""
Embedding-based confidence labeler using local sentence-transformers.

GPU-batched cosine similarity between resume and job embeddings, mapped to
calibrated confidence scores [0.05, 0.75]. No API key required, ~40K pairs
in under 2 minutes on a modern GPU (or ~5 minutes on CPU).

Mapping:
    cosine_sim → conf = cos_sim * 0.70 + 0.05  (clamped to [0.05, 0.75])

Usage:
    from pipeline.labeling.embed_labeler import embed_label_batch

    pairs = [("resume text...", "job description..."), ...]
    labels = embed_label_batch(pairs)
    # → [{"confidence": 0.52, "method": "embed_cosine"}, ...]
"""
from __future__ import annotations

import sys
from pathlib import Path
from typing import List, Optional, Tuple

_DEFAULT_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
_LABEL_FLOOR = 0.05
_LABEL_CEILING = 0.75
_COSINE_SCALE = 0.70  # span of the output range


def _cosine_to_confidence(cos_sim: float) -> float:
    """Map cosine similarity [0, 1] to confidence [0.05, 0.75]."""
    cos_sim = max(0.0, min(1.0, float(cos_sim)))
    conf = cos_sim * _COSINE_SCALE + _LABEL_FLOOR
    return round(min(_LABEL_CEILING, max(_LABEL_FLOOR, conf)), 4)


def embed_label_batch(
    pairs: List[Tuple[str, str]],
    model_name: str = _DEFAULT_MODEL,
    batch_size: int = 64,
    device: Optional[str] = None,
    log_interval: int = 500,
) -> List[dict]:
    """
    Label (resume, job) pairs using cosine similarity of sentence embeddings.

    Args:
        pairs: List of (resume_text, job_text) tuples.
        model_name: SentenceTransformer model to use.
        batch_size: Encoding batch size (increase for GPU, decrease for OOM).
        device: "cuda", "cpu", or None (auto-detect).
        log_interval: Print progress every N pairs.

    Returns:
        List of dicts: {"confidence": float, "method": "embed_cosine"}
    """
    try:
        from sentence_transformers import SentenceTransformer
        import torch
        import torch.nn.functional as F
    except ImportError as e:
        raise ImportError(
            "sentence-transformers and torch are required. "
            "Install with: pip install sentence-transformers torch"
        ) from e

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    print(f"[EmbedLabeler] Loading model: {model_name} on {device}", flush=True)
    model = SentenceTransformer(model_name, device=device)

    resume_texts = [p[0][:800] for p in pairs]
    job_texts = [p[1][:600] for p in pairs]
    total = len(pairs)

    print(f"[EmbedLabeler] Encoding {total} resumes...", flush=True)
    resume_embeddings = model.encode(
        resume_texts,
        batch_size=batch_size,
        show_progress_bar=False,
        convert_to_tensor=True,
        device=device,
    )

    print(f"[EmbedLabeler] Encoding {total} job descriptions...", flush=True)
    job_embeddings = model.encode(
        job_texts,
        batch_size=batch_size,
        show_progress_bar=False,
        convert_to_tensor=True,
        device=device,
    )

    print(f"[EmbedLabeler] Computing cosine similarities...", flush=True)
    cosine_sims = F.cosine_similarity(resume_embeddings, job_embeddings, dim=1)
    cosine_sims_cpu = cosine_sims.cpu().tolist()

    results = []
    for i, sim in enumerate(cosine_sims_cpu):
        conf = _cosine_to_confidence(sim)
        results.append({"confidence": conf, "cosine_similarity": round(sim, 4), "method": "embed_cosine"})
        if log_interval > 0 and (i + 1) % log_interval == 0:
            print(f"[EmbedLabeler] {i + 1}/{total} labeled (last conf={conf:.3f})", flush=True)

    confs = [r["confidence"] for r in results]
    if confs:
        print(
            f"[EmbedLabeler] Done. conf range: [{min(confs):.3f}, {max(confs):.3f}] "
            f"mean={sum(confs)/len(confs):.3f}",
            flush=True,
        )

    return results


def precompute_embeddings(
    resume_texts: List[str],
    job_texts: List[str],
    model_name: str = _DEFAULT_MODEL,
    batch_size: int = 64,
    device: Optional[str] = None,
):
    """
    Pre-compute and return normalized sentence embeddings for auxiliary training loss.

    Returns:
        (resume_embs, job_embs): two torch.Tensor of shape [N, hidden_dim] on CPU.
        cosine_sims: torch.Tensor of shape [N] with cosine similarities.
    """
    try:
        from sentence_transformers import SentenceTransformer
        import torch
        import torch.nn.functional as F
    except ImportError as e:
        raise ImportError("sentence-transformers and torch are required.") from e

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model = SentenceTransformer(model_name, device=device)

    resume_embs = model.encode(
        [t[:800] for t in resume_texts],
        batch_size=batch_size,
        convert_to_tensor=True,
        device=device,
        show_progress_bar=False,
    )
    job_embs = model.encode(
        [t[:600] for t in job_texts],
        batch_size=batch_size,
        convert_to_tensor=True,
        device=device,
        show_progress_bar=False,
    )

    cosine_sims = F.cosine_similarity(resume_embs, job_embs, dim=1)
    # Clamp to [0.05, 0.75] confidence range for use as auxiliary targets
    aux_targets = (cosine_sims.clamp(0.0, 1.0) * _COSINE_SCALE + _LABEL_FLOOR).clamp(
        _LABEL_FLOOR, _LABEL_CEILING
    )

    return resume_embs.cpu(), job_embs.cpu(), aux_targets.cpu()
