"""Fetch more Fine Arts & Design jobs from Indeed"""
import sqlite3
from services.job_api_service import ApifyIndeedClient
from config.settings import Settings

client = ApifyIndeedClient(api_key=Settings.APIFY_API_KEY)

# More search terms for Fine Arts & Design
searches = [
    'creative designer',
    'video editor',
    'photographer',
    'animator',
    'web designer', 
    'motion graphics',
    'brand designer',
    'layout artist',
    'art director',
    'multimedia artist'
]

print("Fetching more Fine Arts & Design jobs...")
total_fetched = 0

for search in searches:
    print(f"  Searching: {search}...")
    try:
        jobs = client.fetch_jobs(location='Philippines', keywords=[search], limit=10)
        if jobs:
            print(f"    Found {len(jobs)} jobs")
            total_fetched += len(jobs)
            
            conn = sqlite3.connect('jobs.db')
            c = conn.cursor()
            for job in jobs:
                try:
                    c.execute('''
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
                        job.get('city', 'Philippines'),
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
        print(f"    Error: {e}")

print(f"\nTotal jobs fetched: {total_fetched}")

# Final count
conn = sqlite3.connect('jobs.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM jobs WHERE industry = 'Fine Arts & Design'")
final_count = c.fetchone()[0]
print(f"Final Fine Arts & Design jobs count: {final_count}")
conn.close()
