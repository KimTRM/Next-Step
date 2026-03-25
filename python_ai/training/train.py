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


# ---------------------------------------------------------------------------
# DeepSeek per-epoch judge
# ---------------------------------------------------------------------------

def deepseek_epoch_judge(
    model,
    val_dataset,
    sample_size: int,
    ollama_model: str,
    device: str,
    epoch: int,
) -> tuple[float, dict]:
    """
    Sample `sample_size` pairs from val_dataset, get the current model's
    predictions AND DeepSeek's independent scores, then print both with
    chain-of-thought thoughts. Returns (mean_bias_delta, {idx: ds_score}).
    """
    import random
    import re
    import requests as _req

    n = len(val_dataset)
    indices = random.sample(range(n), min(sample_size, n))

    ds_scores: dict[int, float] = {}
    pair_data: list[tuple[int, str, str, float, float]] = []  # (idx, resume, job, label, pred)

    # --- Phase 1: collect model predictions on GPU ---
    model.eval()
    with torch.no_grad():
        for idx in indices:
            item = val_dataset[idx]
            resume_text = item["resume_text"]
            job_text = item["job_text"]
            label = float(item["confidence"]) if isinstance(item["confidence"], (int, float)) else item["confidence"].item()
            pred = model([resume_text], [job_text]).cpu().item()
            pair_data.append((idx, resume_text, job_text, label, pred))

    # --- Phase 2: offload training model from GPU so Ollama can use VRAM ---
    model.to("cpu")
    torch.cuda.empty_cache()
    print(f"[DeepSeek Epoch {epoch}] Model offloaded to CPU — running judge on {len(pair_data)} pairs...", flush=True)

    for i, (idx, resume_text, job_text, label, pred) in enumerate(pair_data):
        prompt = (
            f"/no_think\n"
            f"PH job screening. DEFAULT score = 0.50.\n"
            f"Only go ABOVE 0.65 if you can name 3+ required skills explicitly in the resume.\n"
            f"Only go BELOW 0.35 if there is zero field relevance.\n\n"
            f"Score guide:\n"
            f"0.0-0.3 = wrong field or no relevant skills\n"
            f"0.3-0.5 = partial/weak — some skills but major gaps\n"
            f"0.5-0.65 = average — basic fit, nothing exceptional\n"
            f"0.65-0.80 = good — most required skills explicitly present\n"
            f"0.80+ = strong — reserved for explicit full skill+experience match\n\n"
            f"Resume: {resume_text[:150]}\n"
            f"Job: {job_text[:100]}\n\n"
            f"Reply with ONE number only (e.g. 0.50)."
        )
        ds_score = None
        try:
            resp = _req.post(
                "http://localhost:11434/api/generate",
                json={"model": ollama_model, "prompt": prompt, "stream": False,
                      "options": {"temperature": 0.1, "num_predict": 800, "num_ctx": 2048}},
                timeout=180,
            )
            resp.raise_for_status()
            data = resp.json()
            raw = data.get("response", "")
            done_reason = data.get("done_reason", "unknown")
            if not raw:
                print(f"[DeepSeek Epoch Judge] pair {idx}: empty response (done_reason={done_reason})", flush=True)
                continue
            # Print chain-of-thought
            think_start = raw.find("<think>")
            think_end = raw.find("</think>")
            if think_start >= 0 and think_end > think_start:
                think_content = raw[think_start + 7:think_end].strip()
                for chunk in [think_content[i:i+160] for i in range(0, len(think_content), 160)]:
                    print(f"[DeepSeek Think] {chunk}", flush=True)
                raw = raw[think_end + 8:].strip()
            m = re.search(r"(?<!\d)(0\.\d+|1\.0+|0\.0+|1|0)(?!\d)", raw)
            if m:
                ds_score = min(1.0, max(0.0, float(m.group(1))))
            else:
                preview = raw.replace("\n", " ")[:120]
                print(f"[DeepSeek Epoch Judge] pair {idx}: no score parsed (done={done_reason}) from: '{preview}'", flush=True)
        except Exception as e:
            print(f"[DeepSeek Epoch Judge] Error on pair {idx}: {e}", flush=True)

        if ds_score is not None:
            delta = ds_score - label
            print(
                f"[DeepSeek Epoch {epoch}] pair={len(ds_scores)+1}/{len(pair_data)} | "
                f"model={pred:.3f} | deepseek={ds_score:.3f} | label={label:.3f} | delta={delta:+.3f}",
                flush=True,
            )
            ds_scores[idx] = ds_score

    # --- Phase 3: restore model to GPU ---
    model.to(device)
    torch.cuda.empty_cache()
    print(f"[DeepSeek Epoch {epoch}] Model restored to {device}.", flush=True)

    if not ds_scores:
        print(f"[DeepSeek Epoch {epoch}] No scores returned — skipping bias correction", flush=True)
        return 0.0, {}

    # Compute mean bias: positive = DeepSeek thinks labels are too low, negative = too high
    label_map = {idx: label for idx, _, _, label, _ in pair_data}
    bias_deltas = [ds_scores[i] - label_map[i] for i in ds_scores]
    mean_bias = sum(bias_deltas) / len(bias_deltas)
    direction = (
        "labels over-estimated (rule-based too generous)" if mean_bias < -0.05
        else "labels under-estimated (rule-based too strict)" if mean_bias > 0.05
        else "labels well-calibrated"
    )
    print(
        f"[DeepSeek Epoch {epoch}] bias_delta={mean_bias:+.4f} | {direction}",
        flush=True,
    )
    return mean_bias, ds_scores


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
    use_deepseek_judge: bool = False,
    deepseek_epoch_sample: int = 10,
    deepseek_bias_alpha: float = 0.3,
    deepseek_model: str = "deepseek-r1:7b",
) -> dict:
    """Train the cross-encoder and return final metrics."""
    # Free any GPU memory held by other processes (e.g. Ollama) before allocating
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
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
    head_param_ids = {
        id(p) for n, p in model.model.named_parameters()
        if "classifier" in n or "pooler" in n
    }
    encoder_params = [
        p for p in model.model.base_model.parameters()
        if id(p) not in head_param_ids
    ]
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

                # Squeeze out any extra dim from tokenizer (e.g. [B,1,L] -> [B,L])
                if input_ids.dim() == 3:
                    input_ids = input_ids.squeeze(1)
                    attention_mask = attention_mask.squeeze(1)

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

        # DeepSeek per-epoch judge + bias correction
        if use_deepseek_judge:
            try:
                _, ds_scores = deepseek_epoch_judge(
                    model=model,
                    val_dataset=val_ds,
                    sample_size=deepseek_epoch_sample,
                    ollama_model=deepseek_model,
                    device=device,
                    epoch=epoch,
                )
                if ds_scores:
                    # Apply soft label correction to training dataset for next epoch
                    train_ds.apply_bias_correction(ds_scores, deepseek_bias_alpha)
            except Exception as e:
                print(f"[DeepSeek Epoch {epoch}] Judge failed (skipping): {e}", flush=True)

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
                if input_ids.dim() == 3:
                    input_ids = input_ids.squeeze(1)
                    attention_mask = attention_mask.squeeze(1)
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
    # DeepSeek per-epoch judge
    parser.add_argument("--use-deepseek-judge", action="store_true",
                        help="Run DeepSeek as independent judge after each epoch and correct labels")
    parser.add_argument("--deepseek-epoch-sample", type=int, default=10,
                        help="Pairs to judge per epoch (default: 10, ~30s overhead)")
    parser.add_argument("--deepseek-bias-alpha", type=float, default=0.3,
                        help="Label correction strength 0.0–1.0 (default: 0.3)")
    parser.add_argument("--deepseek-model", default="deepseek-r1:7b",
                        help="Ollama model to use as judge (default: deepseek-r1:7b)")
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
        use_deepseek_judge=args.use_deepseek_judge,
        deepseek_epoch_sample=args.deepseek_epoch_sample,
        deepseek_bias_alpha=args.deepseek_bias_alpha,
        deepseek_model=args.deepseek_model,
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
