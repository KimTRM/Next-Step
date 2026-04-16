"""
Post-training Temperature Scaling calibration for PHJobCrossEncoder.

Temperature scaling is a single-parameter post-hoc calibration method.
It fits a scalar T on the validation set that divides the raw logits:

    calibrated_score = sigmoid(logit / T)

T > 1.0 → spreads predictions (reduces overconfidence)
T < 1.0 → sharpens predictions (rarely needed at start of training)
T = 1.0 → no change

Also computes Expected Calibration Error (ECE) to measure how well
confidence correlates with actual accuracy.

Usage:
    # After training, calibrate the saved checkpoint:
    python python_ai/training/calibration.py \
        --checkpoint python_ai/models/checkpoints/cross_encoder.pt \
        --val-jsonl python_ai/data/labeled/unified_training_pairs.jsonl

    # Or from code:
    from training.calibration import fit_temperature, compute_ece
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import List, Optional, Tuple

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).parents[1]))
from models.cross_encoder import PHJobCrossEncoder, CHECKPOINT_DIR
from training.dataset import JobMatchDataset


# ---------------------------------------------------------------------------
# ECE
# ---------------------------------------------------------------------------

def compute_ece(
    preds: List[float],
    targets: List[float],
    n_bins: int = 10,
) -> Tuple[float, List[dict]]:
    """
    Compute Expected Calibration Error.

    A well-calibrated model has ECE < 0.10.
    Returns (ece_score, bin_data) where bin_data is useful for reliability diagrams.
    """
    bin_size = 1.0 / n_bins
    bins = [{"count": 0, "sum_conf": 0.0, "sum_target": 0.0} for _ in range(n_bins)]

    for pred, target in zip(preds, targets):
        bin_idx = min(int(pred / bin_size), n_bins - 1)
        bins[bin_idx]["count"] += 1
        bins[bin_idx]["sum_conf"] += pred
        bins[bin_idx]["sum_target"] += target

    n = len(preds)
    ece = 0.0
    bin_data = []

    for i, b in enumerate(bins):
        if b["count"] == 0:
            continue
        avg_conf = b["sum_conf"] / b["count"]
        avg_acc = b["sum_target"] / b["count"]
        ece += (b["count"] / n) * abs(avg_conf - avg_acc)
        bin_data.append({
            "bin_lower": round(i * bin_size, 2),
            "bin_upper": round((i + 1) * bin_size, 2),
            "count": b["count"],
            "avg_confidence": round(avg_conf, 4),
            "avg_target": round(avg_acc, 4),
            "gap": round(avg_conf - avg_acc, 4),
        })

    return round(ece, 4), bin_data


def print_reliability_diagram(bin_data: List[dict]):
    """Print ASCII reliability diagram to stdout."""
    print("\n=== Reliability Diagram ===")
    print(f"{'Bin':<12} {'Count':>6} {'Avg Conf':>10} {'Avg Target':>11} {'Gap':>8}")
    print("-" * 52)
    for b in bin_data:
        gap_str = f"{b['gap']:+.4f}"
        bar = "." * int(abs(b["gap"]) * 50)
        direction = ">" if b["gap"] > 0 else "<"
        print(
            f"[{b['bin_lower']:.2f}-{b['bin_upper']:.2f}]"
            f"{b['count']:>7}"
            f"{b['avg_confidence']:>11.4f}"
            f"{b['avg_target']:>12.4f}"
            f"{gap_str:>9}  {direction}{bar}"
        )
    print()


# ---------------------------------------------------------------------------
# Temperature scaling
# ---------------------------------------------------------------------------

def _collect_logits_and_targets(
    model: PHJobCrossEncoder,
    val_loader: DataLoader,
    device: str,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """Collect raw logits (pre-sigmoid) and targets from validation set."""
    model.eval()
    all_logits = []
    all_targets = []

    with torch.no_grad():
        for batch in val_loader:
            if "input_ids" in batch:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                targets = batch["confidence"].to(device)

                if input_ids.dim() == 3:
                    input_ids = input_ids.squeeze(1)
                    attention_mask = attention_mask.squeeze(1)

                logits = model.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                ).logits.squeeze(-1)
            else:
                resume_texts = list(batch["resume_text"])
                job_texts = list(batch["job_text"])
                targets = batch["confidence"].to(device)

                pairs = list(zip(resume_texts, job_texts))
                encoded = model.tokenizer(
                    pairs,
                    padding=True,
                    truncation=True,
                    max_length=512,
                    return_tensors="pt",
                ).to(device)
                logits = model.model(**encoded).logits.squeeze(-1)

            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

    return torch.cat(all_logits), torch.cat(all_targets)


def fit_temperature(
    model: PHJobCrossEncoder,
    val_loader: DataLoader,
    device: str = "cpu",
    max_iter: int = 100,
    lr: float = 0.01,
) -> float:
    """
    Fit a temperature scalar T on the validation set by minimizing MSE of
    calibrated predictions vs. targets.

    Returns the optimal T value.
    """
    print("[Calibration] Collecting logits from validation set...", flush=True)
    logits, targets = _collect_logits_and_targets(model, val_loader, device)

    temperature = nn.Parameter(torch.ones(1) * 1.0)
    optimizer = torch.optim.LBFGS([temperature], lr=lr, max_iter=max_iter)
    criterion = nn.MSELoss()

    def closure():
        optimizer.zero_grad()
        scaled = torch.sigmoid(logits / temperature.clamp(min=0.05, max=10.0))
        loss = criterion(scaled, targets)
        loss.backward()
        return loss

    optimizer.step(closure)

    T = float(temperature.clamp(min=0.05, max=10.0).item())
    print(f"[Calibration] Fitted temperature T = {T:.4f}", flush=True)
    if T > 1.0:
        print(f"[Calibration] T > 1 → model was overconfident, spreading predictions", flush=True)
    elif T < 1.0:
        print(f"[Calibration] T < 1 → model was underconfident, sharpening predictions", flush=True)
    else:
        print(f"[Calibration] T ≈ 1 → model already well-calibrated", flush=True)

    # Report ECE before and after
    sigmoid = torch.sigmoid
    preds_before = sigmoid(logits).tolist()
    preds_after = sigmoid(logits / T).tolist()
    targets_list = targets.tolist()

    ece_before, _ = compute_ece(preds_before, targets_list)
    ece_after, bin_data = compute_ece(preds_after, targets_list)
    print(f"[Calibration] ECE before: {ece_before:.4f} | after: {ece_after:.4f} (target < 0.10)", flush=True)
    print_reliability_diagram(bin_data)

    return T


def save_temperature_to_checkpoint(
    checkpoint_path: Path,
    temperature: float,
):
    """
    Load an existing checkpoint, add the temperature value, and re-save.
    """
    checkpoint = torch.load(checkpoint_path, map_location="cpu")
    checkpoint["temperature"] = temperature
    torch.save(checkpoint, checkpoint_path)
    print(f"[Calibration] Saved T={temperature:.4f} to {checkpoint_path}", flush=True)


def calibrate_checkpoint(
    checkpoint_path: str,
    val_jsonl: str,
    batch_size: int = 32,
) -> float:
    """
    Full calibration pipeline: load model → collect val logits → fit T → save.
    Returns fitted temperature.
    """
    device = "cuda" if torch.cuda.is_available() else "cpu"
    ckpt = Path(checkpoint_path)

    print(f"[Calibration] Loading model from {ckpt}")
    try:
        model = PHJobCrossEncoder.load(ckpt)
    except Exception as e:
        print(f"[Calibration] Could not load checkpoint: {e}", file=sys.stderr)
        return 1.0

    val_ds = JobMatchDataset(split="val", use_db=False, jsonl_path=val_jsonl)
    if len(val_ds) == 0:
        print("[Calibration] No validation pairs found. Skipping calibration.", file=sys.stderr)
        return 1.0

    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    T = fit_temperature(model, val_loader, device=device)
    save_temperature_to_checkpoint(ckpt, T)
    return T


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Temperature scaling calibration")
    parser.add_argument("--checkpoint", default=str(CHECKPOINT_DIR / "cross_encoder.pt"))
    parser.add_argument("--val-jsonl", required=True, help="Path to validation JSONL")
    parser.add_argument("--batch-size", type=int, default=32)
    args = parser.parse_args()

    T = calibrate_checkpoint(
        checkpoint_path=args.checkpoint,
        val_jsonl=args.val_jsonl,
        batch_size=args.batch_size,
    )
    print(f"\nCalibration complete. Temperature = {T:.4f}")


if __name__ == "__main__":
    main()
