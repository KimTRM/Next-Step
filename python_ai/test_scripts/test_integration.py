"""
Test the full integration: Settings -> Orchestrator -> Client
"""
import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from config.settings import settings
from services.job_api_service import JobAPIOrchestrator

print(f"USE_REAL_JOBS: {settings.USE_REAL_JOBS}")
print(f"API Key present: {bool(settings.APIFY_API_KEY)}")
print(f"Primary API: {settings.PRIMARY_JOB_API}")

# Create orchestrator
print("\nInitializing orchestrator...")
orchestrator = JobAPIOrchestrator(settings)

print(f"Available clients: {list(orchestrator.clients.keys())}")

# Try fetching jobs
print("\nFetching jobs for Manila...")
try:
    jobs = orchestrator.fetch_jobs(location="Manila", limit=5)
    print(f"Got {len(jobs)} jobs")

    if jobs:
        print("\nFirst job:")
        import json
        print(json.dumps(jobs[0], indent=2))
    else:
        print("No jobs returned")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
