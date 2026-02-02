#!/usr/bin/env python3
"""
Intensive Overnight Training Script
Run this to fetch thousands of fresh jobs and train the model intensively.

Usage:
    python train_overnight.py                    # Default: 50 jobs per industry
    python train_overnight.py --jobs-per-ind 100 # Fetch 100 jobs per industry
    python train_overnight.py --samples 50000    # Train with 50k synthetic samples
    python train_overnight.py --iterations 5     # Re-train 5 times with new data
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from models.job_matcher import JobMatcher
from data.data_generator import JobDatabase
from services.job_api_service import JobAPIOrchestrator
from config.settings import Settings
from dotenv import load_dotenv

load_dotenv()


def fetch_jobs_for_all_industries(
    orchestrator: JobAPIOrchestrator,
    db: JobDatabase,
    jobs_per_industry: int = 50,
    cities: list = None
):
    """Fetch jobs for all supported industries."""
    
    industries = [
        'Technology',
        'Finance', 
        'Healthcare',
        'Marketing',
        'Education',
        'Retail',
        'Manufacturing',
        'Consulting',
        'Fine Arts & Design'
    ]
    
    if cities is None:
        cities = ['Manila', 'Makati', 'Quezon City', 'Cebu', 'Davao']
    
    # Industry-specific search keywords
    industry_keywords = {
        'Technology': ['software engineer', 'developer', 'data analyst', 'IT support', 'python', 'javascript', 'devops'],
        'Finance': ['accountant', 'financial analyst', 'auditor', 'bookkeeper', 'finance manager', 'tax specialist'],
        'Healthcare': ['nurse', 'medical technologist', 'pharmacist', 'healthcare assistant', 'medical records'],
        'Marketing': ['marketing manager', 'digital marketing', 'social media manager', 'content writer', 'SEO specialist'],
        'Education': ['teacher', 'tutor', 'educational coordinator', 'training specialist', 'curriculum developer'],
        'Retail': ['sales associate', 'store manager', 'retail supervisor', 'customer service', 'cashier'],
        'Manufacturing': ['production supervisor', 'quality control', 'machine operator', 'manufacturing engineer'],
        'Consulting': ['consultant', 'business analyst', 'management consultant', 'strategy consultant'],
        'Fine Arts & Design': ['graphic designer', 'UI designer', 'creative director', 'art director', 'illustrator']
    }
    
    total_fetched = 0
    results = {}
    
    print("\n" + "=" * 70)
    print("FETCHING JOBS FOR ALL INDUSTRIES")
    print("=" * 70)
    
    for industry in industries:
        print(f"\n[{industry}]")
        results[industry] = {'fetched': 0, 'errors': []}
        
        keywords = industry_keywords.get(industry, [industry.lower()])
        
        for keyword in keywords:
            for city in cities:
                try:
                    print(f"  Searching '{keyword}' in {city}...", end=' ')
                    jobs = orchestrator.fetch_jobs(
                        location=city,
                        keywords=[keyword],
                        limit=jobs_per_industry // len(keywords) // len(cities) + 1
                    )
                    
                    if jobs:
                        # Add industry tag
                        for job in jobs:
                            job['industry'] = industry
                            job['job_source'] = 'apify_indeed'
                        
                        # Save to database
                        saved = 0
                        for job in jobs:
                            try:
                                db.insert_job(job)
                                saved += 1
                            except Exception as e:
                                pass  # Duplicate
                        
                        results[industry]['fetched'] += saved
                        total_fetched += saved
                        print(f"[OK] {saved} jobs")
                    else:
                        print("no results")
                    
                    # Rate limiting
                    time.sleep(2)
                    
                except Exception as e:
                    print(f"[ERR] Error: {e}")
                    results[industry]['errors'].append(str(e))
    
    print(f"\n{'=' * 70}")
    print(f"TOTAL JOBS FETCHED: {total_fetched}")
    print("=" * 70)
    
    return results, total_fetched


def intensive_training(
    db: JobDatabase,
    output_dir: str = 'trained_models',
    samples_per_job: int = 5,
    target_samples: int = 10000
):
    """
    Perform intensive training using all database jobs.
    Creates multiple candidate variations per job for better learning.
    """
    print("\n" + "=" * 70)
    print("INTENSIVE MODEL TRAINING")
    print("=" * 70)
    
    # Get all jobs from database
    all_jobs = db.get_all_jobs(limit=5000)
    real_jobs = [j for j in all_jobs if j.get('job_source', 'synthetic') != 'synthetic']
    
    print(f"\nDatabase contains:")
    print(f"  - Total jobs: {len(all_jobs)}")
    print(f"  - Real jobs: {len(real_jobs)}")
    
    if len(real_jobs) < 10:
        print("\n[WARN] Not enough real jobs. Training with synthetic data...")
        from train_model import train_with_synthetic_data
        return train_with_synthetic_data(num_samples=target_samples, output_dir=output_dir)
    
    # Build comprehensive skill vocabulary
    print("\n[1/4] Building expanded skill vocabulary...")
    all_skills = set()
    skill_by_industry = {}
    
    # Comprehensive skill dictionary by category
    EXPANDED_SKILLS = {
        # Programming Languages
        'programming': [
            'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust', 'swift',
            'kotlin', 'typescript', 'php', 'perl', 'scala', 'r', 'matlab', 'julia', 'dart', 'lua',
            'objective-c', 'assembly', 'fortran', 'cobol', 'haskell', 'elixir', 'clojure', 'f#',
            'visual basic', 'vb.net', 'groovy', 'shell', 'bash', 'powershell', 'sql', 'plsql', 'tsql'
        ],
        # Web Development
        'web': [
            'html', 'css', 'sass', 'scss', 'less', 'bootstrap', 'tailwind', 'react', 'reactjs',
            'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 'svelte', 'next.js', 'nextjs',
            'nuxt.js', 'nuxtjs', 'gatsby', 'express', 'expressjs', 'node.js', 'nodejs', 'deno',
            'django', 'flask', 'fastapi', 'rails', 'ruby on rails', 'laravel', 'symfony',
            'spring', 'spring boot', 'asp.net', '.net', 'dotnet', 'jquery', 'ajax', 'rest api',
            'restful', 'graphql', 'websocket', 'webpack', 'vite', 'babel', 'npm', 'yarn', 'pnpm'
        ],
        # Databases
        'database': [
            'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'sqlite',
            'oracle', 'sql server', 'mssql', 'mariadb', 'dynamodb', 'cassandra', 'couchdb',
            'firebase', 'supabase', 'neo4j', 'influxdb', 'timescaledb', 'cockroachdb'
        ],
        # Cloud & DevOps
        'cloud': [
            'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
            'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins', 'gitlab ci',
            'github actions', 'circleci', 'travis ci', 'nginx', 'apache', 'linux', 'unix',
            'devops', 'ci/cd', 'microservices', 'serverless', 'lambda', 'ec2', 's3', 'cloudformation',
            'helm', 'prometheus', 'grafana', 'datadog', 'splunk', 'elk stack', 'vagrant'
        ],
        # Data Science & AI
        'data_science': [
            'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'ml',
            'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy',
            'scipy', 'matplotlib', 'seaborn', 'plotly', 'jupyter', 'data analysis',
            'data visualization', 'nlp', 'natural language processing', 'computer vision',
            'neural networks', 'regression', 'classification', 'clustering', 'opencv',
            'spark', 'pyspark', 'hadoop', 'hive', 'airflow', 'dbt', 'etl', 'data engineering',
            'power bi', 'tableau', 'looker', 'metabase', 'statistics', 'a/b testing'
        ],
        # Mobile Development
        'mobile': [
            'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
            'swift', 'swiftui', 'kotlin', 'java android', 'mobile development', 'app development'
        ],
        # Design
        'design': [
            'photoshop', 'illustrator', 'figma', 'sketch', 'adobe xd', 'indesign', 'after effects',
            'premiere pro', 'lightroom', 'canva', 'coreldraw', 'blender', '3ds max', 'maya',
            'cinema 4d', 'ui design', 'ux design', 'ui/ux', 'user interface', 'user experience',
            'graphic design', 'visual design', 'web design', 'product design', 'interaction design',
            'motion graphics', 'animation', 'video editing', 'prototyping', 'wireframing',
            'typography', 'branding', 'logo design', 'illustration', 'creative design'
        ],
        # Marketing
        'marketing': [
            'digital marketing', 'seo', 'sem', 'google ads', 'facebook ads', 'social media marketing',
            'content marketing', 'email marketing', 'marketing automation', 'hubspot', 'mailchimp',
            'google analytics', 'analytics', 'copywriting', 'brand management', 'market research',
            'ppc', 'affiliate marketing', 'influencer marketing', 'crm', 'salesforce'
        ],
        # Finance & Accounting
        'finance': [
            'accounting', 'bookkeeping', 'financial analysis', 'financial modeling', 'budgeting',
            'forecasting', 'excel', 'quickbooks', 'sap', 'erp', 'auditing', 'tax preparation',
            'payroll', 'accounts payable', 'accounts receivable', 'gaap', 'ifrs', 'cpa',
            'financial reporting', 'cost accounting', 'treasury', 'risk management', 'compliance'
        ],
        # Project Management
        'management': [
            'project management', 'agile', 'scrum', 'kanban', 'waterfall', 'jira', 'confluence',
            'trello', 'asana', 'monday.com', 'notion', 'pmp', 'prince2', 'lean', 'six sigma',
            'stakeholder management', 'resource management', 'risk assessment', 'team leadership',
            'product management', 'product owner', 'scrum master'
        ],
        # Soft Skills
        'soft_skills': [
            'communication', 'teamwork', 'problem solving', 'critical thinking', 'leadership',
            'time management', 'adaptability', 'creativity', 'attention to detail', 'organization',
            'collaboration', 'presentation', 'negotiation', 'conflict resolution', 'decision making',
            'emotional intelligence', 'customer service', 'interpersonal skills', 'multitasking',
            'self-motivated', 'proactive', 'analytical', 'strategic thinking'
        ],
        # Healthcare
        'healthcare': [
            'patient care', 'nursing', 'medical records', 'hipaa', 'ehr', 'emr', 'clinical',
            'pharmacy', 'medical terminology', 'vital signs', 'cpr', 'first aid', 'phlebotomy',
            'medical coding', 'icd-10', 'healthcare management', 'medical billing'
        ],
        # Retail & Sales
        'retail': [
            'sales', 'retail', 'customer service', 'point of sale', 'pos', 'inventory management',
            'merchandising', 'cash handling', 'upselling', 'cross-selling', 'crm', 'lead generation',
            'b2b sales', 'b2c sales', 'sales forecasting', 'account management'
        ]
    }
    
    # Add all expanded skills
    for category, skills in EXPANDED_SKILLS.items():
        for skill in skills:
            all_skills.add(skill.lower().strip())
    
    # Extract skills from job data
    for job in real_jobs:
        industry = job.get('industry', 'Technology')
        required = job.get('required_skills', [])
        preferred = job.get('preferred_skills', [])
        description = job.get('description', '')
        
        if industry not in skill_by_industry:
            skill_by_industry[industry] = set()
        
        # Add from job fields
        for skill in required + preferred:
            skill_lower = skill.lower().strip()
            all_skills.add(skill_lower)
            skill_by_industry[industry].add(skill_lower)
        
        # Extract skills from description
        if description:
            desc_lower = description.lower()
            for category, skills in EXPANDED_SKILLS.items():
                for skill in skills:
                    if skill in desc_lower:
                        all_skills.add(skill)
                        skill_by_industry[industry].add(skill)
    
    print(f"  [OK] {len(all_skills)} unique skills across {len(skill_by_industry)} industries")
    
    # Generate intensive training data
    print("\n[2/4] Generating training data...")
    import random
    training_data = []
    
    # Convert to list for random sampling
    all_skills_list = list(all_skills)
    
    for job in real_jobs:
        required_skills = [s.lower() for s in job.get('required_skills', [])]
        preferred_skills = [s.lower() for s in job.get('preferred_skills', [])]
        all_job_skills = set(required_skills + preferred_skills)
        
        min_exp = job.get('min_experience', 0) or 0
        max_exp = job.get('max_experience', 15) or 15
        industry = job.get('industry', 'Technology')
        
        # Generate multiple candidates per job with different match qualities
        match_qualities = [
            ('perfect', 0.95, 0.95),      # Perfect match
            ('excellent', 0.90, 0.85),    # Excellent match
            ('strong', 0.75, 0.70),       # Strong match
            ('good', 0.60, 0.55),         # Good match
            ('moderate', 0.45, 0.35),     # Moderate match
            ('weak', 0.30, 0.20),         # Weak match
            ('poor', 0.15, 0.08),         # Poor match
            ('mismatch', 0.05, 0.02),     # Complete mismatch
        ]
        
        for quality_name, skill_ratio, hire_prob in match_qualities:
            # Create candidate with varying skill coverage
            skill_count = max(1, int(len(required_skills) * skill_ratio))
            candidate_skills = random.sample(required_skills, min(skill_count, len(required_skills))) if required_skills else []
            
            # Add some preferred skills for higher quality matches
            if skill_ratio > 0.5 and preferred_skills:
                bonus_skills = random.sample(preferred_skills, min(2, len(preferred_skills)))
                candidate_skills += bonus_skills
            
            # Add related skills from the expanded vocabulary for realistic resumes
            if skill_ratio > 0.6:
                # Good candidates have related skills
                industry_skills = list(skill_by_industry.get(industry, set()) - all_job_skills)
                if industry_skills:
                    extra_count = random.randint(1, 3)
                    candidate_skills += random.sample(industry_skills, min(extra_count, len(industry_skills)))
            
            # Add random unrelated skills for lower quality matches
            if skill_ratio < 0.5:
                other_skills = list(all_skills - all_job_skills)
                random_count = random.randint(3, 8)
                if other_skills and random_count > 0:
                    candidate_skills += random.sample(other_skills, min(random_count, len(other_skills)))
            
            # Add some soft skills randomly (realistic resumes have these)
            soft_skills = ['communication', 'teamwork', 'problem solving', 'leadership', 'time management']
            if random.random() < 0.7:
                candidate_skills += random.sample(soft_skills, random.randint(1, 3))
            
            # Experience variance
            if skill_ratio > 0.7:
                exp_years = random.randint(min_exp, max_exp)
            elif skill_ratio > 0.4:
                exp_years = random.randint(max(0, min_exp - 2), max_exp + 3)
            else:
                exp_years = random.randint(0, 20)
            
            was_hired = random.random() < hire_prob
            
            training_data.append({
                'candidate_skills': list(set(candidate_skills)),
                'job_skills': required_skills,
                'candidate_experience': exp_years,
                'job_min_experience': min_exp,
                'job_max_experience': max_exp,
                'job_industry': industry,
                'was_hired': was_hired,
            })
    
    # Duplicate if we need more samples
    while len(training_data) < target_samples:
        # Add slight variations
        sample = random.choice(training_data).copy()
        # Small random skill modifications
        if sample['candidate_skills'] and random.random() < 0.3:
            sample['candidate_skills'] = sample['candidate_skills'][:-1]  # Remove one skill
        training_data.append(sample)
    
    random.shuffle(training_data)
    training_data = training_data[:target_samples]
    
    hired_count = sum(1 for d in training_data if d['was_hired'])
    avg_skills = sum(len(d['candidate_skills']) for d in training_data) / len(training_data)
    
    print(f"  [OK] Generated {len(training_data)} training samples")
    print(f"  [OK] Hire rate: {hired_count/len(training_data):.1%}")
    print(f"  [OK] Avg skills/candidate: {avg_skills:.1f}")
    
    # Train the model
    print("\n[3/4] Training model...")
    matcher = JobMatcher()
    matcher.train(training_data)
    
    print(f"  [OK] Vocabulary: {len(matcher.embedder.vocabulary)} skills")
    print("\n  Learned weights:")
    for key, value in matcher.weights.items():
        print(f"    - {key}: {value:.3f}")
    
    # Save model
    print("\n[4/4] Saving model...")
    os.makedirs(output_dir, exist_ok=True)
    matcher.save(output_dir)
    
    # Save comprehensive metadata
    metadata = {
        'trained_at': datetime.now().isoformat(),
        'training_type': 'intensive',
        'total_jobs_used': len(real_jobs),
        'training_samples': len(training_data),
        'hire_rate': hired_count / len(training_data),
        'vocabulary_size': len(matcher.embedder.vocabulary),
        'industries_covered': list(skill_by_industry.keys()),
        'skills_per_industry': {k: len(v) for k, v in skill_by_industry.items()},
        'model_weights': matcher.weights,
    }
    
    with open(os.path.join(output_dir, 'training_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    # Save sample data
    with open(os.path.join(output_dir, 'training_data.json'), 'w') as f:
        json.dump(training_data[:200], f, indent=2)
    
    print(f"\n  [OK] Model saved to {output_dir}/")
    
    return matcher


def train_only_loop(
    training_samples: int = 50000,
    iterations: int = 10,
    sleep_between: int = 5  # 1 minute between iterations
):
    """
    Run overnight training with existing data only (no API calls).
    Each iteration uses different random resume compositions.
    """
    print("\n" + "=" * 70)
    print("OVERNIGHT TRAINING (NO JOB FETCHING)")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Iterations: {iterations}")
    print(f"Samples per iteration: {training_samples}")
    print(f"Sleep between: {sleep_between}s")
    print("=" * 70)
    
    db = JobDatabase('jobs.db')
    best_accuracy = 0
    
    for iteration in range(1, iterations + 1):
        print(f"\n{'='*70}")
        print(f"ITERATION {iteration}/{iterations}")
        print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
        print("="*70)
        
        # Train with different random seed each time
        import random
        random.seed(iteration * 1000 + int(time.time()) % 1000)
        
        # Train
        matcher = intensive_training(
            db,
            output_dir='trained_models',
            target_samples=training_samples
        )
        
        # Evaluate
        print("\n[Evaluation]")
        from train_model import evaluate_model
        evaluate_model('trained_models')
        
        # Wait between iterations (except last)
        if iteration < iterations:
            wait_until = datetime.now() + timedelta(seconds=sleep_between)
            print(f"\n[WAIT] Next iteration at {wait_until.strftime('%H:%M:%S')}...")
            time.sleep(sleep_between)
    
    # Final summary
    print("\n" + "=" * 70)
    print("OVERNIGHT TRAINING COMPLETE")
    print("=" * 70)
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total iterations: {iterations}")
    print(f"Samples processed: {iterations * training_samples:,}")
    
    # Final evaluation
    print("\n[FINAL MODEL]")
    view_model_knowledge()


def overnight_training_loop(
    jobs_per_industry: int = 50,
    training_samples: int = 20000,
    iterations: int = 3,
    sleep_between: int = 300  # 5 minutes between iterations
):
    """
    Run overnight intensive training with multiple iterations.
    """
    print("\n" + "=" * 70)
    print("OVERNIGHT INTENSIVE TRAINING")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Initialize
    settings = Settings()
    apify_key = settings.APIFY_API_KEY
    if not apify_key:
        print("\n[WARN] Warning: APIFY_API_KEY not set. Will train with existing data only.")
    
    db = JobDatabase('jobs.db')
    orchestrator = JobAPIOrchestrator(settings) if apify_key else None
    
    total_jobs_fetched = 0
    best_accuracy = 0
    
    for iteration in range(1, iterations + 1):
        print(f"\n{'='*70}")
        print(f"ITERATION {iteration}/{iterations}")
        print(f"Time: {datetime.now().strftime('%H:%M:%S')}")
        print("="*70)
        
        # Fetch fresh jobs if API is available
        if orchestrator:
            try:
                results, fetched = fetch_jobs_for_all_industries(
                    orchestrator, db, jobs_per_industry
                )
                total_jobs_fetched += fetched
            except Exception as e:
                print(f"\n[WARN] Job fetching error: {e}")
        
        # Train intensively
        matcher = intensive_training(
            db,
            output_dir='trained_models',
            target_samples=training_samples
        )
        
        # Evaluate
        print("\n[Evaluation]")
        from train_model import evaluate_model
        evaluate_model('trained_models')
        
        # Wait between iterations (except last)
        if iteration < iterations:
            wait_until = datetime.now() + timedelta(seconds=sleep_between)
            print(f"\n[WAIT] Waiting until {wait_until.strftime('%H:%M:%S')} before next iteration...")
            time.sleep(sleep_between)
    
    # Final summary
    print("\n" + "=" * 70)
    print("OVERNIGHT TRAINING COMPLETE")
    print("=" * 70)
    print(f"\nFinished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Total iterations: {iterations}")
    print(f"Total new jobs fetched: {total_jobs_fetched}")
    
    # Final stats
    all_jobs = db.get_all_jobs(limit=10000)
    real_jobs = [j for j in all_jobs if j.get('job_source', 'synthetic') != 'synthetic']
    print(f"Total jobs in database: {len(all_jobs)} ({len(real_jobs)} real)")


def view_model_knowledge(model_dir: str = 'trained_models'):
    """Display detailed information about the current model's knowledge."""
    
    print("\n" + "=" * 70)
    print("CURRENT MODEL KNOWLEDGE")
    print("=" * 70)
    
    # Load metadata
    metadata_path = os.path.join(model_dir, 'training_metadata.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        print(f"\n[DATE] Last trained: {metadata.get('trained_at', 'Unknown')}")
        print(f"[TYPE] Training type: {metadata.get('training_type', 'standard')}")
        print(f"[DATA] Training samples: {metadata.get('training_samples', 'Unknown')}")
        print(f"[JOBS] Jobs used: {metadata.get('total_jobs_used', metadata.get('real_jobs', 'Unknown'))}")
        print(f"[VOCAB] Vocabulary size: {metadata.get('vocabulary_size', 'Unknown')} skills")
        
        if 'hire_rate' in metadata:
            print(f"[RATE] Training hire rate: {metadata['hire_rate']:.1%}")
        
        if 'industries_covered' in metadata:
            print(f"\n[IND] Industries covered: {', '.join(metadata['industries_covered'])}")
        
        if 'skills_per_industry' in metadata:
            print("\n[SKILLS] Skills per industry:")
            for ind, count in sorted(metadata['skills_per_industry'].items(), key=lambda x: -x[1]):
                print(f"   - {ind}: {count} skills")
        
        if 'top_skills' in metadata:
            print(f"\n[TOP] Top skills: {', '.join(metadata['top_skills'][:15])}")
        
        if 'model_weights' in metadata:
            print("\n[WEIGHTS] Model weights:")
            for key, value in metadata['model_weights'].items():
                print(f"   - {key}: {value:.3f}")
    else:
        print("\n[WARN] No metadata found. Run --evaluate to see model performance.")
    
    # Load and show embedder info
    import pickle
    embedder_path = os.path.join(model_dir, 'embedder.pkl')
    if os.path.exists(embedder_path):
        with open(embedder_path, 'rb') as f:
            embedder = pickle.load(f)
        
        print(f"\n[EMBEDDER] Skill Embedder:")
        
        # Handle both dict and object format
        if isinstance(embedder, dict):
            vocab = embedder.get('vocabulary', [])
            idf_scores = embedder.get('idf_scores', {})
        else:
            vocab = getattr(embedder, 'vocabulary', [])
            idf_scores = getattr(embedder, 'idf_scores', {})
        
        print(f"   - Vocabulary size: {len(vocab)}")
        
        # Show top IDF scores (most distinctive skills)
        if idf_scores:
            top_idf = sorted(idf_scores.items(), key=lambda x: -x[1])[:20]
            print(f"\n   Top distinctive skills (by IDF):")
            for skill, idf in top_idf[:10]:
                print(f"      {skill}: {idf:.3f}")
    
    # Run evaluation
    print("\n" + "-" * 50)
    print("MODEL PERFORMANCE EVALUATION")
    print("-" * 50)
    from train_model import evaluate_model
    evaluate_model(model_dir)


def main():
    parser = argparse.ArgumentParser(
        description='Intensive overnight training for job matcher AI',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_overnight.py --view              # View current model knowledge
  python train_overnight.py --quick             # Quick training (1 iteration)
  python train_overnight.py --intensive         # Full overnight training
  python train_overnight.py --fetch-only        # Only fetch jobs, no training
  python train_overnight.py --samples 50000     # Train with 50k samples
        """
    )
    
    parser.add_argument('--view', action='store_true',
                        help='View current model knowledge and performance')
    parser.add_argument('--quick', action='store_true',
                        help='Quick training (1 iteration, no job fetching)')
    parser.add_argument('--train-only', action='store_true',
                        help='Train overnight with multiple iterations (no job fetching)')
    parser.add_argument('--intensive', action='store_true',
                        help='Full intensive overnight training (includes job fetching)')
    parser.add_argument('--fetch-only', action='store_true',
                        help='Only fetch jobs, do not train')
    parser.add_argument('--jobs-per-ind', type=int, default=30,
                        help='Jobs to fetch per industry (default: 30)')
    parser.add_argument('--samples', type=int, default=20000,
                        help='Training samples to generate (default: 20000)')
    parser.add_argument('--iterations', type=int, default=3,
                        help='Training iterations (default: 3)')
    parser.add_argument('--sleep', type=int, default=300,
                        help='Seconds between iterations (default: 300)')
    
    args = parser.parse_args()
    
    if args.view:
        view_model_knowledge()
    elif args.quick:
        # Quick training with existing data
        db = JobDatabase('jobs.db')
        intensive_training(db, target_samples=args.samples)
        view_model_knowledge()
    elif args.train_only:
        # Overnight training without job fetching
        train_only_loop(
            training_samples=args.samples,
            iterations=args.iterations,
            sleep_between=args.sleep
        )
    elif args.fetch_only:
        # Only fetch jobs
        settings = Settings()
        if not settings.APIFY_API_KEY:
            print("Error: APIFY_API_KEY not set")
            sys.exit(1)
        db = JobDatabase('jobs.db')
        orchestrator = JobAPIOrchestrator(settings)
        fetch_jobs_for_all_industries(orchestrator, db, args.jobs_per_ind)
    elif args.intensive:
        # Full overnight training (with job fetching)
        overnight_training_loop(
            jobs_per_industry=args.jobs_per_ind,
            training_samples=args.samples,
            iterations=args.iterations,
            sleep_between=args.sleep
        )
    else:
        # Default: view model knowledge
        view_model_knowledge()


if __name__ == '__main__':
    main()
