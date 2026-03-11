"""
PostgreSQL + pgvector database connection and query helpers.
Replaces the SQLite JobDatabase from data/data_generator.py.
"""
from __future__ import annotations

import json
import os
import uuid
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Generator, List, Optional

import psycopg2
import psycopg2.pool
import psycopg2.extras
from psycopg2.extras import RealDictCursor

from config.settings import settings


def _get_dsn() -> str:
    return settings.DATABASE_URL or os.getenv("DATABASE_URL", "")


# Module-level connection pool (lazy init)
_pool: Optional[psycopg2.pool.ThreadedConnectionPool] = None


def get_pool() -> psycopg2.pool.ThreadedConnectionPool:
    global _pool
    if _pool is None:
        dsn = _get_dsn()
        if not dsn:
            raise RuntimeError(
                "DATABASE_URL is not set. Add it to .env.local or environment variables."
            )
        _pool = psycopg2.pool.ThreadedConnectionPool(minconn=1, maxconn=10, dsn=dsn)
    return _pool


@contextmanager
def get_conn() -> Generator[psycopg2.extensions.connection, None, None]:
    pool = get_pool()
    conn = pool.getconn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


@contextmanager
def get_cursor(conn=None) -> Generator[RealDictCursor, None, None]:
    if conn is not None:
        yield conn.cursor(cursor_factory=RealDictCursor)
    else:
        with get_conn() as c:
            yield c.cursor(cursor_factory=RealDictCursor)


# ---------------------------------------------------------------------------
# Jobs
# ---------------------------------------------------------------------------

def insert_job(job: dict) -> str:
    """Insert a job record, return its UUID."""
    job_id = str(uuid.uuid4())
    embedding = job.get("embedding")  # list[float] | None

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO jobs
                    (id, title, company, location, region, required_skills,
                     min_experience, max_experience, education_required,
                     industry, niche, certifications, description, source, source_url, embedding)
                VALUES
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
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
                    job.get("description"),
                    job.get("source", "synthetic"),
                    job.get("source_url"),
                    embedding,
                ),
            )
    return job_id


def get_jobs(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[dict]:
    conditions = []
    params: list = []

    if industry:
        conditions.append("industry = %s")
        params.append(industry)
    if region:
        conditions.append("region ILIKE %s")
        params.append(f"%{region}%")

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params += [limit, offset]

    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                f"SELECT * FROM jobs {where} ORDER BY created_at DESC LIMIT %s OFFSET %s",
                params,
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


def vector_search_jobs(embedding: list, limit: int = 20) -> List[dict]:
    """Find the most similar jobs using pgvector cosine similarity."""
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *, 1 - (embedding <=> %s::vector) AS similarity
                FROM jobs
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (embedding, embedding, limit),
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Resumes
# ---------------------------------------------------------------------------

def insert_resume(resume: dict) -> str:
    resume_id = str(uuid.uuid4())
    embedding = resume.get("embedding")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO resumes
                    (id, skills, experience_yrs, education, certifications,
                     industry, region, raw_text, embedding, source)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    resume_id,
                    json.dumps(resume.get("skills", [])),
                    resume.get("experience_yrs", 0),
                    json.dumps(resume.get("education", {})),
                    json.dumps(resume.get("certifications", [])),
                    resume.get("industry"),
                    resume.get("region"),
                    resume.get("raw_text"),
                    embedding,
                    resume.get("source", "synthetic"),
                ),
            )
    return resume_id


# ---------------------------------------------------------------------------
# Training Pairs
# ---------------------------------------------------------------------------

def insert_training_pair(resume_id: str, job_id: str, confidence: float,
                          label_method: str, split: str) -> str:
    pair_id = str(uuid.uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO training_pairs (id, resume_id, job_id, confidence, label_method, split)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (pair_id, resume_id, job_id, confidence, label_method, split),
            )
    return pair_id


def get_training_pairs(split: Optional[str] = None, limit: int = 10000) -> List[dict]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if split:
                cur.execute(
                    """
                    SELECT tp.*, r.skills as resume_skills, r.experience_yrs, r.education,
                           r.certifications as resume_certs, r.raw_text,
                           j.title as job_title, j.required_skills, j.min_experience,
                           j.industry, j.niche, j.certifications as job_certs
                    FROM training_pairs tp
                    JOIN resumes r ON tp.resume_id = r.id
                    JOIN jobs j ON tp.job_id = j.id
                    WHERE tp.split = %s
                    LIMIT %s
                    """,
                    (split, limit),
                )
            else:
                cur.execute(
                    """
                    SELECT tp.*, r.skills as resume_skills, r.experience_yrs, r.education,
                           r.certifications as resume_certs, r.raw_text,
                           j.title as job_title, j.required_skills, j.min_experience,
                           j.industry, j.niche, j.certifications as job_certs
                    FROM training_pairs tp
                    JOIN resumes r ON tp.resume_id = r.id
                    JOIN jobs j ON tp.job_id = j.id
                    LIMIT %s
                    """,
                    (limit,),
                )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Training Runs
# ---------------------------------------------------------------------------

def start_training_run(epochs: int, batch_size: int, learning_rate: float) -> str:
    run_id = str(uuid.uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO training_runs (id, epochs, batch_size, learning_rate, status)
                VALUES (%s, %s, %s, %s, 'running')
                """,
                (run_id, epochs, batch_size, learning_rate),
            )
    return run_id


def finish_training_run(run_id: str, metrics: dict, checkpoint_path: str,
                         status: str = "completed"):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE training_runs SET
                    finished_at = NOW(), status = %s,
                    train_loss = %s, val_loss = %s,
                    pearson = %s, rmse = %s,
                    ndcg_at_10 = %s, precision_at_5 = %s,
                    checkpoint_path = %s
                WHERE id = %s
                """,
                (
                    status,
                    metrics.get("train_loss"),
                    metrics.get("val_loss"),
                    metrics.get("pearson"),
                    metrics.get("rmse"),
                    metrics.get("ndcg_at_10"),
                    metrics.get("precision_at_5"),
                    checkpoint_path,
                    run_id,
                ),
            )


def get_latest_training_run() -> Optional[dict]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM training_runs ORDER BY started_at DESC LIMIT 1"
            )
            row = cur.fetchone()
    return dict(row) if row else None


def get_training_history(limit: int = 10) -> List[dict]:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT * FROM training_runs ORDER BY started_at DESC LIMIT %s",
                (limit,),
            )
            rows = cur.fetchall()
    return [dict(r) for r in rows]


# ---------------------------------------------------------------------------
# Pipeline Runs
# ---------------------------------------------------------------------------

def start_pipeline_run(stage: str) -> str:
    run_id = str(uuid.uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO pipeline_runs (id, stage, status) VALUES (%s, %s, 'running')",
                (run_id, stage),
            )
    return run_id


def finish_pipeline_run(run_id: str, records_processed: int = 0,
                          records_failed: int = 0, status: str = "completed",
                          notes: str = ""):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE pipeline_runs SET
                    finished_at = NOW(), status = %s,
                    records_processed = %s, records_failed = %s, notes = %s
                WHERE id = %s
                """,
                (status, records_processed, records_failed, notes, run_id),
            )


def get_pipeline_status() -> dict:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 1")
            latest = cur.fetchone()
            cur.execute("SELECT COUNT(*) as total FROM jobs")
            job_count = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as total FROM resumes")
            resume_count = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as total FROM training_pairs")
            pair_count = cur.fetchone()["total"]
            cur.execute(
                """
                SELECT label_method, COUNT(*) as count
                FROM training_pairs GROUP BY label_method
                """
            )
            label_breakdown = {r["label_method"]: r["count"] for r in cur.fetchall()}
            cur.execute(
                "SELECT industry, COUNT(*) as count FROM jobs GROUP BY industry ORDER BY count DESC LIMIT 15"
            )
            industry_breakdown = {r["industry"]: r["count"] for r in cur.fetchall()}

    return {
        "latest_run": dict(latest) if latest else None,
        "job_count": job_count,
        "resume_count": resume_count,
        "training_pair_count": pair_count,
        "label_method_breakdown": label_breakdown,
        "industry_breakdown": industry_breakdown,
    }


# ---------------------------------------------------------------------------
# Feedback
# ---------------------------------------------------------------------------

def insert_feedback(resume_id: str, job_id: str, was_successful: bool,
                     feedback_type: str = "application") -> str:
    fb_id = str(uuid.uuid4())
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO feedback (id, resume_id, job_id, was_successful, feedback_type)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (fb_id, resume_id, job_id, was_successful, feedback_type),
            )
    return fb_id


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

def ping() -> bool:
    try:
        with get_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        return True
    except Exception:
        return False
