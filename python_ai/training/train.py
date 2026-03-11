"""
Training script for the PHJob Cross-Encoder.
Architecture: paraphrase-multilingual-MiniLM-L12-v2 + MSE loss
Optimizer: AdamW with layer-wise LRs (2e-5 encoder, 1e-4 head)
Scheduler: Linear warmup
Early stopping: on val RMSE

Usage:
    python python_ai/training/train.py \
        --epochs 10 --batch-size 32 --jsonl python_ai/data/labeled/synthetic_pairs.jsonl
"""
from __future__ import annotations

import argparse
import json
import math
import sys
import time
from datetime import datetime
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).parents[1]))
from models.cross_encoder import PHJobCrossEncoder, CHECKPOINT_DIR
from training.dataset import JobMatchDataset

try:
    from transformers import get_linear_schedule_with_warmup
    _SCHEDULER_AVAILABLE = True
except ImportError:
    _SCHEDULER_AVAILABLE = False


def train(
    epochs: int = 10,
    batch_size: int = 32,
    encoder_lr: float = 2e-5,
    head_lr: float = 1e-4,
    weight_decay: float = 0.01,
    warmup_steps: int = 500,
    max_length: int = 256,
    patience: int = 3,
    use_db: bool = True,
    jsonl_path: str | None = None,
    run_id: str | None = None,
    checkpoint_name: str = "cross_encoder.pt",
) -> dict:
    """Train the cross-encoder and return final metrics."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[Train] Device: {device}")
    print(f"[Train] Epochs: {epochs} | Batch: {batch_size} | Encoder LR: {encoder_lr}")

    # Load datasets
    train_ds = JobMatchDataset(
        split="train", max_length=max_length,
        use_db=use_db, jsonl_path=jsonl_path
    )
    val_ds = JobMatchDataset(
        split="val", max_length=max_length,
        use_db=use_db, jsonl_path=jsonl_path
    )

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0)

    # Initialize model
    model = PHJobCrossEncoder(device=device)
    model.train()

    # Layer-wise learning rates
    encoder_params = list(model.model.base_model.parameters())
    head_params = [
        p for n, p in model.model.named_parameters()
        if "classifier" in n or "pooler" in n
    ]
    optimizer = torch.optim.AdamW(
        [
            {"params": encoder_params, "lr": encoder_lr},
            {"params": head_params, "lr": head_lr},
        ],
        weight_decay=weight_decay,
    )

    total_steps = len(train_loader) * epochs
    scheduler = None
    if _SCHEDULER_AVAILABLE and warmup_steps > 0:
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=min(warmup_steps, total_steps // 10),
            num_training_steps=total_steps,
        )

    criterion = nn.MSELoss()

    best_val_rmse = float("inf")
    patience_count = 0
    history = []
    checkpoint_path = CHECKPOINT_DIR / checkpoint_name

    for epoch in range(1, epochs + 1):
        # --- Training ---
        model.train()
        train_loss = 0.0
        n_batches = 0

        for batch in train_loader:
            if "input_ids" in batch:
                # Tokenized mode
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                targets = batch["confidence"].to(device)

                outputs = model.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                ).logits.squeeze(-1)
                preds = model.sigmoid(outputs)
            else:
                # Text mode fallback
                resume_texts = batch["resume_text"]
                job_texts = batch["job_text"]
                targets = batch["confidence"].to(device)
                preds = model(resume_texts, job_texts)

            loss = criterion(preds, targets)
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            if scheduler:
                scheduler.step()

            train_loss += loss.item()
            n_batches += 1

        avg_train_loss = train_loss / max(n_batches, 1)

        # --- Validation ---
        val_rmse, val_loss = _evaluate(model, val_loader, criterion, device)

        print(
            f"[Epoch {epoch}/{epochs}] "
            f"train_loss={avg_train_loss:.4f} | "
            f"val_loss={val_loss:.4f} | val_rmse={val_rmse:.4f}"
        )

        history.append({
            "epoch": epoch,
            "train_loss": round(avg_train_loss, 6),
            "val_loss": round(val_loss, 6),
            "val_rmse": round(val_rmse, 6),
        })

        # Early stopping
        if val_rmse < best_val_rmse:
            best_val_rmse = val_rmse
            patience_count = 0
            model.save(checkpoint_path)
            print(f"  Checkpoint saved (val_rmse={val_rmse:.4f})")
        else:
            patience_count += 1
            if patience_count >= patience:
                print(f"[Train] Early stopping at epoch {epoch}")
                break

    metrics = {
        "train_loss": history[-1]["train_loss"] if history else None,
        "val_loss": history[-1]["val_loss"] if history else None,
        "val_rmse": best_val_rmse,
        "epochs_trained": len(history),
        "checkpoint": str(checkpoint_path),
        "history": history,
    }

    # Update training run in DB if run_id provided
    if run_id:
        try:
            from database.db import finish_training_run
            finish_training_run(
                run_id,
                metrics={"train_loss": metrics["train_loss"],
                         "val_loss": metrics["val_loss"],
                         "rmse": best_val_rmse},
                checkpoint_path=str(checkpoint_path),
            )
        except Exception as e:
            print(f"[Train] Could not update DB run: {e}")

    return metrics


def _evaluate(model, loader, criterion, device) -> tuple:
    model.eval()
    total_loss = 0.0
    all_preds = []
    all_targets = []

    with torch.no_grad():
        for batch in loader:
            if "input_ids" in batch:
                input_ids = batch["input_ids"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                targets = batch["confidence"].to(device)
                outputs = model.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                ).logits.squeeze(-1)
                preds = model.sigmoid(outputs)
            else:
                resume_texts = batch["resume_text"]
                job_texts = batch["job_text"]
                targets = batch["confidence"].to(device)
                preds = model(resume_texts, job_texts)

            loss = criterion(preds, targets)
            total_loss += loss.item()
            all_preds.extend(preds.cpu().tolist())
            all_targets.extend(targets.cpu().tolist())

    n = max(len(all_preds), 1)
    avg_loss = total_loss / max(len(loader), 1)
    rmse = math.sqrt(sum((p - t) ** 2 for p, t in zip(all_preds, all_targets)) / n)
    return rmse, avg_loss


def main():
    parser = argparse.ArgumentParser(description="Train PHJob Cross-Encoder")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--encoder-lr", type=float, default=2e-5)
    parser.add_argument("--head-lr", type=float, default=1e-4)
    parser.add_argument("--warmup-steps", type=int, default=500)
    parser.add_argument("--patience", type=int, default=3)
    parser.add_argument("--max-length", type=int, default=256)
    parser.add_argument("--jsonl", default=None, help="Path to JSONL file (skip DB)")
    parser.add_argument("--no-db", action="store_true", help="Use JSONL only, skip DB")
    args = parser.parse_args()

    use_db = not args.no_db and args.jsonl is None

    metrics = train(
        epochs=args.epochs,
        batch_size=args.batch_size,
        encoder_lr=args.encoder_lr,
        head_lr=args.head_lr,
        warmup_steps=args.warmup_steps,
        patience=args.patience,
        max_length=args.max_length,
        use_db=use_db,
        jsonl_path=args.jsonl,
    )

    print("\n=== Training Complete ===")
    print(json.dumps(
        {k: v for k, v in metrics.items() if k != "history"},
        indent=2,
    ))

    # Save metrics
    metrics_path = CHECKPOINT_DIR / "training_metrics.json"
    metrics_path.parent.mkdir(parents=True, exist_ok=True)
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to {metrics_path}")


if __name__ == "__main__":
    main()
