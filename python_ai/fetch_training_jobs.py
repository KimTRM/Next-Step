#!/usr/bin/env python3
"""
Fetch jobs from Indeed API for training data
"""
import sys
sys.path.insert(0, '.')

from services.job_api_service import ApifyIndeedClient
from data.data_generator import JobDatabase
from config.settings import settings


def fetch_jobs():
    client = ApifyIndeedClient(api_key=settings.APIFY_API_KEY)
    db = JobDatabase('jobs.db')
    
    # Multiple searches to get diverse training data
    searches = [
        # Healthcare
        {'position': 'nurse', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'medical technologist', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'pharmacist', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'physical therapist', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'doctor', 'location': 'Philippines', 'maxItems': 30},
        # Finance & Accounting
        {'position': 'accountant', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'financial analyst', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'auditor', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'bookkeeper', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'tax specialist', 'location': 'Philippines', 'maxItems': 30},
        # Marketing & Sales
        {'position': 'marketing manager', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'digital marketing', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'sales representative', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'brand manager', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'social media manager', 'location': 'Philippines', 'maxItems': 30},
        # Human Resources
        {'position': 'HR manager', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'recruiter', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'training specialist', 'location': 'Philippines', 'maxItems': 30},
        # Customer Service / BPO
        {'position': 'customer service representative', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'call center agent', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'technical support', 'location': 'Philippines', 'maxItems': 50},
        # Education
        {'position': 'teacher', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'tutor', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'training coordinator', 'location': 'Philippines', 'maxItems': 30},
        # Engineering (non-software)
        {'position': 'civil engineer', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'mechanical engineer', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'electrical engineer', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'architect', 'location': 'Philippines', 'maxItems': 30},
        # Operations & Logistics
        {'position': 'operations manager', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'supply chain', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'logistics coordinator', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'warehouse supervisor', 'location': 'Philippines', 'maxItems': 30},
        # Administrative
        {'position': 'administrative assistant', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'executive assistant', 'location': 'Philippines', 'maxItems': 50},
        {'position': 'office manager', 'location': 'Philippines', 'maxItems': 30},
        # Legal
        {'position': 'paralegal', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'legal assistant', 'location': 'Philippines', 'maxItems': 30},
        # Hospitality & Tourism
        {'position': 'hotel manager', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'chef', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'restaurant manager', 'location': 'Philippines', 'maxItems': 30},
        # Retail
        {'position': 'store manager', 'location': 'Philippines', 'maxItems': 30},
        {'position': 'retail sales', 'location': 'Philippines', 'maxItems': 30},
    ]
    
    total_fetched = 0
    
    for search in searches:
        position = search['position']
        location = search['location']
        max_items = search['maxItems']
        
        print(f"\n{'='*60}")
        print(f"Fetching: {position} in {location} (max {max_items})...")
        
        try:
            # The fetch_jobs method expects keywords as a list
            jobs = client.fetch_jobs(
                location=location,
                keywords=[position],
                limit=max_items
            )
            
            # Save to database
            for job in jobs:
                db.insert_job(job)
                total_fetched += 1
            
            print(f"  ✓ Got {len(jobs)} jobs")
            
        except Exception as e:
            print(f"  ✗ Error: {e}")
    
    print(f"\n{'='*60}")
    print(f"TOTAL: {total_fetched} jobs fetched and saved to database")
    print(f"{'='*60}")
    
    # Show DB stats
    all_jobs = db.get_all_jobs(limit=5000)
    real_jobs = [j for j in all_jobs if j.get('job_source', 'synthetic') != 'synthetic']
    print(f"\nDatabase now has:")
    print(f"  - {len(all_jobs)} total jobs")
    print(f"  - {len(real_jobs)} real jobs from Indeed")
    
    # Show skill distribution
    skills = {}
    for job in real_jobs:
        for skill in job.get('required_skills', []):
            skills[skill.lower()] = skills.get(skill.lower(), 0) + 1
    
    top_skills = sorted(skills.items(), key=lambda x: x[1], reverse=True)[:20]
    print(f"\nTop skills in database:")
    for skill, count in top_skills:
        print(f"  - {skill}: {count}")


if __name__ == '__main__':
    fetch_jobs()
