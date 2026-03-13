"""
Evaluation script for the PHJob Cross-Encoder.
Computes: Pearson correlation, RMSE, NDCG@10, Precision@5

Optionally uses DeepSeek-r1 (via Ollama) as an independent judge to score
a sample of resume-job pairs — giving a bias-corrected view of real-world
performance that does not depend on the synthetic training labels.

Targets (from architecture §5):
    Pearson > 0.80 | RMSE < 0.12 | NDCG@10 > 0.75 | P@5 > 0.70

Usage:
    # Standard evaluation against synthetic labels
    python python_ai/training/evaluate.py \
        --jsonl python_ai/data/labeled/synthetic_pairs.jsonl \
        --output python_ai/models/checkpoints/metrics.json

    # + DeepSeek as independent judge (samples 100 pairs)
    python python_ai/training/evaluate.py \
        --jsonl python_ai/data/labeled/synthetic_pairs.jsonl \
        --use-deepseek --deepseek-sample 100 --deepseek-model deepseek-r1:7b
"""
from __future__ import annotations

import argparse
import json
import math
import random
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import torch
from torch.utils.data import DataLoader

sys.path.insert(0, str(Path(__file__).parents[1]))
from models.cross_encoder import PHJobCrossEncoder, CHECKPOINT_DIR
from training.dataset import JobMatchDataset


# ---------------------------------------------------------------------------
# Math helpers
# ---------------------------------------------------------------------------

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
    dcg = 0.0
    for i, rel in enumerate(relevances[:k], start=1):
        dcg += rel / math.log2(i + 1)
    return dcg


def ndcg_at_k(preds: List[float], targets: List[float], k: int = 10) -> float:
    if not preds:
        return 0.0
    ranked = sorted(zip(preds, targets), key=lambda x: x[0], reverse=True)
    ideal = sorted(targets, reverse=True)
    actual_dcg = dcg_at_k([t for _, t in ranked], k)
    ideal_dcg = dcg_at_k(ideal, k)
    return actual_dcg / ideal_dcg if ideal_dcg > 0 else 0.0


def precision_at_k(preds: List[float], targets: List[float],
                   k: int = 5, threshold: float = 0.6) -> float:
    if not preds:
        return 0.0
    ranked = sorted(zip(preds, targets), key=lambda x: x[0], reverse=True)
    top_k = ranked[:k]
    n_relevant = sum(1 for _, t in top_k if t >= threshold)
    return n_relevant / k


# ---------------------------------------------------------------------------
# DeepSeek judge
# ---------------------------------------------------------------------------

def _deepseek_score_pair(resume_text: str, job_text: str, model: str) -> Optional[float]:
    """Ask DeepSeek to score one resume-job pair. Returns 0-1 or None on error."""
    import re
    import requests as _req

    resume_snippet = resume_text[:600]
    job_snippet = job_text[:400]

    prompt = f"""You are an expert Philippine HR recruiter.

Rate how well this candidate fits this job on a scale from 0.0 to 1.0.
- 0.0 = completely unsuitable
- 0.5 = partial match, some relevant skills
- 1.0 = perfect match

Candidate resume (excerpt):
{resume_snippet}

Job description (excerpt):
{job_snippet}

Reply with ONLY a single decimal number between 0.0 and 1.0. No explanation."""

    try:
        resp = _req.post(
            "http://localhost:11434/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.1, "num_predict": 80},
            },
            timeout=120,
        )
        resp.raise_for_status()
        raw = resp.json().get("response", "")
        # Print chain-of-thought
        think_start = raw.find("<think>")
        think_end = raw.find("</think>")
        if think_start >= 0 and think_end > think_start:
            think_content = raw[think_start + 7:think_end].strip()
            for chunk in [think_content[i:i+160] for i in range(0, len(think_content), 160)]:
                print(f"[DeepSeek Think] {chunk}", flush=True)
            raw = raw[think_end + 8:]
        match = re.search(r"\b(0\.\d+|1\.0|0|1)\b", raw)
        if match:
            return min(1.0, max(0.0, float(match.group(1))))
    except Exception as e:
        print(f"[DeepSeek Judge] Error: {e}", flush=True)
    return None


def run_deepseek_judge(
    resume_texts: List[str],
    job_texts: List[str],
    model_preds: List[float],
    rule_labels: List[float],
    sample_size: int = 100,
    deepseek_model: str = "deepseek-r1:7b",
) -> Dict:
    """
    Sample `sample_size` pairs and have DeepSeek score each one.
    Returns a dict with:
      - model_vs_deepseek: Pearson/RMSE between model predictions and DeepSeek scores
      - label_bias: mean difference between rule-based labels and DeepSeek scores
      - deepseek_scores: the raw scores
    """
    n = len(resume_texts)
    indices = random.sample(range(n), min(sample_size, n))

    deepseek_scores: List[float] = []
    sampled_preds: List[float] = []
    sampled_labels: List[float] = []

    for i, idx in enumerate(indices, 1):
        print(
            f"[DeepSeek Judge] {i}/{len(indices)} | idx={idx} | "
            f"model_pred={model_preds[idx]:.3f} | label={rule_labels[idx]:.3f}",
            flush=True,
        )
        score = _deepseek_score_pair(resume_texts[idx], job_texts[idx], deepseek_model)
        if score is not None:
            deepseek_scores.append(score)
            sampled_preds.append(model_preds[idx])
            sampled_labels.append(rule_labels[idx])
            print(
                f"[DeepSeek Judge]   -> deepseek={score:.3f} "
                f"| diff_from_label={score - rule_labels[idx]:+.3f}",
                flush=True,
            )

    if not deepseek_scores:
        return {"error": "DeepSeek returned no scores", "n_scored": 0}

    label_biases = [ds - lb for ds, lb in zip(deepseek_scores, sampled_labels)]
    mean_bias = sum(label_biases) / len(label_biases)

    result = {
        "n_scored": len(deepseek_scores),
        "model": deepseek_model,
        "model_vs_deepseek": {
            "pearson": round(pearson_correlation(sampled_preds, deepseek_scores), 4),
            "rmse": round(rmse(sampled_preds, deepseek_scores), 4),
        },
        "label_bias": {
            "mean": round(mean_bias, 4),
            "direction": "deepseek scores HIGHER than rule-based" if mean_bias > 0.05
                         else "deepseek scores LOWER than rule-based" if mean_bias < -0.05
                         else "labels are well-calibrated",
        },
        "deepseek_mean_score": round(sum(deepseek_scores) / len(deepseek_scores), 4),
        "rule_label_mean_score": round(sum(sampled_labels) / len(sampled_labels), 4),
    }

    print(
        f"\n[DeepSeek Judge] Results:\n"
        f"  Scored {result['n_scored']} pairs\n"
        f"  Model vs DeepSeek  — Pearson: {result['model_vs_deepseek']['pearson']:.4f} | "
        f"RMSE: {result['model_vs_deepseek']['rmse']:.4f}\n"
        f"  Label bias: {result['label_bias']['direction']} "
        f"(mean delta={mean_bias:+.4f})\n",
        flush=True,
    )
    return result


# ---------------------------------------------------------------------------
# Main evaluation
# ---------------------------------------------------------------------------

def evaluate(
    checkpoint_path: str = str(CHECKPOINT_DIR / "cross_encoder.pt"),
    split: str = "test",
    use_db: bool = True,
    jsonl_path: str | None = None,
    batch_size: int = 32,
    k_ndcg: int = 10,
    k_precision: int = 5,
    relevance_threshold: float = 0.6,
    use_deepseek: bool = False,
    deepseek_sample: int = 100,
    deepseek_model: str = "deepseek-r1:7b",
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

    dataset = JobMatchDataset(split=split, use_db=use_db, jsonl_path=jsonl_path)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)

    all_preds: List[float] = []
    all_targets: List[float] = []
    all_resume_texts: List[str] = []
    all_job_texts: List[str] = []

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
                # For DeepSeek judge, collect raw texts too
                all_resume_texts.extend(batch.get("resume_text", [""] * len(targets)))
                all_job_texts.extend(batch.get("job_text", [""] * len(targets)))
            else:
                resume_texts = list(batch["resume_text"])
                job_texts = list(batch["job_text"])
                targets = batch["confidence"].tolist()
                preds = model(resume_texts, job_texts).cpu().tolist()
                all_resume_texts.extend(resume_texts)
                all_job_texts.extend(job_texts)

            all_preds.extend(preds if isinstance(preds, list) else [preds])
            all_targets.extend(targets if isinstance(targets, list) else [targets])

    print(f"[Evaluate] Evaluated {len(all_preds)} pairs")

    metrics: Dict = {
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

    metrics["targets_met"] = {
        "pearson_gt_080": metrics["pearson"] > 0.80,
        "rmse_lt_012": metrics["rmse"] < 0.12,
        "ndcg10_gt_075": metrics["ndcg_at_10"] > 0.75,
        "p5_gt_070": metrics["precision_at_5"] > 0.70,
    }

    # Optional DeepSeek judge
    if use_deepseek and all_resume_texts:
        print(
            f"\n[DeepSeek Judge] Running independent evaluation on "
            f"{min(deepseek_sample, len(all_preds))} sampled pairs...",
            flush=True,
        )
        metrics["deepseek_judge"] = run_deepseek_judge(
            resume_texts=all_resume_texts,
            job_texts=all_job_texts,
            model_preds=all_preds,
            rule_labels=all_targets,
            sample_size=deepseek_sample,
            deepseek_model=deepseek_model,
        )

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

    if "deepseek_judge" in m:
        dj = m["deepseek_judge"]
        if "error" not in dj:
            print(f"\n=== DeepSeek Independent Judge ({dj['n_scored']} pairs) ===")
            print(f"  Model vs DeepSeek  Pearson : {dj['model_vs_deepseek']['pearson']:.4f}")
            print(f"  Model vs DeepSeek  RMSE    : {dj['model_vs_deepseek']['rmse']:.4f}")
            print(f"  Label bias         : {dj['label_bias']['direction']}")
            print(f"  DeepSeek mean score: {dj['deepseek_mean_score']:.4f}")
            print(f"  Rule label mean    : {dj['rule_label_mean_score']:.4f}")


def main():
    parser = argparse.ArgumentParser(description="Evaluate PHJob Cross-Encoder")
    parser.add_argument("--checkpoint", default=str(CHECKPOINT_DIR / "cross_encoder.pt"))
    parser.add_argument("--split", default="test")
    parser.add_argument("--jsonl", default=None)
    parser.add_argument("--no-db", action="store_true")
    parser.add_argument("--output", default=str(CHECKPOINT_DIR / "metrics.json"))
    parser.add_argument("--log", default=None, help="Write stdout to this log file")
    # DeepSeek judge options
    parser.add_argument("--use-deepseek", action="store_true",
                        help="Use DeepSeek as an independent judge for realistic scoring")
    parser.add_argument("--deepseek-sample", type=int, default=100,
                        help="Number of pairs to score with DeepSeek (default: 100)")
    parser.add_argument("--deepseek-model", default="deepseek-r1:7b",
                        help="Ollama model to use as judge (default: deepseek-r1:7b)")
    args = parser.parse_args()

    # Optionally redirect stdout → log file for streaming support
    if args.log:
        import io
        log_path = Path(args.log)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_file = open(log_path, "w", encoding="utf-8", buffering=1)
        sys.stdout = io.TextIOWrapper(log_file.buffer, line_buffering=True) if hasattr(log_file, "buffer") else log_file

    use_db = not args.no_db and args.jsonl is None
    metrics = evaluate(
        checkpoint_path=args.checkpoint,
        split=args.split,
        use_db=use_db,
        jsonl_path=args.jsonl,
        use_deepseek=args.use_deepseek,
        deepseek_sample=args.deepseek_sample,
        deepseek_model=args.deepseek_model,
    )

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nMetrics saved to {args.output}", flush=True)


if __name__ == "__main__":
    main()
