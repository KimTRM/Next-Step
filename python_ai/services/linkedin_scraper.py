"""
LinkedIn Profile Scraper Service
Uses Apify's LinkedIn Profile Scraper to fetch public profile data.
"""
import requests
import logging
import re
from typing import Dict, List, Optional
import time

logger = logging.getLogger(__name__)


class LinkedInScraper:
    """
    Scrape LinkedIn profile data using Apify's LinkedIn Profile Scraper.
    Uses the cheapest actor: https://apify.com/anchor/linkedin-profile-scraper
    """
    
    # Apify actor for LinkedIn profile scraping (pay-per-result, very cheap)
    ACTOR_ID = "anchor/linkedin-profile-scraper"
    
    def __init__(self, api_key: str, timeout: int = 60):
        """Initialize LinkedIn scraper with Apify API key."""
        self.api_key = api_key
        self.timeout = timeout
        self.base_url = "https://api.apify.com/v2"
        
    def is_valid_linkedin_url(self, url: str) -> bool:
        """Check if URL is a valid LinkedIn profile URL."""
        if not url:
            return False
        
        # Match patterns like:
        # https://www.linkedin.com/in/username
        # https://linkedin.com/in/username
        # http://www.linkedin.com/in/username/
        pattern = r'^https?://(www\.)?linkedin\.com/in/[\w\-]+/?$'
        return bool(re.match(pattern, url.strip()))
    
    def extract_username(self, url: str) -> Optional[str]:
        """Extract username from LinkedIn URL."""
        if not url:
            return None
        
        match = re.search(r'linkedin\.com/in/([\w\-]+)', url)
        return match.group(1) if match else None
    
    def scrape_profile(self, linkedin_url: str) -> Dict:
        """
        Scrape a LinkedIn profile and return structured data.
        
        Args:
            linkedin_url: Full LinkedIn profile URL
            
        Returns:
            Dictionary with profile data or error information
        """
        if not self.api_key:
            logger.warning("Apify API key not configured for LinkedIn scraping")
            return {"error": "LinkedIn scraping not configured", "scraped": False}
        
        if not self.is_valid_linkedin_url(linkedin_url):
            return {"error": "Invalid LinkedIn URL", "scraped": False}
        
        logger.info(f"Scraping LinkedIn profile: {linkedin_url}")
        
        try:
            # Run the Apify actor
            run_url = f"{self.base_url}/acts/{self.ACTOR_ID}/runs"
            
            payload = {
                "profileUrls": [linkedin_url],
                "proxyConfiguration": {
                    "useApifyProxy": True
                }
            }
            
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Start the actor run
            response = requests.post(
                run_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 201:
                logger.error(f"Failed to start LinkedIn scraper: {response.status_code}")
                return {"error": f"Scraper failed to start: {response.status_code}", "scraped": False}
            
            run_data = response.json()
            run_id = run_data.get("data", {}).get("id")
            
            if not run_id:
                return {"error": "Failed to get run ID", "scraped": False}
            
            # Wait for the run to complete
            result = self._wait_for_run(run_id)
            
            if result:
                return self._transform_profile_data(result)
            else:
                return {"error": "Scraping timed out or failed", "scraped": False}
                
        except requests.Timeout:
            logger.error("LinkedIn scraping timed out")
            return {"error": "Request timed out", "scraped": False}
        except Exception as e:
            logger.error(f"LinkedIn scraping failed: {e}")
            return {"error": str(e), "scraped": False}
    
    def _wait_for_run(self, run_id: str, max_wait: int = 60) -> Optional[Dict]:
        """Wait for Apify actor run to complete and return results."""
        status_url = f"{self.base_url}/actor-runs/{run_id}"
        dataset_url = f"{self.base_url}/actor-runs/{run_id}/dataset/items"
        
        headers = {"Authorization": f"Bearer {self.api_key}"}
        
        start_time = time.time()
        while time.time() - start_time < max_wait:
            try:
                # Check run status
                status_response = requests.get(status_url, headers=headers, timeout=10)
                if status_response.status_code == 200:
                    status_data = status_response.json()
                    status = status_data.get("data", {}).get("status")
                    
                    if status == "SUCCEEDED":
                        # Get results
                        results_response = requests.get(dataset_url, headers=headers, timeout=10)
                        if results_response.status_code == 200:
                            results = results_response.json()
                            if results and len(results) > 0:
                                return results[0]
                        break
                    elif status in ["FAILED", "ABORTED", "TIMED-OUT"]:
                        logger.error(f"LinkedIn scraper run failed with status: {status}")
                        break
                
                time.sleep(3)  # Poll every 3 seconds
                
            except Exception as e:
                logger.error(f"Error checking run status: {e}")
                time.sleep(3)
        
        return None
    
    def _transform_profile_data(self, raw_data: Dict) -> Dict:
        """Transform raw Apify response to our internal format."""
        try:
            # Extract relevant fields from LinkedIn profile
            skills = []
            
            # Extract skills from the skills section
            if raw_data.get("skills"):
                skills = [s.get("name", "") for s in raw_data.get("skills", []) if s.get("name")]
            
            # Extract experience
            experiences = []
            total_years = 0
            for exp in raw_data.get("experiences", []):
                title = exp.get("title", "")
                company = exp.get("company", "")
                duration = exp.get("duration", "")
                
                if title:
                    experiences.append({
                        "title": title,
                        "company": company,
                        "duration": duration
                    })
                
                # Try to parse years from duration
                if duration:
                    years_match = re.search(r'(\d+)\s*(?:yr|year)', duration.lower())
                    if years_match:
                        total_years += int(years_match.group(1))
            
            # Extract education
            education = []
            for edu in raw_data.get("education", []):
                school = edu.get("school", "")
                degree = edu.get("degree", "")
                if school:
                    education.append({
                        "school": school,
                        "degree": degree
                    })
            
            # Extract certifications
            certifications = []
            for cert in raw_data.get("certifications", []):
                name = cert.get("name", "")
                if name:
                    certifications.append(name)
            
            return {
                "scraped": True,
                "name": raw_data.get("name", ""),
                "headline": raw_data.get("headline", ""),
                "location": raw_data.get("location", ""),
                "summary": raw_data.get("about", ""),
                "skills": skills[:20],  # Limit to 20 skills
                "experiences": experiences[:10],  # Limit to 10 experiences
                "experience_years": total_years,
                "education": education[:5],
                "certifications": certifications[:10],
                "connection_count": raw_data.get("connectionsCount", 0),
                "profile_picture": raw_data.get("profilePicture", ""),
            }
            
        except Exception as e:
            logger.error(f"Failed to transform LinkedIn data: {e}")
            return {"error": f"Failed to parse profile: {e}", "scraped": False}
    
    def calculate_profile_boost(self, profile_data: Dict) -> Dict:
        """
        Calculate confidence boost based on LinkedIn profile completeness.
        
        Returns:
            Dict with boost_percentage and breakdown
        """
        if not profile_data.get("scraped"):
            return {
                "boost_percentage": -5,  # Small penalty for no LinkedIn
                "reason": "No LinkedIn profile provided",
                "breakdown": {}
            }
        
        boost = 0
        breakdown = {}
        
        # Skills section (up to +5%)
        skills_count = len(profile_data.get("skills", []))
        if skills_count >= 10:
            boost += 5
            breakdown["skills"] = f"+5% ({skills_count} skills)"
        elif skills_count >= 5:
            boost += 3
            breakdown["skills"] = f"+3% ({skills_count} skills)"
        elif skills_count > 0:
            boost += 1
            breakdown["skills"] = f"+1% ({skills_count} skills)"
        
        # Experience section (up to +4%)
        exp_count = len(profile_data.get("experiences", []))
        if exp_count >= 3:
            boost += 4
            breakdown["experience"] = f"+4% ({exp_count} positions)"
        elif exp_count >= 1:
            boost += 2
            breakdown["experience"] = f"+2% ({exp_count} positions)"
        
        # Education section (up to +2%)
        edu_count = len(profile_data.get("education", []))
        if edu_count >= 1:
            boost += 2
            breakdown["education"] = f"+2% ({edu_count} entries)"
        
        # Summary/About section (up to +2%)
        if profile_data.get("summary") and len(profile_data.get("summary", "")) > 50:
            boost += 2
            breakdown["summary"] = "+2% (has profile summary)"
        
        # Certifications (up to +2%)
        cert_count = len(profile_data.get("certifications", []))
        if cert_count >= 2:
            boost += 2
            breakdown["certifications"] = f"+2% ({cert_count} certifications)"
        elif cert_count == 1:
            boost += 1
            breakdown["certifications"] = f"+1% ({cert_count} certification)"
        
        return {
            "boost_percentage": min(boost, 15),  # Cap at 15%
            "reason": f"LinkedIn profile verified with {skills_count} skills, {exp_count} experiences",
            "breakdown": breakdown
        }
