"""
Kalibrr job listings fetcher via their public JSON API.

Usage:
    python python_ai/pipeline/spiders/kalibrr_spider.py \
        --output python_ai/data/raw/kalibrr_jobs.jsonl
"""
from __future__ import annotations

import argparse
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List

import requests

KALIBRR_API = "https://www.kalibrr.com/api/job_posts"

SEARCH_KEYWORDS = [
    "software engineer", "data analyst", "nurse", "accountant",
    "customer service", "marketing", "teacher", "engineer", "designer",
]


def fetch_kalibrr_jobs(keyword: str, limit: int = 20) -> List[dict]:
    jobs = []
    try:
        resp = requests.get(
            KALIBRR_API,
            params={
                "search": keyword,
                "limit": limit,
                "offset": 0,
                "country_code": "PH",
            },
            headers={"Accept": "application/json"},
            timeout=20,
        )
        resp.raise_for_status()
        data = resp.json()

        for item in data.get("job_posts", []):
            jobs.append({
                "title": item.get("name", ""),
                "company": item.get("company", {}).get("name", ""),
                "location": item.get("location", ""),
                "required_skills": [
                    s.get("name", "") for s in item.get("required_skills", [])
                ],
                "min_experience": item.get("minimum_years_of_work_experience", 0),
                "description": item.get("description_plaintext", ""),
                "industry": item.get("industries", [{}])[0].get("name", "") if item.get("industries") else "",
                "source": "kalibrr",
                "keyword": keyword,
                "scraped_at": datetime.utcnow().isoformat(),
                "source_url": f"https://www.kalibrr.com/jobs/{item.get('id', '')}",
            })
    except Exception as e:
        print(f"[Kalibrr] Error fetching '{keyword}': {e}")

    return jobs


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="python_ai/data/raw/kalibrr_jobs.jsonl")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    total = 0
    with open(args.output, "w", encoding="utf-8") as f:
        for keyword in SEARCH_KEYWORDS:
            print(f"Fetching: {keyword}...")
            jobs = fetch_kalibrr_jobs(keyword, limit=args.limit)
            for job in jobs:
                f.write(json.dumps(job, ensure_ascii=False) + "\n")
            total += len(jobs)
            print(f"  Got {len(jobs)} jobs")
            time.sleep(1.5)

    print(f"\nTotal jobs saved: {total} → {args.output}")


if __name__ == "__main__":
    main()
