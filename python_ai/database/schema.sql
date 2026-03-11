-- PH Job Matcher — PostgreSQL + pgvector schema
-- Install pgvector: https://github.com/pgvector/pgvector
-- Run: psql $DATABASE_URL -f python_ai/database/schema.sql

CREATE EXTENSION IF NOT EXISTS vector;
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
    source TEXT, -- 'jobstreet_ph' | 'kalibrr' | 'synthetic' | 'kaggle'
    source_url TEXT,
    embedding VECTOR(384),
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
    embedding VECTOR(384),
    source TEXT, -- 'user_upload' | 'synthetic' | 'kaggle' | 'huggingface'
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

-- Training runs table (for tracking training history)
CREATE TABLE IF NOT EXISTS training_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running', -- 'running' | 'completed' | 'failed'
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
    stage TEXT, -- 'ingestion' | 'parsing' | 'normalization' | 'labeling' | 'storage' | 'full'
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running',
    records_processed INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    notes TEXT
);

-- Feedback table (application outcomes for continuous learning)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id),
    job_id UUID REFERENCES jobs(id),
    was_successful BOOLEAN,
    feedback_type TEXT DEFAULT 'application',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_region ON jobs(region);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_resumes_source ON resumes(source);
CREATE INDEX IF NOT EXISTS idx_training_pairs_split ON training_pairs(split);
CREATE INDEX IF NOT EXISTS idx_training_pairs_label_method ON training_pairs(label_method);

-- Vector similarity search indexes (IVFFlat for approximate nearest neighbor)
-- Run after loading data: CREATE INDEX ON jobs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX ON resumes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
