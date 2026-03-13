"""
PyTorch Dataset for training the PHJob Cross-Encoder.
Loads training_pairs from PostgreSQL (or a JSONL fallback),
formats with text_formatter.py, and tokenizes with multilingual MiniLM.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

import torch
from torch.utils.data import Dataset

sys.path.insert(0, str(Path(__file__).parents[1]))
from models.text_formatter import format_resume, format_job

try:
    from transformers import AutoTokenizer
    _BASE_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    _tokenizer_cache: Optional[AutoTokenizer] = None

    def _get_tokenizer() -> AutoTokenizer:
        global _tokenizer_cache
        if _tokenizer_cache is None:
            _tokenizer_cache = AutoTokenizer.from_pretrained(_BASE_MODEL)
        return _tokenizer_cache

except ImportError:
    _get_tokenizer = None


class JobMatchDataset(Dataset):
    """
    Dataset for (resume_text, job_text, confidence) triples.
    Can load from:
      1. PostgreSQL training_pairs table (default)
      2. JSONL file (fallback or offline mode)
    """

    def __init__(
        self,
        split: str = "train",
        max_length: int = 256,
        use_db: bool = True,
        jsonl_path: Optional[str] = None,
        limit: int = 50000,
    ):
        self.max_length = max_length
        self.tokenizer = _get_tokenizer() if _get_tokenizer else None
        self.pairs: List[Dict] = []

        if use_db:
            self.pairs = self._load_from_db(split, limit)
        elif jsonl_path:
            self.pairs = self._load_from_jsonl(jsonl_path, split, limit)
        else:
            raise ValueError("Either use_db=True or provide jsonl_path")

        print(f"[Dataset] Loaded {len(self.pairs)} pairs (split={split})")

    def _load_from_db(self, split: str, limit: int) -> List[Dict]:
        from database.db import get_training_pairs
        rows = get_training_pairs(split=split, limit=limit)
        pairs = []
        for row in rows:
            resume = {
                "skills": row.get("resume_skills") or [],
                "experience_yrs": row.get("experience_yrs", 0),
                "education": row.get("education") or {},
                "certifications": row.get("resume_certs") or [],
            }
            job = {
                "title": row.get("job_title", ""),
                "required_skills": row.get("required_skills") or [],
                "min_experience": row.get("min_experience", 0),
                "industry": row.get("industry", ""),
                "niche": row.get("niche", ""),
                "certifications": row.get("job_certs") or [],
            }
            pairs.append({
                "resume_text": format_resume(resume),
                "job_text": format_job(job),
                "confidence": float(row.get("confidence", 0.5)),
            })
        return pairs

    def _load_from_jsonl(self, path: str, split: str, limit: int) -> List[Dict]:
        pairs = []
        with open(path, encoding="utf-8") as f:
            for line in f:
                if len(pairs) >= limit:
                    break
                try:
                    item = json.loads(line.strip())
                    if item.get("split") != split:
                        continue
                    resume = item.get("resume", {})
                    job = item.get("job", {})
                    pairs.append({
                        "resume_text": format_resume(resume),
                        "job_text": format_job(job),
                        "confidence": float(item.get("confidence", 0.5)),
                    })
                except (json.JSONDecodeError, KeyError):
                    continue
        return pairs

    def apply_bias_correction(self, ds_scores: dict, alpha: float) -> None:
        """
        Soft-correct confidence labels toward DeepSeek scores.
        ds_scores: {dataset_index: deepseek_score (0-1)}
        alpha: blend strength — 0.0 = no change, 1.0 = fully replace with DeepSeek score
        """
        corrected = 0
        for idx, ds_score in ds_scores.items():
            if 0 <= idx < len(self.pairs):
                old = self.pairs[idx]["confidence"]
                new = old + alpha * (ds_score - old)
                self.pairs[idx]["confidence"] = round(min(1.0, max(0.0, new)), 4)
                corrected += 1
        print(f"[Dataset] Corrected {corrected} labels (alpha={alpha})", flush=True)

    def __len__(self) -> int:
        return len(self.pairs)

    def __getitem__(self, idx: int) -> Dict[str, torch.Tensor]:
        item = self.pairs[idx]
        resume_text = item["resume_text"]
        job_text = item["job_text"]
        confidence = torch.tensor(item["confidence"], dtype=torch.float32)

        if self.tokenizer:
            encoded = self.tokenizer(
                text=resume_text,
                text_pair=job_text,
                padding="max_length",
                truncation=True,
                max_length=self.max_length,
                return_tensors="pt",
            )
            return {
                "input_ids": encoded["input_ids"].squeeze(0),
                "attention_mask": encoded["attention_mask"].squeeze(0),
                "confidence": confidence,
                "resume_text": resume_text,
                "job_text": job_text,
            }
        else:
            return {
                "resume_text": resume_text,
                "job_text": job_text,
                "confidence": confidence,
            }
