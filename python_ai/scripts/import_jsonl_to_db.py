"""
Import synthetic_pairs.jsonl into PostgreSQL (jobs, resumes, training_pairs tables).
Run from python_ai directory: python scripts/import_jsonl_to_db.py
"""
import json
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from database.db import get_conn, ping

JSONL_PATH = Path(__file__).parents[1] / "python_ai" / "data" / "labeled" / "synthetic_pairs.jsonl"
FALLBACK_PATH = Path(__file__).parents[1] / "data" / "labeled" / "synthetic_pairs.jsonl"


def import_pairs(jsonl_path: Path):
    print(f"Importing from: {jsonl_path}")
    count = 0
    errors = 0

    with open(jsonl_path, encoding="utf-8") as f:
        lines = f.readlines()

    print(f"Found {len(lines):,} pairs. Inserting...")

    with get_conn() as conn:
        with conn.cursor() as cur:
            for line in lines:
                try:
                    item = json.loads(line.strip())
                    resume = item.get("resume", {})
                    job = item.get("job", {})
                    confidence = float(item.get("confidence", 0.5))
                    split = item.get("split", "train")

                    resume_id = str(uuid.uuid4())
                    job_id = str(uuid.uuid4())

                    cur.execute(
                        """
                        INSERT INTO resumes (id, skills, experience_yrs, education, certifications, industry, region, source)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            resume_id,
                            json.dumps(resume.get("skills", [])),
                            resume.get("experience_yrs", 0),
                            json.dumps(resume.get("education", {})),
                            json.dumps(resume.get("certifications", [])),
                            resume.get("industry"),
                            resume.get("region"),
                            "synthetic",
                        ),
                    )

                    cur.execute(
                        """
                        INSERT INTO jobs (id, title, company, location, region, required_skills,
                                         min_experience, max_experience, education_required,
                                         industry, niche, certifications, source)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            job_id,
                            job.get("title", ""),
                            job.get("company"),
                            job.get("location"),
                            job.get("region"),
                            json.dumps(job.get("required_skills", [])),
                            job.get("min_experience", 0),
                            job.get("max_experience"),
                            job.get("education_required"),
                            job.get("industry"),
                            job.get("niche"),
                            json.dumps(job.get("certifications", [])),
                            "synthetic",
                        ),
                    )

                    cur.execute(
                        """
                        INSERT INTO training_pairs (id, resume_id, job_id, confidence, label_method, split)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        """,
                        (str(uuid.uuid4()), resume_id, job_id, confidence, "rule_based", split),
                    )

                    count += 1
                    if count % 1000 == 0:
                        print(f"  Inserted {count:,} pairs...")
                        conn.commit()

                except Exception as e:
                    errors += 1
                    if errors <= 3:
                        print(f"  [WARN] Row error: {e}")

        conn.commit()

    print(f"\nDone. Inserted {count:,} pairs ({errors} errors).")


if __name__ == "__main__":
    if not ping():
        print("ERROR: Cannot connect to PostgreSQL. Check DATABASE_URL in .env.local")
        sys.exit(1)

    path = JSONL_PATH if JSONL_PATH.exists() else FALLBACK_PATH
    if not path.exists():
        print(f"ERROR: JSONL file not found at:\n  {JSONL_PATH}\n  {FALLBACK_PATH}")
        print("Run: python -m data.synthetic.combinatorial_generator")
        sys.exit(1)

    import_pairs(path)
