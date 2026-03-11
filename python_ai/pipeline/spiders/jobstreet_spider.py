"""
Scrapy spider for JobStreet Philippines.
Rate-limited (2s delay), respects robots.txt.

Usage:
    scrapy runspider python_ai/pipeline/spiders/jobstreet_spider.py \
        -o python_ai/data/raw/jobstreet_jobs.jsonl
"""
import scrapy
from datetime import datetime
from typing import Generator


class JobStreetSpider(scrapy.Spider):
    name = "jobstreet_ph"
    allowed_domains = ["jobstreet.com.ph"]
    base_url = "https://www.jobstreet.com.ph/en/job-search/{keyword}-jobs/"

    custom_settings = {
        "DOWNLOAD_DELAY": 2,
        "AUTOTHROTTLE_ENABLED": True,
        "AUTOTHROTTLE_START_DELAY": 2,
        "AUTOTHROTTLE_MAX_DELAY": 10,
        "ROBOTSTXT_OBEY": True,
        "USER_AGENT": (
            "Mozilla/5.0 (compatible; PHJobMatcherBot/1.0; "
            "+https://github.com/nextstep)"
        ),
        "FEEDS": {
            "python_ai/data/raw/jobstreet_jobs.jsonl": {"format": "jsonlines"},
        },
    }

    keywords = [
        "software engineer", "data scientist", "nurse", "accountant",
        "bpo agent", "civil engineer", "teacher", "architect",
        "marketing manager", "financial analyst", "web developer",
        "graphic designer", "medical technologist", "project manager",
        "customer service representative", "human resources",
    ]

    def start_requests(self) -> Generator:
        for kw in self.keywords:
            url = self.base_url.format(keyword=kw.replace(" ", "-"))
            yield scrapy.Request(
                url,
                callback=self.parse,
                meta={"keyword": kw, "page": 1},
            )

    def parse(self, response):
        for job in response.css("article.job-card, [data-automation='job-card']"):
            yield {
                "title": (
                    job.css("h1.job-title::text, [data-automation='job-title']::text").get("").strip()
                ),
                "company": (
                    job.css(".company-name::text, [data-automation='job-company-name']::text").get("").strip()
                ),
                "location": (
                    job.css(".location::text, [data-automation='job-location']::text").get("").strip()
                ),
                "skills": job.css(".skill-tag::text, [data-automation='job-tag']::text").getall(),
                "description": job.css(".job-description::text").get("").strip(),
                "source": "jobstreet_ph",
                "keyword": response.meta["keyword"],
                "scraped_at": datetime.utcnow().isoformat(),
                "source_url": job.css("a::attr(href)").get(""),
            }

        # Pagination
        next_page = response.css(
            "a[data-automation='page-next']::attr(href), "
            ".pagination-next a::attr(href)"
        ).get()
        page = response.meta["page"]
        if next_page and page < 5:  # max 5 pages per keyword
            yield response.follow(
                next_page,
                callback=self.parse,
                meta={"keyword": response.meta["keyword"], "page": page + 1},
            )
