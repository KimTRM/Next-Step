# NextStep AI — Job Matching System (v2)

An AI-powered job matching system for the Philippine job market. Uses a **Siamese Bi-Encoder + Cross-Encoder** architecture trained on real job/resume pairs, with **DeepSeek R1** as an LLM judge for per-epoch bias correction during training.

## Architecture

```
Resume Input
     │
     ▼
[Bi-Encoder]  ←── sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
     │              Fast semantic retrieval — top-K candidates
     ▼
[Cross-Encoder] ←── same base model, fine-tuned on PH job pairs
     │               Precise confidence scoring — sigmoid → [0.0, 1.0]
     ▼
Confidence Score + Verdict
```

### Per-Epoch DeepSeek Bias Correction

During training, after each validation pass, DeepSeek R1 (via Ollama) acts as an independent judge on a sample of training pairs. Its scores are used to soft-correct labels in the training dataset:

```
new_label = old_label + alpha × (deepseek_score − old_label)
```

- `alpha = 0.3` (default) — 30% nudge toward DeepSeek's judgment per epoch
- This gradually corrects rule-based label bias without fully overriding the original labels
- VRAM is shared safely: training model is offloaded to CPU during judge calls, then restored to GPU

## Features

- **Resume Parsing**: Extract skills, experience, education from PDF/DOCX/TXT
- **Semantic Matching**: Bi-Encoder retrieval + Cross-Encoder reranking
- **Confidence Scoring**: Calibrated 0–100% match scores
- **LLM Resume Analysis**: Gemini → DeepSeek R1 → rule-based fallback chain
- **Data Pipeline**: Scrape → normalize → LLM-label → train
- **Per-Epoch DeepSeek Judge**: Bias correction using DeepSeek R1 during training
- **Async Evaluation**: Non-blocking evaluation with live log streaming
- **REST API**: Full FastAPI backend

## Quick Start

### 1. Install Dependencies

```bash
cd python_ai
pip install -r requirements.txt
```

### 2. Set Up Ollama (for DeepSeek features)

```bash
# Install Ollama: https://ollama.com
ollama pull deepseek-r1:7b
```

### 3. Configure Environment

Create a `.env` file in `python_ai/`:

```env
# Google Gemini (for resume analysis)
GEMINI_API_KEY=your_gemini_api_key

# Apify (for job scraping)
APIFY_API_KEY=apify_api_xxxxx

# PostgreSQL + pgvector
DATABASE_URL=postgresql://user:pass@localhost:5432/nextstep
```

### 4. Run the Data Pipeline

Populate training data from real job postings:

```bash
# From the Training Dashboard UI, or directly:
python python_ai/pipeline/run_pipeline.py --stage all --limit 5000
```

### 5. Train the Model

```bash
# Via API (recommended — streams logs to UI)
POST /train
{
  "epochs": 10,
  "batch_size": 16,
  "encoder_lr": 2e-5,
  "head_lr": 1e-4,
  "use_deepseek_judge": true,
  "deepseek_epoch_sample": 10,
  "deepseek_bias_alpha": 0.3
}

# Or directly:
python python_ai/training/train.py \
  --epochs 10 --batch-size 16 \
  --use-deepseek-judge --deepseek-epoch-sample 10 --deepseek-bias-alpha 0.3
```

### 6. Start the API Server

```bash
uvicorn python_ai.api.main:app --reload --port 8000
```

## Project Structure

```
python_ai/
├── api/
│   └── main.py                  # FastAPI app — all endpoints
├── models/
│   ├── bi_encoder.py            # Bi-Encoder for fast retrieval
│   ├── cross_encoder.py         # Cross-Encoder reranker (primary model)
│   ├── resume_parser.py         # PDF/DOCX/TXT resume parsing
│   ├── text_formatter.py        # Resume/job text normalization
│   └── checkpoints/             # Saved model weights + logs
│       ├── cross_encoder.pt
│       ├── train.log
│       ├── evaluate.log
│       └── pipeline.log
├── training/
│   ├── train.py                 # Training loop + DeepSeek epoch judge
│   ├── evaluate.py              # Evaluation metrics + DeepSeek judge
│   └── dataset.py               # JobMatchDataset + bias correction
├── pipeline/
│   ├── spiders/                 # Job scrapers (Jobstreet, Kalibrr)
│   ├── parsers/                 # Job/resume parsers
│   ├── normalizers/             # Skill normalization
│   └── labeling/
│       ├── llm_labeler.py       # DeepSeek LLM labeling
│       └── rule_labeler.py      # Rule-based fallback labeling
├── services/
│   ├── gemini_analyzer.py       # Gemini resume analysis
│   └── linkedin_scraper.py      # LinkedIn job scraping
├── database/
│   └── db.py                    # PostgreSQL + pgvector
├── config/
│   └── settings.py
└── requirements.txt
```

## API Endpoints

### Resume & Matching

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analyze-resume` | POST | Analyze resume text (Gemini → DeepSeek → rule-based) |
| `/analyze-resume-file` | POST | Analyze uploaded resume file |
| `/analyze-resume-deepseek` | POST | Analyze with DeepSeek explicitly |
| `/match` | POST | Match resume text to jobs |
| `/match-resume` | POST | Upload resume and get matches |

### Training

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/train` | POST | Start training (async subprocess) |
| `/train/logs` | GET | Stream training log (last N lines) |
| `/train/status` | GET | Latest training metrics |
| `/train/history` | GET | Historical training runs |

### Evaluation

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/evaluate` | POST | Launch evaluation (async) |
| `/evaluate/logs` | GET | Stream evaluate.log |
| `/evaluate/analyze` | GET | DeepSeek analysis of latest metrics |
| `/evaluate/metrics` | GET | Latest saved metrics JSON |

### Pipeline

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pipeline/run` | POST | Run data pipeline stage |
| `/pipeline/logs` | GET | Stream pipeline.log |
| `/pipeline/status` | GET | Pipeline status |

## Training Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `epochs` | 10 | Number of training epochs |
| `batch_size` | 16 | Batch size (reduce if OOM) |
| `encoder_lr` | 2e-5 | Learning rate for transformer encoder |
| `head_lr` | 1e-4 | Learning rate for classification head |
| `warmup_steps` | 500 | Linear warmup steps |
| `patience` | 3 | Early stopping patience |
| `use_deepseek_judge` | false | Enable per-epoch DeepSeek bias correction |
| `deepseek_epoch_sample` | 10 | Pairs sampled per epoch for judging |
| `deepseek_bias_alpha` | 0.3 | Bias correction strength (0.0–1.0) |
| `deepseek_model` | `deepseek-r1:7b` | Ollama model name |

### Bias Alpha Guide

| Alpha | Effect |
|-------|--------|
| `0.1` | Very gentle — 10% nudge per epoch |
| `0.3` | Balanced — default, gradual correction |
| `0.5` | Aggressive — strong DeepSeek influence |
| `1.0` | Full override — label replaced by DeepSeek score |

## Evaluation Targets

| Metric | Target |
|--------|--------|
| Pearson correlation | > 0.80 |
| RMSE | < 0.12 |
| NDCG@10 | > 0.75 |
| Precision@5 | > 0.70 |

Run evaluation:
```bash
python python_ai/training/evaluate.py \
  --use-deepseek --deepseek-sample 50 --deepseek-model deepseek-r1:7b \
  --log python_ai/models/checkpoints/evaluate.log
```

## GPU / VRAM Notes

- Training uses CUDA automatically if available (`torch.cuda.is_available()`)
- DeepSeek epoch judging is VRAM-safe: training model is moved to CPU before calling Ollama, then restored to GPU after
- Recommended: 8 GB VRAM minimum (RTX 3060 / 4060 / 5060)
- If OOM during training: reduce `batch_size` to 8 or 16

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key for resume analysis |
| `APIFY_API_KEY` | Apify key for job scraping |
| `DATABASE_URL` | PostgreSQL connection string |
| `BI_ENCODER_BASE` | Override base model (default: `paraphrase-multilingual-MiniLM-L12-v2`) |
