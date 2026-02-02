#!/usr/bin/env python3
"""Test LinkedIn API key and find working actor."""

import os
import requests
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('LINKEDIN_TRAINING_API_KEY_1')
print(f"Using API Key 1: {api_key[:25]}...")

# Try different LinkedIn actor IDs
actors = [
    'bebity/linkedin-jobs-scraper',
    'curious_coder/linkedin-jobs-search-scraper', 
    'anchor/linkedin-job-scraper',
    'misceres/linkedin-jobs-scraper',
    'hMvNSpz3JnHgl5jkh',  # common LinkedIn scraper ID
]

print("\n--- Testing Actor Availability ---")
for actor_id in actors:
    try:
        response = requests.get(
            f'https://api.apify.com/v2/acts/{actor_id}',
            params={'token': api_key},
            timeout=15
        )
        status = response.status_code
        if status == 200:
            data = response.json().get('data', {})
            title = data.get('title', 'N/A')
            print(f"[OK] {actor_id}")
            print(f"     Title: {title}")
        else:
            print(f"[--] {actor_id} - Status {status}")
    except Exception as e:
        print(f"[!!] {actor_id} - Error: {e}")

# Also search for LinkedIn actors
print("\n--- Searching for LinkedIn Actors ---")
try:
    response = requests.get(
        'https://api.apify.com/v2/store',
        params={
            'token': api_key,
            'search': 'linkedin jobs',
            'limit': 5
        },
        timeout=15
    )
    if response.status_code == 200:
        data = response.json().get('data', {})
        items = data.get('items', [])
        for item in items[:5]:
            actor_id = item.get('id', 'N/A')
            name = item.get('name', 'N/A')
            username = item.get('username', 'N/A')
            print(f"  {username}/{name} (ID: {actor_id})")
except Exception as e:
    print(f"Search error: {e}")

# Test running an actor synchronously
print("\n--- Testing Actor Run ---")
test_actor = 'hMvNSpz3JnHgl5jkh'  # LinkedIn Jobs Scraper
try:
    run_url = f'https://api.apify.com/v2/acts/{test_actor}/run-sync-get-dataset-items'
    
    actor_input = {
        "title": "Software Engineer",
        "location": "United States",
        "rows": 3
    }
    
    print(f"Running actor {test_actor} with sync endpoint...")
    response = requests.post(
        run_url,
        json=actor_input,
        params={'token': api_key},
        timeout=60
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        jobs = response.json()
        print(f"Jobs returned: {len(jobs) if isinstance(jobs, list) else 'N/A'}")
        if jobs and isinstance(jobs, list) and len(jobs) > 0:
            print(f"Sample job keys: {list(jobs[0].keys())[:5]}")
    else:
        print(f"Response: {response.text[:300]}")
except Exception as e:
    print(f"Error: {e}")
