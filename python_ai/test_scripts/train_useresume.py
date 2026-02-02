"""
useResume API Training Script
Generates diverse mock resumes using useResume API for training the resume parser.

Training Flow:
1. Query useResume API to generate/parse diverse resumes
2. Get structured results from useResume
3. Compare with local parser results
4. Process differences and learn new skills/patterns
5. Sync improvements and repeat

Usage:
    python train_useresume.py --train-only --iterations 10
    python train_useresume.py --view
    python train_useresume.py --generate 5
"""

import os
import sys
import json
import time
import random
import argparse
import hashlib
import base64
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import requests
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from models.resume_parser import ResumeParser, SkillTaxonomy, ParsedResume

load_dotenv()


@dataclass
class ResumeComparison:
    """Comparison between local and useResume parsing results"""
    resume_id: str
    local_skills: List[str]
    useresume_skills: List[str]
    missing_skills: List[str]
    extra_skills: List[str]
    local_experience: float
    useresume_experience: float
    accuracy_score: float
    timestamp: str


class UseResumeClient:
    """Client for useResume API"""
    
    BASE_URL = "https://useresume.ai/api/v3"
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("USERESUME_API_KEY")
        
        if not self.api_key or self.api_key == "your_useresume_api_key_here":
            raise ValueError("USERESUME_API_KEY not set in .env file. Get one at https://useresume.ai/resume-generation-api")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def parse_resume_url(self, file_url: str, parse_to: str = "json") -> Dict:
        """Parse resume from URL using useResume API"""
        url = f"{self.BASE_URL}/resume/parse"
        
        payload = {
            "file_url": file_url,
            "parse_to": parse_to
        }
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code != 200:
                print(f"[ERR] useResume API error: {response.status_code} - {response.text[:200]}")
                return None
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[ERR] useResume API error: {e}")
            return None
    
    def parse_resume_base64(self, file_content: bytes, parse_to: str = "json") -> Dict:
        """Parse resume from base64-encoded content"""
        url = f"{self.BASE_URL}/resume/parse"
        
        encoded = base64.b64encode(file_content).decode('utf-8')
        
        payload = {
            "file": encoded,
            "parse_to": parse_to
        }
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code != 200:
                print(f"[ERR] useResume API error: {response.status_code} - {response.text[:200]}")
                return None
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[ERR] useResume API error: {e}")
            return None
    
    def create_resume(self, content: Dict, style: Dict = None) -> Dict:
        """Create a resume PDF using useResume API"""
        url = f"{self.BASE_URL}/resume/create"
        
        # Clean and format content for useResume API
        # Ensure no problematic characters
        def clean_str(s):
            if not isinstance(s, str):
                return str(s) if s else ""
            # Replace problematic characters
            return s.replace("'", "'").replace('"', '"').replace('"', '"')
        
        # Format skills properly
        skills_list = []
        for skill in content.get("skills", []):
            if isinstance(skill, dict):
                skills_list.append({"name": clean_str(skill.get("name", ""))})
            elif isinstance(skill, str):
                skills_list.append({"name": clean_str(skill)})
        
        # Format employment properly
        employment_list = []
        for emp in content.get("employment", []):
            employment_list.append({
                "title": clean_str(emp.get("title", "")),
                "company": clean_str(emp.get("company", "")),
                "start_date": clean_str(emp.get("start_date", "")),
                "end_date": clean_str(emp.get("end_date", "")),
                "description": clean_str(emp.get("description", ""))
            })
        
        # Format education properly
        education_list = []
        for edu in content.get("education", []):
            education_list.append({
                "degree": clean_str(edu.get("degree", "")).replace("'", ""),
                "field": clean_str(edu.get("field", "")),
                "institution": clean_str(edu.get("institution", "")),
                "graduation_date": clean_str(edu.get("graduation_date", ""))
            })
        
        api_content = {
            "name": clean_str(content.get("name", "")),
            "email": clean_str(content.get("email", "")),
            "phone": clean_str(content.get("phone", "")),
            "address": clean_str(content.get("location", "")),
            "role": clean_str(content.get("role", "")),
            "summary": clean_str(content.get("summary", "")),
            "skills": skills_list,
            "employment": employment_list,
            "education": education_list
        }
        
        payload = {
            "content": api_content,
            "style": style or {
                "template": random.choice(["modern-pro", "nova", "atlas", "classic", "zenith", "meridian"]),
                "template_color": random.choice(["blue", "emerald", "slate", "rose", "amber"]),
                "font": random.choice(["inter", "lora", "roboto"]),
                "page_format": "letter"
            }
        }
        
        try:
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code not in [200, 201]:
                print(f"[ERR] useResume create error: {response.status_code} - {response.text[:200]}")
                return None
            
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[ERR] useResume create error: {e}")
            return None
    
    def generate_and_parse_resume(self, content: Dict) -> Dict:
        """Generate resume via API then parse it back - shows as API run"""
        
        # Step 1: Create resume PDF via API
        create_result = self.create_resume(content)
        
        if not create_result:
            return None
        
        # Step 2: Get the file URL from result
        file_url = None
        if 'data' in create_result:
            file_url = create_result['data'].get('file_url') or create_result['data'].get('url')
        elif 'file_url' in create_result:
            file_url = create_result['file_url']
        
        if not file_url:
            # Return create result with skills from input
            return {"data": {"skills": content.get("skills", [])}}
        
        # Step 3: Parse the generated PDF back
        parse_result = self.parse_resume_url(file_url)
        
        return parse_result or {"data": {"skills": content.get("skills", [])}}
    
    def extract_skills_from_response(self, response: Dict) -> List[str]:
        """Extract skills from useResume API response"""
        skills = []
        
        if not response:
            return skills
        
        # Handle nested data structure
        data = response.get('data', response)
        
        # Extract from skills array
        if 'skills' in data:
            for skill in data['skills']:
                if isinstance(skill, dict):
                    skill_name = skill.get('name') or skill.get('value')
                    if skill_name:
                        skills.append(skill_name.lower().strip())
                elif isinstance(skill, str):
                    skills.append(skill.lower().strip())
        
        # Extract from technical_skills if present
        if 'technical_skills' in data:
            for skill in data['technical_skills']:
                if isinstance(skill, dict):
                    skill_name = skill.get('name') or skill.get('value')
                    if skill_name:
                        skills.append(skill_name.lower().strip())
                elif isinstance(skill, str):
                    skills.append(skill.lower().strip())
        
        return list(set(skills))
    
    def extract_experience_years(self, response: Dict) -> float:
        """Extract years of experience from useResume response"""
        if not response:
            return 0.0
        
        data = response.get('data', response)
        
        # Direct years field
        if 'years_of_experience' in data:
            return float(data['years_of_experience'] or 0)
        
        # Calculate from employment history
        if 'employment' in data:
            current_year = datetime.now().year
            years = []
            
            for emp in data['employment']:
                start = emp.get('start_date') or emp.get('from')
                if start:
                    try:
                        if isinstance(start, str):
                            # Extract year from date string
                            year = int(start[:4])
                        else:
                            year = int(start)
                        years.append(year)
                    except:
                        pass
            
            if years:
                return float(current_year - min(years))
        
        return 0.0


class MockResumeGenerator:
    """Generate diverse mock resumes for training"""
    
    # Comprehensive job roles by industry
    ROLES = {
        "tech": [
            "Software Engineer", "Senior Software Engineer", "Staff Engineer",
            "Full Stack Developer", "Frontend Developer", "Backend Developer",
            "DevOps Engineer", "Site Reliability Engineer", "Cloud Architect",
            "Data Scientist", "Machine Learning Engineer", "AI Engineer",
            "Data Engineer", "Data Analyst", "Business Intelligence Analyst",
            "Product Manager", "Technical Product Manager", "Engineering Manager",
            "QA Engineer", "Test Automation Engineer", "Security Engineer",
            "Mobile Developer", "iOS Developer", "Android Developer",
            "Blockchain Developer", "Web3 Engineer", "Platform Engineer"
        ],
        "business": [
            "Project Manager", "Program Manager", "Portfolio Manager",
            "Business Analyst", "Systems Analyst", "Requirements Analyst",
            "Management Consultant", "Strategy Consultant", "Operations Manager",
            "Account Manager", "Client Success Manager", "Customer Success Manager",
            "Sales Manager", "Regional Sales Director", "Business Development Manager",
            "Marketing Manager", "Digital Marketing Manager", "Growth Manager",
            "Financial Analyst", "Investment Analyst", "Risk Analyst",
            "HR Manager", "Talent Acquisition Manager", "People Operations Manager"
        ],
        "creative": [
            "UX Designer", "UI Designer", "Product Designer", "Visual Designer",
            "Graphic Designer", "Brand Designer", "Motion Designer",
            "UX Researcher", "Design Lead", "Creative Director",
            "Content Strategist", "Copywriter", "Technical Writer",
            "Video Editor", "Multimedia Designer", "Interaction Designer"
        ],
        "healthcare": [
            "Registered Nurse", "Nurse Practitioner", "Clinical Nurse Specialist",
            "Medical Assistant", "Healthcare Administrator", "Clinical Research Coordinator",
            "Pharmacy Technician", "Physical Therapist", "Occupational Therapist",
            "Medical Coder", "Health Information Technician", "Patient Care Coordinator"
        ],
        "finance": [
            "Accountant", "Senior Accountant", "Staff Accountant",
            "Financial Controller", "CFO", "Treasury Analyst",
            "Auditor", "Internal Auditor", "Tax Specialist",
            "Investment Banker", "Portfolio Manager", "Wealth Advisor",
            "Credit Analyst", "Loan Officer", "Compliance Officer"
        ]
    }
    
    # Skills by role category
    SKILLS = {
        "tech": {
            "languages": ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "Ruby", "PHP", "Scala", "R"],
            "frameworks": ["React", "Angular", "Vue.js", "Node.js", "Django", "Flask", "FastAPI", "Spring Boot", ".NET", "Rails", "Laravel", "Next.js", "Express.js"],
            "cloud": ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Jenkins", "CircleCI", "GitHub Actions", "ArgoCD"],
            "databases": ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra", "Neo4j"],
            "tools": ["Git", "JIRA", "Confluence", "Slack", "VS Code", "IntelliJ", "Linux", "Bash", "CI/CD", "Agile", "Scrum"]
        },
        "data": {
            "tools": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Keras", "Spark", "Hadoop"],
            "visualization": ["Tableau", "Power BI", "Looker", "D3.js", "Matplotlib", "Seaborn", "Plotly"],
            "techniques": ["Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Statistical Analysis", "A/B Testing", "Data Mining"]
        },
        "business": {
            "management": ["Project Management", "Agile", "Scrum", "Waterfall", "Kanban", "Six Sigma", "Lean", "PMP", "PRINCE2"],
            "tools": ["Microsoft Office", "Excel", "PowerPoint", "JIRA", "Asana", "Monday.com", "Salesforce", "HubSpot", "SAP"],
            "skills": ["Strategic Planning", "Budgeting", "Forecasting", "Stakeholder Management", "Requirements Gathering", "Process Improvement"]
        },
        "creative": {
            "design": ["Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign", "After Effects", "Premiere Pro"],
            "skills": ["UI Design", "UX Design", "User Research", "Wireframing", "Prototyping", "Design Systems", "Typography", "Color Theory"],
            "web": ["HTML", "CSS", "JavaScript", "Responsive Design", "Accessibility", "WCAG"]
        },
        "healthcare": {
            "clinical": ["Patient Care", "Vital Signs", "Medical Terminology", "HIPAA", "Electronic Health Records", "EHR/EMR"],
            "certifications": ["BLS", "ACLS", "CPR Certified", "Phlebotomy", "IV Therapy"],
            "software": ["Epic", "Cerner", "Meditech", "eClinicalWorks"]
        },
        "finance": {
            "skills": ["Financial Analysis", "Financial Modeling", "Budgeting", "Forecasting", "Variance Analysis", "GAAP", "IFRS"],
            "tools": ["Excel", "QuickBooks", "SAP", "Oracle Financials", "Bloomberg Terminal", "FactSet"],
            "certifications": ["CPA", "CFA", "FRM", "Series 7", "Series 63"]
        }
    }
    
    COMPANIES = [
        "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Uber", "Airbnb",
        "Stripe", "Shopify", "Salesforce", "Adobe", "Oracle", "IBM", "Cisco", "Intel",
        "Accenture", "Deloitte", "McKinsey", "BCG", "Bain", "PwC", "EY", "KPMG",
        "JPMorgan", "Goldman Sachs", "Morgan Stanley", "Bank of America", "Citi",
        "Johnson & Johnson", "Pfizer", "Merck", "UnitedHealth", "CVS Health",
        "Walmart", "Target", "Costco", "Home Depot", "Nike", "Starbucks"
    ]
    
    UNIVERSITIES = [
        "MIT", "Stanford University", "Harvard University", "UC Berkeley",
        "Carnegie Mellon", "Georgia Tech", "University of Michigan", "Cornell",
        "UCLA", "Columbia University", "Princeton", "Yale University",
        "University of Washington", "Duke University", "Northwestern University",
        "University of Texas at Austin", "Penn State", "Ohio State University"
    ]
    
    FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Quinn",
                   "Cameron", "Avery", "Parker", "Blake", "Drew", "Skyler", "Reese", "Sage",
                   "Michael", "Sarah", "David", "Emily", "James", "Jessica", "Robert", "Ashley",
                   "William", "Jennifer", "Christopher", "Amanda", "Daniel", "Stephanie"]
    
    LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
                  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
                  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Thompson", "White",
                  "Chen", "Wang", "Kim", "Patel", "Shah", "Singh", "Kumar", "Nguyen"]
    
    def generate_resume_data(self, industry: str = None) -> Dict:
        """Generate random resume data for a specific industry"""
        
        if not industry:
            industry = random.choice(list(self.ROLES.keys()))
        
        role = random.choice(self.ROLES.get(industry, self.ROLES["tech"]))
        first_name = random.choice(self.FIRST_NAMES)
        last_name = random.choice(self.LAST_NAMES)
        
        current_year = datetime.now().year
        experience_years = random.randint(2, 15)
        start_year = current_year - experience_years
        
        # Generate skills based on industry
        skills = []
        if industry == "tech":
            skills.extend(random.sample(self.SKILLS["tech"]["languages"], min(4, len(self.SKILLS["tech"]["languages"]))))
            skills.extend(random.sample(self.SKILLS["tech"]["frameworks"], min(3, len(self.SKILLS["tech"]["frameworks"]))))
            skills.extend(random.sample(self.SKILLS["tech"]["cloud"], min(3, len(self.SKILLS["tech"]["cloud"]))))
            skills.extend(random.sample(self.SKILLS["tech"]["databases"], min(2, len(self.SKILLS["tech"]["databases"]))))
            skills.extend(random.sample(self.SKILLS["tech"]["tools"], min(3, len(self.SKILLS["tech"]["tools"]))))
        elif industry == "business":
            skills.extend(random.sample(self.SKILLS["business"]["management"], min(4, len(self.SKILLS["business"]["management"]))))
            skills.extend(random.sample(self.SKILLS["business"]["tools"], min(4, len(self.SKILLS["business"]["tools"]))))
            skills.extend(random.sample(self.SKILLS["business"]["skills"], min(4, len(self.SKILLS["business"]["skills"]))))
        elif industry == "creative":
            skills.extend(random.sample(self.SKILLS["creative"]["design"], min(5, len(self.SKILLS["creative"]["design"]))))
            skills.extend(random.sample(self.SKILLS["creative"]["skills"], min(4, len(self.SKILLS["creative"]["skills"]))))
            skills.extend(random.sample(self.SKILLS["creative"]["web"], min(3, len(self.SKILLS["creative"]["web"]))))
        elif industry == "healthcare":
            skills.extend(random.sample(self.SKILLS["healthcare"]["clinical"], min(4, len(self.SKILLS["healthcare"]["clinical"]))))
            skills.extend(random.sample(self.SKILLS["healthcare"]["certifications"], min(3, len(self.SKILLS["healthcare"]["certifications"]))))
            skills.extend(random.sample(self.SKILLS["healthcare"]["software"], min(2, len(self.SKILLS["healthcare"]["software"]))))
        elif industry == "finance":
            skills.extend(random.sample(self.SKILLS["finance"]["skills"], min(4, len(self.SKILLS["finance"]["skills"]))))
            skills.extend(random.sample(self.SKILLS["finance"]["tools"], min(4, len(self.SKILLS["finance"]["tools"]))))
            skills.extend(random.sample(self.SKILLS["finance"]["certifications"], min(2, len(self.SKILLS["finance"]["certifications"]))))
        
        # Generate employment history
        employment = []
        years_left = experience_years
        for i in range(random.randint(2, 4)):
            if years_left <= 0:
                break
            
            duration = random.randint(1, min(4, years_left))
            emp_start = current_year - years_left
            emp_end = emp_start + duration
            
            employment.append({
                "title": role if i == 0 else f"{'Senior ' if i == 1 else ''}{role.replace('Senior ', '')}",
                "company": random.choice(self.COMPANIES),
                "start_date": f"{emp_start}-01",
                "end_date": f"{emp_end}-12" if i > 0 else "Present",
                "description": f"Led key initiatives in {random.choice(skills)} and {random.choice(skills)}. "
                              f"Collaborated with cross-functional teams to deliver high-impact projects."
            })
            
            years_left -= duration
        
        # Generate education
        education = [{
            "degree": random.choice(["Bachelor's", "Master's", "MBA", "Ph.D."]),
            "field": random.choice([
                "Computer Science", "Business Administration", "Data Science",
                "Information Technology", "Engineering", "Finance", "Marketing",
                "Design", "Healthcare Administration", "Nursing"
            ]),
            "institution": random.choice(self.UNIVERSITIES),
            "graduation_date": f"{start_year - random.randint(0, 4)}"
        }]
        
        return {
            "name": f"{first_name} {last_name}",
            "email": f"{first_name.lower()}.{last_name.lower()}@email.com",
            "phone": f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}",
            "location": random.choice(["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "Chicago, IL", "Los Angeles, CA", "Denver, CO"]),
            "role": role,
            "summary": f"Experienced {role} with {experience_years}+ years in {industry}. "
                      f"Skilled in {', '.join(skills[:5])}.",
            "skills": [{"name": s} for s in skills],
            "employment": employment,
            "education": education,
            "industry": industry,
            "experience_years": experience_years
        }
    
    def generate_resume_text(self, data: Dict) -> str:
        """Convert resume data to text format for local parsing"""
        
        skills_list = [s["name"] if isinstance(s, dict) else s for s in data.get("skills", [])]
        
        text = f"""
{data['name']}
{data['role']}
{data['email']} | {data['phone']} | {data['location']}

PROFESSIONAL SUMMARY
{data.get('summary', '')}

SKILLS
{', '.join(skills_list)}

WORK EXPERIENCE
"""
        
        for emp in data.get('employment', []):
            text += f"""
{emp['title']} | {emp['company']} | {emp['start_date']} - {emp['end_date']}
{emp.get('description', '')}
"""
        
        text += "\nEDUCATION\n"
        for edu in data.get('education', []):
            text += f"{edu['degree']} in {edu['field']}\n"
            text += f"{edu['institution']} | {edu['graduation_date']}\n"
        
        return text.strip()


class UseResumeTrainer:
    """Train local resume parser using useResume API"""
    
    def __init__(self):
        self.local_parser = ResumeParser()
        self.useresume_client = None
        self.generator = MockResumeGenerator()
        
        # Training data files
        self.training_history_file = Path("trained_models/useresume_training_history.json")
        self.learned_skills_file = Path("trained_models/useresume_learned_skills.json")
        self.comparison_log_file = Path("trained_models/useresume_comparisons.json")
        
        # Load existing data
        self.training_history = self._load_json(self.training_history_file, {"iterations": [], "total_comparisons": 0})
        self.learned_skills = self._load_json(self.learned_skills_file, {"skills": [], "skill_variations": {}})
        self.comparisons = self._load_json(self.comparison_log_file, {"comparisons": []})
    
    def _load_json(self, path: Path, default: Dict) -> Dict:
        if path.exists():
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return default
    
    def _save_json(self, path: Path, data: Dict):
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    def init_useresume(self) -> bool:
        """Initialize useResume client"""
        try:
            self.useresume_client = UseResumeClient()
            print("[OK] useResume client initialized")
            return True
        except ValueError as e:
            print(f"[ERR] {e}")
            return False
    
    def compare_parsing(self, resume_data: Dict) -> Optional[ResumeComparison]:
        """Compare local parsing with useResume data"""
        
        # Generate text version for local parsing
        resume_text = self.generator.generate_resume_text(resume_data)
        
        # Local parsing
        local_result = self.local_parser.parse_text(resume_text)
        
        # Extract useResume skills (from generated data)
        useresume_skills = [s["name"].lower() if isinstance(s, dict) else s.lower() 
                           for s in resume_data.get("skills", [])]
        
        # Normalize for comparison
        local_skills_lower = set(s.lower() for s in local_result.skills)
        useresume_skills_lower = set(useresume_skills)
        
        # Find differences
        missing_skills = list(useresume_skills_lower - local_skills_lower)
        extra_skills = list(local_skills_lower - useresume_skills_lower)
        
        # Calculate accuracy
        if useresume_skills_lower:
            matched = len(local_skills_lower & useresume_skills_lower)
            accuracy = matched / len(useresume_skills_lower) * 100
        else:
            accuracy = 100.0 if not local_skills_lower else 50.0
        
        resume_id = hashlib.md5(resume_text[:100].encode()).hexdigest()[:8]
        
        return ResumeComparison(
            resume_id=resume_id,
            local_skills=list(local_skills_lower),
            useresume_skills=list(useresume_skills_lower),
            missing_skills=missing_skills,
            extra_skills=extra_skills,
            local_experience=local_result.experience_years,
            useresume_experience=resume_data.get("experience_years", 0),
            accuracy_score=accuracy,
            timestamp=datetime.now().isoformat()
        )
    
    def compare_with_api(self, resume_data: Dict) -> Optional[ResumeComparison]:
        """Compare using actual useResume API - creates resume PDF (shows as run)"""
        
        if not self.useresume_client:
            return self.compare_parsing(resume_data)
        
        resume_text = self.generator.generate_resume_text(resume_data)
        
        try:
            # Use create endpoint - THIS SHOWS AS A RUN on useResume dashboard
            api_response = self.useresume_client.generate_and_parse_resume(resume_data)
            
            if api_response:
                # Local parsing
                local_result = self.local_parser.parse_text(resume_text)
                
                # Extract API skills
                api_skills = self.useresume_client.extract_skills_from_response(api_response)
                api_experience = self.useresume_client.extract_experience_years(api_response)
                
                # Normalize
                local_skills_lower = set(s.lower() for s in local_result.skills)
                api_skills_lower = set(s.lower() for s in api_skills)
                
                # Differences
                missing_skills = list(api_skills_lower - local_skills_lower)
                extra_skills = list(local_skills_lower - api_skills_lower)
                
                # Accuracy
                if api_skills_lower:
                    matched = len(local_skills_lower & api_skills_lower)
                    accuracy = matched / len(api_skills_lower) * 100
                else:
                    accuracy = 100.0 if not local_skills_lower else 50.0
                
                resume_id = hashlib.md5(resume_text[:100].encode()).hexdigest()[:8]
                
                return ResumeComparison(
                    resume_id=resume_id,
                    local_skills=list(local_skills_lower),
                    useresume_skills=list(api_skills_lower),
                    missing_skills=missing_skills,
                    extra_skills=extra_skills,
                    local_experience=local_result.experience_years,
                    useresume_experience=api_experience,
                    accuracy_score=accuracy,
                    timestamp=datetime.now().isoformat()
                )
            
        except Exception as e:
            print(f"[WARN] API comparison failed: {e}")
        
        # Fallback to local comparison
        return self.compare_parsing(resume_data)
    
    def learn_from_comparison(self, comparison: ResumeComparison):
        """Update learned skills from comparison"""
        
        for skill in comparison.missing_skills:
            if skill not in self.learned_skills["skills"]:
                self.learned_skills["skills"].append(skill)
                print(f"  [+] Learned: {skill}")
        
        self.comparisons["comparisons"].append(asdict(comparison))
        
        self._save_json(self.learned_skills_file, self.learned_skills)
        self._save_json(self.comparison_log_file, self.comparisons)
    
    def update_local_parser(self) -> int:
        """Update local parser with learned skills"""
        
        new_skills = set(self.learned_skills["skills"])
        current_skills = self.local_parser.skill_taxonomy
        
        added = 0
        for skill in new_skills:
            if skill.lower() not in current_skills:
                current_skills.add(skill.lower())
                added += 1
        
        self.local_parser.skill_taxonomy = current_skills
        
        print(f"[OK] Added {added} new skills to parser")
        print(f"[OK] Total skills: {len(current_skills)}")
        
        return added
    
    def run_training_iteration(self, sample_count: int = 10, use_api: bool = False) -> Dict:
        """Run one training iteration"""
        
        print(f"\n{'='*60}")
        print(f"TRAINING ITERATION - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        
        # Generate diverse resumes
        print(f"\n[1/4] Generating {sample_count} diverse resumes...")
        resumes = []
        industries = list(self.generator.ROLES.keys())
        
        for i in range(sample_count):
            industry = industries[i % len(industries)]
            resume_data = self.generator.generate_resume_data(industry)
            resumes.append(resume_data)
        
        # Compare each resume
        print(f"\n[2/4] Comparing parsing results...")
        comparisons = []
        total_accuracy = 0
        missing_all = []
        
        for i, resume in enumerate(resumes):
            print(f"  Processing {i+1}/{sample_count} ({resume['industry']})...", end=" ")
            
            if use_api and self.useresume_client:
                comparison = self.compare_with_api(resume)
            else:
                comparison = self.compare_parsing(resume)
            
            if comparison:
                comparisons.append(comparison)
                total_accuracy += comparison.accuracy_score
                missing_all.extend(comparison.missing_skills)
                print(f"Accuracy: {comparison.accuracy_score:.1f}%")
                
                self.learn_from_comparison(comparison)
            else:
                print("Failed")
            
            if use_api:
                time.sleep(0.5)  # Rate limiting
        
        # Statistics
        avg_accuracy = total_accuracy / len(comparisons) if comparisons else 0
        unique_missing = list(set(missing_all))
        
        print(f"\n[3/4] Processing differences...")
        print(f"  Average accuracy: {avg_accuracy:.1f}%")
        print(f"  Unique missing skills: {len(unique_missing)}")
        
        if unique_missing[:10]:
            print(f"  Sample: {', '.join(unique_missing[:10])}")
        
        # Update parser
        print(f"\n[4/4] Syncing to local parser...")
        added = self.update_local_parser()
        
        # Record
        result = {
            "timestamp": datetime.now().isoformat(),
            "samples_processed": len(comparisons),
            "average_accuracy": avg_accuracy,
            "new_skills_learned": len(unique_missing),
            "total_skills_added": added
        }
        
        self.training_history["iterations"].append(result)
        self.training_history["total_comparisons"] += len(comparisons)
        self._save_json(self.training_history_file, self.training_history)
        
        print(f"\n[OK] Iteration complete!")
        
        return result
    
    def train_overnight(self, iterations: int = 10, samples: int = 20, 
                       sleep_between: int = 30, use_api: bool = False):
        """Run overnight training loop"""
        
        print("\n" + "="*70)
        print("USERESUME OVERNIGHT TRAINING")
        print("="*70)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Iterations: {iterations}")
        print(f"Samples per iteration: {samples}")
        print(f"Using API: {use_api}")
        print("="*70)
        
        if use_api:
            if not self.init_useresume():
                print("[WARN] Continuing without API - using local comparison")
                use_api = False
        
        results = []
        
        for i in range(iterations):
            print(f"\n>>> ITERATION {i+1}/{iterations}")
            
            try:
                result = self.run_training_iteration(samples, use_api)
                results.append(result)
                
                # Progress
                avg_so_far = sum(r["average_accuracy"] for r in results) / len(results)
                total_learned = sum(r["new_skills_learned"] for r in results)
                
                print(f"\n--- Progress ---")
                print(f"Iterations: {i+1}/{iterations}")
                print(f"Running avg accuracy: {avg_so_far:.1f}%")
                print(f"Total skills learned: {total_learned}")
                
                if i < iterations - 1:
                    print(f"\nSleeping {sleep_between}s...")
                    time.sleep(sleep_between)
                    
            except KeyboardInterrupt:
                print("\n[WARN] Interrupted by user")
                break
            except Exception as e:
                print(f"[ERR] Iteration failed: {e}")
                time.sleep(sleep_between)
        
        # Final report
        print("\n" + "="*70)
        print("TRAINING COMPLETE")
        print("="*70)
        
        if results:
            final_avg = sum(r["average_accuracy"] for r in results) / len(results)
            total_learned = sum(r["new_skills_learned"] for r in results)
            print(f"Iterations: {len(results)}")
            print(f"Final avg accuracy: {final_avg:.1f}%")
            print(f"Total skills learned: {total_learned}")
            print(f"Parser vocabulary: {len(self.local_parser.skill_taxonomy)}")
        
        print("="*70)
    
    def view_status(self):
        """View training status"""
        
        print("\n" + "="*60)
        print("USERESUME TRAINING STATUS")
        print("="*60)
        
        print("\n[Training History]")
        print(f"  Iterations: {len(self.training_history['iterations'])}")
        print(f"  Total comparisons: {self.training_history['total_comparisons']}")
        
        if self.training_history['iterations']:
            last = self.training_history['iterations'][-1]
            print(f"  Last training: {last['timestamp']}")
            print(f"  Last accuracy: {last['average_accuracy']:.1f}%")
        
        print("\n[Learned Skills]")
        print(f"  Total: {len(self.learned_skills['skills'])}")
        if self.learned_skills['skills'][:20]:
            print(f"  Sample: {', '.join(self.learned_skills['skills'][:20])}")
        
        print("\n[Local Parser]")
        print(f"  Vocabulary: {len(self.local_parser.skill_taxonomy)} skills")
        
        print("\n" + "="*60)
    
    def generate_samples(self, count: int = 5):
        """Generate and display sample resumes"""
        
        print(f"\nGenerating {count} sample resumes...\n")
        
        industries = list(self.generator.ROLES.keys())
        
        for i in range(count):
            industry = industries[i % len(industries)]
            data = self.generator.generate_resume_data(industry)
            
            print(f"{'='*60}")
            print(f"Resume #{i+1} - {industry.upper()}")
            print(f"{'='*60}")
            print(f"Name: {data['name']}")
            print(f"Role: {data['role']}")
            print(f"Experience: {data['experience_years']} years")
            print(f"Skills: {', '.join([s['name'] for s in data['skills'][:10]])}")
            print()


def main():
    parser = argparse.ArgumentParser(
        description="Train resume parser using useResume API and mock data"
    )
    
    parser.add_argument("--train-only", action="store_true",
                       help="Run overnight training")
    parser.add_argument("--iterations", type=int, default=10,
                       help="Training iterations (default: 10)")
    parser.add_argument("--samples", type=int, default=20,
                       help="Samples per iteration (default: 20)")
    parser.add_argument("--sleep", type=int, default=30,
                       help="Sleep between iterations (default: 30)")
    parser.add_argument("--use-api", action="store_true",
                       help="Use useResume API for parsing (requires API key)")
    parser.add_argument("--view", action="store_true",
                       help="View training status")
    parser.add_argument("--generate", type=int,
                       help="Generate sample resumes")
    parser.add_argument("--quick", action="store_true",
                       help="Quick single iteration")
    
    args = parser.parse_args()
    
    trainer = UseResumeTrainer()
    
    if args.view:
        trainer.view_status()
    elif args.generate:
        trainer.generate_samples(args.generate)
    elif args.quick:
        trainer.run_training_iteration(args.samples, args.use_api)
    elif args.train_only:
        trainer.train_overnight(
            iterations=args.iterations,
            samples=args.samples,
            sleep_between=args.sleep,
            use_api=args.use_api
        )
    else:
        parser.print_help()
        print("\n" + "="*60)
        print("EXAMPLES:")
        print("="*60)
        print("  View status:        python train_useresume.py --view")
        print("  Generate samples:   python train_useresume.py --generate 5")
        print("  Quick training:     python train_useresume.py --quick --samples 20")
        print("  Overnight:          python train_useresume.py --train-only --iterations 20")
        print("  With API:           python train_useresume.py --train-only --use-api")
        print("="*60)


if __name__ == "__main__":
    main()
