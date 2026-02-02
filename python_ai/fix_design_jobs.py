"""Fix industry classification for design-related jobs and fetch new Fine Arts jobs"""
import sqlite3
from services.job_api_service import ApifyIndeedClient
from config.settings import Settings

conn = sqlite3.connect('jobs.db')
c = conn.cursor()

# Update existing design-related jobs to Fine Arts & Design
design_keywords = ['designer', 'graphic', 'artist', 'illustrator', 'ui/ux', 'ux/ui', 'creative', 'multimedia', 'animator', 'art director', 'visual']

print("Reclassifying design-related jobs to Fine Arts & Design...")
updated = 0
for keyword in design_keywords:
    c.execute(f"UPDATE jobs SET industry = 'Fine Arts & Design' WHERE LOWER(title) LIKE '%{keyword}%' AND industry != 'Fine Arts & Design'")
    updated += c.rowcount

conn.commit()
print(f"Reclassified {updated} jobs to Fine Arts & Design")

# Verify
c.execute("SELECT COUNT(*) FROM jobs WHERE industry = 'Fine Arts & Design'")
count = c.fetchone()[0]
print(f"Total Fine Arts & Design jobs now: {count}")

# Show some examples
c.execute("SELECT title, company, city FROM jobs WHERE industry = 'Fine Arts & Design' LIMIT 10")
print("\nSample Fine Arts & Design jobs:")
for row in c.fetchall():
    print(f"  - {row[0]} at {row[1]} ({row[2]})")

conn.close()

# Fetch more Fine Arts jobs if needed
if count < 50:
    print(f"\nFetching more Fine Arts & Design jobs from Indeed...")
    client = ApifyIndeedClient(api_key=Settings.APIFY_API_KEY)
    
    searches = ['graphic designer', 'UI UX designer', 'visual artist', 'illustrator']
    
    for search in searches:
        print(f"  Searching: {search}...")
        try:
            jobs = client.fetch_jobs(location='Philippines', keywords=[search], limit=10)
            if jobs:
                print(f"    Found {len(jobs)} jobs")
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
    
    # Final count
    conn = sqlite3.connect('jobs.db')
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM jobs WHERE industry = 'Fine Arts & Design'")
    final_count = c.fetchone()[0]
    print(f"\nFinal Fine Arts & Design jobs count: {final_count}")
    conn.close()
