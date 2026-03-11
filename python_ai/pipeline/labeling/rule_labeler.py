"""
Rule-based silver labeler using Jaccard similarity.
Score = |resume_skills ∩ job_skills| / |resume_skills ∪ job_skills|
Free, instant, no dependencies.
"""
from __future__ import annotations

from typing import Dict, List, Tuple


def jaccard_similarity(set_a: List[str], set_b: List[str]) -> float:
    """Compute Jaccard similarity between two skill lists."""
    a = {s.lower() for s in set_a if s}
    b = {s.lower() for s in set_b if s}
    if not a and not b:
        return 0.0
    intersection = len(a & b)
    union = len(a | b)
    return intersection / union if union > 0 else 0.0


def experience_score(resume_yrs: float, job_min_yrs: int) -> float:
    """Score experience match: 1.0 if meets requirement, decays for gap."""
    if job_min_yrs == 0:
        return 1.0
    if resume_yrs >= job_min_yrs:
        return 1.0
    # Partial credit: up to 80% if within 2 years below requirement
    gap = job_min_yrs - resume_yrs
    if gap <= 2:
        return max(0.5, 1.0 - gap * 0.25)
    return max(0.0, 1.0 - gap * 0.15)


def education_score(resume_edu: dict, job_edu: str) -> float:
    """Score education match."""
    LEVELS = {
        "PhD": 6, "Master's": 5, "Bachelor's": 4,
        "Associate": 3, "TESDA NC": 2, "High School": 1, "Not specified": 0,
    }
    resume_level = LEVELS.get(resume_edu.get("degree", "Not specified"), 0)
    required_level = LEVELS.get(job_edu or "Not specified", 0)
    if required_level == 0:
        return 1.0
    if resume_level >= required_level:
        return 1.0
    return max(0.0, resume_level / required_level)


def label_pair(resume: dict, job: dict) -> Tuple[float, str]:
    """
    Compute confidence score for a resume–job pair using rule-based heuristics.
    Returns (confidence: float, method: str).
    """
    skill_score = jaccard_similarity(
        resume.get("skills", []),
        job.get("required_skills", []),
    )
    exp_score = experience_score(
        resume.get("experience_yrs", 0),
        job.get("min_experience", 0),
    )
    edu_score = education_score(
        resume.get("education", {}),
        job.get("education_required", ""),
    )

    # Weighted combination: skills 60%, experience 30%, education 10%
    confidence = 0.60 * skill_score + 0.30 * exp_score + 0.10 * edu_score
    confidence = round(min(1.0, max(0.0, confidence)), 4)

    return confidence, "rule_based"


def label_batch(pairs: List[Tuple[dict, dict]]) -> List[Dict]:
    """Label a batch of (resume, job) tuples."""
    results = []
    for resume, job in pairs:
        confidence, method = label_pair(resume, job)
        results.append({
            "resume_id": resume.get("id"),
            "job_id": job.get("id"),
            "confidence": confidence,
            "label_method": method,
        })
    return results


def assign_splits(
    pairs: List[dict],
    train_ratio: float = 0.8,
    val_ratio: float = 0.1,
) -> List[dict]:
    """Assign train/val/test splits to labeled pairs."""
    import random
    random.shuffle(pairs)
    n = len(pairs)
    train_end = int(n * train_ratio)
    val_end = train_end + int(n * val_ratio)

    for i, pair in enumerate(pairs):
        if i < train_end:
            pair["split"] = "train"
        elif i < val_end:
            pair["split"] = "val"
        else:
            pair["split"] = "test"
    return pairs
