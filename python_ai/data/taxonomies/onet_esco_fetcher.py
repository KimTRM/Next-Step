"""
O*NET + ESCO taxonomy fetcher.
Pulls occupations and skills from O*NET REST API and ESCO REST API,
merges by SOC/ISCO code, and enriches with PH-specific credentials.

Usage:
    python onet_esco_fetcher.py --output ph_skills_augmented.json

O*NET: Register free at https://services.onetcenter.org/developer/
ESCO: No auth required — https://esco.ec.europa.eu/en/use-esco/esco-api
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

ONET_BASE = "https://services.onetcenter.org/ws"
ESCO_BASE = "https://ec.europa.eu/esco/api"

TAXONOMY_DIR = Path(__file__).parent
BASE_TAXONOMY = TAXONOMY_DIR / "ph_skills.json"
OUTPUT_FILE = TAXONOMY_DIR / "ph_skills_augmented.json"

# PH-specific credential injection
PH_CREDENTIALS = [
    {"credential": "PRC RN", "canonical": "Nursing (PRC)", "sector": "Healthcare"},
    {"credential": "PRC CPA", "canonical": "Accountancy (CPA)", "sector": "Finance"},
    {"credential": "PRC LET", "canonical": "Teaching (LET)", "sector": "Education"},
    {"credential": "PH BAR", "canonical": "BAR Exam (Lawyer)", "sector": "Legal/Compliance"},
    {"credential": "PRC CE", "canonical": "Civil Engineering (PRC)", "sector": "Construction"},
    {"credential": "PRC MD", "canonical": "Medicine (PRC)", "sector": "Healthcare"},
    {"credential": "PRC RPT", "canonical": "Physical Therapy", "sector": "Healthcare"},
    {"credential": "PRC RMT", "canonical": "Medical Technology", "sector": "Healthcare"},
    {"credential": "PRC RPh", "canonical": "Pharmacy", "sector": "Healthcare"},
    {"credential": "PRC RA", "canonical": "Architecture (PRC)", "sector": "Construction"},
    {"credential": "MARINA STCW", "canonical": "Marine Officer (STCW)", "sector": "Maritime"},
    {"credential": "PRC DVM", "canonical": "Veterinary Medicine (PRC)", "sector": "Agriculture"},
    {"credential": "TESDA NC II", "canonical": "TESDA NC II", "sector": "Vocational"},
    {"credential": "TESDA NC III", "canonical": "TESDA NC III", "sector": "Vocational"},
    {"credential": "DOLE OSH", "canonical": "DOLE Safety Officer", "sector": "Construction"},
    {"credential": "CSC CSE", "canonical": "Civil Service Eligibility", "sector": "Government"},
]


# ---------------------------------------------------------------------------
# O*NET fetcher
# ---------------------------------------------------------------------------

def fetch_onet_occupations(username: str, password: str,
                             limit: int = 50) -> List[Dict]:
    """Fetch top occupations from O*NET with their skills."""
    occupations = []
    try:
        resp = requests.get(
            f"{ONET_BASE}/mnm/careers",
            auth=(username, password),
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        careers = data.get("career", [])[:limit]

        for career in careers:
            code = career.get("code", "")
            title = career.get("title", "")
            skills = _fetch_onet_skills(code, username, password)
            occupations.append({
                "soc_code": code,
                "title": title,
                "skills": skills,
                "source": "onet",
            })
            time.sleep(0.5)  # Rate limiting

    except Exception as e:
        print(f"[O*NET] Warning: {e}", file=sys.stderr)

    return occupations


def _fetch_onet_skills(soc_code: str, username: str, password: str) -> List[str]:
    try:
        resp = requests.get(
            f"{ONET_BASE}/occupations/{soc_code}/skills",
            auth=(username, password),
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        return [s.get("name", "") for s in data.get("element", [])[:10]]
    except Exception:
        return []


# ---------------------------------------------------------------------------
# ESCO fetcher
# ---------------------------------------------------------------------------

def fetch_esco_occupations(limit: int = 50) -> List[Dict]:
    """Fetch occupations from ESCO API (no auth required)."""
    occupations = []
    try:
        resp = requests.get(
            f"{ESCO_BASE}/search",
            params={
                "type": "occupation",
                "language": "en",
                "limit": limit,
                "offset": 0,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get("_embedded", {}).get("results", [])

        for result in results:
            uri = result.get("uri", "")
            title = result.get("title", "")
            skills = _fetch_esco_skills(uri)
            occupations.append({
                "isco_uri": uri,
                "title": title,
                "skills": skills,
                "source": "esco",
            })
            time.sleep(0.5)

    except Exception as e:
        print(f"[ESCO] Warning: {e}", file=sys.stderr)

    return occupations


def _fetch_esco_skills(occupation_uri: str) -> List[str]:
    try:
        resp = requests.get(
            f"{ESCO_BASE}/resource/occupation",
            params={"uri": occupation_uri, "language": "en"},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()
        essential = data.get("_links", {}).get("hasEssentialSkill", [])
        return [s.get("title", "") for s in essential[:10]]
    except Exception:
        return []


# ---------------------------------------------------------------------------
# Merge and augment
# ---------------------------------------------------------------------------

def merge_taxonomies(
    base: dict,
    onet_occupations: List[dict],
    esco_occupations: List[dict],
) -> dict:
    """Merge O*NET and ESCO results into the base PH taxonomy."""
    existing_canonicals = {s["canonical"].lower() for s in base["skills"]}
    new_skills = []

    all_occupations = onet_occupations + esco_occupations
    for occ in all_occupations:
        for skill_name in occ.get("skills", []):
            if not skill_name:
                continue
            if skill_name.lower() in existing_canonicals:
                continue
            new_skills.append({
                "canonical": skill_name,
                "aliases": [],
                "sector": "Cross-Industry",
                "category": "O*NET/ESCO",
                "source": occ.get("source", "external"),
            })
            existing_canonicals.add(skill_name.lower())

    # Add PH credentials as enrichment metadata
    enriched = base.copy()
    enriched["skills"] = base["skills"] + new_skills
    enriched["onet_occupations"] = onet_occupations
    enriched["esco_occupations"] = esco_occupations
    enriched["ph_credentials"] = PH_CREDENTIALS
    enriched["total_skills"] = len(enriched["skills"])

    return enriched


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Fetch O*NET + ESCO taxonomy")
    parser.add_argument("--onet-user", default=os.getenv("ONET_USERNAME", ""))
    parser.add_argument("--onet-pass", default=os.getenv("ONET_PASSWORD", ""))
    parser.add_argument("--limit", type=int, default=50,
                        help="Max occupations to fetch per source")
    parser.add_argument("--output", default=str(OUTPUT_FILE))
    parser.add_argument("--skip-onet", action="store_true")
    parser.add_argument("--skip-esco", action="store_true")
    args = parser.parse_args()

    # Load base taxonomy
    with open(BASE_TAXONOMY) as f:
        base = json.load(f)

    print(f"Base taxonomy: {len(base['skills'])} skills")

    onet_occupations: List[dict] = []
    esco_occupations: List[dict] = []

    if not args.skip_onet and args.onet_user:
        print("Fetching O*NET occupations...")
        onet_occupations = fetch_onet_occupations(
            args.onet_user, args.onet_pass, limit=args.limit
        )
        print(f"  Got {len(onet_occupations)} O*NET occupations")
    else:
        print("Skipping O*NET (no credentials or --skip-onet)")

    if not args.skip_esco:
        print("Fetching ESCO occupations...")
        esco_occupations = fetch_esco_occupations(limit=args.limit)
        print(f"  Got {len(esco_occupations)} ESCO occupations")

    merged = merge_taxonomies(base, onet_occupations, esco_occupations)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"\nAugmented taxonomy saved to {args.output}")
    print(f"Total skills: {merged['total_skills']}")


if __name__ == "__main__":
    main()
