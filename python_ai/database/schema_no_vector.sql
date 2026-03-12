-- PH Job Matcher — PostgreSQL schema (no pgvector required)
-- Run: psql -U user -d ph_jobmatcher -f python_ai/database/schema_no_vector.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    region TEXT,
    required_skills JSONB DEFAULT '[]',
    min_experience INT DEFAULT 0,
    max_experience INT,
    education_required TEXT,
    industry TEXT,
    niche TEXT,
    certifications JSONB DEFAULT '[]',
    description TEXT,
    source TEXT,
    source_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    skills JSONB DEFAULT '[]',
    experience_yrs FLOAT DEFAULT 0,
    education JSONB DEFAULT '{}',
    certifications JSONB DEFAULT '[]',
    industry TEXT,
    region TEXT,
    raw_text TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training pairs table
CREATE TABLE IF NOT EXISTS training_pairs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    confidence FLOAT CHECK (confidence BETWEEN 0 AND 1),
    label_method TEXT CHECK (label_method IN ('human', 'llm', 'rule_based')),
    split TEXT CHECK (split IN ('train', 'val', 'test')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training runs table
CREATE TABLE IF NOT EXISTS training_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    epochs INT,
    batch_size INT,
    learning_rate FLOAT,
    train_loss FLOAT,
    val_loss FLOAT,
    pearson FLOAT,
    rmse FLOAT,
    ndcg_at_10 FLOAT,
    precision_at_5 FLOAT,
    checkpoint_path TEXT,
    notes TEXT
);

-- Pipeline runs table
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    records_processed INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    notes TEXT
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id),
    job_id UUID REFERENCES jobs(id),
    was_successful BOOLEAN,
    feedback_type TEXT DEFAULT 'application',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_resumes_source ON resumes(source);
CREATE INDEX IF NOT EXISTS idx_training_pairs_split ON training_pairs(split);
CREATE INDEX IF NOT EXISTS idx_training_pairs_label_method ON training_pairs(label_method);
