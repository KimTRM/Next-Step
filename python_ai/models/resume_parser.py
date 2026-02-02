"""
Resume Parser & Skill Extractor
Extracts structured data from resumes (PDF, DOCX, TXT)
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime

# For PDF parsing
try:
    from pdfminer.high_level import extract_text as pdf_extract_text
except ImportError:
    pdf_extract_text = None

# For DOCX parsing
try:
    from docx import Document
except ImportError:
    Document = None


@dataclass
class ParsedResume:
    """Structured resume data"""
    raw_text: str
    skills: List[str]
    experience_years: float
    education: List[Dict]
    job_titles: List[str]
    industries: List[str]
    certifications: List[str]
    contact_info: Dict
    skills_sentence: str = ""

    def to_dict(self) -> Dict:
        return asdict(self)


class SkillTaxonomy:
    """
    Comprehensive skill taxonomy for job matching.
    Based on O*NET and industry standards.
    """
    
    # Technical Skills by Category
    PROGRAMMING_LANGUAGES = {
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go', 'golang',
        'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl',
        'shell', 'bash', 'powershell', 'sql', 'html', 'css', 'sass', 'less'
    }
    
    FRAMEWORKS_LIBRARIES = {
        'react', 'reactjs', 'angular', 'vue', 'vuejs', 'svelte', 'nextjs', 'next.js',
        'node', 'nodejs', 'express', 'fastapi', 'django', 'flask', 'spring', 'springboot',
        'rails', 'laravel', '.net', 'dotnet', 'asp.net', 'jquery', 'bootstrap',
        'tailwind', 'material-ui', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
        'pandas', 'numpy', 'opencv', 'spark', 'hadoop'
    }
    
    CLOUD_DEVOPS = {
        'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'docker',
        'kubernetes', 'k8s', 'jenkins', 'gitlab', 'github actions', 'terraform',
        'ansible', 'puppet', 'chef', 'ci/cd', 'cicd', 'linux', 'unix', 'nginx',
        'apache', 'redis', 'mongodb', 'postgresql', 'mysql', 'elasticsearch'
    }
    
    DATA_ANALYTICS = {
        'machine learning', 'deep learning', 'nlp', 'natural language processing',
        'computer vision', 'data analysis', 'data science', 'statistics',
        'a/b testing', 'tableau', 'power bi', 'looker', 'data visualization',
        'etl', 'data pipeline', 'big data', 'data mining', 'predictive modeling'
    }
    
    BUSINESS_SKILLS = {
        'project management', 'agile', 'scrum', 'kanban', 'jira', 'confluence',
        'product management', 'business analysis', 'requirements gathering',
        'stakeholder management', 'strategic planning', 'budgeting', 'forecasting',
        'market research', 'competitive analysis', 'presentation', 'negotiation'
    }
    
    SOFT_SKILLS = {
        'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
        'time management', 'adaptability', 'creativity', 'attention to detail',
        'customer service', 'conflict resolution', 'mentoring', 'collaboration'
    }
    
    DESIGN_CREATIVE = {
        'ui design', 'ux design', 'ui/ux', 'figma', 'sketch', 'adobe xd',
        'photoshop', 'illustrator', 'indesign', 'after effects', 'premiere pro',
        'graphic design', 'web design', 'user research', 'wireframing', 'prototyping'
    }
    
    MARKETING_SALES = {
        'digital marketing', 'seo', 'sem', 'ppc', 'google ads', 'facebook ads',
        'content marketing', 'email marketing', 'social media marketing',
        'salesforce', 'hubspot', 'crm', 'lead generation', 'sales strategy',
        'account management', 'b2b', 'b2c', 'marketing automation'
    }
    
    FINANCE_ACCOUNTING = {
        'financial analysis', 'financial modeling', 'excel', 'quickbooks',
        'sap', 'oracle financials', 'bookkeeping', 'accounts payable',
        'accounts receivable', 'gaap', 'ifrs', 'tax preparation', 'auditing',
        'budgeting', 'forecasting', 'investment analysis', 'risk management'
    }
    
    HEALTHCARE = {
        'patient care', 'clinical research', 'hipaa', 'electronic health records',
        'ehr', 'medical terminology', 'phlebotomy', 'vital signs', 'cpr certified',
        'medical coding', 'icd-10', 'nursing', 'pharmacy', 'radiology'
    }
    
    @classmethod
    def get_all_skills(cls) -> set:
        """Return all skills from all categories"""
        all_skills = set()
        for attr_name in dir(cls):
            attr = getattr(cls, attr_name)
            if isinstance(attr, set):
                all_skills.update(attr)
        return all_skills
    
    @classmethod
    def categorize_skill(cls, skill: str) -> Optional[str]:
        """Return the category a skill belongs to"""
        skill_lower = skill.lower()
        categories = {
            'Programming Languages': cls.PROGRAMMING_LANGUAGES,
            'Frameworks & Libraries': cls.FRAMEWORKS_LIBRARIES,
            'Cloud & DevOps': cls.CLOUD_DEVOPS,
            'Data & Analytics': cls.DATA_ANALYTICS,
            'Business Skills': cls.BUSINESS_SKILLS,
            'Soft Skills': cls.SOFT_SKILLS,
            'Design & Creative': cls.DESIGN_CREATIVE,
            'Marketing & Sales': cls.MARKETING_SALES,
            'Finance & Accounting': cls.FINANCE_ACCOUNTING,
            'Healthcare': cls.HEALTHCARE,
        }
        for category, skills in categories.items():
            if skill_lower in skills:
                return category
        return 'Other'


class ResumeParser:
    """
    Parse resumes from various formats and extract structured data.
    Integrates learned skills from training for improved accuracy.
    """
    
    # Path to unified training knowledge
    LEARNED_SKILLS_PATH = Path(__file__).parent.parent / "trained_models" / "unified_training_knowledge.json"
    
    def __init__(self):
        self.skill_taxonomy = SkillTaxonomy.get_all_skills()
        self.learned_skills_count = 0
        self._load_learned_skills()  # Load skills from training
        self._compile_patterns()
    
    def _load_learned_skills(self):
        """Load learned skills from unified training knowledge file."""
        try:
            if self.LEARNED_SKILLS_PATH.exists():
                with open(self.LEARNED_SKILLS_PATH, 'r') as f:
                    data = json.load(f)
                
                learned_skills = data.get('learned_skills', [])
                initial_count = len(self.skill_taxonomy)
                
                # Add learned skills to taxonomy (lowercase for matching)
                for skill in learned_skills:
                    self.skill_taxonomy.add(skill.lower())
                
                self.learned_skills_count = len(self.skill_taxonomy) - initial_count
                
        except Exception as e:
            # Silently handle errors - training data is optional
            pass
    
    def _compile_patterns(self):
        """Compile regex patterns for extraction"""
        # Email pattern
        self.email_pattern = re.compile(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        )
        
        # Phone pattern
        self.phone_pattern = re.compile(
            r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
        )
        
        # Year pattern for experience calculation
        self.year_pattern = re.compile(r'\b(19|20)\d{2}\b')
        
        # Education degree patterns
        self.degree_patterns = [
            (r'\b(ph\.?d\.?|doctorate|doctoral)\b', 'PhD'),
            (r'\b(master\'?s?|m\.?s\.?|m\.?a\.?|mba|m\.?eng\.?)\b', 'Masters'),
            (r'\b(bachelor\'?s?|b\.?s\.?|b\.?a\.?|b\.?eng\.?)\b', 'Bachelors'),
            (r'\b(associate\'?s?|a\.?s\.?|a\.?a\.?)\b', 'Associates'),
            (r'\b(high school|diploma|ged)\b', 'High School'),
        ]
        
        # Job title patterns
        self.title_patterns = [
            r'software engineer', r'software developer', r'web developer',
            r'data scientist', r'data analyst', r'data engineer',
            r'product manager', r'project manager', r'program manager',
            r'designer', r'ux designer', r'ui designer',
            r'marketing manager', r'sales manager', r'account manager',
            r'analyst', r'consultant', r'director', r'manager',
            r'engineer', r'developer', r'architect', r'lead',
            r'specialist', r'coordinator', r'administrator'
        ]
        
        # Industry keywords
        self.industry_keywords = {
            'Technology': ['software', 'tech', 'saas', 'startup', 'app', 'platform'],
            'Finance': ['bank', 'financial', 'investment', 'trading', 'insurance'],
            'Healthcare': ['hospital', 'clinic', 'medical', 'health', 'pharma'],
            'Retail': ['retail', 'e-commerce', 'store', 'shop', 'consumer'],
            'Manufacturing': ['manufacturing', 'factory', 'production', 'industrial'],
            'Education': ['university', 'school', 'college', 'education', 'teaching'],
            'Consulting': ['consulting', 'advisory', 'strategy'],
            'Media': ['media', 'entertainment', 'news', 'publishing', 'content'],
        }
    
    def parse(self, file_path: str) -> ParsedResume:
        """Parse a resume file and return structured data"""
        path = Path(file_path)
        
        # Extract raw text based on file type
        if path.suffix.lower() == '.pdf':
            raw_text = self._extract_pdf(file_path)
        elif path.suffix.lower() == '.docx':
            raw_text = self._extract_docx(file_path)
        elif path.suffix.lower() == '.txt':
            raw_text = self._extract_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {path.suffix}")
        
        return self.parse_text(raw_text)
    
    def parse_text(self, raw_text: str) -> ParsedResume:
        """Parse resume from raw text"""
        # Clean text
        text = self._clean_text(raw_text)
        text_lower = text.lower()
        
        # Extract all components
        skills = self._extract_skills(text_lower)
        experience_years = self._calculate_experience(text)
        education = self._extract_education(text_lower)
        job_titles = self._extract_job_titles(text_lower)
        industries = self._extract_industries(text_lower)
        certifications = self._extract_certifications(text_lower)
        contact_info = self._extract_contact_info(text)
        
        # Format skills as sentence
        skills_sentence = self.format_skills_sentence(skills)

        return ParsedResume(
            raw_text=raw_text,
            skills=skills,
            experience_years=experience_years,
            education=education,
            job_titles=job_titles,
            industries=industries,
            certifications=certifications,
            contact_info=contact_info,
            skills_sentence=skills_sentence
        )
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        if pdf_extract_text is None:
            raise ImportError("pdfminer.six is required for PDF parsing")
        return pdf_extract_text(file_path)
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        if Document is None:
            raise ImportError("python-docx is required for DOCX parsing")
        doc = Document(file_path)
        return '\n'.join([para.text for para in doc.paragraphs])
    
    def _extract_txt(self, file_path: str) -> str:
        """Extract text from TXT"""
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep useful punctuation
        text = re.sub(r'[^\w\s\.\,\-\@\+\(\)\/]', '', text)
        return text.strip()

    def format_skills_sentence(self, skills: List[str]) -> str:
        """
        Format skills as a complete comma-separated sentence.

        Args:
            skills: List of skill strings

        Returns:
            Formatted sentence like "Detected skills: Python, JavaScript, React, SQL."

        Example:
            >>> parser = ResumeParser()
            >>> parser.format_skills_sentence(['python', 'javascript', 'react'])
            'Detected skills: Python, Javascript, React.'
        """
        if not skills:
            return "No skills detected."

        # Capitalize first letter of each skill for proper presentation
        formatted_skills = []
        for skill in skills:
            # Capitalize first letter if all lowercase, otherwise keep original casing
            if skill.islower():
                formatted_skills.append(skill.capitalize())
            else:
                formatted_skills.append(skill)

        # Join with commas and add period
        skills_list = ', '.join(formatted_skills)

        return f"Detected skills: {skills_list}."

    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using taxonomy matching"""
        found_skills = []
        
        # Direct taxonomy matching
        for skill in self.skill_taxonomy:
            # Create pattern for whole word matching
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.append(skill)
        
        # Additional pattern-based extraction for variations
        skill_variations = {
            'python': ['python3', 'python 3'],
            'javascript': ['js', 'es6', 'ecmascript'],
            'machine learning': ['ml', 'machine-learning'],
            'artificial intelligence': ['ai', 'a.i.'],
        }
        
        for canonical, variations in skill_variations.items():
            for var in variations:
                if var in text and canonical not in found_skills:
                    found_skills.append(canonical)
        
        return list(set(found_skills))
    
    def _calculate_experience(self, text: str) -> float:
        """Calculate years of experience from resume"""
        years = self.year_pattern.findall(text)
        
        if not years:
            return 0.0
        
        years = [int(y) for y in years]
        current_year = datetime.now().year
        
        # Filter reasonable years (work experience typically 1960-present)
        years = [y for y in years if 1960 <= y <= current_year]
        
        if len(years) >= 2:
            return float(current_year - min(years))
        
        return 0.0
    
    def _extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        education = []
        
        for pattern, degree_type in self.degree_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                education.append({
                    'degree': degree_type,
                    'field': self._extract_field_of_study(text, degree_type)
                })
        
        return education
    
    def _extract_field_of_study(self, text: str, degree_type: str) -> Optional[str]:
        """Extract field of study"""
        fields = [
            'computer science', 'software engineering', 'information technology',
            'data science', 'business administration', 'mba', 'finance',
            'marketing', 'economics', 'mathematics', 'statistics', 'physics',
            'engineering', 'electrical engineering', 'mechanical engineering'
        ]
        
        for field in fields:
            if field in text:
                return field.title()
        
        return None
    
    def _extract_job_titles(self, text: str) -> List[str]:
        """Extract job titles from resume"""
        titles = []
        
        for pattern in self.title_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            titles.extend(matches)
        
        return list(set(titles))
    
    def _extract_industries(self, text: str) -> List[str]:
        """Identify industries from resume content"""
        found_industries = []
        
        for industry, keywords in self.industry_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    found_industries.append(industry)
                    break
        
        return list(set(found_industries))
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        cert_patterns = [
            r'aws certified', r'azure certified', r'gcp certified',
            r'pmp', r'scrum master', r'csm', r'cissp', r'cpa', r'cfa',
            r'six sigma', r'itil', r'comptia', r'cisco', r'ccna', r'ccnp'
        ]
        
        certs = []
        for pattern in cert_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                certs.append(pattern.replace(r'\b', '').title())
        
        return certs
    
    def _extract_contact_info(self, text: str) -> Dict:
        """Extract contact information"""
        emails = self.email_pattern.findall(text)
        phones = self.phone_pattern.findall(text)
        
        return {
            'email': emails[0] if emails else None,
            'phone': phones[0] if phones else None
        }


# Example usage and testing
if __name__ == "__main__":
    # Test with sample resume text
    sample_resume = """
    John Smith
    Software Engineer
    john.smith@email.com | (555) 123-4567
    
    EXPERIENCE
    
    Senior Software Engineer | Tech Corp | 2020 - Present
    - Developed Python and JavaScript applications
    - Led team of 5 engineers using Agile methodology
    - Implemented CI/CD pipelines with Docker and Kubernetes
    
    Software Developer | StartupXYZ | 2017 - 2020
    - Built React and Node.js web applications
    - Worked with AWS cloud services
    - Collaborated with product and design teams
    
    EDUCATION
    
    Bachelor's in Computer Science
    State University | 2017
    
    SKILLS
    Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes,
    SQL, MongoDB, Git, Agile, Scrum, Machine Learning
    
    CERTIFICATIONS
    AWS Certified Solutions Architect
    Scrum Master Certified
    """
    
    parser = ResumeParser()
    result = parser.parse_text(sample_resume)
    
    print("Parsed Resume:")
    print(f"Skills: {result.skills}")
    print(f"Experience: {result.experience_years} years")
    print(f"Education: {result.education}")
    print(f"Job Titles: {result.job_titles}")
    print(f"Industries: {result.industries}")
    print(f"Certifications: {result.certifications}")
