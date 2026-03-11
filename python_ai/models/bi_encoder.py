"""
PHJobBiEncoder — Siamese Bi-Encoder for fast candidate retrieval.
Base: paraphrase-multilingual-MiniLM-L12-v2 (384-dim, supports Filipino/Tagalog)
Projection: 384 → 256 → 128 for dense retrieval

Usage:
    from models.bi_encoder import PHJobBiEncoder
    encoder = PHJobBiEncoder()
    resume_emb = encoder.encode_texts(["SKILLS: Python | EXPERIENCE: 3 years"])
    job_emb = encoder.encode_texts(["ROLE: Data Engineer | REQUIRED SKILLS: Python, SQL"])
    similarity = encoder.similarity(resume_emb, job_emb)
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional, Union

import torch
import torch.nn as nn
import torch.nn.functional as F

try:
    from sentence_transformers import SentenceTransformer
    _ST_AVAILABLE = True
except ImportError:
    _ST_AVAILABLE = False

BASE_MODEL = os.getenv(
    "BI_ENCODER_BASE",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
EMBEDDING_DIM = 384
PROJECTION_DIM = 128
CHECKPOINT_DIR = Path(__file__).parent / "checkpoints"


class PHJobBiEncoder(nn.Module):
    """
    Siamese Bi-Encoder for resume ↔ job semantic similarity.
    Encodes resume and job texts independently into a shared 128-dim space.
    Similarity is computed via cosine similarity.
    """

    def __init__(self, base_model: str = BASE_MODEL, device: Optional[str] = None):
        super().__init__()
        if not _ST_AVAILABLE:
            raise ImportError(
                "sentence-transformers not installed.\n"
                "Run: pip install sentence-transformers"
            )
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.encoder = SentenceTransformer(base_model, device=self.device)

        self.projection = nn.Sequential(
            nn.Linear(EMBEDDING_DIM, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, PROJECTION_DIM),
        ).to(self.device)

    def encode_texts(
        self,
        texts: List[str],
        batch_size: int = 32,
        normalize: bool = True,
    ) -> torch.Tensor:
        """Encode texts to 128-dim projected embeddings."""
        embeddings = self.encoder.encode(
            texts,
            batch_size=batch_size,
            convert_to_tensor=True,
            normalize_embeddings=normalize,
            device=self.device,
        )
        projected = self.projection(embeddings)
        if normalize:
            projected = F.normalize(projected, dim=-1)
        return projected

    def encode_texts_384(
        self,
        texts: List[str],
        batch_size: int = 32,
    ) -> torch.Tensor:
        """Encode texts to raw 384-dim embeddings (for pgvector storage)."""
        return self.encoder.encode(
            texts,
            batch_size=batch_size,
            convert_to_tensor=True,
            normalize_embeddings=True,
            device=self.device,
        )

    def similarity(self, emb_a: torch.Tensor, emb_b: torch.Tensor) -> torch.Tensor:
        """Compute cosine similarity between two embedding tensors."""
        return F.cosine_similarity(emb_a, emb_b, dim=-1)

    def forward(
        self,
        resume_texts: List[str],
        job_texts: List[str],
    ) -> torch.Tensor:
        """Forward pass: returns cosine similarity scores for each pair."""
        resume_emb = self.encode_texts(resume_texts)
        job_emb = self.encode_texts(job_texts)
        return self.similarity(resume_emb, job_emb)

    def save(self, path: Union[str, Path] = CHECKPOINT_DIR / "bi_encoder.pt"):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "projection_state": self.projection.state_dict(),
            "base_model": self.encoder.get_sentence_embedding_dimension(),
        }, path)
        print(f"[BiEncoder] Saved to {path}")

    @classmethod
    def load(
        cls,
        path: Union[str, Path] = CHECKPOINT_DIR / "bi_encoder.pt",
        base_model: str = BASE_MODEL,
    ) -> "PHJobBiEncoder":
        instance = cls(base_model=base_model)
        checkpoint = torch.load(path, map_location=instance.device)
        instance.projection.load_state_dict(checkpoint["projection_state"])
        print(f"[BiEncoder] Loaded from {path}")
        return instance
