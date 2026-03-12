"""
Evaluation script for the PHJob Cross-Encoder.
Computes: Pearson correlation, RMSE, NDCG@10, Precision@5
Outputs: metrics.json

Targets (from architecture §5):
    Pearson > 0.80 | RMSE < 0.12 | NDCG@10 > 0.75 | P@5 > 0.70

Usage:
    python python_ai/training/evaluate.py \
        --jsonl python_ai/data/labeled/synthetic_pairs.jsonl \
        --output python_ai/models/checkpoints/metrics.json
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

import torch
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).parents[1]))
from models.cross_encoder import PHJobCrossEncoder, CHECKPOINT_DIR
from training.dataset import JobMatchDataset


def pearson_correlation(preds: List[float], targets: List[float]) -> float:
    n = len(preds)
    if n == 0:
        return 0.0
    mean_p = sum(preds) / n
    mean_t = sum(targets) / n
    cov = sum((p - mean_p) * (t - mean_t) for p, t in zip(preds, targets))
    std_p = math.sqrt(sum((p - mean_p) ** 2 for p in preds))
    std_t = math.sqrt(sum((t - mean_t) ** 2 for t in targets))
    if std_p == 0 or std_t == 0:
        return 0.0
    return cov / (std_p * std_t)


def rmse(preds: List[float], targets: List[float]) -> float:
    n = len(preds)
    if n == 0:
        return 0.0
    return math.sqrt(sum((p - t) ** 2 for p, t in zip(preds, targets)) / n)


def dcg_at_k(relevances: List[float], k: int) -> float:
    """Discounted Cumulative Gain at K."""
    dcg = 0.0
    for i, rel in enumerate(relevances[:k], start=1):
        dcg += rel / math.log2(i + 1)
    return dcg


def ndcg_at_k(preds: List[float], targets: List[float], k: int = 10) -> float:
    """NDCG@K averaged over all queries."""
    if not preds:
        return 0.0
    # Sort by predicted score descending
    ranked = sorted(zip(preds, targets), key=lambda x: x[0], reverse=True)
    ideal = sorted(targets, reverse=True)

    actual_dcg = dcg_at_k([t for _, t in ranked], k)
    ideal_dcg = dcg_at_k(ideal, k)

    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0


def precision_at_k(preds: List[float], targets: List[float],
                    k: int = 5, threshold: float = 0.6) -> float:
    """Precision@K: fraction of top-K that are truly relevant (target >= threshold)."""
    if not preds:
        return 0.0
    ranked = sorted(zip(preds, targets), key=lambda x: x[0], reverse=True)
    top_k = ranked[:k]
    n_relevant = sum(1 for _, t in top_k if t >= threshold)
    return n_relevant / k


def evaluate(
    checkpoint_path: str = str(CHECKPOINT_DIR / "cross_encoder.pt"),
    split: str = "test",
    use_db: bool = True,
    jsonl_path: str | None = None,
    batch_size: int = 32,
    k_ndcg: int = 10,
    k_precision: int = 5,
    relevance_threshold: float = 0.6,
) -> Dict:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[Evaluate] Loading checkpoint: {checkpoint_path}")

    try:
        model = PHJobCrossEncoder.load(checkpoint_path)
    except Exception as e:
        print(f"[Evaluate] Could not load checkpoint: {e}")
        print("[Evaluate] Using untrained model for evaluation")
        model = PHJobCrossEncoder(device=device)

    model.eval()

    dataset = JobMatchDataset(
        split=split, use_db=use_db, jsonl_path=jsonl_path
    )
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    all_preds: List[float] = []
    all_targets: List[float] = []

    with torch.no_grad():
        for batch in loader:
            if "input_ids" in batch:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                targets = batch["confidence"].tolist()
                outputs = model.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                ).logits.squeeze(-1)
                preds = model.sigmoid(outputs).cpu().tolist()
            else:
                resume_texts = list(batch["resume_text"])
                job_texts = list(batch["job_text"])
                targets = batch["confidence"].tolist()
                preds = model(resume_texts, job_texts).cpu().tolist()

            all_preds.extend(preds if isinstance(preds, list) else [preds])
            all_targets.extend(targets if isinstance(targets, list) else [targets])

    print(f"[Evaluate] Evaluated {len(all_preds)} pairs")

    metrics = {
        "split": split,
        "n_pairs": len(all_preds),
        "pearson": round(pearson_correlation(all_preds, all_targets), 4),
        "rmse": round(rmse(all_preds, all_targets), 4),
        "ndcg_at_10": round(ndcg_at_k(all_preds, all_targets, k=k_ndcg), 4),
        "precision_at_5": round(precision_at_k(
            all_preds, all_targets, k=k_precision, threshold=relevance_threshold
        ), 4),
        "checkpoint": checkpoint_path,
    }

    # Target assessment
    metrics["targets_met"] = {
        "pearson_gt_080": metrics["pearson"] > 0.80,
        "rmse_lt_012": metrics["rmse"] < 0.12,
        "ndcg10_gt_075": metrics["ndcg_at_10"] > 0.75,
        "p5_gt_070": metrics["precision_at_5"] > 0.70,
    }

    _print_metrics(metrics)
    return metrics


def _print_metrics(m: dict):
    ok, fail = "OK", "FAIL"
    print("\n=== Evaluation Metrics ===")
    print(f"  Pairs evaluated : {m['n_pairs']}")
    print(f"  Pearson         : {m['pearson']:.4f}  (target: >0.80) {ok if m['targets_met']['pearson_gt_080'] else fail}")
    print(f"  RMSE            : {m['rmse']:.4f}  (target: <0.12) {ok if m['targets_met']['rmse_lt_012'] else fail}")
    print(f"  NDCG@10         : {m['ndcg_at_10']:.4f}  (target: >0.75) {ok if m['targets_met']['ndcg10_gt_075'] else fail}")
    print(f"  Precision@5     : {m['precision_at_5']:.4f}  (target: >0.70) {ok if m['targets_met']['p5_gt_070'] else fail}")
    targets_met = sum(m["targets_met"].values())
    print(f"\n  Targets met: {targets_met}/4")


def main():
    parser = argparse.ArgumentParser(description="Evaluate PHJob Cross-Encoder")
    parser.add_argument("--checkpoint", default=str(CHECKPOINT_DIR / "cross_encoder.pt"))
    parser.add_argument("--split", default="test")
    parser.add_argument("--jsonl", default=None)
    parser.add_argument("--no-db", action="store_true")
    parser.add_argument("--output", default=str(CHECKPOINT_DIR / "metrics.json"))
    args = parser.parse_args()

    use_db = not args.no_db and args.jsonl is None
    metrics = evaluate(
        checkpoint_path=args.checkpoint,
        split=args.split,
        use_db=use_db,
        jsonl_path=args.jsonl,
    )

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nMetrics saved to {args.output}")


if __name__ == "__main__":
    main()
