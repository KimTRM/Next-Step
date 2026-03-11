"""
Job posting parser — Stage 2.
Cleans scraped job JSON and extracts structured fields.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

sys.path.insert(0, str(Path(__file__).parents[2]))
from pipeline.normalizers.skill_normalizer import SkillNormalizer

_normalizer = SkillNormalizer()


def parse_job(raw: dict) -> dict:
    """Clean and structure a raw scraped job dict."""
    description = raw.get("description", "") or ""
    title = (raw.get("title") or "").strip()
    company = (raw.get("company") or "").strip()
    location = (raw.get("location") or "").strip()

    # Extract skills from raw skill list + description
    raw_skills = raw.get("skills") or raw.get("required_skills") or []
    if isinstance(raw_skills, str):
        raw_skills = [s.strip() for s in raw_skills.split(",")]
    desc_skills = _extract_skills_from_text(description)
    all_skills = raw_skills + desc_skills
    required_skills = _normalizer.normalize_list_with_fallback(all_skills)

    # Extract min experience
    min_exp = raw.get("min_experience") or raw.get("minimum_years_of_work_experience") or 0
    if not min_exp:
        min_exp = _extract_min_experience(description)

    # Infer industry
    industry = raw.get("industry") or _infer_industry_from_title(title)

    # Clean location to region
    region = _infer_region(location)

    return {
        "title": title,
        "company": company,
        "location": location,
        "region": region,
        "required_skills": required_skills,
        "min_experience": int(min_exp) if min_exp else 0,
        "industry": industry,
        "description": description[:2000],  # truncate
        "source": raw.get("source", "scraped"),
        "source_url": raw.get("source_url") or raw.get("url", ""),
    }


def _extract_skills_from_text(text: str) -> List[str]:
    words = re.findall(r"\b[\w#.+/]+(?:\s[\w#.+/]+){0,2}\b", text)
    return words


def _extract_min_experience(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s*years?\s+(?:of\s+)?(?:relevant\s+)?experience",
        r"minimum\s+(\d+)\s+years?",
        r"at\s+least\s+(\d+)\s+years?",
    ]
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            val = int(m.group(1))
            if 0 <= val <= 30:
                return val
    return 0


TITLE_INDUSTRY_MAP = {
    "software": "Technology", "developer": "Technology", "engineer": "Technology",
    "data": "Technology", "devops": "Technology", "cloud": "Technology",
    "nurse": "Healthcare", "doctor": "Healthcare", "physician": "Healthcare",
    "pharmacist": "Healthcare", "therapist": "Healthcare",
    "accountant": "Finance", "cpa": "Finance", "auditor": "Finance",
    "analyst": "Finance", "finance": "Finance",
    "teacher": "Education", "professor": "Education", "instructor": "Education",
    "bpo": "BPO/Outsourcing", "customer service": "BPO/Outsourcing",
    "call center": "BPO/Outsourcing",
    "lawyer": "Legal/Compliance", "paralegal": "Legal/Compliance",
    "architect": "Construction", "civil": "Construction",
    "designer": "Creative/Media", "ux": "Creative/Media", "ui": "Creative/Media",
    "marketing": "Cross-Industry", "hr": "Cross-Industry",
}


def _infer_industry_from_title(title: str) -> Optional[str]:
    title_lower = title.lower()
    for keyword, industry in TITLE_INDUSTRY_MAP.items():
        if keyword in title_lower:
            return industry
    return None


def _infer_region(location: str) -> Optional[str]:
    loc = location.lower()
    city_region = {
        "manila": "NCR", "quezon": "NCR", "makati": "NCR",
        "taguig": "NCR", "pasig": "NCR", "paranaque": "NCR",
        "cebu": "Region VII (Central Visayas)",
        "davao": "Region XI (Davao)",
        "iloilo": "Region VI (Western Visayas)",
        "cagayan": "Region X (Northern Mindanao)",
        "naga": "Region V (Bicol)",
        "remote": "OFW/Overseas",
        "overseas": "OFW/Overseas",
        "abroad": "OFW/Overseas",
    }
    for city, region in city_region.items():
        if city in loc:
            return region
    return None
