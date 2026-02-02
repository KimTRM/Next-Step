#!/usr/bin/env python3
"""
Continuous Training Script for NextStep AI Job Matcher

This script runs continuously until interrupted (Ctrl+C) and trains the resume
parser by generating mock resumes and learning new skills. All learned data is
saved to the unified training knowledge file.

Features:
- LinkedIn Job Scraping: Fetches real skills from LinkedIn job postings via Apify
- 5 API Key Rotation: Uses 5 separate Apify keys with automatic fallback
- Free API Fallback: Uses RandomUser.me when LinkedIn unavailable

Usage:
    python train_continuous.py                    # Run with defaults
    python train_continuous.py --batch 20        # 20 resumes per batch
    python train_continuous.py --interval 5      # 5 seconds between batches
    python train_continuous.py --linkedin        # Enable LinkedIn job scraping
    python train_continuous.py --quiet           # Minimal output
    
Press Ctrl+C to stop training gracefully.
"""

import json
import os
import re
import random
import time
import argparse
import signal
import sys
import requests
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from models.resume_parser import ResumeParser


class LinkedInJobScraper:
    """
    LinkedIn Job Scraper using Apify with 5 API key rotation and fallback.
    
    Uses curious_coder/linkedin-jobs-scraper (hKByXkMQaC5Qt9UMN)
    which is a Pay-Per-Result actor ($1.00 / 1,000 results).
    
    This scraper fetches real job postings from LinkedIn to extract
    authentic skills for training the resume parser.
    """
    
    # LinkedIn Jobs Scraper by curious_coder
    # https://apify.com/curious_coder/linkedin-jobs-scraper
    APIFY_ACTOR_ID = "hKByXkMQaC5Qt9UMN"
    APIFY_API_BASE = "https://api.apify.com/v2"
    
    # LinkedIn job search URL templates for diverse skills
    # These generate search URLs that the scraper will process
    JOB_SEARCH_TEMPLATES = [
        "https://www.linkedin.com/jobs/search/?keywords={query}&location=United%20States&position=1&pageNum=0",
    ]
    
    JOB_SEARCH_QUERIES = [
        "Software Engineer",
        "Data Scientist", 
        "Machine Learning Engineer",
        "Full Stack Developer",
        "DevOps Engineer",
        "Cloud Architect",
        "Product Manager",
        "UX Designer",
        "Security Engineer",
        "Backend Developer",
        "Frontend Developer",
        "Data Analyst",
        "AI Engineer",
        "Mobile Developer",
        "Platform Engineer",
        "Site Reliability Engineer",
        "Solutions Architect",
        "Technical Lead",
        "QA Engineer",
        "Business Analyst",
        "Python Developer",
        "Java Developer",
        "React Developer",
        "Node.js Developer",
        "AWS Engineer",
    ]
    
    def __init__(self, quiet: bool = False):
        self.quiet = quiet
        
        # Load 5 API keys from environment IN ORDER (1 first, 5 last)
        self.api_keys = []
        for i in range(1, 6):
            key = os.getenv(f"LINKEDIN_TRAINING_API_KEY_{i}")
            if key and not key.startswith("apify_api_YOUR_KEY"):
                self.api_keys.append((i, key))  # Store index and key
        
        self.current_key_index = 0  # Start with key 1
        self.failed_keys = set()  # Track which keys have failed
        
        # Cache for scraped jobs to reduce API calls
        self.job_cache: List[Dict] = []
        self.cache_timestamp: Optional[datetime] = None
        self.cache_ttl_minutes = 30  # Cache jobs for 30 minutes
        
        # Statistics
        self.stats = {
            "total_jobs_fetched": 0,
            "total_skills_extracted": 0,
            "api_calls": 0,
            "api_failures": 0,
            "key_rotations": 0
        }
        
        if not self.quiet and self.api_keys:
            print(f"    [LinkedIn] Loaded {len(self.api_keys)} API keys (priority: 1→5)")
            print(f"    [LinkedIn] Using curious_coder/linkedin-jobs-scraper")
    
    def _get_current_key(self) -> Optional[Tuple[int, str]]:
        """Get the current active API key (index, key), skipping failed ones."""
        if not self.api_keys:
            return None
        
        # Keys are already in order 1-5, just skip failed ones
        attempts = 0
        while attempts < len(self.api_keys):
            if self.current_key_index not in self.failed_keys:
                return self.api_keys[self.current_key_index]
            
            # This key has failed, try next
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            attempts += 1
        
        # All keys have failed, reset and try again
        self.failed_keys.clear()
        self.current_key_index = 0  # Reset to key 1
        return self.api_keys[0] if self.api_keys else None
    
    def _rotate_key(self, mark_failed: bool = True) -> bool:
        """
        Rotate to the next API key (priority: 1→2→3→4→5).
        Returns True if there's another key to try, False if all have failed.
        """
        if not self.api_keys:
            return False
        
        if mark_failed:
            self.failed_keys.add(self.current_key_index)
            key_num = self.api_keys[self.current_key_index][0] if self.current_key_index < len(self.api_keys) else "?"
            if not self.quiet:
                print(f"    [!] Marking API key #{key_num} as failed")
        
        self.stats["key_rotations"] += 1
        
        # Check if all keys have failed
        if len(self.failed_keys) >= len(self.api_keys):
            if not self.quiet:
                print("    [!] All 5 LinkedIn API keys have failed")
            return False
        
        # Rotate to next non-failed key (in order 1→2→3→4→5)
        original_index = self.current_key_index
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        
        while self.current_key_index in self.failed_keys:
            self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
            if self.current_key_index == original_index:
                return False
        
        key_num = self.api_keys[self.current_key_index][0]
        if not self.quiet:
            print(f"    [→] Rotating to API key #{key_num}")
        
        return True
    
    def _is_cache_valid(self) -> bool:
        """Check if the job cache is still valid."""
        if not self.job_cache or not self.cache_timestamp:
            return False
        
        age = datetime.now() - self.cache_timestamp
        return age.total_seconds() < (self.cache_ttl_minutes * 60)
    
    def _fetch_jobs_from_apify(self, query: str, limit: int = 100, retry_count: int = 0) -> List[Dict]:
        """
        Fetch jobs from LinkedIn via Apify with key rotation on failure.
        Uses curious_coder/linkedin-jobs-scraper with URL-based input.
        
        Note: Minimum count is 100 for this actor.
        """
        key_info = self._get_current_key()
        if not key_info:
            return []
        
        key_num, api_key = key_info
        
        # Build LinkedIn search URL
        encoded_query = query.replace(" ", "%20")
        search_url = f"https://www.linkedin.com/jobs/search/?keywords={encoded_query}&location=United%20States"
        
        # Use async run with waitForFinish (actor doesn't support sync endpoint well)
        run_url = f"{self.APIFY_API_BASE}/acts/{self.APIFY_ACTOR_ID}/runs"
        
        # Input for curious_coder/linkedin-jobs-scraper
        # Minimum count is 100 for this actor
        actor_input = {
            "urls": [search_url],
            "count": max(100, limit),  # Minimum 100 required
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        params = {
            "token": api_key,
            "waitForFinish": 120  # Wait up to 2 minutes for completion
        }
        
        try:
            self.stats["api_calls"] += 1
            
            if not self.quiet:
                print(f"    [API] Key #{key_num} → LinkedIn: \"{query}\"")
            
            response = requests.post(
                run_url,
                json=actor_input,
                headers=headers,
                params=params,
                timeout=130
            )
            
            # Check for rate limiting or auth errors
            if response.status_code == 401:
                if not self.quiet:
                    print(f"    [!] API key #{key_num} unauthorized")
                self.stats["api_failures"] += 1
                if self._rotate_key():
                    return self._fetch_jobs_from_apify(query, limit, retry_count + 1)
                return []
            
            if response.status_code == 429:
                if not self.quiet:
                    print(f"    [!] API key #{key_num} rate limited")
                self.stats["api_failures"] += 1
                if self._rotate_key():
                    return self._fetch_jobs_from_apify(query, limit, retry_count + 1)
                return []
            
            if response.status_code not in [200, 201]:
                error_text = response.text[:100] if response.text else "Unknown"
                if not self.quiet:
                    print(f"    [!] API error {response.status_code}: {error_text}")
                self.stats["api_failures"] += 1
                if self._rotate_key():
                    return self._fetch_jobs_from_apify(query, limit, 0)
                return []
            
            # Get run data and dataset ID
            run_data = response.json()
            dataset_id = run_data.get("data", {}).get("defaultDatasetId")
            run_status = run_data.get("data", {}).get("status")
            
            if not self.quiet:
                print(f"    [→] Run status: {run_status}")
            
            if not dataset_id:
                if not self.quiet:
                    print(f"    [!] No dataset returned")
                return []
            
            # Fetch results from dataset
            dataset_url = f"{self.APIFY_API_BASE}/datasets/{dataset_id}/items"
            dataset_response = requests.get(
                dataset_url,
                params={"token": api_key},
                timeout=30
            )
            
            if dataset_response.status_code == 200:
                jobs = dataset_response.json()
                if isinstance(jobs, list) and len(jobs) > 0:
                    self.stats["total_jobs_fetched"] += len(jobs)
                    if not self.quiet:
                        print(f"    [✓] Fetched {len(jobs)} jobs from LinkedIn")
                    return jobs
            
            return []
            
        except requests.exceptions.Timeout:
            if not self.quiet:
                print(f"    [!] API timeout for key #{key_num}")
            self.stats["api_failures"] += 1
            if self._rotate_key():
                return self._fetch_jobs_from_apify(query, limit, 0)
            return []
            
        except Exception as e:
            if not self.quiet:
                print(f"    [!] API error: {e}")
            self.stats["api_failures"] += 1
            return []
    
    def _extract_skills_from_job(self, job: Dict) -> List[str]:
        """
        Extract skills from a job posting (LinkedIn format from curious_coder scraper).
        Parses the job title and any available description.
        """
        skills = set()
        
        # Get text fields to parse (LinkedIn format from curious_coder)
        # Fields: id, trackingId, refId, link, title, companyName, companyLinkedinUrl, 
        #         companyLogo, location, salaryInfo, postedTime, applicants, jobDescription
        title = job.get("title", "") or ""
        description = job.get("jobDescription", "") or job.get("description", "") or ""
        company = job.get("companyName", "") or ""
        
        # Common skill patterns (comprehensive regex for tech skills)
        skill_patterns = [
            # Programming languages
            r'\b(Python|Java|JavaScript|TypeScript|C\+\+|C#|Go|Golang|Rust|Ruby|PHP|Swift|Kotlin|Scala|R|MATLAB|Perl)\b',
            # Frontend frameworks
            r'\b(React|Angular|Vue\.?js|Next\.?js|Svelte|jQuery|Redux|Webpack|Vite)\b',
            # Backend frameworks
            r'\b(Node\.?js|Express\.?js|Django|Flask|FastAPI|Spring\s?Boot|Rails|Laravel|ASP\.NET|NestJS)\b',
            # Cloud platforms
            r'\b(AWS|Amazon Web Services|Azure|Google Cloud|GCP|Heroku|DigitalOcean|Vercel|Netlify)\b',
            # DevOps tools
            r'\b(Docker|Kubernetes|K8s|Terraform|Ansible|Jenkins|GitLab|GitHub Actions|CI/CD|CircleCI)\b',
            # Databases
            r'\b(PostgreSQL|Postgres|MySQL|MongoDB|Redis|Elasticsearch|SQLite|Oracle|SQL Server|Cassandra|DynamoDB|Firebase)\b',
            # Data Science / ML
            r'\b(TensorFlow|PyTorch|Keras|Scikit-learn|Pandas|NumPy|Spark|Hadoop|Airflow|dbt|Snowflake|BigQuery)\b',
            # General tech
            r'\b(REST|RESTful|GraphQL|gRPC|Microservices|API|ETL|Kafka|RabbitMQ)\b',
            # Methodologies
            r'\b(Agile|Scrum|Kanban|JIRA|Confluence|Git|Linux|Unix|Bash|Shell)\b',
            # AI/ML specific
            r'\b(Machine Learning|Deep Learning|NLP|Natural Language Processing|Computer Vision|Neural Networks|LLM|GPT|Transformers)\b',
            # Design tools  
            r'\b(Figma|Sketch|Adobe XD|Photoshop|Illustrator|InDesign)\b',
            # Data skills
            r'\b(SQL|NoSQL|Data Modeling|Data Warehousing|Data Pipeline|Data Engineering)\b',
            # Security
            r'\b(Cybersecurity|Security|Penetration Testing|OWASP|OAuth|JWT|SSL|TLS)\b',
            # Modern skills
            r'\b(LangChain|OpenAI|Claude|Anthropic|RAG|Vector Database|Pinecone|Weaviate|Embeddings)\b',
        ]
        
        text = f"{title} {description}".lower()
        full_text = f"{title} {description}"  # Keep original case for extraction
        
        # Extract skills using patterns
        for pattern in skill_patterns:
            matches = re.findall(pattern, full_text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    skills.update(m.strip() for m in match if m)
                else:
                    skills.add(match.strip())
        
        # Also extract skills from title (job titles often contain key technologies)
        title_patterns = [
            r'\b(Senior|Lead|Principal|Staff)?\s*(Python|Java|React|Node|Angular|Vue|AWS|Azure|GCP|DevOps|ML|AI|Data)\s*(Developer|Engineer|Architect|Scientist)?\b',
        ]
        
        for pattern in title_patterns:
            matches = re.findall(pattern, title, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    skills.update(m.strip() for m in match if m and len(m) > 2)
                else:
                    if len(match) > 2:
                        skills.add(match.strip())
        
        # Also extract from common skill sections in description
        skill_keywords = [
            "requirements:", "qualifications:", "skills:", "experience with",
            "proficiency in", "knowledge of", "expertise in", "familiar with",
            "must have", "nice to have", "required:", "preferred:"
        ]
        
        for keyword in skill_keywords:
            if keyword in text:
                idx = text.find(keyword)
                snippet = full_text[idx:idx+300]  # Get context after keyword
                
                for pattern in skill_patterns:
                    matches = re.findall(pattern, snippet, re.IGNORECASE)
                    for match in matches:
                        if isinstance(match, tuple):
                            skills.update(m.strip() for m in match if m)
                        else:
                            skills.add(match.strip())
        
        # Clean up skills
        cleaned_skills = []
        stop_words = {'the', 'and', 'or', 'for', 'with', 'senior', 'lead', 'principal', 'staff', 'developer', 'engineer', 'architect', 'scientist'}
        for skill in skills:
            skill = skill.strip()
            if 2 <= len(skill) <= 50 and skill.lower() not in stop_words:
                cleaned_skills.append(skill)
        
        self.stats["total_skills_extracted"] += len(cleaned_skills)
        return cleaned_skills
    
    def fetch_skills(self, count: int = 50) -> Tuple[List[str], bool]:
        """
        Fetch skills from LinkedIn job postings.
        
        Returns:
            Tuple of (list of skills, whether API was used successfully)
        """
        # Check cache first
        if self._is_cache_valid() and self.job_cache:
            all_skills = []
            for job in random.sample(self.job_cache, min(len(self.job_cache), 10)):
                all_skills.extend(self._extract_skills_from_job(job))
            return list(set(all_skills))[:count], True
        
        # No valid cache, fetch new jobs
        if not self.api_keys or all(i in self.failed_keys for i in range(len(self.api_keys))):
            return [], False
        
        # Fetch jobs for random query
        query = random.choice(self.JOB_SEARCH_QUERIES)
        jobs = self._fetch_jobs_from_apify(query, limit=25)
        
        if jobs:
            # Update cache
            self.job_cache = jobs
            self.cache_timestamp = datetime.now()
            
            # Extract skills
            all_skills = []
            for job in jobs:
                all_skills.extend(self._extract_skills_from_job(job))
            
            return list(set(all_skills))[:count], True
        
        return [], False
    
    def is_available(self) -> bool:
        """Check if LinkedIn scraping is available (has valid API keys)."""
        return len(self.api_keys) > 0 and len(self.failed_keys) < len(self.api_keys)
    
    def get_stats(self) -> Dict:
        """Get scraper statistics."""
        return {
            **self.stats,
            "available_keys": len(self.api_keys),
            "failed_keys": len(self.failed_keys),
            "cache_size": len(self.job_cache)
        }


class ContinuousTrainer:
    """Continuous training system for the resume parser."""
    
    # Paths
    TRAINED_MODELS_DIR = Path(__file__).parent / "trained_models"
    UNIFIED_KNOWLEDGE_FILE = TRAINED_MODELS_DIR / "unified_training_knowledge.json"
    
    # Free API endpoints
    RANDOMUSER_API = "https://randomuser.me/api/"
    FAKERAPI_URL = "https://fakerapi.it/api/v2/"
    
    # Comprehensive skill database by category
    SKILLS = {
        "programming": [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
            "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
            "Shell Scripting", "Bash", "PowerShell", "SQL", "NoSQL", "GraphQL",
            "Haskell", "Elixir", "Clojure", "F#", "Dart", "Lua", "Groovy", "Julia"
        ],
        "web_frontend": [
            "React", "Vue.js", "Angular", "Next.js", "Nuxt.js", "Svelte", "SvelteKit",
            "HTML5", "CSS3", "SASS", "LESS", "Tailwind CSS", "Bootstrap", "Material UI",
            "Redux", "Vuex", "Pinia", "MobX", "Webpack", "Vite", "Parcel", "Rollup",
            "jQuery", "TypeScript", "REST APIs", "WebSocket", "PWA", "Web Components"
        ],
        "web_backend": [
            "Node.js", "Express.js", "Fastify", "Koa", "Django", "Flask", "FastAPI",
            "Spring Boot", "Spring Framework", "Ruby on Rails", "ASP.NET", "ASP.NET Core",
            "Laravel", "Symfony", "NestJS", "GraphQL", "gRPC", "Microservices",
            "API Design", "OAuth", "OAuth2", "JWT", "WebSockets", "Socket.io",
            "RESTful APIs", "SOAP", "Message Queues", "RabbitMQ", "Apache Kafka"
        ],
        "data_science": [
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
            "Scikit-learn", "Pandas", "NumPy", "SciPy", "Data Analysis", "Data Visualization",
            "Matplotlib", "Seaborn", "Plotly", "Jupyter", "Statistics", "Probability",
            "Natural Language Processing", "NLP", "Computer Vision", "Neural Networks",
            "Feature Engineering", "Model Deployment", "MLOps", "A/B Testing",
            "Regression", "Classification", "Clustering", "Time Series", "Reinforcement Learning",
            "XGBoost", "LightGBM", "CatBoost", "Random Forest", "Gradient Boosting"
        ],
        "cloud": [
            "AWS", "Amazon Web Services", "Azure", "Microsoft Azure", "Google Cloud", "GCP",
            "Docker", "Kubernetes", "K8s", "Terraform", "CloudFormation", "Pulumi",
            "Serverless", "AWS Lambda", "Azure Functions", "Cloud Functions",
            "EC2", "S3", "RDS", "DynamoDB", "ECS", "EKS", "Fargate",
            "Firebase", "Heroku", "DigitalOcean", "Linode", "Netlify", "Vercel",
            "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI",
            "ArgoCD", "Ansible", "Puppet", "Chef", "Prometheus", "Grafana", "Datadog"
        ],
        "databases": [
            "PostgreSQL", "MySQL", "MariaDB", "MongoDB", "Redis", "Memcached",
            "Elasticsearch", "SQLite", "Oracle", "SQL Server", "Cassandra", "Neo4j",
            "DynamoDB", "Firebase Realtime Database", "Firestore", "InfluxDB",
            "TimescaleDB", "CockroachDB", "Supabase", "PlanetScale", "Prisma", "TypeORM",
            "Sequelize", "SQLAlchemy", "Hibernate", "Entity Framework"
        ],
        "devops": [
            "Linux", "Unix", "Ubuntu", "CentOS", "RedHat", "Windows Server",
            "Nginx", "Apache", "HAProxy", "Load Balancing", "Reverse Proxy",
            "Git", "GitHub", "GitLab", "Bitbucket", "Version Control",
            "Agile", "Scrum", "Kanban", "JIRA", "Confluence", "Trello", "Asana",
            "Monitoring", "Logging", "Observability", "ELK Stack", "Splunk", "New Relic",
            "Site Reliability Engineering", "SRE", "Infrastructure as Code", "IaC"
        ],
        "mobile": [
            "iOS Development", "Android Development", "React Native", "Flutter",
            "Swift", "SwiftUI", "Kotlin", "Jetpack Compose", "Objective-C",
            "Xamarin", "Ionic", "Capacitor", "Cordova", "Mobile UI/UX",
            "App Store Optimization", "ASO", "Push Notifications", "Mobile Security",
            "Mobile Testing", "Appium", "Detox", "XCTest", "Espresso"
        ],
        "security": [
            "Cybersecurity", "Information Security", "Penetration Testing", "Pen Testing",
            "Vulnerability Assessment", "OWASP", "OWASP Top 10", "Security Auditing",
            "Encryption", "Cryptography", "SSL/TLS", "PKI", "IAM", "Identity Management",
            "SIEM", "SOC", "Security Operations", "Incident Response", "Forensics",
            "Compliance", "GDPR", "HIPAA", "SOC 2", "PCI DSS", "ISO 27001",
            "Zero Trust", "Network Security", "Application Security", "Cloud Security"
        ],
        "business": [
            "Project Management", "PMP", "Program Management", "Product Management",
            "Business Analysis", "Requirements Gathering", "Stakeholder Management",
            "Budgeting", "Financial Planning", "Strategic Planning", "OKRs", "KPIs",
            "Risk Management", "Change Management", "Process Improvement", "Six Sigma",
            "Lean", "Vendor Management", "Contract Negotiation", "Procurement"
        ],
        "soft_skills": [
            "Leadership", "Team Leadership", "Communication", "Written Communication",
            "Problem Solving", "Critical Thinking", "Analytical Thinking",
            "Team Collaboration", "Teamwork", "Cross-functional Collaboration",
            "Time Management", "Prioritization", "Adaptability", "Flexibility",
            "Creativity", "Innovation", "Attention to Detail", "Quality Focus",
            "Customer Service", "Client Relations", "Presentation Skills", "Public Speaking",
            "Conflict Resolution", "Negotiation", "Decision Making", "Mentoring", "Coaching"
        ],
        "marketing": [
            "Digital Marketing", "SEO", "Search Engine Optimization", "SEM", "PPC",
            "Content Marketing", "Content Strategy", "Social Media Marketing",
            "Google Analytics", "Google Ads", "Facebook Ads", "LinkedIn Ads",
            "Marketing Automation", "HubSpot", "Marketo", "Mailchimp", "Email Marketing",
            "Brand Strategy", "Brand Management", "Market Research", "Competitive Analysis",
            "Campaign Management", "CRM", "Salesforce", "Lead Generation", "Conversion Optimization"
        ],
        "design": [
            "UI Design", "UX Design", "UI/UX Design", "Product Design", "Visual Design",
            "Figma", "Adobe XD", "Sketch", "InVision", "Zeplin", "Framer",
            "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro",
            "User Research", "Usability Testing", "Wireframing", "Prototyping",
            "Design Systems", "Design Tokens", "Accessibility", "WCAG", "Responsive Design",
            "Motion Design", "Interaction Design", "Information Architecture"
        ],
        "finance": [
            "Financial Analysis", "Financial Modeling", "Accounting", "GAAP", "IFRS",
            "Excel", "Advanced Excel", "Financial Reporting", "Budgeting", "Forecasting",
            "QuickBooks", "SAP", "SAP FICO", "Oracle Financials", "NetSuite",
            "ERP Systems", "Auditing", "Internal Audit", "Tax Planning", "Tax Preparation",
            "Investment Analysis", "Portfolio Management", "Risk Assessment", "Valuation",
            "Bloomberg Terminal", "FactSet", "Capital IQ", "CFA", "CPA", "FRM"
        ],
        "healthcare": [
            "HIPAA", "HIPAA Compliance", "Healthcare IT", "Health Informatics",
            "EHR", "EMR", "EHR/EMR", "Epic Systems", "Epic", "Cerner", "Meditech",
            "Medical Coding", "ICD-10", "CPT Codes", "Medical Billing",
            "Clinical Research", "Clinical Trials", "FDA Regulations", "GCP",
            "Patient Care", "Care Coordination", "Population Health",
            "Telemedicine", "Telehealth", "Remote Patient Monitoring",
            "HL7", "FHIR", "Healthcare Analytics", "HEDIS", "Quality Measures"
        ]
    }
    
    # Job titles by industry
    JOB_TITLES = {
        "tech": [
            "Software Engineer", "Senior Software Engineer", "Staff Software Engineer",
            "Principal Engineer", "Full Stack Developer", "Frontend Developer",
            "Backend Developer", "DevOps Engineer", "Site Reliability Engineer",
            "Platform Engineer", "Data Engineer", "Machine Learning Engineer",
            "AI Engineer", "Cloud Architect", "Solutions Architect", "Technical Lead",
            "Engineering Manager", "Director of Engineering", "VP of Engineering", "CTO"
        ],
        "data": [
            "Data Scientist", "Senior Data Scientist", "Lead Data Scientist",
            "Data Analyst", "Senior Data Analyst", "Business Intelligence Analyst",
            "Analytics Engineer", "Machine Learning Scientist", "Research Scientist",
            "Quantitative Analyst", "Data Engineer", "Data Architect", "Chief Data Officer"
        ],
        "product": [
            "Product Manager", "Senior Product Manager", "Group Product Manager",
            "Director of Product", "VP of Product", "Chief Product Officer",
            "Product Owner", "Technical Product Manager", "Product Analyst"
        ],
        "design": [
            "UI Designer", "UX Designer", "Product Designer", "Senior Product Designer",
            "Staff Designer", "Design Lead", "Design Manager", "Creative Director",
            "Visual Designer", "UX Researcher", "Interaction Designer", "Brand Designer"
        ],
        "security": [
            "Security Engineer", "Senior Security Engineer", "Security Analyst",
            "Penetration Tester", "Security Architect", "CISO", "SOC Analyst",
            "Incident Responder", "Compliance Analyst", "Security Consultant"
        ]
    }
    
    # Universities
    UNIVERSITIES = [
        "MIT", "Stanford University", "Harvard University", "UC Berkeley",
        "Carnegie Mellon University", "Georgia Tech", "University of Michigan",
        "University of Washington", "Cornell University", "UCLA", "Caltech",
        "University of Texas at Austin", "Columbia University", "Princeton University",
        "Yale University", "Duke University", "Northwestern University",
        "University of Illinois", "Penn State", "Ohio State University",
        "University of Florida", "Arizona State University", "NYU", "USC",
        "Boston University", "University of Chicago", "Brown University",
        "University of Pennsylvania", "Johns Hopkins University", "Rice University"
    ]
    
    # Companies
    COMPANIES = [
        "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla",
        "Uber", "Airbnb", "Spotify", "Salesforce", "Adobe", "Intel", "IBM",
        "Oracle", "Cisco", "VMware", "Nvidia", "Qualcomm", "PayPal", "Square",
        "Stripe", "Shopify", "Zoom", "Slack", "Dropbox", "GitHub", "GitLab",
        "LinkedIn", "Twitter", "Pinterest", "Snap", "Lyft", "DoorDash",
        "Instacart", "Robinhood", "Coinbase", "Databricks", "Snowflake",
        "Palantir", "MongoDB", "Elastic", "Datadog", "HashiCorp", "Confluent",
        "Twilio", "Okta", "CrowdStrike", "Cloudflare", "Figma", "Notion"
    ]
    
    def __init__(self, batch_size: int = 10, interval: int = 3, quiet: bool = False, use_linkedin: bool = False):
        self.batch_size = batch_size
        self.interval = interval
        self.quiet = quiet
        self.use_linkedin = use_linkedin
        self.running = True
        self.parser = ResumeParser()
        
        # Initialize LinkedIn scraper (required for training)
        self.linkedin_scraper = LinkedInJobScraper(quiet=quiet)
        if not self.linkedin_scraper.is_available():
            if not quiet:
                print("[!] No valid LinkedIn API keys found")
                print("    Add keys to .env: LINKEDIN_TRAINING_API_KEY_1 through _5")
            self.linkedin_scraper = None
        
        # LinkedIn skills cache (skills fetched from real job postings)
        self.linkedin_skills_cache: List[str] = []
        self.linkedin_jobs_cache: List[Dict] = []
        
        # Previous batch results for comparison
        self.previous_batch: Optional[Dict] = None
        
        # Statistics
        self.stats = {
            "start_time": None,
            "total_resumes": 0,
            "total_skills_learned": 0,
            "batches_completed": 0,
            "api_calls": 0,
            "api_failures": 0,
            "linkedin_skills_used": 0,
            "linkedin_jobs_scraped": 0,
            "accuracy_trend": []  # Track accuracy over time
        }
        
        # Ensure directory exists
        self.TRAINED_MODELS_DIR.mkdir(exist_ok=True)
        
        # Load existing knowledge
        self.knowledge = self._load_knowledge()
        
        # Setup graceful shutdown
        signal.signal(signal.SIGINT, self._handle_interrupt)
        signal.signal(signal.SIGTERM, self._handle_interrupt)
    
    def _handle_interrupt(self, signum, frame):
        """Handle Ctrl+C gracefully."""
        print("\n\n[!] Interrupt received. Saving progress and shutting down...")
        self.running = False
    
    def _load_knowledge(self) -> Dict:
        """Load existing unified knowledge or create new."""
        if self.UNIFIED_KNOWLEDGE_FILE.exists():
            try:
                with open(self.UNIFIED_KNOWLEDGE_FILE, 'r') as f:
                    return json.load(f)
            except:
                pass
        
        return {
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "description": "Unified training knowledge from continuous training",
                "sources": ["continuous_trainer"]
            },
            "statistics": {
                "total_training_sessions": 0,
                "total_samples_processed": 0,
                "total_unique_skills_learned": 0
            },
            "learned_skills": [],
            "skill_variations": {},  # Maps variations to canonical skills
            "skills_by_category": {},
            "training_history": []
        }
    
    # Skill variations that resumes might contain (realistic representations)
    SKILL_VARIATIONS = {
        # Programming variations
        "python": ["Python 3", "Python3", "python3.x", "Py", "CPython"],
        "javascript": ["JS", "ES6", "ES2015", "ECMAScript", "Vanilla JS", "JavaScript ES6"],
        "typescript": ["TS", "TypeScript 4", "TS 5"],
        "java": ["Java 8", "Java 11", "Java 17", "J2EE", "JavaSE", "Core Java"],
        "c++": ["CPP", "C/C++", "Modern C++", "C++ 11", "C++ 17", "C++ 20"],
        "c#": ["CSharp", "C Sharp", ".NET C#", "C# .NET"],
        "golang": ["Go Lang", "Go Programming", "Golang"],
        "sql": ["SQL Server", "T-SQL", "PL/SQL", "MySQL", "MSSQL", "Structured Query Language"],
        
        # Framework variations  
        "react": ["React.js", "ReactJS", "React 18", "React Hooks", "React Native"],
        "angular": ["Angular 2+", "Angular 15", "AngularJS", "Angular CLI"],
        "vue": ["Vue.js", "VueJS", "Vue 3", "Vue 2", "Vuex"],
        "node": ["Node.js", "NodeJS", "Node 18", "Express/Node"],
        "django": ["Django REST", "Django Framework", "DRF", "Django ORM"],
        "spring": ["Spring Boot", "Spring Framework", "Spring MVC", "Spring Cloud", "Spring Security"],
        
        # Cloud variations
        "aws": ["Amazon Web Services", "AWS Cloud", "Amazon AWS", "AWS Certified"],
        "azure": ["Microsoft Azure", "Azure Cloud", "MS Azure", "Azure DevOps"],
        "gcp": ["Google Cloud Platform", "Google Cloud", "GCP Cloud"],
        "docker": ["Docker Containers", "Dockerization", "Docker Compose", "Docker Swarm"],
        "kubernetes": ["K8s", "K8", "Kube", "Kubernetes Cluster", "EKS", "AKS", "GKE"],
        "terraform": ["Terraform IaC", "HashiCorp Terraform", "TF"],
        
        # Database variations
        "postgresql": ["Postgres", "PostgresSQL", "PG", "psql"],
        "mongodb": ["Mongo", "MongoDB Atlas", "NoSQL MongoDB"],
        "redis": ["Redis Cache", "Redis DB", "Amazon ElastiCache"],
        "elasticsearch": ["Elastic Search", "ES", "ELK", "Elastic"],
        
        # Data Science variations
        "machine learning": ["ML", "Machine-Learning", "ML/AI", "Applied ML"],
        "deep learning": ["DL", "Deep-Learning", "Neural Networks", "DNNs"],
        "tensorflow": ["TF", "TensorFlow 2", "TF 2.x", "Keras/TensorFlow"],
        "pytorch": ["PyTorch Lightning", "Torch", "Facebook PyTorch"],
        "pandas": ["Pandas DataFrame", "Python Pandas", "Data Manipulation"],
        "numpy": ["NumPy Arrays", "Python NumPy", "Numerical Python"],
        
        # DevOps variations
        "cicd": ["CI/CD", "CI CD", "Continuous Integration", "Continuous Deployment", "CI/CD Pipelines"],
        "jenkins": ["Jenkins CI", "Jenkins Pipeline", "Jenkins Automation"],
        "github actions": ["GH Actions", "GitHub CI", "GitHub Workflows"],
        "linux": ["Linux Administration", "Ubuntu", "CentOS", "RedHat", "RHEL", "Debian"],
        
        # Soft skills variations
        "agile": ["Agile Methodology", "Agile/Scrum", "Agile Development", "SAFe Agile"],
        "scrum": ["Scrum Master", "Scrum Framework", "Certified Scrum"],
        "leadership": ["Team Leadership", "Technical Leadership", "People Management"],
        "communication": ["Written Communication", "Verbal Communication", "Stakeholder Communication"],
    }
    
    # Novel/emerging skills not typically in taxonomies
    EMERGING_SKILLS = [
        # AI/LLM
        "ChatGPT", "GPT-4", "Claude", "LLM", "Large Language Models", "Prompt Engineering",
        "LangChain", "LlamaIndex", "Vector Databases", "Pinecone", "Weaviate", "Chroma",
        "RAG", "Retrieval Augmented Generation", "Fine-tuning", "RLHF", "Transformers",
        "Hugging Face", "OpenAI API", "Anthropic API", "Gemini API", "Stable Diffusion",
        "DALL-E", "Midjourney", "Generative AI", "AI Agents", "AutoGPT", "CrewAI",
        
        # Modern Web
        "Astro", "Qwik", "Solid.js", "htmx", "Alpine.js", "Turbo", "Hotwire",
        "tRPC", "Zod", "Tanstack Query", "React Query", "SWR", "Zustand", "Jotai",
        "Bun", "Deno", "Edge Functions", "Serverless Edge", "Cloudflare Workers",
        
        # Data/Analytics
        "dbt", "Airbyte", "Fivetran", "Dagster", "Prefect", "Apache Airflow",
        "Delta Lake", "Apache Iceberg", "Trino", "Presto", "ClickHouse", "DuckDB",
        "Great Expectations", "Feast", "MLflow", "Weights & Biases", "Neptune.ai",
        
        # Cloud Native
        "Pulumi", "Crossplane", "Backstage", "Argo Workflows", "Flux CD", "Kustomize",
        "Helm Charts", "Service Mesh", "Istio", "Linkerd", "Envoy", "Cilium",
        "eBPF", "OpenTelemetry", "Jaeger", "Tempo", "Loki", "Mimir",
        
        # Security
        "Zero Trust Architecture", "SAST", "DAST", "SCA", "Snyk", "SonarQube",
        "Trivy", "Falco", "OPA", "Gatekeeper", "Vault", "SPIFFE", "SPIRE",
        
        # Platforms
        "Vercel", "Railway", "Render", "Fly.io", "PlanetScale", "Neon", "Supabase",
        "Clerk", "Auth0", "Okta", "WorkOS", "Stripe", "Plaid", "Twilio",
        
        # Misc Modern
        "WebAssembly", "WASM", "Rust WASM", "AssemblyScript", "Tauri",
        "Electron", "Progressive Web Apps", "Web3", "Blockchain", "Smart Contracts",
        "Solidity", "Ethers.js", "Web3.js", "IPFS", "Graph Protocol"
    ]
    
    def _save_knowledge(self):
        """Save unified knowledge to file."""
        self.knowledge["metadata"]["last_updated"] = datetime.now().isoformat()
        self.knowledge["statistics"]["total_unique_skills_learned"] = len(self.knowledge["learned_skills"])
        
        with open(self.UNIFIED_KNOWLEDGE_FILE, 'w') as f:
            json.dump(self.knowledge, f, indent=2)
    
    def _refresh_linkedin_skills(self) -> bool:
        """
        Refresh skills cache from LinkedIn job postings.
        Returns True if successful, False otherwise.
        """
        if not self.linkedin_scraper or not self.linkedin_scraper.is_available():
            return False
        
        skills, success = self.linkedin_scraper.fetch_skills(count=100)
        
        if success and skills:
            self.linkedin_skills_cache = skills
            self.stats["linkedin_skills_used"] += len(skills)
            
            if not self.quiet:
                print(f"    [LinkedIn] Fetched {len(skills)} real skills from job postings")
            
            return True
        
        return False
    
    def _get_linkedin_skills(self, count: int) -> List[str]:
        """
        Get skills from LinkedIn cache or refresh if needed.
        """
        # Refresh cache if empty or stale (every 10 batches)
        if (not self.linkedin_skills_cache or 
            self.stats["batches_completed"] % 10 == 0):
            self._refresh_linkedin_skills()
        
        if self.linkedin_skills_cache:
            return random.sample(
                self.linkedin_skills_cache, 
                min(count, len(self.linkedin_skills_cache))
            )
        
        return []
    
    def _fetch_random_users(self, count: int) -> List[Dict]:
        """Fetch random user data from RandomUser.me API."""
        try:
            self.stats["api_calls"] += 1
            response = requests.get(
                self.RANDOMUSER_API,
                params={"results": min(count, 100)},
                timeout=15
            )
            response.raise_for_status()
            return response.json().get("results", [])
        except Exception as e:
            self.stats["api_failures"] += 1
            if not self.quiet:
                print(f"    [!] API error: {e}")
            return []
    
    def _generate_resume(self, user: Optional[Dict] = None) -> Dict:
        """Generate a mock resume."""
        
        # Use API data or generate random
        if user:
            name = f"{user['name']['first']} {user['name']['last']}"
            email = user.get("email", f"{user['name']['first'].lower()}@email.com")
            phone = user.get("phone", "(555) 123-4567")
            location = user.get("location", {})
            city = location.get("city", "San Francisco")
            state = location.get("state", "CA")
            age = user.get("dob", {}).get("age", random.randint(25, 55))
        else:
            first_names = ["James", "Sarah", "Michael", "Emily", "David", "Jennifer", "Alex", "Lisa"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            email = f"{name.split()[0].lower()}.{name.split()[1].lower()}@email.com"
            phone = f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"
            city = random.choice(["San Francisco", "New York", "Seattle", "Austin", "Boston"])
            state = random.choice(["CA", "NY", "WA", "TX", "MA"])
            age = random.randint(25, 55)
        
        # Calculate experience
        years_experience = max(0, min(age - 22, 30))
        
        # Select industry and skills
        industry = random.choice(list(self.JOB_TITLES.keys()))
        job_titles = self.JOB_TITLES[industry]
        
        # Select skills from multiple categories
        num_skills = random.randint(8, 20)
        selected_skills = []
        canonical_skills = []  # Track what parser should ideally find
        categories = list(self.SKILLS.keys())
        
        # Weight towards industry-relevant categories
        industry_categories = {
            "tech": ["programming", "web_frontend", "web_backend", "cloud", "databases"],
            "data": ["data_science", "programming", "databases", "cloud"],
            "product": ["business", "soft_skills", "marketing"],
            "design": ["design", "soft_skills", "web_frontend"],
            "security": ["security", "cloud", "devops", "programming"]
        }
        
        primary_categories = industry_categories.get(industry, categories)
        
        # If LinkedIn scraping is enabled, use real skills from job postings
        if self.linkedin_scraper and self.linkedin_skills_cache:
            # 40% LinkedIn real skills (truly generative/discovered)
            linkedin_skills_count = int(num_skills * 0.4)
            linkedin_skills = self._get_linkedin_skills(linkedin_skills_count)
            for skill in linkedin_skills:
                selected_skills.append(skill)
                canonical_skills.append(skill)
            
            # 30% canonical skills from primary categories
            for _ in range(int(num_skills * 0.3)):
                cat = random.choice(primary_categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
            
            # 15% skill variations
            for _ in range(int(num_skills * 0.15)):
                if self.SKILL_VARIATIONS and random.random() > 0.3:
                    canonical = random.choice(list(self.SKILL_VARIATIONS.keys()))
                    variation = random.choice(self.SKILL_VARIATIONS[canonical])
                    selected_skills.append(variation)
                    canonical_skills.append(canonical)
                else:
                    cat = random.choice(categories)
                    if self.SKILLS.get(cat):
                        skill = random.choice(self.SKILLS[cat])
                        selected_skills.append(skill)
                        canonical_skills.append(skill)
            
            # 15% emerging skills
            for _ in range(int(num_skills * 0.15)):
                if self.EMERGING_SKILLS and random.random() > 0.2:
                    skill = random.choice(self.EMERGING_SKILLS)
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
                else:
                    cat = random.choice(categories)
                    if self.SKILLS.get(cat):
                        skill = random.choice(self.SKILLS[cat])
                        selected_skills.append(skill)
                        canonical_skills.append(skill)
        else:
            # Original behavior when LinkedIn not available
            # 50% canonical skills from primary categories
            for _ in range(int(num_skills * 0.5)):
                cat = random.choice(primary_categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                selected_skills.append(skill)
                canonical_skills.append(skill)
        
        # 25% skill variations (realistic resume representations)
        for _ in range(int(num_skills * 0.25)):
            # Pick a skill that has variations
            if self.SKILL_VARIATIONS and random.random() > 0.3:
                canonical = random.choice(list(self.SKILL_VARIATIONS.keys()))
                variation = random.choice(self.SKILL_VARIATIONS[canonical])
                selected_skills.append(variation)
                canonical_skills.append(canonical)  # Parser should find canonical
            else:
                cat = random.choice(categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
        
        # 25% emerging/novel skills (parser likely won't know these)
        for _ in range(int(num_skills * 0.25)):
            if self.EMERGING_SKILLS and random.random() > 0.2:
                skill = random.choice(self.EMERGING_SKILLS)
                selected_skills.append(skill)
                canonical_skills.append(skill)  # New skill to potentially learn
            else:
                cat = random.choice(categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        unique_canonical = []
        for skill, canonical in zip(selected_skills, canonical_skills):
            if skill.lower() not in seen:
                seen.add(skill.lower())
                unique_skills.append(skill)
                unique_canonical.append(canonical)
        
        selected_skills = unique_skills[:num_skills]
        canonical_skills = unique_canonical[:num_skills]
        
        # Generate experience
        experience = []
        remaining_years = years_experience
        current_year = datetime.now().year
        
        for i in range(random.randint(2, 4)):
            if remaining_years <= 0:
                break
            
            duration = random.randint(1, min(5, remaining_years))
            end_year = "Present" if i == 0 else str(current_year - (years_experience - remaining_years))
            start_year = current_year - (years_experience - remaining_years) - duration
            remaining_years -= duration
            
            experience.append({
                "title": random.choice(job_titles),
                "company": random.choice(self.COMPANIES),
                "start_date": str(start_year),
                "end_date": end_year
            })
        
        # Generate education
        education = [{
            "degree": random.choice([
                "BS in Computer Science", "BA in Computer Science",
                "MS in Computer Science", "MS in Data Science",
                "BS in Software Engineering", "MBA"
            ]),
            "institution": random.choice(self.UNIVERSITIES),
            "year": str(current_year - years_experience)
        }]
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "location": f"{city}, {state}",
            "skills": selected_skills,  # What appears on resume (variations)
            "canonical_skills": canonical_skills,  # What parser should ideally find
            "experience": experience,
            "education": education,
            "years_experience": years_experience,
            "industry": industry
        }
    
    def _convert_to_text(self, resume: Dict) -> str:
        """Convert resume dict to plain text for parsing."""
        lines = [
            resume["name"],
            resume["email"],
            resume["phone"],
            resume["location"],
            "",
            "SKILLS",
            ", ".join(resume["skills"]),
            "",
            "EXPERIENCE"
        ]
        
        for job in resume["experience"]:
            lines.append(f"{job['title']} at {job['company']}")
            lines.append(f"{job['start_date']} - {job['end_date']}")
            lines.append("")
        
        lines.append("EDUCATION")
        for edu in resume["education"]:
            lines.append(f"{edu['degree']} - {edu['institution']} ({edu['year']})")
        
        return "\n".join(lines)
    
    def _learn_skills(self, expected_skills: List[str], parsed_skills: List[str]) -> List[str]:
        """Identify and learn new skills."""
        expected_set = set(s.lower() for s in expected_skills)
        parsed_set = set(s.lower() for s in parsed_skills)
        
        missing = expected_set - parsed_set
        new_skills = []
        
        existing_skills = set(s.lower() for s in self.knowledge["learned_skills"])
        
        for skill in missing:
            if skill not in existing_skills and len(skill) > 1:
                # Find original case
                original = next((s for s in expected_skills if s.lower() == skill), skill)
                new_skills.append(original)
                self.knowledge["learned_skills"].append(original)
        
        return new_skills
    
    def _scrape_linkedin_jobs(self) -> Tuple[List[Dict], List[str]]:
        """
        Scrape LinkedIn jobs and extract skills.
        Returns: (jobs, skills)
        """
        if not self.linkedin_scraper or not self.linkedin_scraper.is_available():
            return [], []
        
        # Pick a random job search query
        query = random.choice(self.linkedin_scraper.JOB_SEARCH_QUERIES)
        
        if not self.quiet:
            print(f"\n    [SCRAPE] Fetching LinkedIn jobs: \"{query}\"")
        
        # Fetch jobs
        jobs = self.linkedin_scraper._fetch_jobs_from_apify(query, limit=100)
        
        if not jobs:
            if not self.quiet:
                print(f"    [SCRAPE] No jobs returned")
            return [], []
        
        # Extract skills from all jobs
        all_skills = []
        for job in jobs:
            skills = self.linkedin_scraper._extract_skills_from_job(job)
            all_skills.extend(skills)
        
        # Deduplicate skills
        unique_skills = list(set(all_skills))
        
        self.stats["linkedin_jobs_scraped"] += len(jobs)
        self.stats["linkedin_skills_used"] += len(unique_skills)
        
        if not self.quiet:
            print(f"    [SCRAPE] Extracted {len(unique_skills)} unique skills from {len(jobs)} jobs")
        
        return jobs, unique_skills
    
    def _compare_with_previous(self, current_results: Dict) -> Dict:
        """
        Compare current batch results with previous batch.
        Returns analysis dict.
        """
        analysis = {
            "accuracy_change": 0,
            "skills_improvement": 0,
            "new_skills_delta": 0,
            "trend": "stable"
        }
        
        if not self.previous_batch:
            return analysis
        
        prev = self.previous_batch
        curr = current_results
        
        # Accuracy change
        prev_acc = sum(prev["accuracy_scores"]) / len(prev["accuracy_scores"]) if prev["accuracy_scores"] else 0
        curr_acc = sum(curr["accuracy_scores"]) / len(curr["accuracy_scores"]) if curr["accuracy_scores"] else 0
        analysis["accuracy_change"] = curr_acc - prev_acc
        
        # Skills learned comparison
        analysis["new_skills_delta"] = len(curr["new_skills"]) - len(prev["new_skills"])
        
        # Determine trend
        if analysis["accuracy_change"] > 2:
            analysis["trend"] = "improving"
        elif analysis["accuracy_change"] < -2:
            analysis["trend"] = "declining"
        else:
            analysis["trend"] = "stable"
        
        return analysis
    
    def _process_batch(self) -> Dict:
        """
        Process one training batch:
        1. Scrape LinkedIn jobs
        2. Extract real skills from job postings
        3. Generate resumes using those skills
        4. Parse and compare with expected
        5. Learn new skills
        6. Compare with previous batch
        """
        results = {
            "resumes_processed": 0,
            "new_skills": [],
            "variations_learned": [],
            "accuracy_scores": [],
            "api_used": False,
            "linkedin_jobs": 0,
            "linkedin_skills": [],
            "analysis": {}
        }
        
        # STEP 1: Scrape LinkedIn jobs and extract skills
        jobs, linkedin_skills = self._scrape_linkedin_jobs()
        results["linkedin_jobs"] = len(jobs)
        results["linkedin_skills"] = linkedin_skills
        
        # Update cache with new jobs/skills
        if jobs:
            self.linkedin_jobs_cache = jobs
            self.linkedin_skills_cache = linkedin_skills
            results["api_used"] = True
        
        # Try to fetch random user data for realistic names
        users = self._fetch_random_users(self.batch_size)
        
        # Generate resumes using LinkedIn skills if available
        resumes = []
        for i in range(self.batch_size):
            user = users[i] if i < len(users) else None
            resumes.append(self._generate_resume_with_linkedin_skills(user, linkedin_skills))
        
        # STEP 2: Process each resume - parse and learn
        for resume in resumes:
            # Convert and parse
            text = self._convert_to_text(resume)
            parsed = self.parser.parse_text(text)
            
            # Calculate accuracy against DISPLAYED skills
            displayed_skills = set(s.lower() for s in resume["skills"])
            found = set(s.lower() for s in parsed.skills)
            
            if displayed_skills:
                accuracy = len(displayed_skills & found) / len(displayed_skills) * 100
            else:
                accuracy = 0
            
            results["accuracy_scores"].append(accuracy)
            
            # Learn new skills
            new = self._learn_skills(resume["skills"], parsed.skills)
            results["new_skills"].extend(new)
            
            # Track skill variations
            for display_skill, canonical in zip(resume["skills"], resume.get("canonical_skills", resume["skills"])):
                if display_skill.lower() != canonical.lower():
                    if display_skill.lower() not in found:
                        variation_key = canonical.lower()
                        if "skill_variations" not in self.knowledge:
                            self.knowledge["skill_variations"] = {}
                        if variation_key not in self.knowledge["skill_variations"]:
                            self.knowledge["skill_variations"][variation_key] = []
                        if display_skill not in self.knowledge["skill_variations"][variation_key]:
                            self.knowledge["skill_variations"][variation_key].append(display_skill)
                            results["variations_learned"].append(f"{display_skill} -> {canonical}")
            
            results["resumes_processed"] += 1
        
        # STEP 3: Compare with previous batch
        results["analysis"] = self._compare_with_previous(results)
        
        # Save current as previous for next comparison
        self.previous_batch = results.copy()
        
        return results
    
    def _generate_resume_with_linkedin_skills(self, user: Optional[Dict], linkedin_skills: List[str]) -> Dict:
        """Generate a resume using real LinkedIn skills when available."""
        
        # Use API data or generate random for personal info
        if user:
            name = f"{user['name']['first']} {user['name']['last']}"
            email = user.get("email", f"{user['name']['first'].lower()}@email.com")
            phone = user.get("phone", "(555) 123-4567")
            location = user.get("location", {})
            city = location.get("city", "San Francisco")
            state = location.get("state", "CA")
            age = user.get("dob", {}).get("age", random.randint(25, 55))
        else:
            first_names = ["James", "Sarah", "Michael", "Emily", "David", "Jennifer", "Alex", "Lisa"]
            last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
            name = f"{random.choice(first_names)} {random.choice(last_names)}"
            email = f"{name.split()[0].lower()}.{name.split()[1].lower()}@email.com"
            phone = f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}"
            city = random.choice(["San Francisco", "New York", "Seattle", "Austin", "Boston"])
            state = random.choice(["CA", "NY", "WA", "TX", "MA"])
            age = random.randint(25, 55)
        
        years_experience = max(0, min(age - 22, 30))
        industry = random.choice(list(self.JOB_TITLES.keys()))
        job_titles = self.JOB_TITLES[industry]
        
        num_skills = random.randint(8, 20)
        selected_skills = []
        canonical_skills = []
        categories = list(self.SKILLS.keys())
        
        # Industry-relevant categories
        industry_categories = {
            "tech": ["programming", "web_frontend", "web_backend", "cloud", "databases"],
            "data": ["data_science", "programming", "databases", "cloud"],
            "product": ["business", "soft_skills", "marketing"],
            "design": ["design", "soft_skills", "web_frontend"],
            "security": ["security", "cloud", "devops", "programming"]
        }
        primary_categories = industry_categories.get(industry, categories)
        
        # PRIORITIZE LinkedIn skills (real skills from job postings)
        if linkedin_skills:
            # 50% from LinkedIn (real job postings)
            linkedin_count = int(num_skills * 0.5)
            sampled_linkedin = random.sample(linkedin_skills, min(linkedin_count, len(linkedin_skills)))
            for skill in sampled_linkedin:
                selected_skills.append(skill)
                canonical_skills.append(skill)
            
            # 25% from hardcoded categories
            for _ in range(int(num_skills * 0.25)):
                cat = random.choice(primary_categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
            
            # 15% skill variations
            for _ in range(int(num_skills * 0.15)):
                if self.SKILL_VARIATIONS and random.random() > 0.3:
                    canonical = random.choice(list(self.SKILL_VARIATIONS.keys()))
                    variation = random.choice(self.SKILL_VARIATIONS[canonical])
                    selected_skills.append(variation)
                    canonical_skills.append(canonical)
                else:
                    cat = random.choice(categories)
                    if self.SKILLS.get(cat):
                        skill = random.choice(self.SKILLS[cat])
                        selected_skills.append(skill)
                        canonical_skills.append(skill)
            
            # 10% emerging skills
            for _ in range(int(num_skills * 0.10)):
                if self.EMERGING_SKILLS:
                    skill = random.choice(self.EMERGING_SKILLS)
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
        else:
            # Fallback: Use hardcoded skills when LinkedIn not available
            for _ in range(int(num_skills * 0.5)):
                cat = random.choice(primary_categories)
                if self.SKILLS.get(cat):
                    skill = random.choice(self.SKILLS[cat])
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
            
            for _ in range(int(num_skills * 0.25)):
                if self.SKILL_VARIATIONS and random.random() > 0.3:
                    canonical = random.choice(list(self.SKILL_VARIATIONS.keys()))
                    variation = random.choice(self.SKILL_VARIATIONS[canonical])
                    selected_skills.append(variation)
                    canonical_skills.append(canonical)
                else:
                    cat = random.choice(categories)
                    if self.SKILLS.get(cat):
                        skill = random.choice(self.SKILLS[cat])
                        selected_skills.append(skill)
                        canonical_skills.append(skill)
            
            for _ in range(int(num_skills * 0.25)):
                if self.EMERGING_SKILLS and random.random() > 0.2:
                    skill = random.choice(self.EMERGING_SKILLS)
                    selected_skills.append(skill)
                    canonical_skills.append(skill)
                else:
                    cat = random.choice(categories)
                    if self.SKILLS.get(cat):
                        skill = random.choice(self.SKILLS[cat])
                        selected_skills.append(skill)
                        canonical_skills.append(skill)
        
        # Remove duplicates
        seen = set()
        unique_skills = []
        unique_canonical = []
        for skill, canonical in zip(selected_skills, canonical_skills):
            if skill.lower() not in seen:
                seen.add(skill.lower())
                unique_skills.append(skill)
                unique_canonical.append(canonical)
        
        selected_skills = unique_skills[:num_skills]
        canonical_skills = unique_canonical[:num_skills]
        
        # Generate experience
        experience = []
        remaining_years = years_experience
        current_year = datetime.now().year
        
        for i in range(random.randint(2, 4)):
            if remaining_years <= 0:
                break
            duration = random.randint(1, min(5, remaining_years))
            end_year = "Present" if i == 0 else str(current_year - (years_experience - remaining_years))
            start_year = current_year - (years_experience - remaining_years) - duration
            remaining_years -= duration
            experience.append({
                "title": random.choice(job_titles),
                "company": random.choice(self.COMPANIES),
                "start_date": str(start_year),
                "end_date": end_year
            })
        
        # Generate education
        education = [{
            "degree": random.choice([
                "BS in Computer Science", "BA in Computer Science",
                "MS in Computer Science", "MS in Data Science",
                "BS in Software Engineering", "MBA"
            ]),
            "institution": random.choice(self.UNIVERSITIES),
            "year": str(current_year - years_experience)
        }]
        
        return {
            "name": name,
            "email": email,
            "phone": phone,
            "location": f"{city}, {state}",
            "skills": selected_skills,
            "canonical_skills": canonical_skills,
            "experience": experience,
            "education": education,
            "years_experience": years_experience,
            "industry": industry
        }
    
    def run(self):
        """
        Run continuous training loop:
        1. Scrape LinkedIn jobs → Get real skills from job postings
        2. Generate resumes using those skills
        3. Parse and compare accuracy
        4. Compare with previous batch → Show analysis
        5. Learn and repeat
        """
        self.stats["start_time"] = datetime.now()
        
        print("=" * 60)
        print(" NEXTSTEP AI - LINKEDIN-FIRST CONTINUOUS TRAINING")
        print(" Press Ctrl+C to stop")
        print("=" * 60)
        print()
        print(f"Batch size: {self.batch_size} resumes")
        print(f"Interval: {self.interval} seconds")
        print(f"Starting vocabulary: {len(self.parser.skill_taxonomy)} skills")
        print(f"Previously learned: {len(self.knowledge['learned_skills'])} skills")
        
        # LinkedIn status
        if self.linkedin_scraper and self.linkedin_scraper.is_available():
            scraper_stats = self.linkedin_scraper.get_stats()
            print(f"\n🔗 LinkedIn Scraping: ENABLED")
            print(f"   • {scraper_stats['available_keys']} API keys available (priority 1→5)")
            print(f"   • Will fetch real job postings each batch")
            print(f"   • Extract skills from actual job descriptions")
        else:
            print(f"\n⚠️  LinkedIn Scraping: DISABLED")
            print("   → Add LINKEDIN_TRAINING_API_KEY_1 to .env for real skill discovery")
        
        print()
        print("Training Flow:")
        print("  1. [SCRAPE]  → Fetch LinkedIn jobs")
        print("  2. [EXTRACT] → Extract skills from job descriptions")
        print("  3. [GENERATE]→ Create resumes using real skills")
        print("  4. [PARSE]   → Parse resumes with current model")
        print("  5. [COMPARE] → Analyze vs previous batch")
        print("  6. [LEARN]   → Learn missed skills")
        print("  7. [REPEAT]")
        print()
        print("-" * 60)
        
        try:
            while self.running:
                batch_start = time.time()
                
                # Process batch (scrape → generate → parse → compare → learn)
                results = self._process_batch()
                
                # Update stats
                self.stats["total_resumes"] += results["resumes_processed"]
                self.stats["total_skills_learned"] += len(results["new_skills"])
                self.stats["batches_completed"] += 1
                
                # Update knowledge
                self.knowledge["statistics"]["total_samples_processed"] += results["resumes_processed"]
                self.knowledge["statistics"]["total_training_sessions"] = self.stats["batches_completed"]
                
                # Calculate average accuracy
                avg_accuracy = sum(results["accuracy_scores"]) / len(results["accuracy_scores"]) if results["accuracy_scores"] else 0
                
                # Track accuracy trend
                self.stats["accuracy_trend"].append(avg_accuracy)
                
                # Add to history (keep last 100)
                self.knowledge["training_history"].append({
                    "timestamp": datetime.now().isoformat(),
                    "samples": results["resumes_processed"],
                    "avg_accuracy": round(avg_accuracy, 1),
                    "new_skills": len(results["new_skills"]),
                    "api_used": results["api_used"],
                    "linkedin_jobs": results.get("linkedin_jobs", 0),
                    "linkedin_skills": len(results.get("linkedin_skills", []))
                })
                self.knowledge["training_history"] = self.knowledge["training_history"][-100:]
                
                # Save periodically
                if self.stats["batches_completed"] % 5 == 0:
                    self._save_knowledge()
                
                # Print progress with comparison analysis
                if not self.quiet:
                    elapsed = datetime.now() - self.stats["start_time"]
                    
                    # Main batch line
                    print(f"\n[Batch {self.stats['batches_completed']:4d}] "
                          f"Resumes: {self.stats['total_resumes']:5d} | "
                          f"Accuracy: {avg_accuracy:5.1f}% | "
                          f"New Skills: {len(results['new_skills']):2d} | "
                          f"Total Learned: {len(self.knowledge['learned_skills']):4d} | "
                          f"Time: {str(elapsed).split('.')[0]}")
                    
                    # LinkedIn scrape info
                    if results.get("linkedin_jobs", 0) > 0:
                        print(f"    [LINKEDIN] Jobs scraped: {results['linkedin_jobs']} | "
                              f"Skills extracted: {len(results.get('linkedin_skills', []))}")
                    
                    # Comparison analysis
                    analysis = results.get("analysis", {})
                    if analysis.get("trend") and analysis["trend"] != "stable":
                        acc_change = analysis.get("accuracy_change", 0)
                        trend_icon = "📈" if analysis["trend"] == "improving" else "📉"
                        print(f"    [COMPARE] {trend_icon} Trend: {analysis['trend'].upper()} | "
                              f"Accuracy Δ: {acc_change:+.1f}%")
                    elif analysis.get("trend") == "stable":
                        print(f"    [COMPARE] ➡️  Trend: STABLE")
                    
                    # New skills discovered
                    if results["new_skills"] and len(results["new_skills"]) <= 5:
                        print(f"    [LEARNED] {', '.join(results['new_skills'])}")
                
                # Wait before next batch
                elapsed_batch = time.time() - batch_start
                sleep_time = max(0, self.interval - elapsed_batch)
                if sleep_time > 0 and self.running:
                    time.sleep(sleep_time)
        
        except Exception as e:
            print(f"\n[!] Error: {e}")
            import traceback
            traceback.print_exc()
        
        finally:
            # Final save
            self._save_knowledge()
            self._print_summary()
    
    def _print_summary(self):
        """Print training summary with accuracy analysis."""
        elapsed = datetime.now() - self.stats["start_time"] if self.stats["start_time"] else 0
        
        print()
        print("=" * 60)
        print(" TRAINING COMPLETE")
        print("=" * 60)
        print()
        print(f"Duration: {str(elapsed).split('.')[0] if elapsed else 'N/A'}")
        print(f"Batches completed: {self.stats['batches_completed']}")
        print(f"Total resumes processed: {self.stats['total_resumes']}")
        print(f"New skills learned this session: {self.stats['total_skills_learned']}")
        print(f"Total learned skills: {len(self.knowledge['learned_skills'])}")
        print(f"API calls: {self.stats['api_calls']} ({self.stats['api_failures']} failures)")
        
        # Accuracy trend analysis
        if self.stats.get("accuracy_trend") and len(self.stats["accuracy_trend"]) >= 2:
            trend = self.stats["accuracy_trend"]
            first_half = sum(trend[:len(trend)//2]) / (len(trend)//2) if len(trend)//2 > 0 else 0
            second_half = sum(trend[len(trend)//2:]) / (len(trend) - len(trend)//2) if (len(trend) - len(trend)//2) > 0 else 0
            improvement = second_half - first_half
            
            print()
            print("📊 Accuracy Analysis:")
            print(f"   First half avg:  {first_half:.1f}%")
            print(f"   Second half avg: {second_half:.1f}%")
            print(f"   Overall trend:   {'+' if improvement >= 0 else ''}{improvement:.1f}%")
            
            if improvement > 2:
                print("   Status: 📈 IMPROVING - Model is learning effectively")
            elif improvement < -2:
                print("   Status: 📉 DECLINING - May need more diverse training data")
            else:
                print("   Status: ➡️  STABLE - Consider adding new skill variations")
        
        # LinkedIn stats
        if self.linkedin_scraper:
            scraper_stats = self.linkedin_scraper.get_stats()
            print()
            print("🔗 LinkedIn Scraping Stats:")
            print(f"   Jobs fetched: {scraper_stats['total_jobs_fetched']}")
            print(f"   Skills extracted: {scraper_stats['total_skills_extracted']}")
            print(f"   LinkedIn API calls: {scraper_stats['api_calls']}")
            print(f"   Key rotations: {scraper_stats['key_rotations']}")
            print(f"   Skills used in training: {self.stats.get('linkedin_skills_used', 0)}")
            print(f"   Jobs scraped this session: {self.stats.get('linkedin_jobs_scraped', 0)}")
        
        print()
        print(f"Knowledge saved to: {self.UNIFIED_KNOWLEDGE_FILE}")
        print()


def main():
    parser = argparse.ArgumentParser(
        description="Continuous training for NextStep AI resume parser",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_continuous.py                    # Default settings
  python train_continuous.py --batch 20        # Larger batches
  python train_continuous.py --interval 1      # Faster training
  python train_continuous.py --linkedin        # Enable LinkedIn job scraping
  python train_continuous.py --quiet           # Minimal output

LinkedIn Job Scraping:
  To enable real skill discovery from LinkedIn job postings,
  add API keys to your .env file:
  
    LINKEDIN_TRAINING_API_KEY_1=apify_api_xxxxx
    LINKEDIN_TRAINING_API_KEY_2=apify_api_xxxxx
    LINKEDIN_TRAINING_API_KEY_3=apify_api_xxxxx
    LINKEDIN_TRAINING_API_KEY_4=apify_api_xxxxx
    LINKEDIN_TRAINING_API_KEY_5=apify_api_xxxxx
  
  Get keys at: https://apify.com/

Press Ctrl+C to stop training gracefully.
        """
    )
    
    parser.add_argument(
        "--batch", "-b",
        type=int,
        default=10,
        help="Number of resumes per batch (default: 10)"
    )
    parser.add_argument(
        "--interval", "-i",
        type=int,
        default=3,
        help="Seconds between batches (default: 3)"
    )
    parser.add_argument(
        "--linkedin", "-l",
        action="store_true",
        help="Enable LinkedIn job scraping for real skill discovery"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Minimal output mode"
    )
    
    args = parser.parse_args()
    
    trainer = ContinuousTrainer(
        batch_size=args.batch,
        interval=args.interval,
        quiet=args.quiet,
        use_linkedin=args.linkedin
    )
    
    trainer.run()


if __name__ == "__main__":
    main()
