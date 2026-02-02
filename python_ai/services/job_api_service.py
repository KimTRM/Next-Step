"""
Job API Service Layer - Integration with external job APIs.
"""
import time
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Optional
import requests
from datetime import datetime

logger = logging.getLogger(__name__)


class JobAPIClient(ABC):
    """Abstract base class for job API clients."""

    @abstractmethod
    def fetch_jobs(self, location: str, keywords: Optional[List[str]] = None, limit: int = 20) -> List[Dict]:
        """
        Fetch jobs from external API.

        Args:
            location: City or region to search jobs
            keywords: List of keywords to search for
            limit: Maximum number of jobs to return

        Returns:
            List of job dictionaries in internal format
        """
        pass

    @abstractmethod
    def transform_to_internal_format(self, external_job: Dict) -> Dict:
        """
        Transform external API response to internal job format.

        Args:
            external_job: Job data from external API

        Returns:
            Job dictionary in internal format
        """
        pass

    def validate_response(self, response: requests.Response) -> bool:
        """Validate API response."""
        if response.status_code in [200, 201]:  # 201 for Apify created/success
            return True
        elif response.status_code == 429:
            logger.warning("Rate limit exceeded")
            return False
        else:
            logger.error(f"API error: {response.status_code}")
            return False


class ApifyJobStreetClient(JobAPIClient):
    """JobStreet API client via Apify scraper."""

    def __init__(self, api_key: str, timeout: int = 120):
        self.api_key = api_key
        self.timeout = timeout
        self.base_url = "https://api.apify.com/v2/acts/easyapi~jobstreet-job-scraper/run-sync-get-dataset-items"

    def fetch_jobs(self, location: str, keywords: Optional[List[str]] = None, limit: int = 20) -> List[Dict]:
        """Fetch jobs from JobStreet via Apify."""
        try:
            # Build search query - keep it simple for better results
            search_query = " ".join(keywords) if keywords else "software"

            payload = {
                "country": "PH",
                "location": location,
                "search": search_query,
                "maxItems": limit
            }

            headers = {
                "Content-Type": "application/json"
            }

            url = f"{self.base_url}?token={self.api_key}"

            print(f"[DEBUG] Fetching JobStreet jobs for {location} with query: {search_query}")
            print(f"[DEBUG] API URL: {self.base_url}")
            print(f"[DEBUG] Payload: {payload}")
            print(f"[DEBUG] Timeout: {self.timeout} seconds")
            logger.info(f"Fetching JobStreet jobs for {location} with query: {search_query}")

            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )

            print(f"[DEBUG] Response status: {response.status_code}")
            print(f"[DEBUG] Response headers: {response.headers}")

            if not self.validate_response(response):
                print(f"[ERROR] Response validation failed: {response.text[:500]}")
                return []

            data = response.json()
            print(f"[DEBUG] Response type: {type(data)}")
            print(f"[DEBUG] Response length: {len(data) if isinstance(data, list) else 'N/A'}")
            print(f"[DEBUG] First item keys: {list(data[0].keys()) if data and isinstance(data, list) else 'N/A'}")
            print(f"[DEBUG] First item sample: {data[0] if data and isinstance(data, list) else 'N/A'}")

            jobs = []

            for item in data:
                try:
                    job = self.transform_to_internal_format(item)
                    jobs.append(job)
                except Exception as e:
                    print(f"[ERROR] Failed to transform job: {e}")
                    print(f"[ERROR] Job item: {item}")
                    logger.warning(f"Failed to transform job: {e}")
                    continue

            print(f"[SUCCESS] Successfully fetched {len(jobs)} jobs from JobStreet")
            logger.info(f"Successfully fetched {len(jobs)} jobs from JobStreet")
            return jobs

        except requests.Timeout:
            print(f"[ERROR] API request timed out after {self.timeout} seconds")
            logger.error(f"API request timed out after {self.timeout} seconds")
            return []
        except Exception as e:
            print(f"[ERROR] Error fetching jobs from Apify: {e}")
            import traceback
            traceback.print_exc()
            logger.error(f"Error fetching jobs from Apify: {e}")
            return []

    def transform_to_internal_format(self, external_job: Dict) -> Dict:
        """Transform JobStreet job to internal format."""
        # Extract company name (it's an object)
        company_data = external_job.get('company', {})
        company_name = company_data.get('name', 'Unknown Company') if isinstance(company_data, dict) else str(company_data)

        # Extract salary information
        salary_text = external_job.get('salary', '')
        salary_min, salary_max = self._parse_salary(salary_text)

        # Extract industry from classifications and map to our standard industries
        classifications = external_job.get('classifications', [])
        raw_industry = classifications[0].get('main', 'Technology') if classifications else 'Technology'
        industry = self._map_to_standard_industry(raw_industry)

        # Extract skills from description
        skills = self._extract_skills_from_description(external_job.get('description', ''))

        return {
            'id': f"jobstreet_{external_job.get('jobId', '')}",
            'title': external_job.get('title', 'Unknown Title'),
            'company': company_name,
            'industry': industry,
            'city': external_job.get('location', 'Philippines'),
            'required_skills': skills[:5],  # Top 5 skills
            'preferred_skills': skills[5:10],  # Next 5 skills
            'min_experience': self._parse_experience(external_job.get('description', '')),
            'max_experience': self._parse_experience(external_job.get('description', ''), max_val=True),
            'education_required': 'Bachelors',
            'salary_min': salary_min,
            'salary_max': salary_max,
            'posted_date': external_job.get('postDate', datetime.now().isoformat()),
            'description': external_job.get('description', ''),
            'job_url': external_job.get('sourceUrl', ''),
            'job_source': 'jobstreet'
        }

    def _map_to_standard_industry(self, raw_industry: str) -> str:
        """Map JobStreet industry to our standard industry categories."""
        industry_mapping = {
            # Technology mappings
            'information & communication technology': 'Technology',
            'information technology': 'Technology',
            'ict': 'Technology',
            'computer/it': 'Technology',
            'software': 'Technology',
            'engineering': 'Technology',
            # Finance mappings
            'accounting': 'Finance',
            'banking & financial services': 'Finance',
            'banking': 'Finance',
            'finance': 'Finance',
            'insurance': 'Finance',
            # Healthcare mappings
            'healthcare & medical': 'Healthcare',
            'healthcare': 'Healthcare',
            'medical': 'Healthcare',
            'pharmaceutical': 'Healthcare',
            # Retail mappings
            'retail & consumer products': 'Retail',
            'retail': 'Retail',
            'sales': 'Retail',
            # Consulting mappings
            'consulting & corporate strategy': 'Consulting',
            'consulting': 'Consulting',
            'human resources': 'Consulting',
            # Education mappings
            'education & training': 'Education',
            'education': 'Education',
            # Media mappings
            'advertising, arts & media': 'Media',
            'media': 'Media',
            'marketing & communications': 'Media',
            # Manufacturing mappings
            'manufacturing, transport & logistics': 'Manufacturing',
            'manufacturing': 'Manufacturing',
        }
        
        raw_lower = raw_industry.lower().strip()
        return industry_mapping.get(raw_lower, 'Technology')  # Default to Technology

    def _parse_salary(self, salary_text: str) -> tuple:
        """Parse salary range from text."""
        # Simple parsing - in production, use more robust parsing
        import re

        # Remove currency symbols and commas
        cleaned = re.sub(r'[₱,$,]', '', salary_text)

        # Find numbers
        numbers = re.findall(r'\d+', cleaned)

        if len(numbers) >= 2:
            return int(numbers[0]), int(numbers[1])
        elif len(numbers) == 1:
            return int(numbers[0]), int(numbers[0]) * 1.3
        else:
            return 50000, 80000  # Default

    def _parse_experience(self, exp_text: str, max_val: bool = False) -> int:
        """Parse experience years from text."""
        import re
        numbers = re.findall(r'\d+', exp_text)

        if numbers:
            if max_val and len(numbers) > 1:
                return int(numbers[1])
            return int(numbers[0])

        return 3 if not max_val else 5  # Default

    def _extract_skills_from_description(self, description: str) -> List[str]:
        """Extract skills from job description using word boundary matching."""
        import re
        
        # Comprehensive skill list covering multiple industries
        # Short ambiguous words that need exact matching are marked
        skill_categories = {
            'tech': [
                'python', 'javascript', 'java', 'react', 'node.js', 'sql',
                'aws', 'docker', 'kubernetes', 'agile', 'scrum',
                'html', 'css', 'typescript', 'mongodb', 'postgresql',
                'angular', 'vue.js', 'laravel', 'django', 'flask',
                'c#', '.net', 'ruby', 'rust', 'swift', 'kotlin',
                'machine learning', 'data analysis', 'devops', 'api development'
            ],
            'tech_exact': ['git', 'php', 'go', 'vue'],  # These need word boundary matching
            'design': [
                'photoshop', 'illustrator', 'figma', 'sketch', 'adobe',
                'indesign', 'after effects', 'premiere', 'lightroom',
                'ui design', 'ux design', 'graphic design', 'web design',
                'visual design', 'branding', 'typography', 'layout design',
                'wireframing', 'prototyping', 'animation', 'motion graphics',
                '3d modeling', 'blender', 'maya', 'cinema 4d', 'creative design',
                'canva', 'coreldraw', 'logo design', 'illustration'
            ],
            'marketing': [
                'seo', 'sem', 'ppc', 'social media marketing', 'content marketing',
                'email marketing', 'google analytics', 'facebook ads',
                'copywriting', 'brand management', 'market research'
            ],
            'finance': [
                'accounting', 'bookkeeping', 'quickbooks', 'excel', 'sap',
                'financial analysis', 'budgeting', 'auditing', 'taxation',
                'payroll', 'accounts payable', 'accounts receivable'
            ],
            'general': [
                'microsoft office', 'powerpoint', 'word processing',
                'communication skills', 'leadership', 'project management',
                'problem solving', 'teamwork', 'customer service',
                'time management', 'negotiation', 'presentation skills'
            ]
        }

        description_lower = description.lower()
        found_skills = []

        # Match regular skills (substring match)
        for category, skills in skill_categories.items():
            if category == 'tech_exact':
                continue  # Handle separately
            for skill in skills:
                if skill in description_lower and skill not in found_skills:
                    found_skills.append(skill)
        
        # Match exact-word skills using word boundaries
        for skill in skill_categories.get('tech_exact', []):
            # Use word boundary regex to avoid false matches
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, description_lower) and skill not in found_skills:
                found_skills.append(skill)

        return found_skills[:15]  # Return max 15 skills


class RapidAPIJobClient(JobAPIClient):
    """RapidAPI Jobs Search client."""

    def __init__(self, api_key: str, timeout: int = 10):
        self.api_key = api_key
        self.timeout = timeout
        self.base_url = "https://jsearch.p.rapidapi.com/search"

    def fetch_jobs(self, location: str, keywords: Optional[List[str]] = None, limit: int = 20) -> List[Dict]:
        """Fetch jobs from RapidAPI."""
        try:
            query = " ".join(keywords) if keywords else "software developer"

            params = {
                "query": f"{query} in {location}, Philippines",
                "page": "1",
                "num_pages": "1"
            }

            headers = {
                "X-RapidAPI-Key": self.api_key,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }

            logger.info(f"Fetching jobs from RapidAPI for {location}")

            response = requests.get(
                self.base_url,
                headers=headers,
                params=params,
                timeout=self.timeout
            )

            if not self.validate_response(response):
                return []

            data = response.json()
            jobs = []

            for item in data.get('data', [])[:limit]:
                try:
                    job = self.transform_to_internal_format(item)
                    jobs.append(job)
                except Exception as e:
                    logger.warning(f"Failed to transform job: {e}")
                    continue

            logger.info(f"Successfully fetched {len(jobs)} jobs from RapidAPI")
            return jobs

        except Exception as e:
            logger.error(f"Error fetching jobs from RapidAPI: {e}")
            return []

    def transform_to_internal_format(self, external_job: Dict) -> Dict:
        """Transform RapidAPI job to internal format."""
        return {
            'id': f"rapidapi_{external_job.get('job_id', '')}",
            'title': external_job.get('job_title', 'Unknown Title'),
            'company': external_job.get('employer_name', 'Unknown Company'),
            'industry': 'Technology',
            'city': external_job.get('job_city', 'Philippines'),
            'required_skills': [],
            'preferred_skills': [],
            'min_experience': 2,
            'max_experience': 5,
            'education_required': 'Bachelors',
            'salary_min': external_job.get('job_min_salary', 50000),
            'salary_max': external_job.get('job_max_salary', 80000),
            'posted_date': external_job.get('job_posted_at_datetime_utc', datetime.now().isoformat()),
            'description': external_job.get('job_description', ''),
            'job_url': external_job.get('job_apply_link', ''),
            'job_source': 'rapidapi'
        }


class ApifyIndeedClient(JobAPIClient):
    """Indeed Jobs Scraper client via Apify (PPR actor)."""

    def __init__(self, api_key: str, timeout: int = 120):
        self.api_key = api_key
        self.timeout = timeout
        # Using the misceres/indeed-scraper actor
        self.base_url = "https://api.apify.com/v2/acts/misceres~indeed-scraper/run-sync-get-dataset-items"

    def fetch_jobs(self, location: str, keywords: Optional[List[str]] = None, limit: int = 20) -> List[Dict]:
        """Fetch jobs from Indeed via Apify."""
        try:
            # Build search position from keywords
            position = " ".join(keywords) if keywords else "software developer"

            payload = {
                "country": "PH",  # Philippines
                "location": location,
                "position": position,
                "maxItems": limit,
                "saveOnlyUniqueItems": True
            }

            headers = {
                "Content-Type": "application/json"
            }

            url = f"{self.base_url}?token={self.api_key}"

            print(f"[DEBUG] Fetching Indeed jobs for {location} with position: {position}")
            print(f"[DEBUG] Indeed API URL: {self.base_url}")
            print(f"[DEBUG] Indeed Payload: {payload}")
            logger.info(f"Fetching Indeed jobs for {location} with position: {position}")

            response = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=self.timeout
            )

            print(f"[DEBUG] Indeed Response status: {response.status_code}")

            if not self.validate_response(response):
                print(f"[ERROR] Indeed Response validation failed: {response.text[:500]}")
                return []

            data = response.json()
            print(f"[DEBUG] Indeed Response type: {type(data)}")
            print(f"[DEBUG] Indeed Response length: {len(data) if isinstance(data, list) else 'N/A'}")
            if data and isinstance(data, list) and len(data) > 0:
                print(f"[DEBUG] Indeed First item keys: {list(data[0].keys())}")
                print(f"[DEBUG] Indeed First item sample: {data[0]}")

            jobs = []

            for item in data:
                # Skip error responses
                if 'error' in item:
                    print(f"[DEBUG] Indeed returned error: {item['error']}")
                    continue
                    
                try:
                    job = self.transform_to_internal_format(item)
                    jobs.append(job)
                except Exception as e:
                    print(f"[ERROR] Failed to transform Indeed job: {e}")
                    logger.warning(f"Failed to transform Indeed job: {e}")
                    continue

            print(f"[SUCCESS] Successfully fetched {len(jobs)} jobs from Indeed")
            logger.info(f"Successfully fetched {len(jobs)} jobs from Indeed")
            return jobs

        except requests.Timeout:
            print(f"[ERROR] Indeed API request timed out after {self.timeout} seconds")
            logger.error(f"Indeed API request timed out after {self.timeout} seconds")
            return []
        except Exception as e:
            print(f"[ERROR] Error fetching jobs from Indeed Apify: {e}")
            import traceback
            traceback.print_exc()
            logger.error(f"Error fetching jobs from Indeed Apify: {e}")
            return []

    def transform_to_internal_format(self, external_job: Dict) -> Dict:
        """Transform Indeed job to internal format."""
        # Extract job type
        job_types = external_job.get('jobType', [])
        job_type_str = job_types[0] if job_types else 'Full-time'

        # Extract skills from description
        description = external_job.get('description', '')
        skills = self._extract_skills_from_description(description)

        # Parse salary
        salary_text = external_job.get('salary', '') or ''
        salary_min, salary_max = self._parse_salary(salary_text)

        return {
            'id': f"indeed_{external_job.get('id', '')}",
            'title': external_job.get('positionName', 'Unknown Title'),
            'company': external_job.get('company', 'Unknown Company'),
            'industry': self._infer_industry_from_title(external_job.get('positionName', '')),
            'city': external_job.get('location', 'Philippines'),
            'required_skills': skills[:5],
            'preferred_skills': skills[5:10],
            'min_experience': self._parse_experience(description),
            'max_experience': self._parse_experience(description, max_val=True),
            'education_required': 'Bachelors',
            'salary_min': salary_min,
            'salary_max': salary_max,
            'posted_date': external_job.get('postedAt', datetime.now().isoformat()),
            'description': description,
            'job_url': external_job.get('url', ''),
            'job_source': 'indeed'
        }

    def _infer_industry_from_title(self, title: str) -> str:
        """Infer industry from job title."""
        title_lower = title.lower()
        
        tech_keywords = ['software', 'developer', 'engineer', 'programmer', 'data', 'it ', 'devops', 'cloud', 'web', 'mobile', 'full stack', 'backend', 'frontend']
        finance_keywords = ['accountant', 'finance', 'banking', 'analyst', 'auditor', 'bookkeeper']
        healthcare_keywords = ['nurse', 'doctor', 'medical', 'healthcare', 'pharma', 'clinical']
        retail_keywords = ['sales', 'retail', 'customer', 'store', 'merchandis']
        design_keywords = ['designer', 'graphic', 'artist', 'illustrator', 'ui', 'ux', 'creative', 'visual', 'multimedia', 'animator', 'art director']
        marketing_keywords = ['marketing', 'social media', 'content', 'seo', 'digital marketing', 'brand']
        bpo_keywords = ['customer service', 'call center', 'support', 'bpo', 'csr']
        hr_keywords = ['hr', 'human resources', 'recruiter', 'recruitment', 'talent']
        admin_keywords = ['admin', 'assistant', 'secretary', 'clerk', 'office']
        
        for kw in design_keywords:
            if kw in title_lower:
                return 'Fine Arts & Design'
        for kw in tech_keywords:
            if kw in title_lower:
                return 'Technology'
        for kw in finance_keywords:
            if kw in title_lower:
                return 'Finance'
        for kw in healthcare_keywords:
            if kw in title_lower:
                return 'Healthcare'
        for kw in retail_keywords:
            if kw in title_lower:
                return 'Retail'
        for kw in marketing_keywords:
            if kw in title_lower:
                return 'Marketing'
        for kw in bpo_keywords:
            if kw in title_lower:
                return 'BPO'
        for kw in hr_keywords:
            if kw in title_lower:
                return 'Human Resources'
        for kw in admin_keywords:
            if kw in title_lower:
                return 'Administrative'
        
        return 'Technology'  # Default

    def _parse_salary(self, salary_text: str) -> tuple:
        """Parse salary range from text."""
        import re
        if not salary_text:
            return 50000, 80000
        
        cleaned = re.sub(r'[₱,$,PHP]', '', salary_text, flags=re.IGNORECASE)
        numbers = re.findall(r'\d+', cleaned)
        
        if len(numbers) >= 2:
            return int(numbers[0]), int(numbers[1])
        elif len(numbers) == 1:
            return int(numbers[0]), int(int(numbers[0]) * 1.3)
        return 50000, 80000

    def _parse_experience(self, exp_text: str, max_val: bool = False) -> int:
        """Parse experience years from text."""
        import re
        exp_patterns = [
            r'(\d+)\+?\s*(?:to|-)\s*(\d+)\s*years?',
            r'(\d+)\s*years?',
            r'(\d+)\+?\s*yrs?'
        ]
        
        for pattern in exp_patterns:
            match = re.search(pattern, exp_text.lower())
            if match:
                groups = match.groups()
                if max_val and len(groups) > 1 and groups[1]:
                    return int(groups[1])
                return int(groups[0])
        
        return 3 if not max_val else 5

    def _extract_skills_from_description(self, description: str) -> List[str]:
        """Extract skills from job description using word boundary matching."""
        import re
        
        # Comprehensive skill list covering multiple industries
        skill_categories = {
            'tech': [
                'python', 'javascript', 'java', 'react', 'node.js', 'sql',
                'aws', 'docker', 'kubernetes', 'agile', 'scrum',
                'html', 'css', 'typescript', 'mongodb', 'postgresql',
                'angular', 'vue.js', 'laravel', 'django', 'flask',
                'c#', '.net', 'ruby', 'rust', 'swift', 'kotlin',
                'machine learning', 'data analysis', 'devops', 'api development'
            ],
            'tech_exact': ['git', 'php', 'go', 'vue'],  # These need word boundary matching
            'design': [
                'photoshop', 'illustrator', 'figma', 'sketch', 'adobe',
                'indesign', 'after effects', 'premiere', 'lightroom',
                'ui design', 'ux design', 'graphic design', 'web design',
                'visual design', 'branding', 'typography', 'layout design',
                'wireframing', 'prototyping', 'animation', 'motion graphics',
                '3d modeling', 'blender', 'maya', 'cinema 4d', 'creative design',
                'canva', 'coreldraw', 'logo design', 'illustration'
            ],
            'marketing': [
                'seo', 'sem', 'ppc', 'social media marketing', 'content marketing',
                'email marketing', 'google analytics', 'facebook ads',
                'copywriting', 'brand management', 'market research'
            ],
            'finance': [
                'accounting', 'bookkeeping', 'quickbooks', 'excel', 'sap',
                'financial analysis', 'budgeting', 'auditing', 'taxation',
                'payroll', 'accounts payable', 'accounts receivable'
            ],
            'general': [
                'microsoft office', 'powerpoint', 'word processing',
                'communication skills', 'leadership', 'project management',
                'problem solving', 'teamwork', 'customer service',
                'time management', 'negotiation', 'presentation skills'
            ]
        }
        
        description_lower = description.lower()
        found_skills = []
        
        # Match regular skills (substring match)
        for category, skills in skill_categories.items():
            if category == 'tech_exact':
                continue  # Handle separately
            for skill in skills:
                if skill in description_lower and skill not in found_skills:
                    found_skills.append(skill)
        
        # Match exact-word skills using word boundaries
        for skill in skill_categories.get('tech_exact', []):
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, description_lower) and skill not in found_skills:
                found_skills.append(skill)
        
        return found_skills[:15]


class JobAPIOrchestrator:
    """Orchestrates multiple job API providers with fallback logic."""

    def __init__(self, settings):
        self.settings = settings
        self.clients = {}
        self._init_clients()
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = settings.JOB_CACHE_TTL

    def _init_clients(self):
        """Initialize available API clients."""
        if self.settings.APIFY_API_KEY:
            # JobStreet client
            self.clients['apify'] = ApifyJobStreetClient(
                self.settings.APIFY_API_KEY,
                timeout=self.settings.API_TIMEOUT
            )
            logger.info("Initialized Apify JobStreet client")
            
            # Indeed client (also uses Apify)
            self.clients['indeed'] = ApifyIndeedClient(
                self.settings.APIFY_API_KEY,
                timeout=self.settings.API_TIMEOUT
            )
            logger.info("Initialized Apify Indeed client")

        if self.settings.RAPIDAPI_KEY:
            self.clients['rapidapi'] = RapidAPIJobClient(
                self.settings.RAPIDAPI_KEY,
                timeout=self.settings.API_TIMEOUT
            )
            logger.info("Initialized RapidAPI client")

    def fetch_jobs(self, location: str, keywords: Optional[List[str]] = None, limit: int = 20) -> List[Dict]:
        """
        Fetch jobs with fallback mechanism.

        Tries primary API first, then falls back to other providers.
        """
        # Check cache first
        cache_key = f"{location}_{','.join(keywords or [])}_{limit}"
        if self.settings.ENABLE_CACHE and cache_key in self.cache:
            cache_entry = self.cache[cache_key]
            if time.time() - cache_entry['timestamp'] < self.cache_ttl:
                logger.info(f"Returning cached jobs for {location}")
                return cache_entry['jobs']

        # Try primary API
        primary_api = self.settings.PRIMARY_JOB_API

        if primary_api in self.clients:
            jobs = self._fetch_with_retry(
                self.clients[primary_api],
                location,
                keywords,
                limit
            )

            if jobs:
                # Cache results
                if self.settings.ENABLE_CACHE:
                    self.cache[cache_key] = {
                        'jobs': jobs,
                        'timestamp': time.time()
                    }
                return jobs

        # Try fallback APIs
        if self.settings.ENABLE_FALLBACK:
            for api_name, client in self.clients.items():
                if api_name != primary_api:
                    logger.info(f"Trying fallback API: {api_name}")
                    jobs = self._fetch_with_retry(client, location, keywords, limit)
                    if jobs:
                        return jobs

        logger.warning("All APIs failed, returning empty list")
        return []

    def _fetch_with_retry(self, client: JobAPIClient, location: str,
                         keywords: Optional[List[str]], limit: int) -> List[Dict]:
        """Fetch jobs with exponential backoff retry."""
        for attempt in range(self.settings.API_RETRY_COUNT):
            try:
                jobs = client.fetch_jobs(location, keywords, limit)
                if jobs:
                    return jobs
            except Exception as e:
                logger.error(f"Attempt {attempt + 1} failed: {e}")
                if attempt < self.settings.API_RETRY_COUNT - 1:
                    sleep_time = 2 ** attempt  # Exponential backoff
                    time.sleep(sleep_time)

        return []
