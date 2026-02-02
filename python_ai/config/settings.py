"""
Configuration settings for Job Matcher API.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings with environment variable support."""

    # API Keys
    APIFY_API_KEY = os.getenv('APIFY_API_KEY', '')
    RAPIDAPI_KEY = os.getenv('RAPIDAPI_KEY', '')
    ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
    ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

    # Job API Settings
    # Options: apify (JobStreet), indeed (Indeed via Apify), rapidapi
    PRIMARY_JOB_API = os.getenv('PRIMARY_JOB_API', 'indeed')  # apify | indeed | rapidapi | synthetic
    ENABLE_FALLBACK = os.getenv('ENABLE_FALLBACK', 'true').lower() == 'true'
    API_TIMEOUT = int(os.getenv('API_TIMEOUT', '120'))  # Apify scraping needs time
    API_RETRY_COUNT = int(os.getenv('API_RETRY_COUNT', '3'))

    # Philippine Cities - Naga City as priority
    PHILIPPINE_CITIES = [
        'Naga City',  # Priority location
        'Manila',
        'Quezon City',
        'Makati',
        'Taguig',
        'Pasig',
        'Cebu City',
        'Davao City',
        'Iloilo City',
        'Bacolod',
        'Cagayan de Oro',
        'General Santos',
        'Zamboanga City',
        'Remote Philippines'
    ]

    # Cache Settings
    JOB_CACHE_TTL = int(os.getenv('JOB_CACHE_TTL', '3600'))  # 1 hour in seconds
    ENABLE_CACHE = os.getenv('ENABLE_CACHE', 'true').lower() == 'true'

    # Database
    DB_PATH = os.getenv('DB_PATH', 'jobs.db')

    # Feature Flags
    USE_REAL_JOBS = os.getenv('USE_REAL_JOBS', 'false').lower() == 'true'
    KEEP_SYNTHETIC_FALLBACK = os.getenv('KEEP_SYNTHETIC_FALLBACK', 'true').lower() == 'true'

    @classmethod
    def validate(cls):
        """Validate configuration settings."""
        if cls.USE_REAL_JOBS and not cls.APIFY_API_KEY:
            print("Warning: USE_REAL_JOBS is enabled but APIFY_API_KEY is not set. Falling back to synthetic data.")
            cls.USE_REAL_JOBS = False

        return True


# Create a singleton instance
settings = Settings()
settings.validate()
