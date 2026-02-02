#!/usr/bin/env python3
"""Check Apify account access and find available actors."""

import os
import requests
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('LINKEDIN_TRAINING_API_KEY_1')
print(f"Using API Key 1: {api_key[:25]}...")

# Check what actors this key has access to
print("\n=== Your Apify Account Actors ===")
response = requests.get(
    'https://api.apify.com/v2/acts',
    params={'token': api_key, 'my': 'true'},
    timeout=30
)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json().get('data', {})
    items = data.get('items', [])
    print(f"Your actors: {len(items)}")
    for item in items[:10]:
        name = item.get('name', 'N/A')
        actor_id = item.get('id', 'N/A')
        print(f"  - {name} (ID: {actor_id})")

# Check recent actor runs
print("\n=== Recent Actor Runs ===")
response = requests.get(
    'https://api.apify.com/v2/actor-runs',
    params={'token': api_key, 'limit': 10},
    timeout=30
)
if response.status_code == 200:
    data = response.json().get('data', {})
    items = data.get('items', [])
    print(f"Recent runs: {len(items)}")
    for item in items[:10]:
        act_id = item.get('actId', 'N/A')
        status = item.get('status', 'N/A')
        started = item.get('startedAt', 'N/A')
        print(f"  - Actor: {act_id}, Status: {status}, Started: {started[:19] if started else 'N/A'}")

# Check account info and credits
print("\n=== Account Info ===")
response = requests.get(
    'https://api.apify.com/v2/users/me',
    params={'token': api_key},
    timeout=30
)
if response.status_code == 200:
    data = response.json().get('data', {})
    username = data.get('username', 'N/A')
    plan = data.get('plan', {})
    print(f"Username: {username}")
    print(f"Plan: {plan.get('id', 'N/A')}")
    
# Try running the Indeed scraper since we know it works
print("\n=== Testing Indeed Scraper (known working) ===")
indeed_actor = 'hMvNSpz3JnHgl5jkh'
response = requests.post(
    f'https://api.apify.com/v2/acts/{indeed_actor}/run-sync-get-dataset-items',
    json={
        "position": "Python Developer",
        "location": "Remote",
        "maxItems": 3
    },
    params={'token': api_key, 'timeout': 60},
    timeout=70
)
print(f"Status: {response.status_code}")
if response.status_code in [200, 201]:
    jobs = response.json()
    if isinstance(jobs, list):
        print(f"Jobs returned: {len(jobs)}")
        if jobs and len(jobs) > 0 and 'error' not in jobs[0]:
            print("Indeed scraper works! Using Indeed for job skill extraction.")
            print(f"Sample job title: {jobs[0].get('positionName', 'N/A')}")
