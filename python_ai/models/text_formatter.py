"""
Text formatter for the Bi-Encoder and Cross-Encoder models.
Converts structured resume/job dicts into formatted text strings
for tokenization by the multilingual MiniLM model.
"""
from __future__ import annotations

from typing import Dict, List


def format_resume(r: dict) -> str:
    """Format a resume dict into a structured text string for the encoder."""
    skills = r.get("skills") or []
    if isinstance(skills, str):
        import json
        try:
            skills = json.loads(skills)
        except Exception:
            skills = [skills]

    edu = r.get("education") or {}
    if isinstance(edu, str):
        import json
        try:
            edu = json.loads(edu)
        except Exception:
            edu = {}

    certs = r.get("certifications") or []
    if isinstance(certs, str):
        import json
        try:
            certs = json.loads(certs)
        except Exception:
            certs = [certs]

    parts = [
        f"SKILLS: {', '.join(skills[:30]) if skills else 'None'}",
        f"EXPERIENCE: {r.get('experience_yrs', 0)} years",
        f"EDUCATION: {edu.get('degree', 'Not specified')} from {edu.get('school', '')}".strip(),
        f"CERTIFICATIONS: {', '.join(certs) if certs else 'None'}",
    ]
    if r.get("industry"):
        parts.append(f"INDUSTRY: {r['industry']}")
    if r.get("region"):
        parts.append(f"REGION: {r['region']}")

    return " | ".join(parts)


def format_job(j: dict) -> str:
    """Format a job dict into a structured text string for the encoder."""
    skills = j.get("required_skills") or []
    if isinstance(skills, str):
        import json
        try:
            skills = json.loads(skills)
        except Exception:
            skills = [skills]

    certs = j.get("certifications") or []
    if isinstance(certs, str):
        import json
        try:
            certs = json.loads(certs)
        except Exception:
            certs = [certs]

    parts = [
        f"ROLE: {j.get('title', '')}",
        f"REQUIRED SKILLS: {', '.join(skills[:30]) if skills else 'None'}",
        f"MIN EXPERIENCE: {j.get('min_experience', 0)} years",
        f"INDUSTRY: {j.get('industry', '')}",
    ]
    if certs:
        parts.append(f"CERTIFICATIONS REQUIRED: {', '.join(certs)}")
    if j.get("education_required"):
        parts.append(f"EDUCATION: {j['education_required']}")
    if j.get("niche"):
        parts.append(f"NICHE: {j['niche']}")
    if j.get("region"):
        parts.append(f"REGION: {j['region']}")

    return " | ".join(parts)


def verdict_from_confidence(confidence: float) -> str:
    """Convert confidence score to human-readable verdict."""
    if confidence >= 0.75:
        return "Strong Match"
    elif confidence >= 0.45:
        return "Partial Match"
    else:
        return "Low Match"
