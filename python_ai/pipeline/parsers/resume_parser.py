"""
Pipeline resume parser — Stage 2.
Uses spaCy + pdfminer.six to extract structured data from resumes.
Skill extraction uses ph_skills.json taxonomy via SkillNormalizer.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except ImportError:
    pdf_extract_text = None

try:
    from docx import Document as DocxDocument
except ImportError:
    DocxDocument = None

import sys
sys.path.insert(0, str(Path(__file__).parents[2]))
from pipeline.normalizers.skill_normalizer import SkillNormalizer

_normalizer = SkillNormalizer()

PH_CERTIFICATIONS = [
    "PRC", "TESDA NC", "TESDA NC II", "TESDA NC III", "CPA", "LET", "BAR",
    "RN", "CE", "RA", "MD", "DVM", "RPT", "RMT", "RPh", "ROT",
    "STCW", "MARINA", "CSE", "Civil Service", "DOLE",
]

EDUCATION_LEVELS = [
    ("PhD", ["phd", "ph.d", "doctor of philosophy", "doctoral"]),
    ("Master's", ["master", "mba", "msc", "m.s.", "m.a.", "mit", "med"]),
    ("Bachelor's", ["bachelor", "b.s.", "b.a.", "bscs", "bsit", "bsba", "bsn",
                    "bsme", "bsce", "bsee", "beed", "bsed", "ab ", "bs "]),
    ("Associate", ["associate", "two-year", "2-year"]),
    ("TESDA NC", ["nc ii", "nc iii", "national certificate", "tesda"]),
    ("High School", ["high school", "senior high", "shs", "secondary"]),
]


@dataclass
class ParsedResume:
    skills: List[str] = field(default_factory=list)
    experience_yrs: float = 0.0
    education: Dict = field(default_factory=dict)
    certifications: List[str] = field(default_factory=list)
    industry: Optional[str] = None
    region: Optional[str] = None
    raw_text: str = ""


def _extract_text(file_path: str) -> str:
    path = Path(file_path)
    ext = path.suffix.lower()
    if ext == ".pdf":
        if pdf_extract_text is None:
            raise ImportError("pdfminer.six not installed: pip install pdfminer.six")
        return pdf_extract_text(file_path)
    elif ext in (".docx", ".doc"):
        if DocxDocument is None:
            raise ImportError("python-docx not installed: pip install python-docx")
        doc = DocxDocument(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
    else:
        return path.read_text(encoding="utf-8", errors="ignore")


def _extract_skills(text: str) -> List[str]:
    # Extract all words/phrases and try normalizing each
    candidates: List[str] = []
    # Multi-word candidates (2-3 words)
    words = re.findall(r"\b[\w#.+/]+(?:\s[\w#.+/]+){0,2}\b", text)
    candidates.extend(words)
    return _normalizer.normalize_list(candidates)


def _extract_experience_years(text: str) -> float:
    patterns = [
        r"(\d+)\+?\s*years?\s+(?:of\s+)?(?:work\s+)?experience",
        r"(\d+)\+?\s*yrs?\s+(?:of\s+)?(?:work\s+)?experience",
        r"experience[:\s]+(\d+)\+?\s*years?",
        r"(\d{4})\s*[-–]\s*(?:present|current|now)",
    ]
    years_found = []
    for pat in patterns:
        matches = re.findall(pat, text, re.IGNORECASE)
        for m in matches:
            val = int(m)
            if val > 1900:  # It's a year range — calculate from now
                from datetime import datetime
                years_found.append(datetime.now().year - val)
            elif 0 < val < 50:
                years_found.append(val)
    return float(max(years_found)) if years_found else 0.0


def _extract_education(text: str, doc=None) -> Dict:
    text_lower = text.lower()
    for level, keywords in EDUCATION_LEVELS:
        for kw in keywords:
            if kw in text_lower:
                # Try to find school name
                school = ""
                if doc:
                    for ent in doc.ents:
                        if ent.label_ == "ORG" and any(
                            w in ent.text.lower()
                            for w in ["university", "college", "institute", "school"]
                        ):
                            school = ent.text
                            break
                return {"degree": level, "school": school}
    return {"degree": "Not specified", "school": ""}


def _extract_certifications(text: str) -> List[str]:
    found = []
    for cert in PH_CERTIFICATIONS:
        if re.search(re.escape(cert), text, re.IGNORECASE):
            found.append(cert)
    return found


def _infer_industry(skills: List[str]) -> Optional[str]:
    sector_counts: Dict[str, int] = {}
    for skill in skills:
        sector = _normalizer.get_sector(skill)
        if sector:
            sector_counts[sector] = sector_counts.get(sector, 0) + 1
    if not sector_counts:
        return None
    return max(sector_counts, key=sector_counts.get)


def _extract_region(text: str) -> Optional[str]:
    from json import load
    taxonomy_path = Path(__file__).parents[2] / "data" / "taxonomies" / "ph_skills.json"
    try:
        with open(taxonomy_path) as f:
            data = load(f)
        regions = data.get("ph_regions", [])
        text_lower = text.lower()
        for region in regions:
            if region.lower() in text_lower:
                return region
        # Common city → region mapping
        city_map = {
            "manila": "NCR", "quezon city": "NCR", "makati": "NCR",
            "taguig": "NCR", "pasig": "NCR", "cebu": "Region VII (Central Visayas)",
            "davao": "Region XI (Davao)", "iloilo": "Region VI (Western Visayas)",
            "cagayan de oro": "Region X (Northern Mindanao)", "naga": "Region V (Bicol)",
        }
        for city, region in city_map.items():
            if city in text_lower:
                return region
    except Exception:
        pass
    return None


def parse_resume_file(file_path: str) -> ParsedResume:
    """Parse a resume file and return structured data."""
    raw_text = _extract_text(file_path)
    return parse_resume_text(raw_text)


def parse_resume_text(raw_text: str) -> ParsedResume:
    """Parse resume from raw text."""
    doc = nlp(raw_text) if nlp else None
    skills = _extract_skills(raw_text)
    experience_yrs = _extract_experience_years(raw_text)
    education = _extract_education(raw_text, doc)
    certifications = _extract_certifications(raw_text)
    industry = _infer_industry(skills)
    region = _extract_region(raw_text)

    return ParsedResume(
        skills=skills,
        experience_yrs=experience_yrs,
        education=education,
        certifications=certifications,
        industry=industry,
        region=region,
        raw_text=raw_text,
    )
