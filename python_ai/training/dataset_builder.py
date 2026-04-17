"""
Dataset Builder — unified pipeline for all resume scoring datasets.

Reads all datasets under python_ai/datasets/, normalizes labels to a
calibrated [0.05, 0.75] range, and writes a single JSONL file:

    python_ai/data/labeled/unified_training_pairs.jsonl

Label design (confidence ceiling = 0.75 initially):
    "No Fit"       → [0.05, 0.30]
    "Potential Fit"→ [0.25, 0.55]
    "Good Fit"     → [0.45, 0.75]

The DeepSeek per-epoch judge in train.py can push labels higher through
bias correction — that is how >75% confidence is "earned" via training.

Usage:
    python python_ai/training/dataset_builder.py
        # Default: use local sentence-transformer embeddings (fast, GPU-batched)

    python python_ai/training/dataset_builder.py --use-ollama
        # Use Ollama LLM ensemble (slow but richer signal, needs Ollama running)

    python python_ai/training/dataset_builder.py --no-embed --no-ollama
        # Skip all ML labeling, use rule-based defaults only

    python python_ai/training/dataset_builder.py --hf-api --hf-token hf_xxx
        # Use HuggingFace Inference API embeddings (requires token, rate-limited)
"""
from __future__ import annotations

import argparse
import json
import random
import sys
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

_REPO_ROOT = Path(__file__).parents[2]
DATASETS_DIR = _REPO_ROOT / "python_ai" / "datasets"
OUTPUT_DIR = _REPO_ROOT / "python_ai" / "data" / "labeled"
OUTPUT_PATH = OUTPUT_DIR / "unified_training_pairs.jsonl"

# Dataset subdirectory names
_SCORED_DIR = DATASETS_DIR / "Resume Datasets with Validators and Scoring"
_DATASET1_DIR = DATASETS_DIR / "Resume Dataset 1"

# ---------------------------------------------------------------------------
# Label normalization helpers
# ---------------------------------------------------------------------------

_TIER_CAPS = {
    "No Fit": 0.30,
    "Potential Fit": 0.55,
    "Good Fit": 0.75,
}

_TIER_FLOORS = {
    "No Fit": 0.05,
    "Potential Fit": 0.25,
    "Good Fit": 0.45,
}

_ATS_MIN = 20.0
_ATS_MAX = 90.0
_LABEL_CEILING = 0.75


def normalize_ats_score(ats_score: float, tier: str) -> float:
    """
    Map ATS score (20–90) to calibrated confidence [0.05, 0.75].

    Formula:
        norm = (ats_score - 20) / 70        → [0.0, 1.0]
        conf = norm * 0.70 + 0.05           → [0.05, 0.75]
        conf = clamp(conf, floor, cap)      based on 3-tier label
    """
    norm = (ats_score - _ATS_MIN) / (_ATS_MAX - _ATS_MIN)
    norm = max(0.0, min(1.0, norm))
    conf = norm * 0.70 + 0.05
    floor = _TIER_FLOORS.get(tier, 0.05)
    cap = _TIER_CAPS.get(tier, 0.75)
    return round(max(floor, min(cap, conf)), 4)


def skills_score_to_confidence(skills_match_score: float, shortlisted: bool) -> float:
    """
    Map ai_resume_screening.csv skills_match_score (0.5–100.0) to confidence.

    shortlisted=Yes → [0.35, 0.65]
    shortlisted=No  → [0.05, 0.35]
    """
    norm = (skills_match_score - 0.5) / 99.5
    norm = max(0.0, min(1.0, norm))
    if shortlisted:
        conf = norm * 0.30 + 0.35   # [0.35, 0.65]
    else:
        conf = norm * 0.30 + 0.05   # [0.05, 0.35]
    return round(conf, 4)


def assign_split(idx: int, total: int, train_frac: float = 0.70,
                 val_frac: float = 0.15) -> str:
    ratio = idx / total
    if ratio < train_frac:
        return "train"
    elif ratio < train_frac + val_frac:
        return "val"
    return "test"


# ---------------------------------------------------------------------------
# Source 1: train.csv + validation.csv (ATS scored, pre-split)
# ---------------------------------------------------------------------------

def load_ats_dataset() -> Iterator[Dict]:
    """Load train.csv and validation.csv. Pre-split: train/val tags preserved."""
    import csv

    for filename, split_tag in [("train.csv", "train"), ("validation.csv", "val")]:
        path = _SCORED_DIR / filename
        if not path.exists():
            print(f"[Builder] WARNING: {path} not found, skipping.", file=sys.stderr)
            continue

        loaded = 0
        skipped = 0
        with open(path, encoding="utf-8", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    ats_score = float(row["ats_score"])
                    tier = row["original_label"].strip()
                    resume_text = row["text"].strip()

                    if not resume_text or tier not in _TIER_CAPS:
                        skipped += 1
                        continue

                    conf = normalize_ats_score(ats_score, tier)

                    yield {
                        "resume_text": resume_text[:1500],
                        "job_text": _ats_job_text(tier),
                        "confidence": conf,
                        "split": split_tag,
                        "source": "ats",
                    }
                    loaded += 1
                except (KeyError, ValueError):
                    skipped += 1
                    continue

        print(f"[Builder] ATS {filename}: {loaded} loaded, {skipped} skipped")


def _ats_job_text(tier: str) -> str:
    """Generic job description keyed to ATS tier."""
    descriptions = {
        "Good Fit": (
            "Seeking an experienced professional with relevant technical skills, "
            "strong educational background, and a proven track record of project delivery. "
            "Must have industry-specific expertise and exceed minimum experience requirements."
        ),
        "Potential Fit": (
            "Looking for a motivated candidate with foundational technical skills and "
            "some relevant experience. Entry to mid-level position open to professionals "
            "who demonstrate growth potential and field relevance."
        ),
        "No Fit": (
            "Specialized position requiring precise domain expertise, specific technical "
            "certifications, and deep industry experience. Candidates without the exact "
            "required skills will not be considered."
        ),
    }
    return descriptions.get(tier, descriptions["Potential Fit"])


# ---------------------------------------------------------------------------
# Source 2: job_applicant_dataset.csv (needs Ollama ensemble labeling)
# ---------------------------------------------------------------------------

def _embed_label_pairs(pairs: List[Tuple[str, str]]) -> Optional[List[dict]]:
    """Try embed_labeler; return None on failure."""
    try:
        sys.path.insert(0, str(Path(__file__).parents[1]))
        from pipeline.labeling.embed_labeler import embed_label_batch
        return embed_label_batch(pairs, log_interval=500)
    except Exception as e:
        print(f"[Builder] embed_labeler failed: {e}", file=sys.stderr)
        return None


def _ollama_label_pairs(
    pairs: List[Tuple[str, str]],
    models: Optional[List[str]] = None,
) -> Optional[List[dict]]:
    """Try ollama_ensemble; return None on failure."""
    try:
        sys.path.insert(0, str(Path(__file__).parents[1]))
        from pipeline.labeling.ollama_ensemble import (
            ensemble_label_batch, get_available_models
        )
        avail = models or get_available_models()
        if not avail:
            return None
        return ensemble_label_batch(pairs, models=avail, log_interval=100)
    except Exception as e:
        print(f"[Builder] ollama_ensemble failed: {e}", file=sys.stderr)
        return None


def _length_default_labels(rows: List[Tuple[str, str]], source: str) -> Iterator[Dict]:
    """Fallback: length-heuristic confidence for unmatched rows."""
    for i, (resume, job_desc) in enumerate(rows):
        length_factor = min(len(resume) / 2000.0, 1.0)
        conf = round(0.35 + length_factor * 0.15, 4)
        split = assign_split(i, max(len(rows), 1))
        yield {
            "resume_text": resume[:1500],
            "job_text": job_desc[:800],
            "confidence": conf,
            "split": split,
            "source": source,
        }


def load_job_applicant_dataset(
    use_embed: bool = True,
    use_ollama: bool = False,
    ollama_limit: int = 2000,
) -> Iterator[Dict]:
    """
    Load job_applicant_dataset.csv. Labels via embed_labeler (default) or Ollama.

    Priority: embed_labeler > ollama_ensemble > length-heuristic fallback.
    """
    import csv

    path = _SCORED_DIR / "job_applicant_dataset.csv"
    if not path.exists():
        print(f"[Builder] WARNING: {path} not found, skipping.", file=sys.stderr)
        return

    rows = []
    with open(path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            resume = row.get("Resume", "").strip()
            job_desc = row.get("Job Description", "").strip()
            if resume and job_desc:
                rows.append((resume, job_desc))

    random.shuffle(rows)
    total = len(rows)
    print(f"[Builder] job_applicant_dataset.csv: {total} pairs found")

    labels = None

    if use_embed:
        print(f"[Builder] Running embed_labeler on {total} pairs (GPU-batched)...")
        pairs_trunc = [(r[:800], j[:600]) for r, j in rows]
        labels = _embed_label_pairs(pairs_trunc)
        source_tag = "job_applicant_embed"

    if labels is None and use_ollama:
        ollama_rows = rows[:ollama_limit]
        print(f"[Builder] Running Ollama ensemble on {len(ollama_rows)} pairs...")
        pairs_trunc = [(r[:800], j[:600]) for r, j in ollama_rows]
        labels = _ollama_label_pairs(pairs_trunc)
        if labels is not None:
            rows = ollama_rows  # only labelled rows
        source_tag = "job_applicant_ollama"

    if labels is not None:
        for i, ((resume, job_desc), label) in enumerate(zip(rows, labels)):
            yield {
                "resume_text": resume[:1500],
                "job_text": job_desc[:800],
                "confidence": label["confidence"],
                "split": assign_split(i, len(rows)),
                "source": source_tag,
            }
        print(f"[Builder] job_applicant_dataset.csv: {len(labels)} labeled via {source_tag}")
    else:
        print(f"[Builder] job_applicant_dataset.csv: using length-heuristic fallback")
        yield from _length_default_labels(rows, "job_applicant_default")


# ---------------------------------------------------------------------------
# Source 3: ai_resume_screening.csv (feature-based → text conversion)
# ---------------------------------------------------------------------------

def load_ai_resume_screening() -> Iterator[Dict]:
    """
    Load ai_resume_screening.csv. Converts structured features to natural language
    resume and job text for the cross-encoder.
    """
    import csv

    path = _SCORED_DIR / "ai_resume_screening.csv"
    if not path.exists():
        print(f"[Builder] WARNING: {path} not found, skipping.", file=sys.stderr)
        return

    rows = []
    with open(path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    random.shuffle(rows)
    total = len(rows)
    loaded = 0
    skipped = 0

    for i, row in enumerate(rows):
        try:
            years_exp = int(float(row["years_experience"]))
            skills_match = float(row["skills_match_score"])
            education = row["education_level"].strip()
            project_count = int(float(row["project_count"]))
            resume_length = int(float(row["resume_length"]))
            github_activity = int(float(row["github_activity"]))
            shortlisted_raw = row["shortlisted"].strip().lower()
            shortlisted = shortlisted_raw in ("yes", "1", "true")

            resume_text = (
                f"Candidate profile: {years_exp} years of professional experience. "
                f"Skills match score: {skills_match:.0f}%. "
                f"Education level: {education}. "
                f"Projects completed: {project_count}. "
                f"Resume length: {resume_length} words. "
                f"GitHub contributions: {github_activity} activities."
            )
            job_text = (
                "We are hiring an experienced professional with strong technical skills, "
                "relevant project portfolio, and proven GitHub/portfolio activity. "
                "Preferred: Bachelor's degree or higher."
            )

            conf = skills_score_to_confidence(skills_match, shortlisted)
            split = assign_split(i, total)

            yield {
                "resume_text": resume_text,
                "job_text": job_text,
                "confidence": conf,
                "split": split,
                "source": "ai_screening",
            }
            loaded += 1
        except (KeyError, ValueError):
            skipped += 1
            continue

    print(f"[Builder] ai_resume_screening.csv: {loaded} loaded, {skipped} skipped")


# ---------------------------------------------------------------------------
# Source 4: Resume Dataset 1 JSONL (structured resumes → templated jobs)
# ---------------------------------------------------------------------------

def load_resume_dataset1(
    use_embed: bool = True,
    use_ollama: bool = False,
    ollama_limit: int = 1000,
) -> Iterator[Dict]:
    """
    Load Resume Dataset 1 JSONL. Pairs each resume with a templated job description
    derived from the resume's most recent job title. Labels via embed_labeler (default).
    """
    jsonl_path = next(_DATASET1_DIR.glob("*.jsonl"), None) if _DATASET1_DIR.exists() else None
    if not jsonl_path:
        print(f"[Builder] WARNING: Resume Dataset 1 JSONL not found, skipping.", file=sys.stderr)
        return

    records = []
    with open(jsonl_path, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    random.shuffle(records)
    print(f"[Builder] Resume Dataset 1: {len(records)} records found")

    pairs: List[Tuple[str, str, dict]] = []
    for rec in records:
        resume_text = _format_structured_resume(rec)
        job_title = _extract_job_title(rec)
        job_text = _make_job_from_title(job_title, rec)
        if resume_text and job_text:
            pairs.append((resume_text, job_text, rec))

    labels = None
    labeled_pairs = pairs
    source_tag = "dataset1_embed"

    if use_embed and pairs:
        print(f"[Builder] Running embed_labeler on {len(pairs)} Resume Dataset 1 pairs...")
        text_pairs = [(r[:800], j[:600]) for r, j, _ in pairs]
        labels = _embed_label_pairs(text_pairs)

    if labels is None and use_ollama and pairs:
        ollama_pairs = pairs[:ollama_limit]
        print(f"[Builder] Running Ollama ensemble on {len(ollama_pairs)} Resume Dataset 1 pairs...")
        text_pairs = [(r[:800], j[:600]) for r, j, _ in ollama_pairs]
        labels = _ollama_label_pairs(text_pairs)
        if labels is not None:
            labeled_pairs = ollama_pairs
        source_tag = "dataset1_ollama"

    if labels is not None:
        for i, ((resume, job, _rec), label) in enumerate(zip(labeled_pairs, labels)):
            yield {
                "resume_text": resume[:1500],
                "job_text": job[:800],
                "confidence": label["confidence"],
                "split": assign_split(i, len(labeled_pairs)),
                "source": source_tag,
            }
        print(f"[Builder] Resume Dataset 1: {len(labels)} labeled via {source_tag}")
    else:
        # Fallback: rule-based scoring from structured fields
        print(f"[Builder] Resume Dataset 1: using rule-based fallback")
        for i, (resume, job, rec) in enumerate(pairs):
            conf = _rule_score_from_structured(rec)
            yield {
                "resume_text": resume[:1500],
                "job_text": job[:800],
                "confidence": conf,
                "split": assign_split(i, max(len(pairs), 1)),
                "source": "dataset1_rule",
            }
        print(f"[Builder] Resume Dataset 1: {len(pairs)} rule-based")


def _str_item(item) -> str:
    """Safely convert a skill/tech item that may be a str or dict to a string."""
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        return item.get("name") or item.get("value") or str(next(iter(item.values()), ""))
    return str(item)


def _join_items(items: list, limit: int) -> str:
    return ", ".join(_str_item(x) for x in items[:limit] if _str_item(x))


def _format_structured_resume(rec: dict) -> str:
    """Convert structured JSONL resume to natural language text."""
    parts = []

    # Personal summary
    if rec.get("personal_info", {}).get("summary"):
        parts.append(rec["personal_info"]["summary"])

    # Skills
    skills_section = rec.get("skills", {})
    all_skills = []
    for category in ["programming_languages", "frameworks", "databases", "cloud"]:
        all_skills.extend(skills_section.get("technical", {}).get(category, []))
    if all_skills:
        parts.append(f"Technical skills: {_join_items(all_skills, 15)}.")

    # Experience
    experiences = rec.get("experience", [])
    for exp in experiences[:2]:
        title = exp.get("title", "")
        company = exp.get("company", "")
        duration = exp.get("dates", {}).get("duration", "")
        if title:
            parts.append(f"Experience: {title} at {company} ({duration}).".strip())
        techs = exp.get("technical_environment", {}).get("technologies", [])
        if techs:
            parts.append(f"Technologies used: {_join_items(techs, 8)}.")

    # Education
    edu_list = rec.get("education", [])
    for edu in edu_list[:1]:
        degree = edu.get("degree", {})
        level = degree.get("level", "")
        field = degree.get("field", "")
        inst = edu.get("institution", {}).get("name", "")
        if level or field:
            parts.append(f"Education: {level} in {field} from {inst}.".strip())

    # Certifications
    certs = rec.get("certifications", [])
    if certs:
        cert_names = [c.get("name", str(c)) if isinstance(c, dict) else str(c) for c in certs[:4]]
        parts.append(f"Certifications: {', '.join(cert_names)}.")

    return " ".join(parts)


def _extract_job_title(rec: dict) -> str:
    """Get most recent job title from structured resume."""
    experiences = rec.get("experience", [])
    if experiences:
        return experiences[0].get("title", "Professional")
    return "Professional"


def _make_job_from_title(title: str, rec: dict) -> str:
    """Create a plausible job description from a resume title and skills."""
    skills_section = rec.get("skills", {})
    tech_skills = []
    for category in ["programming_languages", "frameworks", "databases"]:
        tech_skills.extend(skills_section.get("technical", {}).get(category, []))

    skill_str = _join_items(tech_skills, 6) if tech_skills else "relevant technical skills"
    experiences = rec.get("experience", [])
    exp_yrs = len(experiences) * 2  # rough estimate

    return (
        f"We are looking for a {title} with experience in {skill_str}. "
        f"Minimum {max(1, exp_yrs - 1)} years of experience required. "
        f"Strong problem-solving skills and ability to deliver in a team environment. "
        f"Relevant certifications are a plus."
    )


def _rule_score_from_structured(rec: dict) -> float:
    """Simple rule-based confidence from structured resume fields."""
    score = 0.35  # baseline

    # Experience years
    experiences = rec.get("experience", [])
    exp_yrs = sum(
        _parse_duration_years(e.get("dates", {}).get("duration", ""))
        for e in experiences
    )
    if exp_yrs >= 5:
        score += 0.10
    elif exp_yrs >= 2:
        score += 0.05

    # Technical skills count
    skills_section = rec.get("skills", {})
    skill_count = sum(
        len(skills_section.get("technical", {}).get(cat, []))
        for cat in ["programming_languages", "frameworks", "databases", "cloud"]
    )
    if skill_count >= 10:
        score += 0.10
    elif skill_count >= 5:
        score += 0.05

    # Education
    edu_list = rec.get("education", [])
    for edu in edu_list:
        level = edu.get("degree", {}).get("level", "").lower()
        if "bachelor" in level or "master" in level or "phd" in level:
            score += 0.05
            break

    # Certifications
    if rec.get("certifications"):
        score += 0.03

    return round(min(_LABEL_CEILING, score), 4)


def _parse_duration_years(duration_str: str) -> float:
    """Parse '2 years 3 months' → 2.25, '6 months' → 0.5, etc."""
    if not duration_str:
        return 0.0
    import re
    years = 0.0
    months = 0.0
    y_match = re.search(r"(\d+)\s*year", duration_str, re.I)
    m_match = re.search(r"(\d+)\s*month", duration_str, re.I)
    if y_match:
        years = float(y_match.group(1))
    if m_match:
        months = float(m_match.group(1)) / 12.0
    return years + months


# ---------------------------------------------------------------------------
# Main builder
# ---------------------------------------------------------------------------

def build_dataset(
    use_embed: bool = True,
    use_ollama: bool = False,
    ollama_limit: int = 2000,
    output_path: Optional[Path] = None,
    seed: int = 42,
) -> Dict:
    """
    Build unified training JSONL from all dataset sources.

    Label priority for unlabeled pairs: embed_labeler > ollama_ensemble > rule-based.

    Returns summary dict with split counts.
    """
    random.seed(seed)
    output_path = output_path or OUTPUT_PATH
    output_path.parent.mkdir(parents=True, exist_ok=True)

    labeler_mode = "embed (sentence-transformers)" if use_embed else ("ollama" if use_ollama else "rule-based")
    print(f"[Builder] Output: {output_path}")
    print(f"[Builder] Labeling mode: {labeler_mode}")
    if use_ollama:
        print(f"[Builder] Ollama limit per dataset: {ollama_limit}")
    print()

    sources = [
        ("ATS dataset (train+val)", load_ats_dataset()),
        ("Job Applicant dataset", load_job_applicant_dataset(use_embed, use_ollama, ollama_limit)),
        ("AI Resume Screening", load_ai_resume_screening()),
        ("Resume Dataset 1", load_resume_dataset1(use_embed, use_ollama, ollama_limit // 2)),
    ]

    counts = {"train": 0, "val": 0, "test": 0, "total": 0}
    source_counts: Dict[str, int] = {}

    with open(output_path, "w", encoding="utf-8") as out_f:
        for source_name, gen in sources:
            print(f"\n[Builder] Processing: {source_name}")
            n = 0
            try:
                for record in gen:
                    out_f.write(json.dumps(record, ensure_ascii=False) + "\n")
                    counts[record["split"]] += 1
                    counts["total"] += 1
                    src = record.get("source", "unknown")
                    source_counts[src] = source_counts.get(src, 0) + 1
                    n += 1
            except Exception as e:
                print(f"[Builder] ERROR in {source_name}: {e}", file=sys.stderr)
            print(f"[Builder] {source_name}: {n} records written")

    print(f"\n{'='*50}")
    print(f"[Builder] COMPLETE: {output_path}")
    print(f"[Builder] Split counts: train={counts['train']}, val={counts['val']}, test={counts['test']}")
    print(f"[Builder] Total: {counts['total']}")
    print(f"[Builder] Sources:")
    for src, cnt in sorted(source_counts.items()):
        print(f"  {src:40s}: {cnt}")
    print(f"{'='*50}")

    return {"output": str(output_path), "counts": counts, "sources": source_counts}


def main():
    parser = argparse.ArgumentParser(description="Build unified training dataset")

    # Labeling mode flags (mutually exclusive priorities)
    label_group = parser.add_mutually_exclusive_group()
    label_group.add_argument(
        "--no-embed", action="store_true",
        help="Disable embed_labeler (fall through to Ollama or rules)"
    )
    label_group.add_argument(
        "--use-ollama", action="store_true",
        help="Use Ollama LLM ensemble instead of embed_labeler (slow)"
    )

    parser.add_argument(
        "--ollama-limit", type=int, default=2000,
        help="Max pairs to label with Ollama per dataset (default: 2000)"
    )
    parser.add_argument(
        "--output", default=str(OUTPUT_PATH),
        help="Output JSONL path"
    )
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    use_embed = not args.no_embed and not args.use_ollama
    use_ollama = args.use_ollama

    result = build_dataset(
        use_embed=use_embed,
        use_ollama=use_ollama,
        ollama_limit=args.ollama_limit,
        output_path=Path(args.output),
        seed=args.seed,
    )
    print(f"\nDataset ready: {result['output']}")


if __name__ == "__main__":
    main()
