"""
Job Matcher API
FastAPI backend for resume upload and job matching
"""

import os
import sys
import json
import tempfile
import sqlite3
from pathlib import Path
from typing import List, Optional
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from models.resume_parser import ResumeParser, ParsedResume
from models.job_matcher import JobMatcher, MatchResult, IndustryClassifier
from data.data_generator import JobDatabase, generate_training_data, populate_sample_database
from config.settings import settings
from services.job_api_service import JobAPIOrchestrator
from services.gemini_analyzer import GeminiResumeAnalyzer
from services.linkedin_scraper import LinkedInScraper

# Initialize FastAPI app
app = FastAPI(
    title="Job Matcher AI",
    description="AI-powered job matching based on resume skills",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
resume_parser = ResumeParser()
job_matcher = JobMatcher()
db: Optional[JobDatabase] = None
is_trained = False
job_api_orchestrator: Optional[JobAPIOrchestrator] = None
gemini_analyzer: Optional[GeminiResumeAnalyzer] = None
linkedin_scraper: Optional[LinkedInScraper] = None


# Pydantic models for API
class SkillInput(BaseModel):
    skills: List[str]
    experience_years: float = 0
    education: List[dict] = []
    industries: List[str] = []


class MatchRequest(BaseModel):
    skills: List[str]
    experience_years: float
    education: List[dict] = []
    industries: List[str] = []
    city: Optional[str] = None
    target_industry: Optional[str] = None
    limit: int = 20
    linkedin_url: Optional[str] = None  # Optional LinkedIn profile URL


class LinkedInRequest(BaseModel):
    linkedin_url: str


class FeedbackRequest(BaseModel):
    job_id: str
    candidate_id: str
    was_successful: bool
    feedback_type: str = "application"  # application, interview, hire


class TrainingConfig(BaseModel):
    num_samples: int = 1000
    hire_rate: float = 0.3


class HealthResponse(BaseModel):
    status: str
    is_trained: bool
    num_jobs: int
    timestamp: str


@app.on_event("startup")
async def startup_event():
    """Initialize database and train model on startup"""
    global db, job_matcher, is_trained, job_api_orchestrator, gemini_analyzer, linkedin_scraper

    # Initialize database
    db_path = settings.DB_PATH
    db = JobDatabase(db_path)

    # Run database migration inline
    print("Running database migrations...")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(jobs)")
        columns = [col[1] for col in cursor.fetchall()]

        if 'job_url' not in columns:
            cursor.execute('ALTER TABLE jobs ADD COLUMN job_url TEXT')
            print("[OK] Added job_url column")

        if 'job_source' not in columns:
            cursor.execute('ALTER TABLE jobs ADD COLUMN job_source TEXT DEFAULT "synthetic"')
            print("[OK] Added job_source column")

        cursor.execute("UPDATE jobs SET job_source = 'synthetic' WHERE job_source IS NULL")
        conn.commit()
        conn.close()
        print("[SUCCESS] Migration completed successfully!")
    except Exception as e:
        print(f"[WARNING] Migration warning: {e}")

    # Initialize Gemini analyzer if API key is available
    if settings.GEMINI_API_KEY:
        print("[DEBUG] Initializing Gemini Resume Analyzer...")
        gemini_analyzer = GeminiResumeAnalyzer(settings.GEMINI_API_KEY)
        if gemini_analyzer.is_available():
            print("[SUCCESS] Gemini Resume Analyzer initialized!")
        else:
            print("[WARNING] Gemini API key provided but initialization failed")
    else:
        print("[INFO] No Gemini API key configured, using fallback analysis")

    # Initialize LinkedIn scraper (uses same Apify API key)
    if settings.APIFY_API_KEY:
        print("[DEBUG] Initializing LinkedIn Scraper...")
        linkedin_scraper = LinkedInScraper(settings.APIFY_API_KEY)
        print("[SUCCESS] LinkedIn Scraper initialized!")
    else:
        print("[INFO] No Apify API key configured, LinkedIn scraping disabled")

    # Initialize job API orchestrator if real jobs are enabled
    if settings.USE_REAL_JOBS:
        print(f"[DEBUG] USE_REAL_JOBS={settings.USE_REAL_JOBS}, Initializing job API orchestrator...")
        job_api_orchestrator = JobAPIOrchestrator(settings)
        print(f"[DEBUG] job_api_orchestrator initialized: {job_api_orchestrator is not None}")
        print(f"[DEBUG] Available clients: {list(job_api_orchestrator.clients.keys()) if job_api_orchestrator else 'None'}")

    # Check if we need to populate sample data
    jobs = db.get_all_jobs(limit=1)
    if not jobs:
        if settings.USE_REAL_JOBS and job_api_orchestrator:
            print("Fetching real Philippine jobs...")
            await fetch_and_cache_real_jobs()
        else:
            print("Populating sample job database...")
            populate_sample_database(db_path, num_jobs=500)

    # Train the model
    print("Training job matcher model...")
    training_data = generate_training_data(num_samples=500)
    job_matcher.train(training_data)
    is_trained = True
    print("Model training complete!")


async def fetch_and_cache_real_jobs():
    """Fetch real jobs from API and cache in database"""
    if not job_api_orchestrator:
        print("Job API orchestrator not initialized")
        return False

    try:
        # Fetch jobs for top Philippine cities
        for city in settings.PHILIPPINE_CITIES[:5]:  # Top 5 cities
            print(f"Fetching jobs for {city}...")
            jobs = job_api_orchestrator.fetch_jobs(
                location=city,
                keywords=['software', 'technology', 'data', 'business'],
                limit=20
            )

            # Insert into database
            for job in jobs:
                db.insert_job(job)

            print(f"Cached {len(jobs)} jobs for {city}")

        return True
    except Exception as e:
        print(f"Error fetching real jobs: {e}")
        return False


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    jobs = db.get_all_jobs(limit=1) if db else []
    return HealthResponse(
        status="healthy",
        is_trained=is_trained,
        num_jobs=len(db.get_all_jobs(limit=10000)) if db else 0,
        timestamp=datetime.now().isoformat()
    )


@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    """
    Parse an uploaded resume and extract skills, experience, education.
    
    Supports: PDF, DOCX, TXT files
    """
    # Validate file type
    allowed_types = {'.pdf', '.docx', '.txt'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Save to temp file and parse
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Parse resume
        parsed = resume_parser.parse(tmp_path)
        
        # Clean up
        os.unlink(tmp_path)
        
        return {
            "success": True,
            "data": parsed.to_dict()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/parse-resume-text")
async def parse_resume_text(text: str):
    """Parse resume from raw text"""
    try:
        parsed = resume_parser.parse_text(text)
        return {
            "success": True,
            "data": parsed.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/match")
async def match_jobs(request: MatchRequest):
    """
    Match candidate skills to available jobs.
    
    Returns jobs ranked by confidence score.
    """
    if not is_trained:
        raise HTTPException(
            status_code=503,
            detail="Model not yet trained. Please wait."
        )
    
    # Build candidate profile
    candidate = {
        'skills': request.skills,
        'experience_years': request.experience_years,
        'education': request.education,
        'industries': request.industries,
    }
    
    # Get jobs from database
    if request.city and request.target_industry:
        jobs = db.get_jobs_by_industry(request.target_industry, request.city)
    elif request.city:
        jobs = db.get_jobs_by_city(request.city)
    elif request.target_industry:
        jobs = db.get_jobs_by_industry(request.target_industry)
    else:
        jobs = db.get_all_jobs(limit=200)
    
    # If no jobs found locally and real jobs are enabled, fetch from API on-demand
    if not jobs and settings.USE_REAL_JOBS and job_api_orchestrator:
        print(f"[DEBUG] No local jobs found for {request.city}/{request.target_industry}. Fetching from Apify...")
        
        # Build search keywords from candidate skills and target industry
        search_keywords = []
        
        # Add industry-related keywords - use simpler, broader search terms
        industry_keywords = {
            'Technology': ['software developer', 'IT specialist', 'programmer'],
            'Finance': ['accountant', 'financial analyst', 'bookkeeper'],
            'Healthcare': ['nurse', 'medical assistant', 'healthcare'],
            'Consulting': ['consultant', 'business analyst', 'advisor'],
            'Retail': ['sales associate', 'retail', 'customer service'],
            'Manufacturing': ['production', 'manufacturing', 'operations'],
            'Education': ['teacher', 'instructor', 'tutor'],
            'Marketing': ['marketing', 'digital marketing', 'social media'],
            'Media': ['marketing', 'media', 'advertising'],
            'BPO': ['customer service', 'call center', 'technical support'],
            'Engineering': ['engineer', 'civil engineer', 'mechanical engineer'],
            'Hospitality': ['hotel', 'restaurant', 'hospitality'],
            'Legal': ['paralegal', 'legal assistant', 'lawyer'],
            'HR': ['human resources', 'recruiter', 'HR specialist'],
            'Human Resources': ['human resources', 'recruiter', 'HR specialist'],
            'Administrative': ['admin assistant', 'office manager', 'secretary'],
            'Fine Arts & Design': ['graphic designer', 'UI UX designer', 'illustrator', 'creative designer'],
        }
        
        # Use industry-specific search term (just ONE good keyword, not combined)
        if request.target_industry and request.target_industry in industry_keywords:
            # Use just the first keyword for the industry - more effective search
            search_keywords = [industry_keywords[request.target_industry][0]]
        elif request.target_industry:
            # If industry not in our list, use the industry name itself
            search_keywords = [request.target_industry.lower()]
        
        # Only add skills if no industry keywords found
        if not search_keywords and request.skills:
            # Use just one skill for cleaner search
            search_keywords = [request.skills[0]]
        
        # Default fallback
        if not search_keywords:
            search_keywords = ['job']
        
        # Fetch jobs from API
        fetched_jobs = job_api_orchestrator.fetch_jobs(
            location=request.city or 'Philippines',
            keywords=search_keywords,
            limit=request.limit or 20
        )
        
        if fetched_jobs:
            print(f"[DEBUG] Fetched {len(fetched_jobs)} jobs from API")
            # Cache jobs in database for future use
            for job in fetched_jobs:
                db.insert_job(job)
            jobs = fetched_jobs
        else:
            print(f"[DEBUG] No jobs returned from API")
    
    if not jobs:
        return {
            "success": True,
            "matches": [],
            "candidate_skills": request.skills,
            "total_jobs_analyzed": 0,
            "industry_summary": {},
            "message": "No jobs found for the specified criteria"
        }
    
    # Calculate LinkedIn boost if provided
    linkedin_boost = 0
    linkedin_data = None
    if request.linkedin_url and linkedin_scraper:
        if linkedin_scraper.is_valid_linkedin_url(request.linkedin_url):
            print(f"[LinkedIn] Scraping profile for match boost: {request.linkedin_url}")
            linkedin_data = linkedin_scraper.scrape_profile(request.linkedin_url)
            boost_info = linkedin_scraper.calculate_profile_boost(linkedin_data)
            linkedin_boost = boost_info.get("boost_percentage", 0)
            print(f"[LinkedIn] Boost calculated: {linkedin_boost}%")
            
            # Merge LinkedIn skills with resume skills
            if linkedin_data.get("skills"):
                existing_skills = set(s.lower() for s in request.skills)
                for skill in linkedin_data.get("skills", []):
                    if skill.lower() not in existing_skills:
                        candidate['skills'].append(skill)
    elif not request.linkedin_url:
        # Small penalty for no LinkedIn
        linkedin_boost = -3
        print("[LinkedIn] No profile provided, applying -3% penalty")
    
    # Match against all jobs
    matches = []
    for job in jobs:
        result = job_matcher.match(candidate, job)
        result_dict = result.to_dict()
        
        # Apply LinkedIn boost to confidence
        if linkedin_boost != 0:
            original_confidence = result_dict['confidence']
            result_dict['confidence'] = max(5, min(99, original_confidence + linkedin_boost))
            result_dict['linkedin_boost'] = linkedin_boost
        
        matches.append(result_dict)
    
    # Sort by confidence
    matches.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Group by industry
    industry_summary = {}
    for match in matches:
        ind = match['industry']
        if ind not in industry_summary:
            industry_summary[ind] = {
                'count': 0,
                'avg_confidence': 0,
                'top_companies': []
            }
        industry_summary[ind]['count'] += 1
        industry_summary[ind]['avg_confidence'] += match['confidence']
        if len(industry_summary[ind]['top_companies']) < 3:
            industry_summary[ind]['top_companies'].append(match['company'])
    
    # Calculate averages
    for ind in industry_summary:
        industry_summary[ind]['avg_confidence'] = round(
            industry_summary[ind]['avg_confidence'] / industry_summary[ind]['count'], 1
        )
    
    return {
        "success": True,
        "total_jobs_analyzed": len(jobs),
        "matches": matches[:request.limit],
        "industry_summary": industry_summary,
        "candidate_skills": request.skills,
        "linkedin_boost": linkedin_boost,
        "linkedin_skills": linkedin_data.get("skills", []) if linkedin_data else [],
        "linkedin_profile": linkedin_data if linkedin_data and linkedin_data.get("scraped") else None,
    }


@app.post("/match-resume")
async def match_resume(
    file: UploadFile = File(...),
    city: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    limit: int = Query(20)
):
    """
    Upload a resume and get job matches in one step.
    """
    # Parse resume
    allowed_types = {'.pdf', '.docx', '.txt'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        parsed = resume_parser.parse(tmp_path)
        os.unlink(tmp_path)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume parsing failed: {str(e)}")
    
    # Create match request
    request = MatchRequest(
        skills=parsed.skills,
        experience_years=parsed.experience_years,
        education=[edu for edu in parsed.education],
        industries=parsed.industries,
        city=city,
        target_industry=industry,
        limit=limit
    )
    
    # Get matches
    result = await match_jobs(request)
    
    # Add parsed resume data to response
    result['parsed_resume'] = {
        'skills': parsed.skills,
        'experience_years': parsed.experience_years,
        'education': parsed.education,
        'job_titles': parsed.job_titles,
        'industries': parsed.industries,
        'certifications': parsed.certifications,
    }
    
    return result


@app.get("/jobs")
async def get_jobs(
    city: Optional[str] = None,
    industry: Optional[str] = None,
    limit: int = 50
):
    """Get available jobs, optionally filtered by city or industry"""
    if city and industry:
        jobs = db.get_jobs_by_industry(industry, city)
    elif city:
        jobs = db.get_jobs_by_city(city)
    elif industry:
        jobs = db.get_jobs_by_industry(industry)
    else:
        jobs = db.get_all_jobs(limit=limit)
    
    return {
        "success": True,
        "count": len(jobs),
        "jobs": jobs[:limit]
    }


@app.get("/industries")
async def get_industries():
    """Get list of available industries"""
    industries = list(IndustryClassifier.INDUSTRY_KEYWORDS.keys())
    return {
        "success": True,
        "industries": industries
    }


class AnalyzeResumeRequest(BaseModel):
    resume_text: str
    city: Optional[str] = None
    fetch_fresh_jobs: bool = True


class AnalyzeResumeResponse(BaseModel):
    success: bool
    detected_skills: List[str]
    detected_industry: str
    industry_confidence: float
    suggested_industries: List[dict]
    experience_years: float
    job_titles: List[str]
    search_keywords: List[str]


@app.post("/analyze-resume")
async def analyze_resume(request: AnalyzeResumeRequest):
    """
    Analyze resume text to detect skills, industry, and generate search keywords.
    Optionally fetches fresh jobs based on detected profile.
    """
    try:
        # Parse the resume text
        parsed = resume_parser.parse_text(request.resume_text)
        
        # Detect industries from skills and text
        detected_industries = IndustryClassifier.classify(request.resume_text)
        
        # Score each industry based on keyword matches
        industry_scores = {}
        text_lower = request.resume_text.lower()
        
        for industry, keywords in IndustryClassifier.INDUSTRY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            # Also check skills overlap
            skill_overlap = sum(1 for skill in parsed.skills if any(kw in skill.lower() for kw in keywords))
            total_score = score + skill_overlap * 2  # Weight skills higher
            if total_score > 0:
                industry_scores[industry] = total_score
        
        # Sort and get top industries with confidence
        sorted_industries = sorted(industry_scores.items(), key=lambda x: x[1], reverse=True)
        max_score = sorted_industries[0][1] if sorted_industries else 1
        
        suggested_industries = [
            {
                'industry': ind,
                'score': score,
                'confidence': round((score / max_score) * 100, 1)
            }
            for ind, score in sorted_industries[:5]
        ]
        
        primary_industry = sorted_industries[0][0] if sorted_industries else 'Technology'
        industry_confidence = suggested_industries[0]['confidence'] if suggested_industries else 50.0
        
        # Generate search keywords based on skills and detected industry
        search_keywords = []
        
        # Add top skills as search terms
        if parsed.skills:
            search_keywords.extend(parsed.skills[:5])
        
        # Add job titles if detected
        if parsed.job_titles:
            search_keywords.extend(parsed.job_titles[:2])
        
        # Add industry-specific keywords
        if primary_industry in IndustryClassifier.INDUSTRY_KEYWORDS:
            industry_kws = IndustryClassifier.INDUSTRY_KEYWORDS[primary_industry]
            # Find matching keywords from resume
            matching_kws = [kw for kw in industry_kws if kw in text_lower]
            search_keywords.extend(matching_kws[:3])
        
        # Deduplicate
        search_keywords = list(dict.fromkeys(search_keywords))[:10]
        
        # Fetch fresh jobs if requested
        fresh_jobs_count = 0
        if request.fetch_fresh_jobs and settings.USE_REAL_JOBS and job_api_orchestrator:
            location = request.city or 'Philippines'
            
            # Build search position from detected profile
            if parsed.job_titles:
                search_position = parsed.job_titles[0]
            elif parsed.skills:
                search_position = ' '.join(parsed.skills[:3])
            else:
                search_position = primary_industry
            
            print(f"[AI Analysis] Fetching fresh jobs for: {search_position} in {location}")
            
            try:
                fetched_jobs = job_api_orchestrator.fetch_jobs(
                    location=location,
                    keywords=[search_position],
                    limit=30
                )
                
                # Cache in database
                for job in fetched_jobs:
                    db.insert_job(job)
                
                fresh_jobs_count = len(fetched_jobs)
                print(f"[AI Analysis] Fetched {fresh_jobs_count} fresh jobs")
            except Exception as e:
                print(f"[AI Analysis] Error fetching jobs: {e}")
        
        return {
            "success": True,
            "detected_skills": parsed.skills,
            "detected_industry": primary_industry,
            "industry_confidence": industry_confidence,
            "suggested_industries": suggested_industries,
            "experience_years": parsed.experience_years,
            "job_titles": parsed.job_titles,
            "search_keywords": search_keywords,
            "fresh_jobs_fetched": fresh_jobs_count,
            "education": parsed.education,
            "certifications": parsed.certifications,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze-resume-file")
async def analyze_resume_file(
    file: UploadFile = File(...),
    city: Optional[str] = Query(None, description="City for job search"),
    fetch_fresh_jobs: bool = Query(False, description="Whether to fetch fresh jobs")
):
    """
    Analyze an uploaded resume file (PDF, DOCX, TXT) using Gemini AI.
    Returns detailed analysis including skills, industry, experience, and job search keywords.
    """
    # Validate file type
    allowed_types = {
        'application/pdf': 'pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'text/plain': 'txt'
    }
    
    # Get content type or infer from extension
    content_type = file.content_type
    filename = file.filename or "resume"
    
    if content_type not in allowed_types:
        # Try to infer from extension
        ext = filename.split('.')[-1].lower() if '.' in filename else ''
        if ext == 'pdf':
            content_type = 'application/pdf'
        elif ext == 'docx':
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        elif ext == 'txt':
            content_type = 'text/plain'
        else:
            raise HTTPException(400, f"Unsupported file type: {content_type}. Allowed: PDF, DOCX, TXT")
    
    try:
        # Read file content
        file_content = await file.read()
        
        print(f"[Gemini] Analyzing resume file: {filename} ({content_type}), size: {len(file_content)} bytes")
        
        # Use Gemini for analysis if available
        if gemini_analyzer and gemini_analyzer.is_available():
            if content_type == 'text/plain':
                # For text files, decode and use text analysis
                resume_text = file_content.decode('utf-8', errors='ignore')
                result = gemini_analyzer.analyze_resume_text(resume_text)
                result['extracted_text'] = resume_text
            else:
                # For PDF/DOCX, use file analysis
                result = gemini_analyzer.analyze_resume_file(file_content, filename, content_type)
            
            result['analysis_method'] = 'gemini'
            print(f"[Gemini] Analysis complete: {result.get('detected_industry')} ({result.get('industry_confidence')}%)")
            print(f"[Gemini] Skills detected: {result.get('detected_skills', [])}")
            print(f"[Gemini] Extracted text length: {len(result.get('extracted_text', ''))}")
            
            # If there's an error, log it
            if result.get('error'):
                print(f"[Gemini] Error: {result.get('error')}")
        else:
            # Fallback: Try to extract text and use basic analysis
            print("[Gemini] API not available, using fallback analysis")
            
            if content_type == 'text/plain':
                resume_text = file_content.decode('utf-8', errors='ignore')
            elif content_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                # Try to extract DOCX text
                try:
                    from docx import Document
                    import io
                    doc = Document(io.BytesIO(file_content))
                    resume_text = '\n'.join([p.text for p in doc.paragraphs])
                except ImportError:
                    raise HTTPException(500, "python-docx not installed. Cannot process DOCX files without Gemini API.")
                except Exception as e:
                    raise HTTPException(500, f"Failed to extract text from DOCX: {str(e)}")
            else:
                # PDF without Gemini is not supported
                raise HTTPException(
                    500, 
                    "PDF analysis requires Gemini API. Please configure GEMINI_API_KEY in .env file."
                )
            
            # Use fallback analyzer
            if gemini_analyzer:
                result = gemini_analyzer._fallback_analysis(resume_text)
            else:
                # Ultimate fallback using resume parser
                parsed = resume_parser.parse_text(resume_text)
                result = {
                    'detected_skills': parsed.skills,
                    'detected_industry': 'Technology',
                    'industry_confidence': 50,
                    'suggested_industries': [],
                    'experience_years': parsed.experience_years,
                    'job_titles': parsed.job_titles,
                    'education_level': parsed.education,
                    'search_keywords': parsed.skills[:5] if parsed.skills else [],
                    'summary': '',
                    'analysis_method': 'basic'
                }
        
        # Fetch fresh jobs if requested
        fresh_jobs_count = 0
        if fetch_fresh_jobs and settings.USE_REAL_JOBS and job_api_orchestrator:
            location = city or 'Philippines'
            
            # Build search position from detected profile
            job_titles = result.get('job_titles', [])
            skills = result.get('detected_skills', [])
            industry = result.get('detected_industry', 'Technology')
            
            if job_titles:
                search_position = job_titles[0]
            elif skills:
                search_position = skills[0]
            else:
                search_position = industry
            
            print(f"[Gemini] Fetching fresh jobs for: {search_position} in {location}")
            
            try:
                fetched_jobs = job_api_orchestrator.fetch_jobs(
                    location=location,
                    keywords=[search_position],
                    limit=30
                )
                
                # Cache in database
                for job in fetched_jobs:
                    db.insert_job(job)
                
                fresh_jobs_count = len(fetched_jobs)
                print(f"[Gemini] Fetched {fresh_jobs_count} fresh jobs")
            except Exception as e:
                print(f"[Gemini] Error fetching jobs: {e}")
        
        result['fresh_jobs_fetched'] = fresh_jobs_count
        result['success'] = True
        result['filename'] = filename
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Gemini] Error analyzing file: {e}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")


@app.get("/gemini-status")
async def get_gemini_status():
    """Check if Gemini API is configured and available."""
    return {
        "configured": bool(settings.GEMINI_API_KEY),
        "available": gemini_analyzer.is_available() if gemini_analyzer else False,
        "message": "Gemini AI is ready for resume analysis" if (gemini_analyzer and gemini_analyzer.is_available()) else "Gemini API not available, using fallback analysis"
    }


@app.post("/scrape-linkedin")
async def scrape_linkedin(request: LinkedInRequest):
    """
    Scrape a LinkedIn profile for additional resume data.
    Uses Apify's LinkedIn Profile Scraper (pay-per-result).
    """
    if not linkedin_scraper:
        raise HTTPException(503, "LinkedIn scraping not configured. Add APIFY_API_KEY to .env")
    
    if not linkedin_scraper.is_valid_linkedin_url(request.linkedin_url):
        raise HTTPException(400, "Invalid LinkedIn URL. Use format: https://www.linkedin.com/in/username")
    
    print(f"[LinkedIn] Scraping profile: {request.linkedin_url}")
    
    try:
        # Scrape the profile
        profile_data = linkedin_scraper.scrape_profile(request.linkedin_url)
        
        if profile_data.get("error"):
            print(f"[LinkedIn] Scraping failed: {profile_data.get('error')}")
            return {
                "success": False,
                "error": profile_data.get("error"),
                "profile": None,
                "boost": linkedin_scraper.calculate_profile_boost({})
            }
        
        # Calculate confidence boost
        boost = linkedin_scraper.calculate_profile_boost(profile_data)
        
        print(f"[LinkedIn] Profile scraped successfully. Skills: {len(profile_data.get('skills', []))}, Boost: {boost['boost_percentage']}%")
        
        return {
            "success": True,
            "profile": profile_data,
            "boost": boost
        }
        
    except Exception as e:
        print(f"[LinkedIn] Error: {e}")
        raise HTTPException(500, f"LinkedIn scraping failed: {str(e)}")


@app.get("/linkedin-status")
async def get_linkedin_status():
    """Check if LinkedIn scraping is available."""
    return {
        "configured": bool(settings.APIFY_API_KEY),
        "available": linkedin_scraper is not None,
        "message": "LinkedIn profile scraping is available" if linkedin_scraper else "LinkedIn scraping not configured"
    }


@app.get("/cities")
async def get_cities():
    """Get list of Philippine cities with job listings"""
    return {
        "success": True,
        "cities": settings.PHILIPPINE_CITIES,
        "primary_city": "Naga City"
    }


@app.post("/refresh-jobs")
async def refresh_jobs(
    city: Optional[str] = None,
    force: bool = False
):
    """
    Manually refresh job listings from API.
    Admin endpoint for updating job cache.
    """
    if not settings.USE_REAL_JOBS:
        raise HTTPException(400, "Real job fetching is disabled. Enable USE_REAL_JOBS in .env")

    if not job_api_orchestrator:
        raise HTTPException(500, "Job API orchestrator not initialized")

    try:
        if city:
            print(f"Refreshing jobs for {city}...")
            jobs = job_api_orchestrator.fetch_jobs(
                location=city,
                limit=50
            )
            for job in jobs:
                db.insert_job(job)
            job_count = len(jobs)
        else:
            print("Refreshing jobs for all cities...")
            await fetch_and_cache_real_jobs()
            job_count = len(db.get_all_jobs(limit=1000))

        return {
            "success": True,
            "message": f"Refreshed jobs for {city or 'all cities'}",
            "job_count": job_count
        }
    except Exception as e:
        raise HTTPException(500, f"Error refreshing jobs: {str(e)}")


@app.post("/feedback")
async def submit_feedback(request: FeedbackRequest):
    """
    Submit feedback on a match to improve the model.
    """
    # Record feedback for model improvement
    feedback = {
        'job_id': request.job_id,
        'candidate_id': request.candidate_id,
        'was_successful': request.was_successful,
        'feedback_type': request.feedback_type,
        'timestamp': datetime.now().isoformat()
    }
    
    # In production, this would update the database and trigger retraining
    job_matcher.feedback_history.append(feedback)
    
    return {
        "success": True,
        "message": "Feedback recorded. Thank you!",
        "total_feedback": len(job_matcher.feedback_history)
    }


@app.post("/train")
async def train_model(config: TrainingConfig):
    """
    Trigger model training with new data.
    """
    global is_trained
    
    try:
        # Generate training data
        training_data = generate_training_data(
            num_samples=config.num_samples,
            hire_rate=config.hire_rate
        )
        
        # Train model
        job_matcher.train(training_data)
        is_trained = True
        
        return {
            "success": True,
            "message": f"Model trained on {len(training_data)} samples",
            "weights": job_matcher.weights
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/model-info")
async def get_model_info():
    """Get information about the trained model"""
    return {
        "is_trained": is_trained,
        "weights": job_matcher.weights,
        "calibration": job_matcher.calibration,
        "feedback_count": len(job_matcher.feedback_history),
        "vocabulary_size": len(job_matcher.embedder.vocabulary) if is_trained else 0
    }


# Run with: uvicorn api.main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
