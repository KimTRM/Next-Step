import os
import json
import requests
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('USERESUME_API_KEY')
print(f'API Key: {api_key[:25]}...')

url = 'https://useresume.ai/api/v3/resume/create'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json'
}

payload = {
    'content': {
        'name': 'Alex Johnson',
        'email': 'alex@example.com',
        'phone': '555-123-4567',
        'address': 'San Francisco, CA',
        'role': 'Software Engineer',
        'summary': 'Experienced developer with 5 years in Python.',
        'skills': [
            {'name': 'Python'},
            {'name': 'JavaScript'},
            {'name': 'React'}
        ],
        'employment': [
            {
                'title': 'Software Engineer',
                'company': 'Google',
                'start_date': '2020-01',
                'end_date': 'Present',
                'description': 'Led development of key features.'
            }
        ],
        'education': [
            {
                'degree': 'Bachelor of Science',
                'field': 'Computer Science',
                'institution': 'MIT',
                'graduation_date': '2019'
            }
        ]
    },
    'style': {
        'template': 'modern-pro',
        'template_color': 'blue',
        'font': 'inter',
        'page_format': 'letter'
    }
}

print('Testing create endpoint...')
print(f'Payload size: {len(json.dumps(payload))} bytes')

response = requests.post(url, headers=headers, json=payload, timeout=60)
print(f'Status: {response.status_code}')
print(f'Response: {response.text[:500]}')
