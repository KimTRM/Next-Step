"""
PHJobCrossEncoder — Cross-Encoder reranker for precise confidence scoring.
Base: paraphrase-multilingual-MiniLM-L12-v2
Output: sigmoid → confidence [0.0, 1.0]

This is the primary model used at inference time for the /match endpoint.
The bi-encoder is used for fast retrieval; the cross-encoder reranks top-K candidates.

Usage:
    from models.cross_encoder import PHJobCrossEncoder
    model = PHJobCrossEncoder()
    score = model.score(resume_text, job_text)  # float [0, 1]
    scores = model.score_batch(resume_texts, job_texts)  # List[float]
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import List, Optional, Union

import torch
import torch.nn as nn

try:
    from transformers import AutoModelForSequenceClassification, AutoTokenizer
    _TRANSFORMERS_AVAILABLE = True
except ImportError:
    _TRANSFORMERS_AVAILABLE = False

BASE_MODEL = os.getenv(
    "BI_ENCODER_BASE",
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
)
MAX_LENGTH = 512
CHECKPOINT_DIR = Path(__file__).parent / "checkpoints"

import math as _math


class PHJobCrossEncoder(nn.Module):
    """
    Cross-Encoder for precise resume ↔ job confidence scoring.
    Takes concatenated [resume_text, job_text] and outputs a single
    confidence score in [0.0, 1.0] via sigmoid.
    """

    def __init__(self, base_model: str = BASE_MODEL, device: Optional[str] = None):
        super().__init__()
        if not _TRANSFORMERS_AVAILABLE:
            raise ImportError(
                "transformers not installed.\n"
                "Run: pip install transformers"
            )
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(base_model)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            base_model, num_labels=1
        ).to(self.device)
        self.sigmoid = nn.Sigmoid()
        # Temperature for post-training calibration (1.0 = no scaling)
        self.temperature: float = 1.0

    def init_baseline_bias(self, baseline: float = 0.60) -> None:
        """
        Initialize classifier head bias so the untrained model predicts ~baseline
        for any input. This prevents the model from being overconfident before it
        has seen any real training data.

        baseline=0.60 → logit ≈ 0.405, sigmoid(0.405) ≈ 0.60

        Call this immediately after instantiation when training from scratch (--fresh).
        """
        logit = _math.log(baseline / (1.0 - baseline))
        classifier = getattr(self.model, "classifier", None)
        if classifier is not None and hasattr(classifier, "bias") and classifier.bias is not None:
            nn.init.constant_(classifier.bias, logit)
            print(f"[CrossEncoder] Baseline bias initialized: {baseline:.2f} (logit={logit:.4f})")
        else:
            # Some architectures use a different attribute name
            for name, module in self.model.named_modules():
                if "classifier" in name.lower() and hasattr(module, "bias") and module.bias is not None:
                    nn.init.constant_(module.bias, logit)
                    print(f"[CrossEncoder] Baseline bias initialized via {name}: {baseline:.2f}")
                    break

    def forward(
        self,
        resume_texts: List[str],
        job_texts: List[str],
    ) -> torch.Tensor:
        """
        Forward pass for training. Returns confidence scores [0, 1].
        Input: parallel lists of resume texts and job texts.
        """
        pairs = list(zip(resume_texts, job_texts))
        encoded = self.tokenizer(
            pairs,
            padding=True,
            truncation=True,
            max_length=MAX_LENGTH,
            return_tensors="pt",
        ).to(self.device)
        logits = self.model(**encoded).logits.squeeze(-1)
        # Apply temperature scaling if calibrated (T > 0)
        if self.temperature != 1.0:
            logits = logits / max(self.temperature, 0.05)
        return self.sigmoid(logits)

    def score(self, resume_text: str, job_text: str) -> float:
        """
        Score a single resume-job pair. Returns float in [0.0, 1.0].
        Use for inference.
        """
        self.eval()
        with torch.no_grad():
            scores = self.forward([resume_text], [job_text])
        return round(float(scores[0].item()), 4)

    def score_batch(
        self,
        resume_texts: List[str],
        job_texts: List[str],
        batch_size: int = 16,
    ) -> List[float]:
        """Score a batch of resume-job pairs efficiently."""
        self.eval()
        results = []
        with torch.no_grad():
            for i in range(0, len(resume_texts), batch_size):
                r_batch = resume_texts[i:i + batch_size]
                j_batch = job_texts[i:i + batch_size]
                scores = self.forward(r_batch, j_batch)
                results.extend([round(float(s.item()), 4) for s in scores])
        return results

    def save(self, path: Union[str, Path] = CHECKPOINT_DIR / "cross_encoder.pt"):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({
            "model_state": self.model.state_dict(),
            "base_model": BASE_MODEL,
            "temperature": self.temperature,
        }, path)
        print(f"[CrossEncoder] Saved to {path}")

    @classmethod
    def load(
        cls,
        path: Union[str, Path] = CHECKPOINT_DIR / "cross_encoder.pt",
        base_model: str = BASE_MODEL,
    ) -> "PHJobCrossEncoder":
        instance = cls(base_model=base_model)
        checkpoint = torch.load(path, map_location=instance.device, weights_only=False)
        instance.model.load_state_dict(checkpoint["model_state"])
        instance.temperature = float(checkpoint.get("temperature", 1.0))
        if instance.temperature != 1.0:
            print(f"[CrossEncoder] Loaded from {path} (T={instance.temperature:.4f})")
        else:
            print(f"[CrossEncoder] Loaded from {path}")
        return instance

    @property
    def is_trained(self) -> bool:
        """Check if a checkpoint exists."""
        default_path = CHECKPOINT_DIR / "cross_encoder.pt"
        return default_path.exists()
