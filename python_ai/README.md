# NextStep AI - Job Matching System

An AI-powered job matching system that analyzes resumes and matches candidates to jobs based on skills, experience, and education with confidence scoring. Features **LinkedIn-first continuous training** that scrapes real job postings to learn skills.

## Features

- **Resume Parsing**: Extract skills, experience, education from PDF/DOCX/TXT
- **Skill-Based Matching**: Semantic and exact skill matching
- **Confidence Scoring**: Calibrated 0-100% employability scores
- **LinkedIn-First Training**: Scrapes real LinkedIn jobs to learn current market skills
- **Continuous Learning**: Improves accuracy through iterative batch training
- **Industry Classification**: Categorize jobs and candidates by industry
- **REST API**: Full FastAPI backend for integration

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt --break-system-packages

# For NLP capabilities (optional but recommended)
python -m spacy download en_core_web_sm
```

### 2. Configure LinkedIn API Keys (Recommended)

Create a `.env` file with your Apify API keys for LinkedIn job scraping:

```bash
# LinkedIn Training API Keys (5 keys with automatic fallback)
LINKEDIN_TRAINING_API_KEY_1=apify_api_xxxxx
LINKEDIN_TRAINING_API_KEY_2=apify_api_xxxxx
LINKEDIN_TRAINING_API_KEY_3=apify_api_xxxxx
LINKEDIN_TRAINING_API_KEY_4=apify_api_xxxxx
LINKEDIN_TRAINING_API_KEY_5=apify_api_xxxxx

# Indeed API Key (separate from LinkedIn)
APIFY_API_KEY=apify_api_xxxxx
```

Get API keys at: https://apify.com/

### 3. Train the AI Model

**LinkedIn-First Continuous Training (Recommended):**
```bash
# Start continuous training with LinkedIn job scraping
python train_continuous.py

# Custom batch size and interval
python train_continuous.py --batch 10 --interval 5

# Quiet mode (minimal output)
python train_continuous.py --quiet
```

**Quick Training (No LinkedIn):**
```bash
# Train with synthetic data (quick start)
python train_model.py --samples 1000

# Train with more data for better accuracy
python train_model.py --samples 5000
```

### 4. Start the API Server

```bash
cd api
uvicorn main:app --reload --port 8000
```

## LinkedIn-First Continuous Training

The continuous training system scrapes real LinkedIn job postings to discover and learn current market skills.

### Training Flow

```
1. [SCRAPE]   → Fetch 100 LinkedIn jobs per batch
2. [EXTRACT]  → Extract skills from job descriptions
3. [GENERATE] → Create resumes using real skills (50% LinkedIn + variations)
4. [PARSE]    → Parse resumes with current model
5. [COMPARE]  → Analyze accuracy vs previous batch
6. [LEARN]    → Learn any missed skills
7. [REPEAT]
```

### Features

- **5 API Keys with Fallback**: Keys are prioritized 1→5 with automatic rotation on failure
- **Real Skill Discovery**: Learns skills like "LangChain", "OpenAI", "Kubernetes" from actual jobs
- **Batch Comparison**: Shows accuracy trends (📈 improving / 📉 declining / ➡️ stable)
- **Graceful Shutdown**: Press Ctrl+C to save progress and exit cleanly

### Example Output

```
============================================================
 NEXTSTEP AI - LINKEDIN-FIRST CONTINUOUS TRAINING
============================================================

🔗 LinkedIn Scraping: ENABLED
   • 5 API keys available (priority 1→5)
   • Will fetch real job postings each batch

[Batch    1] Resumes:     5 | Accuracy:  73.6% | New Skills:  2
    [LINKEDIN] Jobs scraped: 83 | Skills extracted: 4
    [COMPARE] ➡️  Trend: STABLE
    [LEARNED] Embeddings, Data

[Batch    2] Resumes:    10 | Accuracy:  72.5% | New Skills:  3
    [LINKEDIN] Jobs scraped: 84 | Skills extracted: 8
    [COMPARE] ➡️  Trend: STABLE
    [LEARNED] Security, DevOps, OpenAI
```

### Command Line Options

```bash
python train_continuous.py [OPTIONS]

Options:
  --batch, -b    Number of resumes per batch (default: 10)
  --interval, -i Seconds between batches (default: 3)
  --quiet, -q    Minimal output mode
```

## Project Structure

```
job-matcher/
├── models/
│   ├── resume_parser.py      # Resume parsing & skill extraction
│   └── job_matcher.py        # Core AI matching algorithm
├── data/
│   └── data_generator.py     # Training data generation
├── services/
│   └── job_api_service.py    # Indeed job API integration
├── api/
│   └── main.py               # FastAPI backend
├── frontend/
│   └── JobMatcherApp.jsx     # React frontend
├── trained_models/
│   └── unified_training_knowledge.json  # Learned skills & patterns
├── train_continuous.py       # LinkedIn-first continuous training
├── train_model.py            # Basic training script
└── requirements.txt
```

## How the AI Works

### Skill Embedding

The system converts skills into vector representations using:
- TF-IDF weighting for skill importance
- Co-occurrence analysis for related skills
- Semantic similarity via embeddings

### LinkedIn Skill Discovery

The continuous training system:
1. Scrapes LinkedIn jobs using the `curious_coder/linkedin-jobs-scraper` Apify actor
2. Extracts skills from `title` and `jobDescription` fields
3. Uses regex patterns to identify skills (AWS, Python, Kubernetes, etc.)
4. Incorporates 50% real LinkedIn skills into generated resumes
5. Learns skills the parser misses for future recognition

### Matching Algorithm

The match score is calculated as:

```
score = (
    0.30 × semantic_skill_similarity +
    0.35 × exact_skill_overlap +
    0.20 × experience_match +
    0.10 × education_match +
    0.05 × industry_match
)
```

These weights are learned during training based on hire/no-hire outcomes.

### Confidence Calibration

Raw scores are converted to calibrated confidence percentages:
- **75-100%**: Strong match - high likelihood of success
- **50-74%**: Good fit - worth applying
- **25-49%**: Partial match - some skill gaps
- **0-24%**: Low match - significant gaps

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/parse-resume` | POST | Parse resume file (PDF/DOCX/TXT) |
| `/match` | POST | Match skills to jobs |
| `/match-resume` | POST | Upload resume and get matches in one step |
| `/jobs` | GET | List available jobs |
| `/industries` | GET | List industries |
| `/cities` | GET | List cities with jobs |
| `/feedback` | POST | Submit match feedback for learning |
| `/train` | POST | Trigger model retraining |
| `/model-info` | GET | Get model information |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `LINKEDIN_TRAINING_API_KEY_1-5` | Apify API keys for LinkedIn scraping (priority order) |
| `APIFY_API_KEY` | Apify API key for Indeed job scraping |

## Training with Your Data

### Real Resume Data

Create a directory structure:
```
your_data/
├── resumes/
│   ├── resume1.pdf
│   ├── resume2.docx
│   └── ...
├── jobs.json
└── feedback.json (optional)
```

`jobs.json` format:
```json
[
  {
    "id": "job_001",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "industry": "Technology",
    "city": "San Francisco",
    "required_skills": ["python", "javascript", "sql"],
    "preferred_skills": ["aws", "docker"],
    "min_experience": 3,
    "max_experience": 8,
    "education_required": "bachelors"
  }
]
```

`feedback.json` format (for supervised learning):
```json
[
  {
    "candidate_id": "resume1.pdf",
    "job_id": "job_001",
    "was_hired": true
  }
]
```

Then train:
```bash
python train_model.py --real-data ./your_data/
```

## Improving Accuracy

1. **LinkedIn Scraping**: Enable API keys for real skill discovery
2. **More Training Data**: More samples = better model
3. **Real Feedback**: Use actual hire outcomes when available
4. **Domain-Specific Skills**: Add industry-specific skill taxonomies
5. **Continuous Training**: Run `train_continuous.py` regularly to learn new skills

## Frontend Usage

The React frontend (`JobMatcherApp.jsx`) provides:
- Resume upload via drag-and-drop
- City and industry selection
- Visual skill matching results
- Confidence score visualization
- Expandable job details

To use in your React app:
```jsx
import JobMatcherApp from './JobMatcherApp';

function App() {
  return <JobMatcherApp />;
}
```

## License

MIT License - Feel free to use and modify for your projects.
