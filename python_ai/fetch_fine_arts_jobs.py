"""Fetch Fine Arts & Design jobs from Indeed for training"""
import os
import sys
sys.path.insert(0, '.')
from services.job_api_service import ApifyIndeedClient
from config.settings import Settings
import sqlite3

# Initialize client
client = ApifyIndeedClient(api_key=Settings.APIFY_API_KEY)

# Fine Arts & Design job searches
searches = [
    'graphic designer',
    'UI UX designer', 
    'visual artist',
    'illustrator',
    'multimedia artist',
    'art director',
    'creative designer',
    'video editor',
    'photographer',
    'animator',
    'web designer',
    'motion graphics',
    'brand designer',
    'layout artist'
]

print('Fetching Fine Arts & Design jobs from Indeed...')
total_fetched = 0

for search in searches:
    print(f'  Searching: {search}...')
    try:
        jobs = client.fetch_jobs(location='Philippines', keywords=[search], limit=8)
        if jobs:
            print(f'    Found {len(jobs)} jobs')
            total_fetched += len(jobs)
            
            # Store in database
            conn = sqlite3.connect('jobs.db')
            cursor = conn.cursor()
            
            for job in jobs:
                try:
                    cursor.execute('''
                        INSERT OR IGNORE INTO jobs (
                            id, company, title, industry, city, required_skills,
                            experience_years, education_level, salary_min, salary_max,
                            job_url, job_source
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        job.get('id', ''),
                        job.get('company', 'Unknown'),
                        job.get('title', 'Unknown'),
                        'Fine Arts & Design',
                        job.get('location', 'Philippines'),
                        job.get('required_skills', ''),
                        job.get('experience_years', 0),
                        job.get('education_level', 'Bachelor'),
                        job.get('salary_min', 0),
                        job.get('salary_max', 0),
                        job.get('job_url', ''),
                        job.get('job_source', 'indeed')
                    ))
                except Exception as e:
                    pass
            
            conn.commit()
            conn.close()
    except Exception as e:
        print(f'    Error: {e}')

print(f'\nTotal Fine Arts & Design jobs fetched: {total_fetched}')

# Verify count
conn = sqlite3.connect('jobs.db')
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) FROM jobs WHERE industry = 'Fine Arts & Design'")
count = cursor.fetchone()[0]
print(f'Fine Arts & Design jobs in database: {count}')
conn.close()
