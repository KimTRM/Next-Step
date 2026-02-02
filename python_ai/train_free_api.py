#!/usr/bin/env python3
"""
FREE API Resume Training Script

Uses completely FREE APIs (no API keys needed) to generate mock resume data:
- RandomUser.me: Personal info (name, email, phone, location, picture)
- FakerAPI: Additional person/company data

This replaces the useResume API with free alternatives for training the resume parser.
"""

import json
import random
import time
import argparse
import os
import sys
import requests
from datetime import datetime, timedelta
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from models.resume_parser import ResumeParser


class FreeAPIClient:
    """Client for free mock data APIs."""
    
    def __init__(self):
        self.randomuser_url = "https://randomuser.me/api/"
        self.fakerapi_url = "https://fakerapi.it/api/v2/"
        
    def get_random_user(self, nationality=None, gender=None):
        """Get a random user from RandomUser.me API."""
        params = {"results": 1}
        if nationality:
            params["nat"] = nationality
        if gender:
            params["gender"] = gender
            
        try:
            response = requests.get(self.randomuser_url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            if data.get("results"):
                return data["results"][0]
        except Exception as e:
            print(f"    [!] RandomUser API error: {e}")
        return None
    
    def get_random_users(self, count=10, nationality=None):
        """Get multiple random users."""
        params = {"results": min(count, 5000)}
        if nationality:
            params["nat"] = nationality
            
        try:
            response = requests.get(self.randomuser_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            print(f"    [!] RandomUser API error: {e}")
        return []
    
    def get_faker_persons(self, quantity=10, locale="en_US"):
        """Get fake persons from FakerAPI."""
        try:
            url = f"{self.fakerapi_url}persons"
            params = {"_quantity": min(quantity, 1000), "_locale": locale}
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except Exception as e:
            print(f"    [!] FakerAPI persons error: {e}")
        return []
    
    def get_faker_companies(self, quantity=10, locale="en_US"):
        """Get fake companies from FakerAPI."""
        try:
            url = f"{self.fakerapi_url}companies"
            params = {"_quantity": min(quantity, 1000), "_locale": locale}
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except Exception as e:
            print(f"    [!] FakerAPI companies error: {e}")
        return []


class EnhancedResumeGenerator:
    """Generate realistic resume data using free APIs + local data."""
    
    # Expanded skill database by category
    SKILLS = {
        "programming": [
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust",
            "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl",
            "Shell Scripting", "Bash", "PowerShell", "SQL", "NoSQL", "GraphQL"
        ],
        "web_frontend": [
            "React", "Vue.js", "Angular", "Next.js", "Svelte", "HTML5", "CSS3",
            "SASS", "LESS", "Tailwind CSS", "Bootstrap", "Material UI", "Redux",
            "Webpack", "Vite", "jQuery", "TypeScript", "REST APIs", "WebSocket"
        ],
        "web_backend": [
            "Node.js", "Express.js", "Django", "Flask", "FastAPI", "Spring Boot",
            "Ruby on Rails", "ASP.NET", "Laravel", "NestJS", "GraphQL", "gRPC",
            "Microservices", "API Design", "OAuth", "JWT", "WebSockets"
        ],
        "data_science": [
            "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras",
            "Scikit-learn", "Pandas", "NumPy", "Data Analysis", "Data Visualization",
            "Matplotlib", "Seaborn", "Plotly", "Jupyter", "Statistics",
            "Natural Language Processing", "Computer Vision", "Neural Networks",
            "Feature Engineering", "Model Deployment", "MLOps", "A/B Testing"
        ],
        "cloud": [
            "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Terraform",
            "CloudFormation", "Serverless", "Lambda", "EC2", "S3", "RDS",
            "DynamoDB", "Firebase", "Heroku", "DigitalOcean", "CI/CD",
            "Jenkins", "GitHub Actions", "GitLab CI", "Ansible", "Prometheus"
        ],
        "databases": [
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
            "SQLite", "Oracle", "SQL Server", "Cassandra", "Neo4j",
            "DynamoDB", "Firebase", "InfluxDB", "TimescaleDB", "CockroachDB"
        ],
        "devops": [
            "Linux", "Unix", "Windows Server", "Nginx", "Apache", "Git",
            "Version Control", "Agile", "Scrum", "Kanban", "JIRA", "Confluence",
            "Monitoring", "Logging", "Grafana", "ELK Stack", "Splunk"
        ],
        "mobile": [
            "iOS Development", "Android Development", "React Native", "Flutter",
            "Swift", "Kotlin", "Objective-C", "Xamarin", "Ionic", "Mobile UI/UX",
            "App Store Optimization", "Push Notifications", "Mobile Security"
        ],
        "security": [
            "Cybersecurity", "Penetration Testing", "Vulnerability Assessment",
            "OWASP", "Security Auditing", "Encryption", "SSL/TLS", "IAM",
            "SIEM", "SOC", "Incident Response", "Compliance", "GDPR", "HIPAA"
        ],
        "business": [
            "Project Management", "Product Management", "Business Analysis",
            "Requirements Gathering", "Stakeholder Management", "Budgeting",
            "Strategic Planning", "Risk Management", "Change Management",
            "Vendor Management", "Contract Negotiation", "Process Improvement"
        ],
        "soft_skills": [
            "Leadership", "Communication", "Problem Solving", "Team Collaboration",
            "Critical Thinking", "Time Management", "Adaptability", "Creativity",
            "Attention to Detail", "Customer Service", "Presentation Skills",
            "Conflict Resolution", "Decision Making", "Mentoring"
        ],
        "marketing": [
            "Digital Marketing", "SEO", "SEM", "Content Marketing", "Social Media",
            "Google Analytics", "Marketing Automation", "Email Marketing",
            "Brand Strategy", "Market Research", "Campaign Management", "CRM"
        ],
        "design": [
            "UI/UX Design", "Figma", "Adobe XD", "Sketch", "Photoshop",
            "Illustrator", "InDesign", "User Research", "Wireframing",
            "Prototyping", "Design Systems", "Accessibility", "Responsive Design"
        ],
        "finance": [
            "Financial Analysis", "Accounting", "Excel", "Financial Modeling",
            "Budgeting", "Forecasting", "QuickBooks", "SAP", "ERP Systems",
            "Auditing", "Tax Planning", "Investment Analysis", "Risk Assessment"
        ],
        "healthcare": [
            "HIPAA Compliance", "EHR/EMR", "Epic Systems", "Cerner",
            "Medical Coding", "ICD-10", "Clinical Research", "Patient Care",
            "Healthcare Analytics", "Telemedicine", "HL7", "FHIR"
        ]
    }
    
    # Job titles by industry
    JOB_TITLES = {
        "tech": [
            "Software Engineer", "Senior Software Engineer", "Staff Engineer",
            "Principal Engineer", "Full Stack Developer", "Frontend Developer",
            "Backend Developer", "DevOps Engineer", "SRE", "Data Engineer",
            "Machine Learning Engineer", "AI Engineer", "Cloud Architect",
            "Solutions Architect", "Technical Lead", "Engineering Manager",
            "VP of Engineering", "CTO", "Mobile Developer", "iOS Developer",
            "Android Developer", "QA Engineer", "Test Automation Engineer"
        ],
        "data": [
            "Data Scientist", "Senior Data Scientist", "Data Analyst",
            "Business Intelligence Analyst", "Analytics Engineer",
            "Machine Learning Scientist", "Research Scientist",
            "Data Engineer", "Data Architect", "Chief Data Officer"
        ],
        "product": [
            "Product Manager", "Senior Product Manager", "Director of Product",
            "VP of Product", "Chief Product Officer", "Product Owner",
            "Technical Product Manager", "Product Analyst"
        ],
        "design": [
            "UI Designer", "UX Designer", "Product Designer", "Senior Designer",
            "Design Lead", "Creative Director", "Visual Designer",
            "UX Researcher", "Interaction Designer", "Design Manager"
        ],
        "business": [
            "Business Analyst", "Senior Business Analyst", "Project Manager",
            "Program Manager", "Strategy Consultant", "Management Consultant",
            "Operations Manager", "Business Development Manager"
        ],
        "marketing": [
            "Marketing Manager", "Digital Marketing Specialist", "SEO Specialist",
            "Content Marketing Manager", "Growth Marketing Manager",
            "Marketing Director", "CMO", "Brand Manager", "Social Media Manager"
        ],
        "finance": [
            "Financial Analyst", "Senior Financial Analyst", "Accountant",
            "Controller", "CFO", "Investment Analyst", "Risk Analyst",
            "Auditor", "Tax Specialist", "Finance Manager"
        ],
        "security": [
            "Security Engineer", "Security Analyst", "Penetration Tester",
            "Security Architect", "CISO", "SOC Analyst", "Incident Responder",
            "Compliance Analyst", "Security Consultant"
        ]
    }
    
    # Universities
    UNIVERSITIES = [
        "MIT", "Stanford University", "Harvard University", "UC Berkeley",
        "Carnegie Mellon University", "Georgia Tech", "University of Michigan",
        "University of Washington", "Cornell University", "UCLA",
        "University of Texas at Austin", "Columbia University", "Princeton University",
        "Yale University", "Duke University", "Northwestern University",
        "University of Illinois", "Penn State", "Ohio State University",
        "University of Florida", "Arizona State University", "NYU",
        "Boston University", "University of Chicago", "Brown University"
    ]
    
    # Degrees
    DEGREES = [
        "Bachelor of Science in Computer Science",
        "Bachelor of Science in Software Engineering",
        "Bachelor of Science in Information Technology",
        "Bachelor of Arts in Computer Science",
        "Master of Science in Computer Science",
        "Master of Science in Data Science",
        "Master of Business Administration",
        "Master of Science in Artificial Intelligence",
        "Bachelor of Science in Electrical Engineering",
        "Bachelor of Science in Mathematics",
        "Bachelor of Science in Statistics",
        "Master of Science in Machine Learning",
        "Bachelor of Science in Business Administration",
        "Master of Science in Information Systems",
        "PhD in Computer Science"
    ]
    
    # Tech companies for work experience
    COMPANIES = [
        "Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix", "Tesla",
        "Uber", "Airbnb", "Spotify", "Salesforce", "Adobe", "Intel", "IBM",
        "Oracle", "Cisco", "VMware", "Nvidia", "Qualcomm", "PayPal",
        "Square", "Stripe", "Shopify", "Zoom", "Slack", "Dropbox", "GitHub",
        "LinkedIn", "Twitter", "Pinterest", "Snap", "Lyft", "DoorDash",
        "Instacart", "Robinhood", "Coinbase", "Databricks", "Snowflake",
        "Palantir", "MongoDB", "Elastic", "Datadog", "HashiCorp", "Confluent"
    ]
    
    def __init__(self, api_client):
        self.api = api_client
        
    def generate_resume_from_api(self, industry=None):
        """Generate a complete resume using free API data."""
        
        # Get random user from API
        user = self.api.get_random_user()
        if not user:
            return self._generate_offline_resume(industry)
        
        # Select industry and job category
        if not industry:
            industry = random.choice(list(self.JOB_TITLES.keys()))
        
        job_titles = self.JOB_TITLES.get(industry, self.JOB_TITLES["tech"])
        
        # Extract user info
        name = f"{user['name']['first']} {user['name']['last']}"
        email = user.get("email", f"{user['name']['first'].lower()}.{user['name']['last'].lower()}@email.com")
        phone = user.get("phone", "(555) 123-4567")
        
        location_data = user.get("location", {})
        city = location_data.get("city", "San Francisco")
        state = location_data.get("state", "California")
        country = location_data.get("country", "United States")
        
        # Calculate experience years from age
        dob = user.get("dob", {})
        age = dob.get("age", random.randint(25, 55))
        years_experience = max(0, min(age - 22, 35))  # Career starts around 22
        
        # Generate skills based on industry
        skills = self._select_skills_for_industry(industry, count=random.randint(8, 20))
        
        # Generate work experience
        experience = self._generate_experience(job_titles, years_experience)
        
        # Generate education
        education = self._generate_education(years_experience)
        
        # Build resume data
        resume = {
            "personal_info": {
                "name": name,
                "email": email,
                "phone": phone,
                "location": f"{city}, {state}" if country == "United States" else f"{city}, {country}",
                "linkedin": f"linkedin.com/in/{user['name']['first'].lower()}{user['name']['last'].lower()}",
            },
            "summary": self._generate_summary(name, industry, years_experience, skills[:5]),
            "skills": skills,
            "experience": experience,
            "education": education,
            "source": "randomuser.me + local generation",
            "generated_at": datetime.now().isoformat()
        }
        
        return resume
    
    def generate_batch_resumes(self, count=10, industries=None):
        """Generate multiple resumes using batch API call."""
        
        resumes = []
        
        # Get batch of users from API
        users = self.api.get_random_users(count=count)
        
        if not industries:
            industries = list(self.JOB_TITLES.keys())
        
        for i, user in enumerate(users):
            industry = random.choice(industries)
            job_titles = self.JOB_TITLES.get(industry, self.JOB_TITLES["tech"])
            
            # Extract user info
            name = f"{user['name']['first']} {user['name']['last']}"
            email = user.get("email", f"{user['name']['first'].lower()}@email.com")
            phone = user.get("phone", "(555) 123-4567")
            
            location_data = user.get("location", {})
            city = location_data.get("city", "San Francisco")
            state = location_data.get("state", "California")
            country = location_data.get("country", "United States")
            
            # Experience from age
            dob = user.get("dob", {})
            age = dob.get("age", random.randint(25, 55))
            years_experience = max(0, min(age - 22, 35))
            
            skills = self._select_skills_for_industry(industry, count=random.randint(8, 18))
            experience = self._generate_experience(job_titles, years_experience)
            education = self._generate_education(years_experience)
            
            resume = {
                "personal_info": {
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "location": f"{city}, {state}" if country == "United States" else f"{city}, {country}",
                },
                "summary": self._generate_summary(name, industry, years_experience, skills[:5]),
                "skills": skills,
                "experience": experience,
                "education": education,
                "industry": industry,
                "years_experience": years_experience
            }
            resumes.append(resume)
        
        # Fill remaining with offline generation if API didn't return enough
        while len(resumes) < count:
            industry = random.choice(industries)
            resumes.append(self._generate_offline_resume(industry))
        
        return resumes
    
    def _select_skills_for_industry(self, industry, count=12):
        """Select relevant skills for an industry."""
        
        # Industry to skill category mapping
        industry_skills = {
            "tech": ["programming", "web_frontend", "web_backend", "cloud", "databases", "devops"],
            "data": ["data_science", "programming", "databases", "cloud"],
            "product": ["business", "soft_skills", "data_science"],
            "design": ["design", "soft_skills", "web_frontend"],
            "business": ["business", "soft_skills", "marketing"],
            "marketing": ["marketing", "design", "soft_skills", "business"],
            "finance": ["finance", "business", "soft_skills"],
            "security": ["security", "cloud", "devops", "programming"]
        }
        
        categories = industry_skills.get(industry, ["programming", "soft_skills"])
        
        # Collect skills from relevant categories
        available_skills = []
        for cat in categories:
            available_skills.extend(self.SKILLS.get(cat, []))
        
        # Add some random skills from other categories
        all_skills = []
        for cat_skills in self.SKILLS.values():
            all_skills.extend(cat_skills)
        
        # Select skills (70% from industry, 30% random)
        industry_count = int(count * 0.7)
        random_count = count - industry_count
        
        selected = random.sample(available_skills, min(industry_count, len(available_skills)))
        
        # Add random skills not already selected
        remaining = [s for s in all_skills if s not in selected]
        selected.extend(random.sample(remaining, min(random_count, len(remaining))))
        
        return selected[:count]
    
    def _generate_experience(self, job_titles, years_experience):
        """Generate work experience."""
        
        experience = []
        current_year = datetime.now().year
        remaining_years = years_experience
        
        num_jobs = min(random.randint(2, 5), max(1, years_experience // 2))
        
        for i in range(num_jobs):
            if remaining_years <= 0:
                break
            
            # Job duration
            if i == 0:  # Current job
                duration = random.randint(1, min(5, remaining_years))
                end_year = "Present"
            else:
                duration = random.randint(1, min(4, remaining_years))
                end_year = str(current_year - (years_experience - remaining_years))
            
            start_year = current_year - (years_experience - remaining_years) - duration
            remaining_years -= duration
            
            # Select job title (higher seniority for more recent jobs)
            seniority_index = min(i * 2, len(job_titles) - 1)
            title = random.choice(job_titles[:len(job_titles) - seniority_index] if seniority_index < len(job_titles) else job_titles)
            
            company = random.choice(self.COMPANIES)
            
            job = {
                "title": title,
                "company": company,
                "start_date": str(start_year),
                "end_date": end_year,
                "description": self._generate_job_description(title)
            }
            experience.append(job)
        
        return experience
    
    def _generate_job_description(self, title):
        """Generate a job description based on title."""
        
        descriptions = {
            "engineer": [
                "Designed and implemented scalable software solutions",
                "Led development of key features increasing user engagement by 40%",
                "Collaborated with cross-functional teams to deliver projects on time",
                "Mentored junior developers and conducted code reviews",
                "Optimized system performance reducing latency by 60%"
            ],
            "data": [
                "Built machine learning models improving prediction accuracy by 35%",
                "Developed data pipelines processing millions of records daily",
                "Created dashboards and visualizations for stakeholder reporting",
                "Conducted A/B tests driving data-informed product decisions",
                "Implemented ETL processes for data warehouse integration"
            ],
            "manager": [
                "Led a team of 8+ engineers delivering key product features",
                "Managed roadmap planning and sprint execution using Agile",
                "Collaborated with stakeholders to define product requirements",
                "Improved team velocity by 25% through process optimization",
                "Drove hiring initiatives growing team from 5 to 15 members"
            ],
            "designer": [
                "Designed intuitive user interfaces for web and mobile applications",
                "Conducted user research informing product design decisions",
                "Created design systems ensuring consistency across products",
                "Led usability testing improving user satisfaction scores by 30%",
                "Collaborated with engineering to implement pixel-perfect designs"
            ]
        }
        
        title_lower = title.lower()
        if "engineer" in title_lower or "developer" in title_lower:
            return ". ".join(random.sample(descriptions["engineer"], 3)) + "."
        elif "data" in title_lower or "analyst" in title_lower:
            return ". ".join(random.sample(descriptions["data"], 3)) + "."
        elif "manager" in title_lower or "lead" in title_lower or "director" in title_lower:
            return ". ".join(random.sample(descriptions["manager"], 3)) + "."
        elif "design" in title_lower:
            return ". ".join(random.sample(descriptions["designer"], 3)) + "."
        else:
            return ". ".join(random.sample(descriptions["engineer"], 3)) + "."
    
    def _generate_education(self, years_experience):
        """Generate education history."""
        
        education = []
        
        # Calculate graduation year
        grad_year = datetime.now().year - years_experience
        
        # Determine if has advanced degree based on experience
        has_masters = years_experience > 5 and random.random() > 0.5
        has_phd = years_experience > 10 and random.random() > 0.8
        
        # PhD
        if has_phd:
            education.append({
                "degree": "PhD in Computer Science",
                "institution": random.choice(self.UNIVERSITIES[:10]),  # Top universities
                "graduation_year": str(grad_year),
                "gpa": f"{random.uniform(3.5, 4.0):.2f}"
            })
            grad_year -= 5
        
        # Masters
        if has_masters or has_phd:
            masters_degrees = [d for d in self.DEGREES if "Master" in d]
            education.append({
                "degree": random.choice(masters_degrees),
                "institution": random.choice(self.UNIVERSITIES[:15]),
                "graduation_year": str(grad_year),
                "gpa": f"{random.uniform(3.3, 4.0):.2f}"
            })
            grad_year -= 2
        
        # Bachelor's (everyone has one)
        bachelors_degrees = [d for d in self.DEGREES if "Bachelor" in d]
        education.append({
            "degree": random.choice(bachelors_degrees),
            "institution": random.choice(self.UNIVERSITIES),
            "graduation_year": str(grad_year),
            "gpa": f"{random.uniform(3.0, 4.0):.2f}"
        })
        
        return education
    
    def _generate_summary(self, name, industry, years_experience, top_skills):
        """Generate a professional summary."""
        
        summaries = [
            f"Experienced {industry} professional with {years_experience}+ years of experience specializing in {', '.join(top_skills[:3])}.",
            f"Results-driven professional with expertise in {', '.join(top_skills[:3])} and a track record of delivering high-impact solutions.",
            f"Passionate {industry} expert with {years_experience} years of hands-on experience in {' and '.join(top_skills[:2])}.",
            f"Innovative problem-solver with deep expertise in {', '.join(top_skills[:3])} seeking to drive technical excellence.",
        ]
        
        return random.choice(summaries)
    
    def _generate_offline_resume(self, industry=None):
        """Generate a resume without API (fallback)."""
        
        if not industry:
            industry = random.choice(list(self.JOB_TITLES.keys()))
        
        first_names = ["James", "Sarah", "Michael", "Emily", "David", "Jennifer", "Robert", "Lisa", "John", "Amanda"]
        last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Martinez", "Anderson"]
        cities = ["San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX", "Boston, MA", "Denver, CO", "Chicago, IL"]
        
        first = random.choice(first_names)
        last = random.choice(last_names)
        
        years_experience = random.randint(2, 20)
        job_titles = self.JOB_TITLES.get(industry, self.JOB_TITLES["tech"])
        skills = self._select_skills_for_industry(industry, count=random.randint(8, 18))
        
        return {
            "personal_info": {
                "name": f"{first} {last}",
                "email": f"{first.lower()}.{last.lower()}@email.com",
                "phone": f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}",
                "location": random.choice(cities),
            },
            "summary": self._generate_summary(f"{first} {last}", industry, years_experience, skills[:5]),
            "skills": skills,
            "experience": self._generate_experience(job_titles, years_experience),
            "education": self._generate_education(years_experience),
            "industry": industry,
            "years_experience": years_experience,
            "source": "offline generation"
        }


class FreeAPITrainer:
    """Train the resume parser using free API generated data."""
    
    def __init__(self, save_dir="trained_models"):
        self.save_dir = Path(save_dir)
        self.save_dir.mkdir(exist_ok=True)
        
        self.parser = ResumeParser()
        self.api_client = FreeAPIClient()
        self.generator = EnhancedResumeGenerator(self.api_client)
        
        # Load training history
        self.history_file = self.save_dir / "free_api_training_history.json"
        self.learned_skills_file = self.save_dir / "free_api_learned_skills.json"
        
        self.history = self._load_json(self.history_file, {"sessions": [], "total_samples": 0})
        self.learned_skills = self._load_json(self.learned_skills_file, {"skills": [], "learned_at": []})
    
    def _load_json(self, path, default):
        """Load JSON file or return default."""
        try:
            if path.exists():
                with open(path, "r") as f:
                    return json.load(f)
        except:
            pass
        return default
    
    def _save_json(self, path, data):
        """Save data to JSON file."""
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    
    def convert_resume_to_text(self, resume_data):
        """Convert structured resume data to plain text for parsing."""
        
        lines = []
        
        # Personal info
        personal = resume_data.get("personal_info", {})
        if personal.get("name"):
            lines.append(personal["name"])
        if personal.get("email"):
            lines.append(personal["email"])
        if personal.get("phone"):
            lines.append(personal["phone"])
        if personal.get("location"):
            lines.append(personal["location"])
        if personal.get("linkedin"):
            lines.append(personal["linkedin"])
        
        lines.append("")
        
        # Summary
        if resume_data.get("summary"):
            lines.append("PROFESSIONAL SUMMARY")
            lines.append(resume_data["summary"])
            lines.append("")
        
        # Skills
        if resume_data.get("skills"):
            lines.append("SKILLS")
            lines.append(", ".join(resume_data["skills"]))
            lines.append("")
        
        # Experience
        if resume_data.get("experience"):
            lines.append("EXPERIENCE")
            for job in resume_data["experience"]:
                lines.append(f"{job.get('title', '')} at {job.get('company', '')}")
                lines.append(f"{job.get('start_date', '')} - {job.get('end_date', '')}")
                if job.get("description"):
                    lines.append(job["description"])
                lines.append("")
        
        # Education
        if resume_data.get("education"):
            lines.append("EDUCATION")
            for edu in resume_data["education"]:
                lines.append(f"{edu.get('degree', '')}")
                lines.append(f"{edu.get('institution', '')} - {edu.get('graduation_year', '')}")
                if edu.get("gpa"):
                    lines.append(f"GPA: {edu['gpa']}")
                lines.append("")
        
        return "\n".join(lines)
    
    def train_iteration(self, num_samples=10, use_batch_api=True, verbose=True):
        """Run one training iteration."""
        
        if verbose:
            print(f"\n{'='*60}")
            print(f"TRAINING ITERATION - {num_samples} samples")
            print(f"{'='*60}")
        
        # Generate resumes
        if use_batch_api:
            if verbose:
                print("\n[*] Fetching batch from RandomUser.me API...")
            resumes = self.generator.generate_batch_resumes(count=num_samples)
        else:
            resumes = [self.generator._generate_offline_resume() for _ in range(num_samples)]
        
        if verbose:
            print(f"[+] Generated {len(resumes)} resumes")
        
        results = {
            "total": len(resumes),
            "skill_matches": [],
            "new_skills_learned": [],
            "accuracy_scores": []
        }
        
        for i, resume in enumerate(resumes):
            # Convert to text and parse
            resume_text = self.convert_resume_to_text(resume)
            parsed = self.parser.parse_text(resume_text)
            
            # Compare skills
            expected_skills = set(s.lower() for s in resume.get("skills", []))
            parsed_skills = set(s.lower() for s in parsed.skills)
            
            # Calculate accuracy
            if expected_skills:
                matches = expected_skills.intersection(parsed_skills)
                accuracy = len(matches) / len(expected_skills) * 100
            else:
                accuracy = 0
            
            results["accuracy_scores"].append(accuracy)
            
            # Find new skills to learn
            missing_skills = expected_skills - parsed_skills
            new_skills = []
            
            for skill in missing_skills:
                # Check if it's a valid skill we should add
                if skill not in [s.lower() for s in self.learned_skills["skills"]]:
                    # Find the original case version
                    original_skill = next((s for s in resume.get("skills", []) if s.lower() == skill), skill)
                    new_skills.append(original_skill)
                    self.learned_skills["skills"].append(original_skill)
                    self.learned_skills["learned_at"].append(datetime.now().isoformat())
            
            results["new_skills_learned"].extend(new_skills)
            
            if verbose and (i + 1) % 5 == 0:
                print(f"    Processed {i+1}/{len(resumes)} - Accuracy: {accuracy:.1f}%")
        
        # Calculate stats
        avg_accuracy = sum(results["accuracy_scores"]) / len(results["accuracy_scores"]) if results["accuracy_scores"] else 0
        
        if verbose:
            print(f"\n[+] Results:")
            print(f"    Average Accuracy: {avg_accuracy:.1f}%")
            print(f"    New Skills Learned: {len(results['new_skills_learned'])}")
            if results['new_skills_learned'][:10]:
                print(f"    Examples: {', '.join(results['new_skills_learned'][:10])}")
        
        # Save session to history
        session = {
            "timestamp": datetime.now().isoformat(),
            "samples": len(resumes),
            "avg_accuracy": avg_accuracy,
            "new_skills": len(results['new_skills_learned']),
            "skill_examples": results['new_skills_learned'][:20]
        }
        self.history["sessions"].append(session)
        self.history["total_samples"] += len(resumes)
        
        # Save files
        self._save_json(self.history_file, self.history)
        self._save_json(self.learned_skills_file, self.learned_skills)
        
        return results
    
    def run_training(self, iterations=10, samples_per_iteration=10, sleep_seconds=1):
        """Run multiple training iterations."""
        
        print("\n" + "="*70)
        print(" FREE API RESUME PARSER TRAINING")
        print(" Using: RandomUser.me + FakerAPI (100% FREE, No API Keys)")
        print("="*70)
        print(f"\nConfig: {iterations} iterations x {samples_per_iteration} samples = {iterations * samples_per_iteration} total")
        print(f"Sleep between iterations: {sleep_seconds}s")
        print(f"Current vocabulary: {len(self.parser.skill_taxonomy)} skills")
        print(f"Previously learned: {len(self.learned_skills['skills'])} skills")
        
        all_results = []
        start_time = datetime.now()
        
        try:
            for i in range(iterations):
                print(f"\n{'='*60}")
                print(f"ITERATION {i+1}/{iterations}")
                print(f"{'='*60}")
                
                result = self.train_iteration(num_samples=samples_per_iteration, verbose=True)
                all_results.append(result)
                
                if i < iterations - 1 and sleep_seconds > 0:
                    print(f"\n[*] Sleeping {sleep_seconds}s before next iteration...")
                    time.sleep(sleep_seconds)
        
        except KeyboardInterrupt:
            print("\n\n[!] Training interrupted by user")
        
        # Final summary
        elapsed = (datetime.now() - start_time).total_seconds()
        total_samples = sum(r["total"] for r in all_results)
        total_new_skills = sum(len(r["new_skills_learned"]) for r in all_results)
        all_accuracies = [a for r in all_results for a in r["accuracy_scores"]]
        avg_accuracy = sum(all_accuracies) / len(all_accuracies) if all_accuracies else 0
        
        print("\n" + "="*70)
        print(" TRAINING COMPLETE")
        print("="*70)
        print(f"\nTotal Time: {elapsed:.1f}s ({elapsed/60:.1f} minutes)")
        print(f"Total Samples Processed: {total_samples}")
        print(f"New Skills Learned: {total_new_skills}")
        print(f"Average Accuracy: {avg_accuracy:.1f}%")
        print(f"Total Vocabulary: {len(self.parser.skill_taxonomy) + len(self.learned_skills['skills'])} skills")
        print(f"\nHistory saved to: {self.history_file}")
        print(f"Learned skills saved to: {self.learned_skills_file}")
        
        return all_results
    
    def view_stats(self):
        """View training statistics."""
        
        print("\n" + "="*60)
        print(" FREE API TRAINING STATISTICS")
        print("="*60)
        
        print(f"\nTotal Training Sessions: {len(self.history.get('sessions', []))}")
        print(f"Total Samples Processed: {self.history.get('total_samples', 0)}")
        print(f"Learned Skills Count: {len(self.learned_skills.get('skills', []))}")
        
        if self.history.get("sessions"):
            recent = self.history["sessions"][-5:]
            print(f"\nRecent Sessions:")
            for s in recent:
                print(f"  - {s['timestamp'][:19]}: {s['samples']} samples, {s['avg_accuracy']:.1f}% acc, {s['new_skills']} new skills")
        
        if self.learned_skills.get("skills"):
            print(f"\nSample Learned Skills (last 20):")
            for skill in self.learned_skills["skills"][-20:]:
                print(f"  - {skill}")


def main():
    parser = argparse.ArgumentParser(description="Train resume parser using FREE APIs (no API keys needed)")
    
    parser.add_argument("--iterations", "-i", type=int, default=10, help="Number of training iterations")
    parser.add_argument("--samples", "-s", type=int, default=10, help="Samples per iteration")
    parser.add_argument("--sleep", type=int, default=1, help="Seconds between iterations")
    parser.add_argument("--view", action="store_true", help="View training statistics")
    parser.add_argument("--generate", "-g", type=int, help="Generate N sample resumes and display")
    parser.add_argument("--test-api", action="store_true", help="Test the free APIs")
    parser.add_argument("--quick", action="store_true", help="Quick test (3 iterations x 5 samples)")
    
    args = parser.parse_args()
    
    trainer = FreeAPITrainer()
    
    if args.view:
        trainer.view_stats()
        return
    
    if args.test_api:
        print("\n[*] Testing Free APIs...")
        
        print("\n1. Testing RandomUser.me...")
        user = trainer.api_client.get_random_user()
        if user:
            print(f"   SUCCESS: Got user {user['name']['first']} {user['name']['last']}")
        else:
            print("   FAILED")
        
        print("\n2. Testing FakerAPI Persons...")
        persons = trainer.api_client.get_faker_persons(quantity=3)
        if persons:
            print(f"   SUCCESS: Got {len(persons)} persons")
            for p in persons:
                print(f"   - {p['firstname']} {p['lastname']}")
        else:
            print("   FAILED")
        
        print("\n3. Testing FakerAPI Companies...")
        companies = trainer.api_client.get_faker_companies(quantity=3)
        if companies:
            print(f"   SUCCESS: Got {len(companies)} companies")
        else:
            print("   FAILED")
        
        return
    
    if args.generate:
        print(f"\n[*] Generating {args.generate} sample resumes...\n")
        resumes = trainer.generator.generate_batch_resumes(count=args.generate)
        
        for i, resume in enumerate(resumes):
            print(f"\n{'='*60}")
            print(f"RESUME {i+1}")
            print(f"{'='*60}")
            print(f"Name: {resume['personal_info']['name']}")
            print(f"Email: {resume['personal_info']['email']}")
            print(f"Location: {resume['personal_info']['location']}")
            print(f"Industry: {resume.get('industry', 'N/A')}")
            print(f"Years Experience: {resume.get('years_experience', 'N/A')}")
            print(f"\nSkills ({len(resume['skills'])}):")
            print(f"  {', '.join(resume['skills'][:15])}...")
            print(f"\nExperience ({len(resume['experience'])} jobs):")
            for job in resume['experience'][:2]:
                print(f"  - {job['title']} at {job['company']} ({job['start_date']}-{job['end_date']})")
            print(f"\nEducation:")
            for edu in resume['education'][:2]:
                print(f"  - {edu['degree']} from {edu['institution']}")
        
        return
    
    if args.quick:
        trainer.run_training(iterations=3, samples_per_iteration=5, sleep_seconds=1)
        return
    
    # Run training
    trainer.run_training(
        iterations=args.iterations,
        samples_per_iteration=args.samples,
        sleep_seconds=args.sleep
    )


if __name__ == "__main__":
    main()
