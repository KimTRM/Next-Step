import sys
sys.path.insert(0, '.')

from data.data_generator import JobDatabase

db = JobDatabase('jobs.db')

# Test partial matching
print("Testing partial city matching:")
jobs = db.get_jobs_by_city('Makati')
print(f"Jobs matching 'Makati': {len(jobs)}")
for j in jobs[:3]:
    print(f"  - {j['title']} at {j['company']} in {j['city']}")

print("\n" + "="*50 + "\n")

jobs = db.get_jobs_by_city('Metro Manila')
print(f"Jobs matching 'Metro Manila': {len(jobs)}")
for j in jobs[:3]:
    print(f"  - {j['title']} at {j['company']} in {j['city']}")

print("\n" + "="*50 + "\n")

# Test industry + city partial matching
jobs = db.get_jobs_by_industry('Technology', 'Metro Manila')
print(f"Technology jobs in Metro Manila: {len(jobs)}")
for j in jobs[:3]:
    print(f"  - {j['title']} at {j['company']} in {j['city']}")
