"""
Test Apify API directly to see response format
"""
import requests
import json
from dotenv import load_dotenv
import os

load_dotenv()

API_KEY = os.getenv('APIFY_API_KEY')
print(f"Using API Key: {API_KEY[:20]}...")

# Test the Apify JobStreet scraper
url = "https://api.apify.com/v2/acts/easyapi~jobstreet-job-scraper/run-sync-get-dataset-items"

payload = {
    "country": "PH",
    "location": "Manila",
    "search": "software developer",
    "maxItems": 5
}

headers = {
    "Content-Type": "application/json"
}

full_url = f"{url}?token={API_KEY}"

print(f"\nCalling Apify API...")
print(f"URL: {url}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(
        full_url,
        json=payload,
        headers=headers,
        timeout=120
    )

    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")

    if response.status_code in [200, 201]:
        data = response.json()
        print(f"\nResponse Type: {type(data)}")

        # Save response to file
        with open('apify_response.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print("Response saved to apify_response.json")

        if isinstance(data, list):
            print(f"Number of items: {len(data)}")
            if data:
                print(f"\nFirst item keys: {list(data[0].keys())}")
                print(f"\nFirst item saved to file (see apify_response.json)")
        else:
            print(f"Response is not a list, it's: {type(data)}")
    else:
        print(f"\nError Response Status: {response.status_code}")

except Exception as e:
    print(f"\nError: {e}")
    import traceback
    traceback.print_exc()
