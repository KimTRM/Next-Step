#!/usr/bin/env python3
"""
Train Job Matcher AI Model
Run this script to train the AI matching algorithm on synthetic or real data.

Usage:
    python train_model.py                    # Train with default settings
    python train_model.py --samples 5000     # Train with 5000 samples
    python train_model.py --real-data data/  # Train with real data from directory
"""

import os
import sys
import json
import random
import argparse
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from models.job_matcher import JobMatcher, SkillEmbedder
from models.resume_parser import ResumeParser, SkillTaxonomy
from data.data_generator import (
    generate_training_data, 
    populate_sample_database, 
    JobDatabase
)


def train_with_database_jobs(
    db_path: str = 'jobs.db',
    output_dir: str = 'trained_models',
    min_jobs: int = 10
):
    """
    Train the job matcher using real jobs from the database.
    
    This uses jobs fetched from Indeed/Apify APIs stored in the SQLite database,
    creating synthetic candidate-job pairs for training.
    
    Args:
        db_path: Path to the SQLite database
        output_dir: Directory to save trained model
        min_jobs: Minimum jobs required to proceed with training
    """
    print("=" * 60)
    print("JOB MATCHER AI - TRAINING WITH DATABASE JOBS")
    print("=" * 60)
    
    # Connect to database and fetch real jobs
    print(f"\n[1/5] Loading jobs from database ({db_path})...")
    db = JobDatabase(db_path)
    all_jobs = db.get_all_jobs(limit=1000)
    
    # Separate by source
    real_jobs = [j for j in all_jobs if j.get('job_source', 'synthetic') != 'synthetic']
    synthetic_jobs = [j for j in all_jobs if j.get('job_source', 'synthetic') == 'synthetic']
    
    print(f"  ✓ Found {len(all_jobs)} total jobs")
    print(f"    - Real jobs (Indeed/Apify): {len(real_jobs)}")
    print(f"    - Synthetic jobs: {len(synthetic_jobs)}")
    
    # Prefer real jobs, fall back to all jobs if not enough
    training_jobs = real_jobs if len(real_jobs) >= min_jobs else all_jobs
    
    if len(training_jobs) < min_jobs:
        print(f"\n  ⚠ Not enough jobs ({len(training_jobs)} < {min_jobs})")
        print(f"  ℹ Falling back to synthetic training...")
        return train_with_synthetic_data(output_dir=output_dir)
    
    print(f"  ✓ Using {len(training_jobs)} jobs for training")
    
    # Extract skill vocabulary from real jobs
    print("\n[2/5] Building skill vocabulary from job listings...")
    all_skills = set()
    skill_frequency = {}
    
    for job in training_jobs:
        required = job.get('required_skills', [])
        preferred = job.get('preferred_skills', [])
        
        for skill in required + preferred:
            skill_lower = skill.lower().strip()
            all_skills.add(skill_lower)
            skill_frequency[skill_lower] = skill_frequency.get(skill_lower, 0) + 1
    
    print(f"  ✓ Extracted {len(all_skills)} unique skills")
    
    # Show top skills
    top_skills = sorted(skill_frequency.items(), key=lambda x: x[1], reverse=True)[:15]
    print(f"  ✓ Top skills: {', '.join(s[0] for s in top_skills)}")
    
    # Generate synthetic candidates based on real job requirements
    print("\n[3/5] Generating candidate-job training pairs...")
    training_data = []
    
    for job in training_jobs:
        required_skills = [s.lower() for s in job.get('required_skills', [])]
        preferred_skills = [s.lower() for s in job.get('preferred_skills', [])]
        all_job_skills = set(required_skills + preferred_skills)
        
        min_exp = job.get('min_experience', 0) or 0
        max_exp = job.get('max_experience', 15) or 15
        
        # Create 3-5 synthetic candidates per job with varying match quality
        for match_quality in ['strong', 'medium', 'weak', 'poor']:
            if match_quality == 'strong':
                # Strong candidate: has 80-100% of required skills
                skill_count = max(1, int(len(required_skills) * random.uniform(0.8, 1.0)))
                candidate_skills = random.sample(required_skills, min(skill_count, len(required_skills)))
                # Add some preferred skills
                if preferred_skills:
                    candidate_skills += random.sample(preferred_skills, min(2, len(preferred_skills)))
                exp_years = random.randint(min_exp, max_exp)
                was_hired = random.random() < 0.85  # 85% hire rate for strong
                
            elif match_quality == 'medium':
                # Medium candidate: has 50-80% of required skills
                skill_count = max(1, int(len(required_skills) * random.uniform(0.5, 0.8)))
                candidate_skills = random.sample(required_skills, min(skill_count, len(required_skills)))
                exp_years = random.randint(max(0, min_exp - 1), max_exp + 2)
                was_hired = random.random() < 0.45  # 45% hire rate for medium
                
            elif match_quality == 'weak':
                # Weak candidate: has 20-50% of required skills
                skill_count = max(1, int(len(required_skills) * random.uniform(0.2, 0.5)))
                candidate_skills = random.sample(required_skills, min(skill_count, len(required_skills)))
                # Add some random skills not in job
                random_skills = random.sample(list(all_skills - all_job_skills), 
                                             min(3, len(all_skills - all_job_skills)))
                candidate_skills += random_skills
                exp_years = random.randint(0, max_exp + 3)
                was_hired = random.random() < 0.15  # 15% hire rate for weak
                
            else:  # poor
                # Poor candidate: has 0-20% of required skills
                skill_count = int(len(required_skills) * random.uniform(0, 0.2))
                candidate_skills = random.sample(required_skills, min(skill_count, len(required_skills))) if skill_count > 0 else []
                # Mostly random skills
                random_skills = random.sample(list(all_skills - all_job_skills), 
                                             min(5, len(all_skills - all_job_skills)))
                candidate_skills += random_skills
                exp_years = random.randint(0, 20)
                was_hired = random.random() < 0.05  # 5% hire rate for poor
            
            training_data.append({
                'candidate_skills': list(set(candidate_skills)),
                'job_skills': required_skills,
                'candidate_experience': exp_years,
                'job_min_experience': min_exp,
                'job_max_experience': max_exp,
                'job_industry': job.get('industry', 'Technology'),
                'was_hired': was_hired,
            })
    
    random.shuffle(training_data)
    
    # Calculate statistics
    hired_count = sum(1 for d in training_data if d['was_hired'])
    avg_skills = sum(len(d['candidate_skills']) for d in training_data) / len(training_data) if training_data else 0
    
    print(f"  ✓ Generated {len(training_data)} training samples")
    print(f"  ✓ Hire rate: {hired_count/len(training_data):.1%}")
    print(f"  ✓ Avg skills per candidate: {avg_skills:.1f}")
    
    # Train the model
    print("\n[4/5] Training skill embedder and matcher...")
    matcher = JobMatcher()
    matcher.train(training_data)
    
    print(f"  ✓ Vocabulary size: {len(matcher.embedder.vocabulary)} skills")
    print(f"  ✓ IDF scores calculated")
    print(f"  ✓ Co-occurrence matrix built")
    
    # Print learned weights
    print("\n  Learned weights:")
    for key, value in matcher.weights.items():
        print(f"    - {key}: {value:.3f}")
    
    # Save model
    print("\n[5/5] Saving trained model...")
    os.makedirs(output_dir, exist_ok=True)
    matcher.save(output_dir)
    
    # Save training metadata
    metadata = {
        'trained_at': datetime.now().isoformat(),
        'total_jobs': len(training_jobs),
        'real_jobs': len(real_jobs),
        'training_samples': len(training_data),
        'hire_rate': hired_count / len(training_data),
        'vocabulary_size': len(matcher.embedder.vocabulary),
        'top_skills': [s[0] for s in top_skills],
        'job_sources': list(set(j.get('job_source', 'unknown') for j in training_jobs)),
    }
    
    with open(os.path.join(output_dir, 'training_metadata.json'), 'w') as f:
        json.dump(metadata, f, indent=2)
    
    # Save sample training data
    with open(os.path.join(output_dir, 'training_data.json'), 'w') as f:
        json.dump(training_data[:100], f, indent=2)
    
    print(f"  ✓ Model saved to {output_dir}/")
    print(f"  ✓ Training metadata saved")
    
    # Validate with a real job
    print("\n" + "=" * 60)
    print("MODEL VALIDATION (using real job from database)")
    print("=" * 60)
    
    test_job = training_jobs[0]
    test_candidate = {
        'skills': test_job.get('required_skills', [])[:4] + ['communication', 'teamwork'],
        'experience_years': (test_job.get('min_experience', 0) or 0) + 2,
        'education': [{'degree': 'Bachelors', 'field': 'Computer Science'}],
        'industries': [test_job.get('industry', 'Technology')],
    }
    
    result = matcher.match(test_candidate, test_job)
    
    print(f"\nTest Match Result:")
    print(f"  Job: {result.title} at {result.company}")
    print(f"  Source: {test_job.get('job_source', 'unknown')}")
    print(f"  Confidence: {result.confidence}%")
    print(f"  Skill Match: {result.skill_match_score}%")
    print(f"  Matched Skills: {', '.join(result.matched_skills[:5])}")
    print(f"  Missing Skills: {', '.join(result.missing_skills[:5])}")
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\nModel trained on {len(real_jobs)} real Indeed jobs + {len(synthetic_jobs)} synthetic jobs")
    print(f"Next: Run the API server and test with real resumes")
    
    return matcher


def train_with_synthetic_data(
    num_samples: int = 1000,
    hire_rate: float = 0.3,
    output_dir: str = 'trained_models'
):
    """
    Train the job matcher using synthetic data.
    
    Args:
        num_samples: Number of training samples to generate
        hire_rate: Percentage of positive (hired) samples
        output_dir: Directory to save trained model
    """
    print("=" * 60)
    print("JOB MATCHER AI - TRAINING")
    print("=" * 60)
    print(f"\nConfiguration:")
    print(f"  - Training samples: {num_samples}")
    print(f"  - Target hire rate: {hire_rate:.1%}")
    print(f"  - Output directory: {output_dir}")
    
    # Generate training data
    print("\n[1/4] Generating synthetic training data...")
    training_data = generate_training_data(
        num_samples=num_samples,
        hire_rate=hire_rate
    )
    
    # Calculate statistics
    hired_count = sum(1 for d in training_data if d['was_hired'])
    avg_skills = sum(len(d['candidate_skills']) for d in training_data) / len(training_data)
    
    print(f"  ✓ Generated {len(training_data)} samples")
    print(f"  ✓ Actual hire rate: {hired_count/len(training_data):.1%}")
    print(f"  ✓ Average skills per candidate: {avg_skills:.1f}")
    
    # Initialize and train matcher
    print("\n[2/4] Training skill embedder...")
    matcher = JobMatcher()
    matcher.train(training_data)
    
    print(f"  ✓ Vocabulary size: {len(matcher.embedder.vocabulary)} skills")
    print(f"  ✓ IDF scores calculated for all skills")
    print(f"  ✓ Co-occurrence matrix built")
    
    # Print learned weights
    print("\n[3/4] Optimizing matching weights...")
    print("  Learned weights:")
    for key, value in matcher.weights.items():
        print(f"    - {key}: {value:.3f}")
    
    # Save model
    print("\n[4/4] Saving trained model...")
    os.makedirs(output_dir, exist_ok=True)
    matcher.save(output_dir)
    
    # Also save training data for reference
    data_path = os.path.join(output_dir, 'training_data.json')
    with open(data_path, 'w') as f:
        json.dump(training_data[:100], f, indent=2)  # Save sample
    
    print(f"  ✓ Model saved to {output_dir}/")
    print(f"  ✓ Sample training data saved to {data_path}")
    
    # Test the model
    print("\n" + "=" * 60)
    print("MODEL VALIDATION")
    print("=" * 60)
    
    test_candidate = {
        'skills': ['python', 'javascript', 'react', 'sql', 'aws', 'docker'],
        'experience_years': 5,
        'education': [{'degree': 'Bachelors', 'field': 'Computer Science'}],
        'industries': ['Technology'],
    }
    
    test_job = {
        'id': 'test_001',
        'title': 'Senior Software Engineer',
        'company': 'Test Corp',
        'industry': 'Technology',
        'city': 'San Francisco',
        'required_skills': ['python', 'react', 'sql', 'kubernetes', 'aws'],
        'min_experience': 4,
        'max_experience': 10,
        'education_required': 'bachelors',
    }
    
    result = matcher.match(test_candidate, test_job)
    
    print("\nTest Match Result:")
    print(f"  Job: {result.title} at {result.company}")
    print(f"  Confidence: {result.confidence}%")
    print(f"  Skill Match: {result.skill_match_score}%")
    print(f"  Experience Match: {result.experience_match_score}%")
    print(f"  Matched Skills: {', '.join(result.matched_skills)}")
    print(f"  Missing Skills: {', '.join(result.missing_skills)}")
    print(f"  Explanation: {result.explanation}")
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\nNext steps:")
    print(f"  1. Start the API server: python api/main.py")
    print(f"  2. Upload resumes to test matching")
    print(f"  3. Collect feedback to improve the model")
    
    return matcher


def train_with_real_data(data_dir: str, output_dir: str = 'trained_models'):
    """
    Train the job matcher using real resume/job data.
    
    Expected directory structure:
        data_dir/
            resumes/       # Resume files (PDF, DOCX, TXT)
            jobs.json      # Job listings
            feedback.json  # Optional: hire/no-hire outcomes
    
    Args:
        data_dir: Directory containing training data
        output_dir: Directory to save trained model
    """
    print("=" * 60)
    print("JOB MATCHER AI - TRAINING WITH REAL DATA")
    print("=" * 60)
    
    data_path = Path(data_dir)
    
    # Parse resumes
    resume_dir = data_path / 'resumes'
    if resume_dir.exists():
        print(f"\n[1/4] Parsing resumes from {resume_dir}...")
        parser = ResumeParser()
        
        skill_documents = []
        parsed_resumes = []
        
        for resume_file in resume_dir.iterdir():
            if resume_file.suffix.lower() in ['.pdf', '.docx', '.txt']:
                try:
                    parsed = parser.parse(str(resume_file))
                    skill_documents.append(parsed.skills)
                    parsed_resumes.append({
                        'file': resume_file.name,
                        'skills': parsed.skills,
                        'experience': parsed.experience_years,
                        'education': parsed.education
                    })
                    print(f"    ✓ Parsed {resume_file.name}: {len(parsed.skills)} skills")
                except Exception as e:
                    print(f"    ✗ Failed to parse {resume_file.name}: {e}")
        
        print(f"  ✓ Parsed {len(parsed_resumes)} resumes")
    else:
        print(f"  ✗ No resumes directory found at {resume_dir}")
        skill_documents = []
        parsed_resumes = []
    
    # Load jobs
    jobs_file = data_path / 'jobs.json'
    if jobs_file.exists():
        print(f"\n[2/4] Loading jobs from {jobs_file}...")
        with open(jobs_file) as f:
            jobs = json.load(f)
        
        for job in jobs:
            skills = job.get('required_skills', []) + job.get('preferred_skills', [])
            skill_documents.append(skills)
        
        print(f"  ✓ Loaded {len(jobs)} jobs")
    else:
        print(f"  ✗ No jobs.json found at {jobs_file}")
        jobs = []
    
    # Load feedback if available
    feedback_file = data_path / 'feedback.json'
    if feedback_file.exists():
        print(f"\n[3/4] Loading feedback from {feedback_file}...")
        with open(feedback_file) as f:
            feedback = json.load(f)
        print(f"  ✓ Loaded {len(feedback)} feedback records")
    else:
        print(f"  ℹ No feedback.json found - using synthetic labels")
        feedback = []
    
    # Build training data
    print("\n[4/4] Training model...")
    
    if skill_documents:
        training_data = []
        for resume in parsed_resumes:
            for job in jobs[:10]:  # Match each resume against some jobs
                training_data.append({
                    'candidate_skills': resume['skills'],
                    'job_skills': job.get('required_skills', []),
                    'candidate_experience': resume['experience'],
                    'job_min_experience': job.get('min_experience', 0),
                    'job_max_experience': job.get('max_experience', 20),
                })
        
        # Add feedback labels if available
        for item in training_data:
            # In real scenario, match feedback to training items
            item['was_hired'] = len(set(item['candidate_skills']) & set(item['job_skills'])) >= 2
        
        matcher = JobMatcher()
        matcher.train(training_data)
        
        # Save
        os.makedirs(output_dir, exist_ok=True)
        matcher.save(output_dir)
        
        print(f"  ✓ Model trained on {len(training_data)} candidate-job pairs")
        print(f"  ✓ Model saved to {output_dir}/")
    else:
        print("  ✗ No training data available")
        print("  ℹ Falling back to synthetic training...")
        matcher = train_with_synthetic_data(output_dir=output_dir)
    
    return matcher


def evaluate_model(model_dir: str, test_samples: int = 100):
    """
    Evaluate a trained model on test data.
    """
    print("=" * 60)
    print("MODEL EVALUATION")
    print("=" * 60)
    
    # Load model
    print(f"\nLoading model from {model_dir}...")
    matcher = JobMatcher()
    matcher.load(model_dir)
    print("  [OK] Model loaded")
    
    # Generate test data
    print(f"\nGenerating {test_samples} test samples...")
    test_data = generate_training_data(num_samples=test_samples, hire_rate=0.3)
    
    # Evaluate
    correct = 0
    predictions = []
    
    for item in test_data:
        candidate = {
            'skills': item['candidate_skills'],
            'experience_years': item['candidate_experience'],
            'education': item.get('candidate_education', []),
            'industries': item.get('candidate_industries', []),
        }
        
        job = {
            'id': 'test',
            'title': 'Test Job',
            'company': 'Test Corp',
            'industry': item.get('job_industry', 'Technology'),
            'city': 'Test City',
            'required_skills': item['job_skills'],
            'min_experience': item['job_min_experience'],
            'max_experience': item['job_max_experience'],
            'education_required': item.get('job_education', 'bachelors'),
        }
        
        result = matcher.match(candidate, job)
        predicted_hire = result.confidence > 50
        actual_hire = item['was_hired']
        
        predictions.append({
            'confidence': result.confidence,
            'predicted': predicted_hire,
            'actual': actual_hire,
            'correct': predicted_hire == actual_hire
        })
        
        if predicted_hire == actual_hire:
            correct += 1
    
    accuracy = correct / len(test_data)
    
    # Calculate metrics
    true_pos = sum(1 for p in predictions if p['predicted'] and p['actual'])
    false_pos = sum(1 for p in predictions if p['predicted'] and not p['actual'])
    true_neg = sum(1 for p in predictions if not p['predicted'] and not p['actual'])
    false_neg = sum(1 for p in predictions if not p['predicted'] and p['actual'])
    
    precision = true_pos / (true_pos + false_pos) if (true_pos + false_pos) > 0 else 0
    recall = true_pos / (true_pos + false_neg) if (true_pos + false_neg) > 0 else 0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0
    
    print(f"\nResults:")
    print(f"  Accuracy: {accuracy:.1%}")
    print(f"  Precision: {precision:.1%}")
    print(f"  Recall: {recall:.1%}")
    print(f"  F1 Score: {f1:.3f}")
    print(f"\nConfusion Matrix:")
    print(f"  True Positives: {true_pos}")
    print(f"  False Positives: {false_pos}")
    print(f"  True Negatives: {true_neg}")
    print(f"  False Negatives: {false_neg}")
    
    # Confidence distribution
    hire_confs = [p['confidence'] for p in predictions if p['actual']]
    no_hire_confs = [p['confidence'] for p in predictions if not p['actual']]
    
    if hire_confs and no_hire_confs:
        print(f"\nConfidence Distribution:")
        print(f"  Avg confidence for hires: {sum(hire_confs)/len(hire_confs):.1f}%")
        print(f"  Avg confidence for non-hires: {sum(no_hire_confs)/len(no_hire_confs):.1f}%")


def main():
    parser = argparse.ArgumentParser(
        description='Train the Job Matcher AI model',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python train_model.py                        # Train with 1000 synthetic samples
  python train_model.py --samples 5000         # Train with 5000 samples
  python train_model.py --from-db              # Train with real jobs from database
  python train_model.py --from-db --db-path jobs.db  # Specify database path
  python train_model.py --real-data ./data/    # Train with real data from files
  python train_model.py --evaluate             # Evaluate existing model
        """
    )
    
    parser.add_argument(
        '--samples', type=int, default=1423,
        help='Number of synthetic training samples (default: 1000)'
    )
    parser.add_argument(
        '--hire-rate', type=float, default=0.3,
        help='Target hire rate for synthetic data (default: 0.3)'
    )
    parser.add_argument(
        '--real-data', type=str, default=None,
        help='Directory containing real training data'
    )
    parser.add_argument(
        '--output', type=str, default='trained_models',
        help='Output directory for trained model (default: trained_models)'
    )
    parser.add_argument(
        '--evaluate', action='store_true',
        help='Evaluate existing model instead of training'
    )
    parser.add_argument(
        '--from-db', action='store_true',
        help='Train using real jobs from the database (Indeed/Apify jobs)'
    )
    parser.add_argument(
        '--db-path', type=str, default='jobs.db',
        help='Path to the jobs database (default: jobs.db)'
    )
    parser.add_argument(
        '--populate-db', action='store_true',
        help='Also populate the job database with sample jobs'
    )
    
    args = parser.parse_args()
    
    if args.evaluate:
        evaluate_model(args.output)
    elif args.from_db:
        train_with_database_jobs(
            db_path=args.db_path,
            output_dir=args.output
        )
    elif args.real_data:
        train_with_real_data(args.real_data, args.output)
    else:
        train_with_synthetic_data(
            num_samples=args.samples,
            hire_rate=args.hire_rate,
            output_dir=args.output
        )
    
    if args.populate_db:
        print("\nPopulating job database...")
        db = populate_sample_database('jobs.db', num_jobs=500)
        print(f"  ✓ Created jobs.db with 500 sample jobs")


if __name__ == '__main__':
    main()