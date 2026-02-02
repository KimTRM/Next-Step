"""
Affinda Resume Parser Training Script
Trains local resume parser accuracy by comparing with Affinda API results.

Training Flow:
1. Query Affinda API with sample resumes
2. Get parsing results from Affinda
3. Compare current local parser results with Affinda results
4. Process differences and update local parser
5. Sync improvements and repeat

Usage:
    python train_affinda.py --train-only --iterations 10
    python train_affinda.py --view
    python train_affinda.py --compare resume.pdf
"""

import os
import sys
import json
import time
import random
import argparse
import hashlib
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
class ParsingComparison:
    """Comparison between local and Affinda parsing results"""
    resume_id: str
    local_skills: List[str]
    affinda_skills: List[str]
    missing_skills: List[str]  # Skills Affinda found that we missed
    extra_skills: List[str]    # Skills we found that Affinda didn't
    local_experience: float
    affinda_experience: float
    local_education: List[Dict]
    affinda_education: List[Dict]
    accuracy_score: float
    timestamp: str


class AffindaClient:
    """Client for Affinda Resume Parser API"""
    
    BASE_URL = "https://api.affinda.com/v3"
    
    def __init__(self, api_key: str = None, workspace_id: str = None):
        self.api_key = api_key or os.getenv("AFFINDA_API_KEY")
        self.workspace_id = workspace_id or os.getenv("AFFINDA_WORKSPACE_ID")
        
        if not self.api_key or self.api_key == "your_affinda_api_key_here":
            raise ValueError("AFFINDA_API_KEY not set in .env file")
        
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
        }
        
        # Get or create collection for resumes
        self.collection_id = None
        self._init_collection()
    
    def _init_collection(self):
        """Initialize or get existing resume collection"""
        try:
            # First, get workspace info to find a resume collection
            url = f"{self.BASE_URL}/workspaces"
            response = requests.get(url, headers=self.headers, timeout=30)
            
            if response.status_code == 200:
                workspaces = response.json()
                if workspaces and len(workspaces) > 0:
                    workspace = workspaces[0]
                    self.workspace_id = workspace.get('identifier')
                    
                    # Get collections in workspace
                    collections = workspace.get('collections', [])
                    for coll in collections:
                        if coll.get('extractor') == 'resume':
                            self.collection_id = coll.get('identifier')
                            print(f"  Using collection: {self.collection_id}")
                            return
            
            # If no collection found, we'll parse without collection
            print("  [WARN] No resume collection found, using default parsing")
            
        except Exception as e:
            print(f"  [WARN] Could not fetch collections: {e}")
    
    def parse_resume_text(self, resume_text: str) -> Dict:
        """Parse resume from raw text using Affinda API"""
        import base64
        import tempfile
        
        # Affinda v3 requires file upload, so we create a temp file
        try:
            # Create temporary text file with resume content
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
                f.write(resume_text)
                temp_path = f.name
            
            # Parse as file
            result = self.parse_resume_file(temp_path)
            
            # Clean up temp file
            try:
                os.unlink(temp_path)
            except:
                pass
            
            return result
            
        except Exception as e:
            print(f"[ERR] Affinda API error: {e}")
            return None
    
    def parse_resume_file(self, file_path: str) -> Dict:
        """Parse resume from file using Affinda API"""
        url = f"{self.BASE_URL}/documents"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': (Path(file_path).name, f)}
                data = {
                    "wait": "true"
                }
                
                # Add collection if available
                if self.collection_id:
                    data["collection"] = self.collection_id
                elif self.workspace_id and self.workspace_id != "your_workspace_id_here":
                    data["workspace"] = self.workspace_id
                
                response = requests.post(
                    url,
                    headers=headers,
                    files=files,
                    data=data,
                    timeout=120
                )
                
                if response.status_code != 200 and response.status_code != 201:
                    # Try to get error details
                    try:
                        error_detail = response.json()
                        print(f"[ERR] Affinda API error: {response.status_code} - {error_detail}")
                    except:
                        print(f"[ERR] Affinda API error: {response.status_code} - {response.text[:200]}")
                    return None
                
                return response.json()
                
        except requests.exceptions.RequestException as e:
            print(f"[ERR] Affinda API error: {e}")
            return None
    
    def extract_skills_from_response(self, response: Dict) -> List[str]:
        """Extract skills from Affinda API response"""
        skills = []
        
        if not response:
            return skills
        
        # Handle both nested 'data' and flat response structures
        data = response.get('data', response)
        
        # Extract from skills section (various possible formats)
        for key in ['skills', 'rawSkills', 'technicalSkills', 'softSkills']:
            if key in data:
                skill_list = data[key]
                if isinstance(skill_list, list):
                    for skill in skill_list:
                        if isinstance(skill, dict):
                            # Try various field names
                            skill_name = (skill.get('name') or skill.get('parsed') or 
                                         skill.get('value') or skill.get('raw'))
                            if skill_name:
                                skills.append(skill_name.lower().strip())
                        elif isinstance(skill, str):
                            skills.append(skill.lower().strip())
        
        # Also extract from work experience descriptions
        if 'workExperience' in data:
            for exp in data.get('workExperience', []):
                # Extract skills mentioned in job descriptions
                desc = exp.get('description') or exp.get('jobDescription') or ''
                if desc:
                    # Quick extraction of common tech terms
                    tech_terms = self._extract_tech_from_text(desc)
                    skills.extend(tech_terms)
        
        # Normalize and dedupe
        normalized = []
        seen = set()
        for skill in skills:
            skill_clean = skill.lower().strip()
            if skill_clean and skill_clean not in seen and len(skill_clean) > 1:
                normalized.append(skill_clean)
                seen.add(skill_clean)
        
        return normalized
    
    def _extract_tech_from_text(self, text: str) -> List[str]:
        """Extract technology keywords from text"""
        import re
        
        tech_patterns = [
            r'\b(python|java|javascript|typescript|react|angular|vue|node\.?js|sql|aws|azure|gcp|docker|kubernetes)\b',
            r'\b(git|github|gitlab|jenkins|terraform|ansible|linux|unix|nginx|apache)\b',
            r'\b(mongodb|postgresql|mysql|redis|elasticsearch|kafka|spark|hadoop)\b',
            r'\b(machine learning|deep learning|nlp|tensorflow|pytorch|pandas|numpy)\b',
            r'\b(agile|scrum|jira|confluence|project management)\b',
            r'\b(figma|sketch|photoshop|illustrator|ui/?ux)\b',
        ]
        
        found = []
        text_lower = text.lower()
        
        for pattern in tech_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            found.extend(matches)
        
        return list(set(found))
    
    def extract_experience_from_response(self, response: Dict) -> float:
        """Extract years of experience from Affinda response"""
        if not response or 'data' not in response:
            return 0.0
        
        data = response.get('data', {})
        
        # Check for total years of experience
        if 'totalYearsExperience' in data:
            return float(data['totalYearsExperience'] or 0)
        
        # Calculate from work experience entries
        if 'workExperience' in data:
            work_exp = data['workExperience']
            if work_exp:
                years = []
                current_year = datetime.now().year
                for exp in work_exp:
                    dates = exp.get('dates', {})
                    start = dates.get('startDate')
                    end = dates.get('endDate')
                    
                    if start:
                        start_year = int(start[:4]) if isinstance(start, str) else start
                        years.append(start_year)
                
                if years:
                    return float(current_year - min(years))
        
        return 0.0
    
    def extract_education_from_response(self, response: Dict) -> List[Dict]:
        """Extract education from Affinda response"""
        education = []
        
        if not response or 'data' not in response:
            return education
        
        data = response.get('data', {})
        
        if 'education' in data:
            for edu in data['education']:
                education.append({
                    'degree': edu.get('accreditation', {}).get('education', 'Unknown'),
                    'field': edu.get('accreditation', {}).get('inputStr', ''),
                    'institution': edu.get('organization', '')
                })
        
        return education


class ResumeTrainer:
    """Train local resume parser using Affinda as ground truth"""
    
    def __init__(self):
        self.local_parser = ResumeParser()
        self.affinda_client = None
        self.training_history_file = Path("trained_models/affinda_training_history.json")
        self.learned_skills_file = Path("trained_models/learned_skills.json")
        self.comparison_log_file = Path("trained_models/parsing_comparisons.json")
        
        # Load existing training history
        self.training_history = self._load_json(self.training_history_file, {"iterations": [], "total_comparisons": 0})
        self.learned_skills = self._load_json(self.learned_skills_file, {"skills": [], "skill_variations": {}})
        self.comparisons = self._load_json(self.comparison_log_file, {"comparisons": []})
    
    def _load_json(self, path: Path, default: Dict) -> Dict:
        """Load JSON file or return default"""
        if path.exists():
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        return default
    
    def _save_json(self, path: Path, data: Dict):
        """Save data to JSON file"""
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    
    def init_affinda(self):
        """Initialize Affinda client"""
        try:
            self.affinda_client = AffindaClient()
            print("[OK] Affinda client initialized")
            return True
        except ValueError as e:
            print(f"[ERR] {e}")
            return False
    
    def generate_sample_resumes(self, count: int = 10) -> List[str]:
        """Generate diverse sample resumes for training"""
        
        # Sample resume templates with various formats
        templates = [
            # Tech resume
            """
            {name}
            {title}
            {email} | {phone}
            
            PROFESSIONAL SUMMARY
            Experienced {title} with {years}+ years in {industry}.
            
            TECHNICAL SKILLS
            {skills}
            
            WORK EXPERIENCE
            
            {company1} | {title} | {start_year} - Present
            - Developed and maintained {tech1} applications
            - Led team projects using {tech2} and {tech3}
            - Implemented {tech4} solutions for scalability
            
            {company2} | Junior Developer | {prev_year} - {start_year}
            - Built {tech5} features for web platform
            - Collaborated with cross-functional teams
            
            EDUCATION
            {degree} in {field}
            {university} | {grad_year}
            
            CERTIFICATIONS
            {cert1}, {cert2}
            """,
            
            # Business resume
            """
            {name}
            {email} | {phone} | LinkedIn: linkedin.com/in/{name_slug}
            
            {title}
            
            PROFILE
            Results-driven {title} with expertise in {skills}.
            {years} years of experience in {industry}.
            
            EXPERIENCE
            
            {title} - {company1}
            {start_year} to Present
            * Managed {skill1} initiatives resulting in growth
            * Developed {skill2} strategies
            * Led {skill3} projects
            
            Associate {title} - {company2}  
            {prev_year} to {start_year}
            * Supported {skill4} operations
            * Analyzed {skill5} metrics
            
            EDUCATION
            {degree}, {field}
            {university}, {grad_year}
            
            SKILLS
            {skills}
            """,
            
            # Creative resume
            """
            --- {name} ---
            {title} | {industry} Professional
            
            Contact: {email} / {phone}
            Portfolio: {name_slug}.design
            
            == ABOUT ==
            Creative {title} passionate about {skill1} and {skill2}.
            
            == SKILLS ==
            {skills}
            
            == EXPERIENCE ==
            
            > {title} @ {company1} ({start_year}-Present)
              - Created {skill3} solutions
              - Collaborated on {skill4} projects
              
            > Junior {title} @ {company2} ({prev_year}-{start_year})
              - Assisted with {skill5} work
            
            == EDUCATION ==
            {degree} | {field} | {university} ({grad_year})
            """
        ]
        
        # Data pools for generation
        names = ["Alex Johnson", "Sarah Chen", "Michael Brown", "Emily Davis", 
                 "James Wilson", "Maria Garcia", "David Lee", "Jennifer Taylor",
                 "Robert Martinez", "Lisa Anderson", "William Thomas", "Jessica White"]
        
        tech_titles = ["Software Engineer", "Full Stack Developer", "Data Scientist",
                       "DevOps Engineer", "Frontend Developer", "Backend Developer",
                       "Machine Learning Engineer", "Cloud Architect"]
        
        business_titles = ["Project Manager", "Product Manager", "Business Analyst",
                          "Marketing Manager", "Sales Manager", "Operations Manager",
                          "Financial Analyst", "Account Executive"]
        
        creative_titles = ["UX Designer", "Graphic Designer", "UI/UX Designer",
                          "Visual Designer", "Product Designer", "Creative Director"]
        
        tech_skills = [
            "Python, JavaScript, React, Node.js, AWS, Docker, Kubernetes, SQL",
            "Java, Spring Boot, Microservices, PostgreSQL, Redis, CI/CD, Git",
            "TypeScript, Angular, GraphQL, MongoDB, Azure, Terraform, Linux",
            "Go, Rust, gRPC, Kafka, Elasticsearch, Prometheus, ArgoCD",
            "Python, TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn, MLflow",
            "C#, .NET Core, Azure Functions, Cosmos DB, Service Bus, Blazor"
        ]
        
        business_skills = [
            "Project Management, Agile, Scrum, Jira, Confluence, Stakeholder Management",
            "Product Strategy, Roadmapping, User Research, A/B Testing, Analytics",
            "Financial Modeling, Excel, PowerPoint, Budgeting, Forecasting, SAP",
            "Digital Marketing, SEO, Google Analytics, Content Strategy, HubSpot",
            "Sales Strategy, CRM, Salesforce, Lead Generation, Negotiation, B2B"
        ]
        
        creative_skills = [
            "Figma, Sketch, Adobe XD, Photoshop, Illustrator, User Research, Wireframing",
            "UI Design, UX Design, Prototyping, Design Systems, Accessibility, HTML/CSS",
            "InDesign, After Effects, Motion Graphics, Brand Design, Typography"
        ]
        
        companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
                     "Uber", "Airbnb", "Stripe", "Shopify", "Salesforce", "Adobe",
                     "Oracle", "IBM", "Cisco", "VMware", "Dell", "HP", "Intel",
                     "Accenture", "Deloitte", "McKinsey", "BCG", "Bain"]
        
        universities = ["MIT", "Stanford University", "UC Berkeley", "Carnegie Mellon",
                       "Georgia Tech", "University of Michigan", "Cornell University",
                       "University of Washington", "UCLA", "Columbia University"]
        
        tech_degrees = ["Bachelor's", "Master's", "B.S.", "M.S."]
        tech_fields = ["Computer Science", "Software Engineering", "Data Science",
                      "Information Technology", "Electrical Engineering"]
        
        business_fields = ["Business Administration", "MBA", "Finance", "Marketing",
                          "Economics", "Management"]
        
        creative_fields = ["Graphic Design", "Visual Communication", "Fine Arts",
                          "Human-Computer Interaction", "Industrial Design"]
        
        certifications = {
            "tech": ["AWS Certified Solutions Architect", "Google Cloud Professional",
                    "Kubernetes Administrator (CKA)", "Azure Developer Associate",
                    "Terraform Associate", "Scrum Master (CSM)"],
            "business": ["PMP", "Six Sigma Green Belt", "Google Analytics Certified",
                        "HubSpot Inbound Marketing", "Salesforce Administrator"],
            "creative": ["Google UX Design Certificate", "Adobe Certified Expert",
                        "Interaction Design Foundation", "Nielsen Norman UX Certificate"]
        }
        
        resumes = []
        current_year = datetime.now().year
        
        for i in range(count):
            template = random.choice(templates)
            
            # Determine resume type
            resume_type = random.choice(["tech", "business", "creative"])
            
            if resume_type == "tech":
                title = random.choice(tech_titles)
                skills = random.choice(tech_skills)
                degree = random.choice(tech_degrees)
                field = random.choice(tech_fields)
                certs = random.sample(certifications["tech"], 2)
            elif resume_type == "business":
                title = random.choice(business_titles)
                skills = random.choice(business_skills)
                degree = random.choice(["Bachelor's", "MBA", "Master's"])
                field = random.choice(business_fields)
                certs = random.sample(certifications["business"], 2)
            else:
                title = random.choice(creative_titles)
                skills = random.choice(creative_skills)
                degree = random.choice(["Bachelor's", "BFA", "MFA"])
                field = random.choice(creative_fields)
                certs = random.sample(certifications["creative"], 2)
            
            name = random.choice(names)
            start_year = random.randint(current_year - 8, current_year - 2)
            years = current_year - start_year
            
            # Parse skills list
            skill_list = [s.strip() for s in skills.split(',')]
            
            resume = template.format(
                name=name,
                name_slug=name.lower().replace(' ', ''),
                title=title,
                email=f"{name.lower().replace(' ', '.')}@email.com",
                phone=f"({random.randint(200,999)}) {random.randint(100,999)}-{random.randint(1000,9999)}",
                years=years,
                industry=random.choice(["Technology", "Finance", "Healthcare", "Retail", "Media"]),
                skills=skills,
                skill1=skill_list[0] if skill_list else "management",
                skill2=skill_list[1] if len(skill_list) > 1 else "analysis",
                skill3=skill_list[2] if len(skill_list) > 2 else "strategy",
                skill4=skill_list[3] if len(skill_list) > 3 else "operations",
                skill5=skill_list[4] if len(skill_list) > 4 else "planning",
                tech1=skill_list[0] if skill_list else "Python",
                tech2=skill_list[1] if len(skill_list) > 1 else "JavaScript",
                tech3=skill_list[2] if len(skill_list) > 2 else "SQL",
                tech4=skill_list[3] if len(skill_list) > 3 else "Docker",
                tech5=skill_list[4] if len(skill_list) > 4 else "React",
                company1=random.choice(companies),
                company2=random.choice(companies),
                start_year=start_year,
                prev_year=start_year - random.randint(2, 4),
                degree=degree,
                field=field,
                university=random.choice(universities),
                grad_year=start_year - random.randint(0, 2),
                cert1=certs[0],
                cert2=certs[1]
            )
            
            resumes.append(resume.strip())
        
        return resumes
    
    def compare_parsing(self, resume_text: str) -> Optional[ParsingComparison]:
        """Compare local parsing with Affinda parsing"""
        
        # Local parsing
        local_result = self.local_parser.parse_text(resume_text)
        
        # Affinda parsing
        if not self.affinda_client:
            print("[WARN] Affinda client not initialized")
            return None
        
        affinda_response = self.affinda_client.parse_resume_text(resume_text)
        
        if not affinda_response:
            return None
        
        # Extract Affinda results
        affinda_skills = self.affinda_client.extract_skills_from_response(affinda_response)
        affinda_experience = self.affinda_client.extract_experience_from_response(affinda_response)
        affinda_education = self.affinda_client.extract_education_from_response(affinda_response)
        
        # Normalize skills for comparison
        local_skills_lower = set(s.lower() for s in local_result.skills)
        affinda_skills_lower = set(s.lower() for s in affinda_skills)
        
        # Find differences
        missing_skills = list(affinda_skills_lower - local_skills_lower)
        extra_skills = list(local_skills_lower - affinda_skills_lower)
        
        # Calculate accuracy score
        if affinda_skills_lower:
            matched = len(local_skills_lower & affinda_skills_lower)
            accuracy = matched / len(affinda_skills_lower) * 100
        else:
            accuracy = 100.0 if not local_skills_lower else 50.0
        
        # Create comparison record
        resume_id = hashlib.md5(resume_text[:100].encode()).hexdigest()[:8]
        
        comparison = ParsingComparison(
            resume_id=resume_id,
            local_skills=list(local_skills_lower),
            affinda_skills=list(affinda_skills_lower),
            missing_skills=missing_skills,
            extra_skills=extra_skills,
            local_experience=local_result.experience_years,
            affinda_experience=affinda_experience,
            local_education=local_result.education,
            affinda_education=affinda_education,
            accuracy_score=accuracy,
            timestamp=datetime.now().isoformat()
        )
        
        return comparison
    
    def learn_from_comparison(self, comparison: ParsingComparison):
        """Update learned skills based on comparison"""
        
        # Add missing skills to learned vocabulary
        for skill in comparison.missing_skills:
            if skill not in self.learned_skills["skills"]:
                self.learned_skills["skills"].append(skill)
                print(f"  [+] Learned new skill: {skill}")
        
        # Store comparison
        self.comparisons["comparisons"].append(asdict(comparison))
        
        # Save updates
        self._save_json(self.learned_skills_file, self.learned_skills)
        self._save_json(self.comparison_log_file, self.comparisons)
    
    def update_local_parser(self):
        """Update local parser with learned skills"""
        
        # Add learned skills to taxonomy
        new_skills = set(self.learned_skills["skills"])
        current_skills = self.local_parser.skill_taxonomy
        
        added_count = 0
        for skill in new_skills:
            if skill.lower() not in current_skills:
                current_skills.add(skill.lower())
                added_count += 1
        
        self.local_parser.skill_taxonomy = current_skills
        
        print(f"[OK] Updated local parser with {added_count} new skills")
        print(f"[OK] Total skills in taxonomy: {len(current_skills)}")
        
        return added_count
    
    def run_training_iteration(self, sample_count: int = 10) -> Dict:
        """Run one training iteration"""
        
        print(f"\n{'='*60}")
        print(f"TRAINING ITERATION - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")
        
        # Generate sample resumes
        print(f"\n[1/4] Generating {sample_count} sample resumes...")
        resumes = self.generate_sample_resumes(sample_count)
        
        # Compare each resume
        print(f"\n[2/4] Querying Affinda API and comparing results...")
        comparisons = []
        total_accuracy = 0
        missing_all = []
        
        for i, resume in enumerate(resumes):
            print(f"  Processing resume {i+1}/{sample_count}...", end=" ")
            
            comparison = self.compare_parsing(resume)
            
            if comparison:
                comparisons.append(comparison)
                total_accuracy += comparison.accuracy_score
                missing_all.extend(comparison.missing_skills)
                print(f"Accuracy: {comparison.accuracy_score:.1f}%")
                
                # Learn from comparison
                self.learn_from_comparison(comparison)
            else:
                print("Failed")
            
            # Rate limiting
            time.sleep(1)
        
        # Calculate statistics
        avg_accuracy = total_accuracy / len(comparisons) if comparisons else 0
        unique_missing = list(set(missing_all))
        
        print(f"\n[3/4] Processing differences...")
        print(f"  Average accuracy: {avg_accuracy:.1f}%")
        print(f"  Unique missing skills found: {len(unique_missing)}")
        
        if unique_missing[:10]:
            print(f"  Sample missing skills: {', '.join(unique_missing[:10])}")
        
        # Update local parser
        print(f"\n[4/4] Syncing improvements to local parser...")
        new_skills_added = self.update_local_parser()
        
        # Record iteration
        iteration_result = {
            "timestamp": datetime.now().isoformat(),
            "samples_processed": len(comparisons),
            "average_accuracy": avg_accuracy,
            "new_skills_learned": len(unique_missing),
            "total_skills_added": new_skills_added
        }
        
        self.training_history["iterations"].append(iteration_result)
        self.training_history["total_comparisons"] += len(comparisons)
        self._save_json(self.training_history_file, self.training_history)
        
        print(f"\n[OK] Iteration complete!")
        print(f"    Processed: {len(comparisons)} resumes")
        print(f"    Avg Accuracy: {avg_accuracy:.1f}%")
        print(f"    New Skills: {len(unique_missing)}")
        
        return iteration_result
    
    def train_overnight(self, iterations: int = 10, samples_per_iteration: int = 10, 
                       sleep_between: int = 60):
        """Run overnight training loop"""
        
        print("\n" + "="*70)
        print("AFFINDA RESUME PARSER OVERNIGHT TRAINING")
        print("="*70)
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Iterations: {iterations}")
        print(f"Samples per iteration: {samples_per_iteration}")
        print(f"Sleep between iterations: {sleep_between}s")
        print("="*70)
        
        # Initialize Affinda
        if not self.init_affinda():
            print("[ERR] Cannot start training without Affinda API key")
            return
        
        results = []
        
        for i in range(iterations):
            print(f"\n>>> ITERATION {i+1}/{iterations}")
            
            try:
                result = self.run_training_iteration(samples_per_iteration)
                results.append(result)
                
                # Progress report
                avg_so_far = sum(r["average_accuracy"] for r in results) / len(results)
                total_learned = sum(r["new_skills_learned"] for r in results)
                
                print(f"\n--- Progress Report ---")
                print(f"Iterations completed: {i+1}/{iterations}")
                print(f"Running avg accuracy: {avg_so_far:.1f}%")
                print(f"Total new skills learned: {total_learned}")
                
                if i < iterations - 1:
                    print(f"\nSleeping {sleep_between}s before next iteration...")
                    time.sleep(sleep_between)
                    
            except KeyboardInterrupt:
                print("\n[WARN] Training interrupted by user")
                break
            except Exception as e:
                print(f"[ERR] Iteration failed: {e}")
                time.sleep(sleep_between)
        
        # Final report
        print("\n" + "="*70)
        print("TRAINING COMPLETE")
        print("="*70)
        print(f"Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Iterations run: {len(results)}")
        
        if results:
            final_avg = sum(r["average_accuracy"] for r in results) / len(results)
            total_learned = sum(r["new_skills_learned"] for r in results)
            print(f"Final avg accuracy: {final_avg:.1f}%")
            print(f"Total skills learned: {total_learned}")
            print(f"Total skills in parser: {len(self.local_parser.skill_taxonomy)}")
        
        print("="*70)
    
    def view_status(self):
        """View current training status"""
        
        print("\n" + "="*60)
        print("AFFINDA TRAINING STATUS")
        print("="*60)
        
        # Training history
        print("\n[Training History]")
        print(f"  Total iterations: {len(self.training_history['iterations'])}")
        print(f"  Total comparisons: {self.training_history['total_comparisons']}")
        
        if self.training_history['iterations']:
            last = self.training_history['iterations'][-1]
            print(f"  Last training: {last['timestamp']}")
            print(f"  Last accuracy: {last['average_accuracy']:.1f}%")
        
        # Learned skills
        print("\n[Learned Skills]")
        print(f"  Total learned: {len(self.learned_skills['skills'])}")
        
        if self.learned_skills['skills'][:20]:
            print(f"  Sample: {', '.join(self.learned_skills['skills'][:20])}")
        
        # Local parser status
        print("\n[Local Parser]")
        print(f"  Skills in taxonomy: {len(self.local_parser.skill_taxonomy)}")
        
        # Recent comparisons
        print("\n[Recent Comparisons]")
        recent = self.comparisons['comparisons'][-5:]
        
        if recent:
            for comp in recent:
                print(f"  [{comp['resume_id']}] Accuracy: {comp['accuracy_score']:.1f}% | "
                      f"Missing: {len(comp['missing_skills'])} | "
                      f"Extra: {len(comp['extra_skills'])}")
        else:
            print("  No comparisons yet")
        
        print("\n" + "="*60)
    
    def compare_single_resume(self, file_path: str):
        """Compare parsing of a single resume file"""
        
        print(f"\n[Comparing] {file_path}")
        
        if not self.init_affinda():
            return
        
        # Read file
        path = Path(file_path)
        if not path.exists():
            print(f"[ERR] File not found: {file_path}")
            return
        
        # Parse with local parser
        local_result = self.local_parser.parse(file_path)
        
        # Parse with Affinda
        affinda_response = self.affinda_client.parse_resume_file(file_path)
        
        if not affinda_response:
            print("[ERR] Affinda parsing failed")
            return
        
        affinda_skills = self.affinda_client.extract_skills_from_response(affinda_response)
        
        # Compare
        local_set = set(s.lower() for s in local_result.skills)
        affinda_set = set(s.lower() for s in affinda_skills)
        
        print("\n[Local Parser Results]")
        print(f"  Skills: {', '.join(sorted(local_result.skills))}")
        print(f"  Experience: {local_result.experience_years} years")
        print(f"  Education: {local_result.education}")
        
        print("\n[Affinda Results]")
        print(f"  Skills: {', '.join(sorted(affinda_skills))}")
        print(f"  Experience: {self.affinda_client.extract_experience_from_response(affinda_response)} years")
        
        print("\n[Comparison]")
        matched = local_set & affinda_set
        missing = affinda_set - local_set
        extra = local_set - affinda_set
        
        accuracy = len(matched) / len(affinda_set) * 100 if affinda_set else 100
        
        print(f"  Accuracy: {accuracy:.1f}%")
        print(f"  Matched: {len(matched)} - {', '.join(sorted(matched))}")
        print(f"  Missing: {len(missing)} - {', '.join(sorted(missing))}")
        print(f"  Extra: {len(extra)} - {', '.join(sorted(extra))}")


def main():
    parser = argparse.ArgumentParser(
        description="Train resume parser accuracy using Affinda API"
    )
    
    parser.add_argument("--train-only", action="store_true",
                       help="Run overnight training loop")
    parser.add_argument("--iterations", type=int, default=10,
                       help="Number of training iterations (default: 10)")
    parser.add_argument("--samples", type=int, default=10,
                       help="Samples per iteration (default: 10)")
    parser.add_argument("--sleep", type=int, default=60,
                       help="Seconds between iterations (default: 60)")
    parser.add_argument("--view", action="store_true",
                       help="View current training status")
    parser.add_argument("--compare", type=str,
                       help="Compare parsing of a specific resume file")
    parser.add_argument("--quick", action="store_true",
                       help="Quick single iteration training")
    
    args = parser.parse_args()
    
    trainer = ResumeTrainer()
    
    if args.view:
        trainer.view_status()
    elif args.compare:
        trainer.compare_single_resume(args.compare)
    elif args.quick:
        if trainer.init_affinda():
            trainer.run_training_iteration(args.samples)
    elif args.train_only:
        trainer.train_overnight(
            iterations=args.iterations,
            samples_per_iteration=args.samples,
            sleep_between=args.sleep
        )
    else:
        # Default: show help
        parser.print_help()
        print("\n" + "="*60)
        print("EXAMPLES:")
        print("="*60)
        print("  View status:           python train_affinda.py --view")
        print("  Quick training:        python train_affinda.py --quick --samples 5")
        print("  Overnight training:    python train_affinda.py --train-only --iterations 20")
        print("  Compare single file:   python train_affinda.py --compare resume.pdf")
        print("="*60)


if __name__ == "__main__":
    main()
