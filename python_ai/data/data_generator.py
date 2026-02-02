"""
Training Data Generator & Database Manager
Generates synthetic training data and manages job database
"""

import json
import random
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import uuid


# Sample data for generation
COMPANIES_BY_INDUSTRY = {
    'Technology': [
        ('Google', 'Mountain View'), ('Microsoft', 'Seattle'), ('Apple', 'Cupertino'),
        ('Amazon', 'Seattle'), ('Meta', 'Menlo Park'), ('Netflix', 'Los Gatos'),
        ('Salesforce', 'San Francisco'), ('Adobe', 'San Jose'), ('Uber', 'San Francisco'),
        ('Airbnb', 'San Francisco'), ('Stripe', 'San Francisco'), ('Databricks', 'San Francisco'),
        ('Snowflake', 'Bozeman'), ('Palantir', 'Denver'), ('Coinbase', 'San Francisco'),
    ],
    'Finance': [
        ('JPMorgan Chase', 'New York'), ('Goldman Sachs', 'New York'), ('Morgan Stanley', 'New York'),
        ('Bank of America', 'Charlotte'), ('Citigroup', 'New York'), ('Wells Fargo', 'San Francisco'),
        ('BlackRock', 'New York'), ('Fidelity', 'Boston'), ('Charles Schwab', 'San Francisco'),
        ('Visa', 'San Francisco'), ('Mastercard', 'New York'), ('PayPal', 'San Jose'),
    ],
    'Healthcare': [
        ('UnitedHealth', 'Minneapolis'), ('CVS Health', 'Woonsocket'), ('Johnson & Johnson', 'New Brunswick'),
        ('Pfizer', 'New York'), ('Moderna', 'Cambridge'), ('Kaiser Permanente', 'Oakland'),
        ('HCA Healthcare', 'Nashville'), ('Mayo Clinic', 'Rochester'), ('Cleveland Clinic', 'Cleveland'),
    ],
    'Retail': [
        ('Walmart', 'Bentonville'), ('Target', 'Minneapolis'), ('Costco', 'Issaquah'),
        ('Home Depot', 'Atlanta'), ('Best Buy', 'Richfield'), ('Nordstrom', 'Seattle'),
        ('Macy\'s', 'New York'), ('Nike', 'Beaverton'), ('Gap', 'San Francisco'),
    ],
    'Consulting': [
        ('McKinsey', 'New York'), ('BCG', 'Boston'), ('Bain', 'Boston'),
        ('Deloitte', 'New York'), ('Accenture', 'Dublin'), ('PwC', 'London'),
        ('EY', 'London'), ('KPMG', 'Amsterdam'), ('Booz Allen', 'McLean'),
    ],
}

JOB_TITLES_BY_CATEGORY = {
    'Engineering': [
        'Software Engineer', 'Senior Software Engineer', 'Staff Engineer',
        'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
        'DevOps Engineer', 'Site Reliability Engineer', 'Data Engineer',
        'Machine Learning Engineer', 'Platform Engineer', 'Mobile Developer',
    ],
    'Data': [
        'Data Scientist', 'Senior Data Scientist', 'Data Analyst',
        'Business Intelligence Analyst', 'Analytics Engineer', 'ML Research Scientist',
    ],
    'Product': [
        'Product Manager', 'Senior Product Manager', 'Technical Program Manager',
        'Product Designer', 'UX Designer', 'UX Researcher',
    ],
    'Business': [
        'Business Analyst', 'Strategy Analyst', 'Operations Manager',
        'Project Manager', 'Account Manager', 'Sales Representative',
    ],
}

SKILLS_BY_ROLE = {
    'Software Engineer': {
        'required': ['python', 'javascript', 'sql', 'git'],
        'preferred': ['react', 'node.js', 'docker', 'aws', 'kubernetes', 'typescript'],
    },
    'Senior Software Engineer': {
        'required': ['python', 'javascript', 'sql', 'git', 'system design'],
        'preferred': ['react', 'aws', 'docker', 'kubernetes', 'leadership', 'mentoring'],
    },
    'Frontend Developer': {
        'required': ['javascript', 'html', 'css', 'react'],
        'preferred': ['typescript', 'vue', 'webpack', 'tailwind', 'figma'],
    },
    'Backend Developer': {
        'required': ['python', 'sql', 'api design', 'git'],
        'preferred': ['django', 'fastapi', 'postgresql', 'redis', 'docker'],
    },
    'Data Scientist': {
        'required': ['python', 'sql', 'machine learning', 'statistics'],
        'preferred': ['tensorflow', 'pytorch', 'pandas', 'scikit-learn', 'deep learning'],
    },
    'Data Engineer': {
        'required': ['python', 'sql', 'etl', 'data pipeline'],
        'preferred': ['spark', 'airflow', 'aws', 'snowflake', 'dbt'],
    },
    'DevOps Engineer': {
        'required': ['linux', 'docker', 'ci/cd', 'scripting'],
        'preferred': ['kubernetes', 'terraform', 'aws', 'jenkins', 'monitoring'],
    },
    'Product Manager': {
        'required': ['product management', 'roadmap planning', 'stakeholder management'],
        'preferred': ['agile', 'jira', 'data analysis', 'a/b testing', 'sql'],
    },
    'Data Analyst': {
        'required': ['sql', 'excel', 'data visualization', 'statistics'],
        'preferred': ['python', 'tableau', 'power bi', 'looker'],
    },
    'Machine Learning Engineer': {
        'required': ['python', 'machine learning', 'tensorflow', 'sql'],
        'preferred': ['pytorch', 'mlops', 'docker', 'aws', 'deep learning'],
    },
}

EDUCATION_LEVELS = ['High School', 'Associates', 'Bachelors', 'Masters', 'PhD']
EDUCATION_FIELDS = [
    'Computer Science', 'Software Engineering', 'Data Science', 'Mathematics',
    'Statistics', 'Physics', 'Electrical Engineering', 'Business Administration',
    'Economics', 'Information Technology'
]


def generate_job(
    industry: Optional[str] = None,
    city: Optional[str] = None
) -> Dict:
    """Generate a synthetic job posting"""
    
    # Pick industry
    if industry is None:
        industry = random.choice(list(COMPANIES_BY_INDUSTRY.keys()))
    
    # Pick company
    companies = COMPANIES_BY_INDUSTRY.get(industry, COMPANIES_BY_INDUSTRY['Technology'])
    company, default_city = random.choice(companies)
    
    if city is None:
        city = default_city
    
    # Pick job category and title
    category = random.choice(list(JOB_TITLES_BY_CATEGORY.keys()))
    title = random.choice(JOB_TITLES_BY_CATEGORY[category])
    
    # Get skills
    role_skills = SKILLS_BY_ROLE.get(title, SKILLS_BY_ROLE['Software Engineer'])
    required_skills = role_skills['required'].copy()
    preferred_skills = random.sample(
        role_skills['preferred'],
        min(len(role_skills['preferred']), random.randint(2, 4))
    )
    
    # Experience requirements
    if 'Senior' in title or 'Staff' in title:
        min_exp = random.randint(5, 8)
        max_exp = random.randint(12, 15)
    elif 'Junior' in title or 'Associate' in title:
        min_exp = 0
        max_exp = random.randint(2, 3)
    else:
        min_exp = random.randint(2, 4)
        max_exp = random.randint(6, 10)
    
    # Education
    if 'PhD' in title or 'Research' in title:
        education = 'PhD'
    elif 'Senior' in title or 'Staff' in title:
        education = random.choice(['Bachelors', 'Masters'])
    else:
        education = random.choice(['Bachelors', 'Bachelors', 'Masters'])
    
    # Salary range
    base_salary = {
        'Junior': (70000, 90000),
        'Associate': (80000, 100000),
        'default': (100000, 150000),
        'Senior': (140000, 200000),
        'Staff': (180000, 280000),
        'Principal': (220000, 350000),
    }
    
    salary_key = 'default'
    for key in base_salary.keys():
        if key in title:
            salary_key = key
            break
    
    salary_min, salary_max = base_salary[salary_key]
    
    return {
        'id': f"job_{uuid.uuid4().hex[:8]}",
        'title': title,
        'company': company,
        'industry': industry,
        'city': city,
        'required_skills': required_skills,
        'preferred_skills': preferred_skills,
        'min_experience': min_exp,
        'max_experience': max_exp,
        'education_required': education,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'posted_date': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
        'description': generate_job_description(title, company, required_skills, preferred_skills),
    }


def generate_job_description(
    title: str,
    company: str,
    required_skills: List[str],
    preferred_skills: List[str]
) -> str:
    """Generate a realistic job description"""
    
    templates = [
        f"We are looking for a talented {title} to join our team at {company}.",
        f"{company} is seeking an experienced {title} to help build the next generation of our products.",
        f"Join {company} as a {title} and make an impact on millions of users.",
    ]
    
    intro = random.choice(templates)
    
    responsibilities = [
        "Design, develop, and maintain high-quality software solutions",
        "Collaborate with cross-functional teams to define and implement new features",
        "Write clean, maintainable, and well-tested code",
        "Participate in code reviews and contribute to team best practices",
        "Debug and resolve complex technical issues",
    ]
    
    desc = f"""
{intro}

**Responsibilities:**
- {random.choice(responsibilities)}
- {random.choice(responsibilities)}
- {random.choice(responsibilities)}

**Required Skills:**
{', '.join(required_skills)}

**Preferred Skills:**
{', '.join(preferred_skills)}
"""
    return desc.strip()


def generate_candidate(
    skill_level: str = 'mid',
    target_industry: Optional[str] = None
) -> Dict:
    """Generate a synthetic candidate profile"""
    
    # Experience based on skill level
    exp_ranges = {
        'junior': (0, 2),
        'mid': (3, 6),
        'senior': (7, 12),
        'staff': (10, 20),
    }
    min_exp, max_exp = exp_ranges.get(skill_level, (3, 6))
    experience = random.randint(min_exp, max_exp)
    
    # Pick a role category
    category = random.choice(list(JOB_TITLES_BY_CATEGORY.keys()))
    titles = JOB_TITLES_BY_CATEGORY[category]
    
    # Adjust title based on experience
    if experience < 3:
        title = random.choice([t for t in titles if 'Junior' in t or 'Associate' in t] or titles[:3])
    elif experience >= 8:
        title = random.choice([t for t in titles if 'Senior' in t or 'Staff' in t or 'Lead' in t] or titles)
    else:
        title = random.choice(titles)
    
    # Generate skills
    role_skills = SKILLS_BY_ROLE.get(title, SKILLS_BY_ROLE['Software Engineer'])
    
    # More experienced candidates have more skills
    num_required = len(role_skills['required'])
    num_preferred = min(len(role_skills['preferred']), experience // 2 + 2)
    
    skills = role_skills['required'].copy()
    skills.extend(random.sample(role_skills['preferred'], num_preferred))
    
    # Add some random additional skills
    all_skills = []
    for r_skills in SKILLS_BY_ROLE.values():
        all_skills.extend(r_skills['required'])
        all_skills.extend(r_skills['preferred'])
    
    additional = random.sample(list(set(all_skills) - set(skills)), min(3, len(set(all_skills) - set(skills))))
    skills.extend(additional)
    
    # Education
    if experience > 10:
        edu_level = random.choice(['Masters', 'PhD', 'Bachelors'])
    elif experience > 5:
        edu_level = random.choice(['Masters', 'Bachelors', 'Bachelors'])
    else:
        edu_level = random.choice(['Bachelors', 'Bachelors', 'Associates'])
    
    education = [{
        'degree': edu_level,
        'field': random.choice(EDUCATION_FIELDS)
    }]
    
    # Industry experience
    industries = [target_industry] if target_industry else []
    industries.extend(random.sample(list(COMPANIES_BY_INDUSTRY.keys()), random.randint(1, 2)))
    industries = list(set(industries))
    
    return {
        'id': f"candidate_{uuid.uuid4().hex[:8]}",
        'skills': list(set(skills)),
        'experience_years': experience,
        'education': education,
        'industries': industries,
        'current_title': title,
    }


def generate_training_data(
    num_samples: int = 1000,
    hire_rate: float = 0.3
) -> List[Dict]:
    """
    Generate training data with realistic hire/no-hire labels.
    """
    training_data = []
    
    for _ in range(num_samples):
        # Generate job and candidate
        industry = random.choice(list(COMPANIES_BY_INDUSTRY.keys()))
        job = generate_job(industry=industry)
        
        # Generate candidate with varying match quality
        match_quality = random.random()
        
        if match_quality > 0.7:
            # Good match - similar skills and experience
            skill_level = 'senior' if job['min_experience'] > 5 else 'mid'
            candidate = generate_candidate(skill_level=skill_level, target_industry=industry)
        elif match_quality > 0.4:
            # Moderate match
            candidate = generate_candidate(skill_level='mid')
        else:
            # Poor match
            candidate = generate_candidate(skill_level=random.choice(['junior', 'mid', 'senior']))
        
        # Calculate skill overlap
        candidate_skills = set(s.lower() for s in candidate['skills'])
        job_skills = set(s.lower() for s in job['required_skills'])
        skill_overlap = len(candidate_skills & job_skills) / len(job_skills) if job_skills else 0
        
        # Calculate experience match
        exp_match = 1.0 if candidate['experience_years'] >= job['min_experience'] else \
                    candidate['experience_years'] / job['min_experience']
        
        # Determine hire outcome (probabilistic based on match quality)
        match_score = 0.5 * skill_overlap + 0.3 * exp_match + 0.2 * (1 if industry in candidate['industries'] else 0)
        
        # Add some noise
        match_score += random.uniform(-0.1, 0.1)
        
        was_hired = match_score > (1 - hire_rate)
        
        training_data.append({
            'candidate_skills': candidate['skills'],
            'job_skills': job['required_skills'] + job['preferred_skills'],
            'candidate_experience': candidate['experience_years'],
            'job_min_experience': job['min_experience'],
            'job_max_experience': job['max_experience'],
            'candidate_education': candidate['education'],
            'job_education': job['education_required'],
            'candidate_industries': candidate['industries'],
            'job_industry': job['industry'],
            'was_hired': was_hired,
            'match_score': match_score,
        })
    
    return training_data


class JobDatabase:
    """SQLite database for storing jobs and matches"""
    
    def __init__(self, db_path: str = 'jobs.db'):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Jobs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                title TEXT,
                company TEXT,
                industry TEXT,
                city TEXT,
                required_skills TEXT,
                preferred_skills TEXT,
                min_experience INTEGER,
                max_experience INTEGER,
                education_required TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                posted_date TEXT,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Candidates table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS candidates (
                id TEXT PRIMARY KEY,
                skills TEXT,
                experience_years REAL,
                education TEXT,
                industries TEXT,
                current_title TEXT,
                resume_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Matches table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id TEXT,
                job_id TEXT,
                confidence REAL,
                skill_match_score REAL,
                experience_match_score REAL,
                matched_skills TEXT,
                missing_skills TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                feedback TEXT,
                was_successful INTEGER,
                FOREIGN KEY (candidate_id) REFERENCES candidates(id),
                FOREIGN KEY (job_id) REFERENCES jobs(id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def insert_job(self, job: Dict):
        """Insert a job into the database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT OR REPLACE INTO jobs
            (id, title, company, industry, city, required_skills, preferred_skills,
             min_experience, max_experience, education_required, salary_min,
             salary_max, posted_date, description, job_url, job_source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            job['id'], job['title'], job['company'], job['industry'], job['city'],
            json.dumps(job['required_skills']), json.dumps(job.get('preferred_skills', [])),
            job['min_experience'], job['max_experience'], job['education_required'],
            job.get('salary_min'), job.get('salary_max'), job.get('posted_date'),
            job.get('description', ''),
            job.get('job_url', ''),
            job.get('job_source', 'synthetic')
        ))

        conn.commit()
        conn.close()
    
    def insert_jobs_bulk(self, jobs: List[Dict]):
        """Insert multiple jobs"""
        for job in jobs:
            self.insert_job(job)
    
    def get_jobs_by_city(self, city: str) -> List[Dict]:
        """Get all jobs in a city using partial matching"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Use LIKE for partial matching (e.g., 'Makati' matches 'Makati City, Metro Manila')
        cursor.execute('SELECT * FROM jobs WHERE city LIKE ?', (f'%{city}%',))
        rows = cursor.fetchall()
        
        conn.close()
        
        return [self._row_to_job(row) for row in rows]
    
    def get_jobs_by_industry(self, industry: str, city: Optional[str] = None) -> List[Dict]:
        """Get jobs by industry, optionally filtered by city (partial match)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if city:
            # Use LIKE for partial city matching
            cursor.execute('SELECT * FROM jobs WHERE industry = ? AND city LIKE ?', (industry, f'%{city}%'))
        else:
            cursor.execute('SELECT * FROM jobs WHERE industry = ?', (industry,))
        
        rows = cursor.fetchall()
        conn.close()
        
        return [self._row_to_job(row) for row in rows]
    
    def get_all_jobs(self, limit: int = 100) -> List[Dict]:
        """Get all jobs"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM jobs LIMIT ?', (limit,))
        rows = cursor.fetchall()
        
        conn.close()
        
        return [self._row_to_job(row) for row in rows]
    
    def _row_to_job(self, row) -> Dict:
        """Convert database row to job dict"""
        return {
            'id': row[0],
            'title': row[1],
            'company': row[2],
            'industry': row[3],
            'city': row[4],
            'required_skills': json.loads(row[5]) if row[5] else [],
            'preferred_skills': json.loads(row[6]) if row[6] else [],
            'min_experience': row[7],
            'max_experience': row[8],
            'education_required': row[9],
            'salary_min': row[10],
            'salary_max': row[11],
            'posted_date': row[12],
            'description': row[13],
            'job_url': row[14] if len(row) > 14 else '',
            'job_source': row[15] if len(row) > 15 else 'synthetic',
        }
    
    def save_match(self, candidate_id: str, match_result: Dict):
        """Save a match result"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO matches 
            (candidate_id, job_id, confidence, skill_match_score, 
             experience_match_score, matched_skills, missing_skills)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            candidate_id,
            match_result['job_id'],
            match_result['confidence'],
            match_result['skill_match_score'],
            match_result['experience_match_score'],
            json.dumps(match_result['matched_skills']),
            json.dumps(match_result['missing_skills']),
        ))
        
        conn.commit()
        conn.close()


def populate_sample_database(db_path: str = 'jobs.db', num_jobs: int = 500):
    """Populate database with sample jobs"""
    db = JobDatabase(db_path)
    
    cities = ['Naga City', 'Manila', 'Quezon City', 'Makati', 'Cebu City',
              'Davao City', 'Iloilo City', 'Bacolod', 'Taguig', 'Pasig']
    
    jobs = []
    for _ in range(num_jobs):
        city = random.choice(cities)
        job = generate_job(city=city)
        jobs.append(job)
    
    db.insert_jobs_bulk(jobs)
    print(f"Inserted {num_jobs} jobs into database")
    
    return db


if __name__ == "__main__":
    # Generate and save training data
    print("Generating training data...")
    training_data = generate_training_data(num_samples=1000)
    
    with open('data/training_data.json', 'w') as f:
        json.dump(training_data, f, indent=2)
    
    print(f"Generated {len(training_data)} training samples")
    
    # Calculate statistics
    hired = sum(1 for d in training_data if d['was_hired'])
    print(f"Hire rate: {hired/len(training_data):.1%}")
    
    # Populate sample database
    print("\nPopulating job database...")
    db = populate_sample_database(num_jobs=500)
    
    # Show sample
    jobs = db.get_all_jobs(limit=5)
    print(f"\nSample jobs:")
    for job in jobs:
        print(f"  - {job['title']} at {job['company']} ({job['city']})")
