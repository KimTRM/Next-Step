"""
Combinatorial synthetic data generator.
Cross-products industries × roles × experience levels × education levels
× skill variants × PH regions × PRC/TESDA certifications.

Targets 50M+ unique combinations. Outputs JSONL.

Usage:
    python python_ai/data/synthetic/combinatorial_generator.py \
        --limit 10000 --output python_ai/data/labeled/synthetic_pairs.jsonl
"""
from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Generator, List

try:
    from faker import Faker
    fake = Faker("en_PH")
except ImportError:
    fake = None

TAXONOMY_PATH = Path(__file__).parents[2] / "data" / "taxonomies" / "ph_skills.json"

# ---------------------------------------------------------------------------
# Industry / niche / role / skill matrix
# ---------------------------------------------------------------------------

INDUSTRY_MATRIX = {
    "Technology": {
        "niches": ["MLOps", "DevSecOps", "Blockchain", "AR/VR", "QA Automation",
                   "Cloud Infrastructure", "Embedded Systems", "Cybersecurity"],
        "roles": ["Software Engineer", "Data Scientist", "DevOps Engineer",
                  "Mobile Developer", "Cloud Architect", "QA Engineer", "Data Analyst"],
        "core_skills": ["Python", "JavaScript", "TypeScript", "SQL", "Git",
                        "Docker", "AWS", "React", "PostgreSQL", "Machine Learning"],
        "niche_skills": {
            "MLOps": ["MLOps", "TensorFlow", "PyTorch", "scikit-learn", "Apache Spark"],
            "DevSecOps": ["DevSecOps", "CI/CD", "Linux", "Docker", "Kubernetes"],
            "Blockchain": ["Blockchain", "JavaScript", "Python", "Go"],
            "QA Automation": ["QA Automation", "Python", "JavaScript"],
            "Cloud Infrastructure": ["AWS", "Azure", "Google Cloud", "Kubernetes"],
        },
    },
    "Healthcare": {
        "niches": ["Telemedicine", "Medical Coding", "Radiology Tech",
                   "Barangay Health", "Occupational Therapy", "Dental"],
        "roles": ["Registered Nurse", "Medical Technologist", "Pharmacist",
                  "Physical Therapist", "Radiologic Technologist", "Doctor"],
        "core_skills": ["Nursing (PRC)", "Electronic Health Records", "Patient Care",
                        "Medical Technology", "Clinical Assessment"],
        "niche_skills": {
            "Telemedicine": ["Telemedicine", "Electronic Health Records"],
            "Medical Coding": ["Medical Coding", "Electronic Health Records"],
        },
        "certifications": ["Nursing (PRC)", "Medicine (PRC)", "Medical Technology",
                           "Pharmacy", "Physical Therapy"],
    },
    "Finance": {
        "niches": ["Fintech", "Actuarial Science", "Islamic Banking",
                   "Tax Compliance", "Anti-Money Laundering"],
        "roles": ["Accountant", "Financial Analyst", "Auditor", "Tax Consultant",
                  "Treasury Analyst", "Compliance Officer"],
        "core_skills": ["Accountancy (CPA)", "Financial Analysis", "SAP", "SQL",
                        "Microsoft Office", "Bookkeeping"],
        "certifications": ["Accountancy (CPA)"],
    },
    "BPO/Outsourcing": {
        "niches": ["Voice BPO", "Non-Voice BPO", "Healthcare BPO",
                   "Legal Process Outsourcing", "Finance BPO"],
        "roles": ["Customer Service Representative", "Team Lead", "Quality Analyst",
                  "Operations Manager", "Technical Support Specialist"],
        "core_skills": ["Customer Service", "English Proficiency", "Communication Skills",
                        "Microsoft Office", "Voice BPO"],
        "niche_skills": {
            "Healthcare BPO": ["Healthcare BPO", "Medical Coding", "Electronic Health Records"],
            "Legal Process Outsourcing": ["Legal Process Outsourcing", "Legal Research"],
        },
    },
    "Education": {
        "niches": ["SPED", "Early Childhood (ECCD)", "K-12 DepEd",
                   "HEI Professor", "TESDA Assessor", "Online Tutor"],
        "roles": ["Teacher", "Professor", "Trainer", "Curriculum Developer",
                  "School Administrator"],
        "core_skills": ["Teaching (LET)", "Curriculum Development", "Communication Skills",
                        "Microsoft Office", "English Proficiency"],
        "certifications": ["Teaching (LET)", "TESDA NC II"],
    },
    "Construction": {
        "niches": ["Green Building", "Structural Engineering", "CADD",
                   "Quantity Surveying", "Project Management"],
        "roles": ["Civil Engineer", "Architect", "Structural Engineer",
                  "Project Manager", "Safety Officer", "Quantity Surveyor"],
        "core_skills": ["Civil Engineering (PRC)", "AutoCAD", "Microsoft Office",
                        "Project Management", "DOLE Safety Officer"],
        "certifications": ["Civil Engineering (PRC)", "Architecture (PRC)", "DOLE Safety Officer"],
    },
    "Maritime": {
        "niches": ["Deck Officer", "Marine Engineer", "STCW Specialist",
                   "Port Logistics", "Marine Surveyor"],
        "roles": ["Deck Officer", "Marine Engineer", "Port Operator",
                  "Marine Surveyor", "Logistics Coordinator"],
        "core_skills": ["Marine Officer (STCW)", "Port Logistics", "Marine Engineering"],
        "certifications": ["Marine Officer (STCW)"],
    },
    "Agriculture": {
        "niches": ["Precision Farming", "Aquaculture", "AgriTech",
                   "Farm Management", "Veterinary"],
        "roles": ["Agronomist", "Aquaculturist", "Veterinarian",
                  "Farm Manager", "AgriTech Specialist"],
        "core_skills": ["Agronomy", "Aquaculture", "Veterinary Medicine (PRC)", "AgriTech"],
        "certifications": ["Veterinary Medicine (PRC)"],
    },
    "Creative/Media": {
        "niches": ["UX/UI Design", "Game Dev", "Motion Graphics",
                   "Content Creator", "Film Production", "Photography"],
        "roles": ["UI/UX Designer", "Graphic Designer", "Video Editor",
                  "Game Developer", "Content Creator", "Photographer"],
        "core_skills": ["UI/UX Design", "Figma", "Adobe Photoshop",
                        "Adobe Illustrator", "Content Creation"],
    },
    "Legal/Compliance": {
        "niches": ["Corporate Paralegal", "IP Law", "Anti-Money Laundering",
                   "PDPA Compliance", "Labor Law"],
        "roles": ["Lawyer", "Paralegal", "Compliance Officer",
                  "Corporate Secretary", "Legal Researcher"],
        "core_skills": ["BAR Exam (Lawyer)", "Legal Research", "PDPA Compliance",
                        "Anti-Money Laundering", "Corporate Paralegal"],
        "certifications": ["BAR Exam (Lawyer)"],
    },
    "Tourism/Hospitality": {
        "niches": ["MICE Events", "Hotel F&B", "Tour Guiding",
                   "Cruise Ship", "Casino Operations"],
        "roles": ["Hotel Manager", "Tour Guide", "Events Coordinator",
                  "F&B Manager", "Front Office Supervisor"],
        "core_skills": ["Hotel Management", "Food & Beverage", "Tour Guiding (DOT)",
                        "MICE Events", "Communication Skills"],
        "certifications": ["Tour Guiding (DOT)"],
    },
    "Energy/Utilities": {
        "niches": ["Solar Installation", "WESM Trading", "Oil & Gas",
                   "Plant Operation", "Electrical Engineering"],
        "roles": ["Electrical Engineer", "Solar Technician", "Plant Operator",
                  "Energy Trader", "Power Systems Engineer"],
        "core_skills": ["Solar Energy", "Electrical Engineering (PE)", "WESM Trading"],
        "certifications": ["Electrical Engineering (PE)"],
    },
    "Retail/E-Commerce": {
        "niches": ["Lazada/Shopee Seller Ops", "Inventory Management",
                   "Visual Merchandising", "Supply Chain", "Logistics"],
        "roles": ["Store Manager", "E-Commerce Specialist", "Inventory Analyst",
                  "Logistics Coordinator", "Visual Merchandiser"],
        "core_skills": ["Supply Chain Management", "E-Commerce Operations",
                        "Visual Merchandising", "Microsoft Office"],
    },
    "Government": {
        "niches": ["LGU Admin", "DILG", "DOST Researcher",
                   "PhilHealth Officer", "BIR Examiner"],
        "roles": ["Government Employee", "Public Administrator", "Policy Analyst",
                  "Researcher", "Revenue Officer"],
        "core_skills": ["Government Administration", "Civil Service Eligibility",
                        "Microsoft Office", "Communication Skills"],
        "certifications": ["Civil Service Eligibility"],
    },
}

EXPERIENCE_LEVELS = [
    {"level": "Entry", "min_yrs": 0, "max_yrs": 1, "resume_yrs_range": (0, 1)},
    {"level": "Junior", "min_yrs": 1, "max_yrs": 3, "resume_yrs_range": (1, 3)},
    {"level": "Mid", "min_yrs": 3, "max_yrs": 5, "resume_yrs_range": (2, 6)},
    {"level": "Senior", "min_yrs": 5, "max_yrs": 10, "resume_yrs_range": (4, 12)},
    {"level": "Executive", "min_yrs": 10, "max_yrs": 20, "resume_yrs_range": (8, 25)},
]

EDUCATION_LEVELS = [
    "High School", "TESDA NC", "Associate", "Bachelor's", "Master's", "PhD"
]

PH_REGIONS = [
    "NCR", "CAR", "Region I", "Region II", "Region III", "Region IV-A (CALABARZON)",
    "Region IV-B (MIMAROPA)", "Region V (Bicol)", "Region VI (Western Visayas)",
    "Region VII (Central Visayas)", "Region VIII (Eastern Visayas)",
    "Region IX (Zamboanga Peninsula)", "Region X (Northern Mindanao)",
    "Region XI (Davao)", "Region XII (SOCCSKSARGEN)", "Region XIII (Caraga)",
    "BARMM", "OFW/Overseas",
]

PH_SCHOOLS = [
    "UP Diliman", "De La Salle University", "Ateneo de Manila", "UST",
    "PLM", "FEU", "Mapua University", "Batangas State U", "Cebu IT",
    "Xavier University", "MSU", "Bicol University", "Silliman University",
]

CAREER_PATHS = [
    "fresh_grad", "experienced", "career_shifter", "ofw_return", "returning_parent"
]


# ---------------------------------------------------------------------------
# Generators
# ---------------------------------------------------------------------------

def _make_job(industry: str, config: dict, niche: str, role: str,
              exp_level: dict, edu_required: str, region: str) -> dict:
    core = config.get("core_skills", [])
    niche_skills = config.get("niche_skills", {}).get(niche, [])
    cert_skills = config.get("certifications", [])

    # Sample 5-12 skills
    all_pool = list(set(core + niche_skills + cert_skills))
    n_skills = random.randint(5, min(12, len(all_pool)))
    required_skills = random.sample(all_pool, n_skills)

    company = fake.company() if fake else f"Company_{random.randint(1, 9999)}"

    return {
        "title": f"{exp_level['level']} {role}",
        "company": company,
        "location": random.choice(["Manila", "Cebu City", "Davao", "Naga City", "Remote"]),
        "region": region,
        "required_skills": required_skills,
        "min_experience": exp_level["min_yrs"],
        "max_experience": exp_level["max_yrs"],
        "education_required": edu_required,
        "industry": industry,
        "niche": niche,
        "certifications": cert_skills[:2],
        "source": "synthetic",
    }


def _make_resume(industry: str, config: dict, exp_level: dict,
                 edu_level: str, region: str, career_path: str,
                 job_skills: list) -> dict:
    core = config.get("core_skills", [])
    cert_skills = config.get("certifications", [])

    # Vary skill overlap based on match intent
    if career_path == "career_shifter":
        # Low overlap
        n_matching = random.randint(0, max(1, len(job_skills) // 4))
    else:
        # Higher overlap
        n_matching = random.randint(
            len(job_skills) // 3,
            max(len(job_skills) // 3, min(len(job_skills), len(job_skills) - 1)),
        )

    matched = random.sample(job_skills, min(n_matching, len(job_skills)))
    extra_pool = list(set(core) - set(matched))
    n_extra = random.randint(0, min(5, len(extra_pool)))
    extra = random.sample(extra_pool, n_extra)

    skills = list(set(matched + extra))
    random.shuffle(skills)

    resume_yrs = random.uniform(*exp_level["resume_yrs_range"])
    if career_path == "fresh_grad":
        resume_yrs = random.uniform(0, 1)
    elif career_path == "ofw_return":
        resume_yrs = random.uniform(3, 15)

    school = random.choice(PH_SCHOOLS)
    certs = random.sample(cert_skills, min(1, len(cert_skills))) if cert_skills else []

    return {
        "skills": skills,
        "experience_yrs": round(resume_yrs, 1),
        "education": {"degree": edu_level, "school": school},
        "certifications": certs,
        "industry": industry,
        "region": region,
        "source": "synthetic",
        "career_path": career_path,
    }


def _pair_confidence(resume: dict, job: dict) -> float:
    """Compute a rough confidence for the synthetic pair."""
    from pipeline.labeling.rule_labeler import label_pair
    confidence, _ = label_pair(resume, job)
    # Add small noise
    noise = random.gauss(0, 0.03)
    return round(min(1.0, max(0.0, confidence + noise)), 4)


def generate_pairs(limit: int = 10000) -> Generator[dict, None, None]:
    """Generate synthetic resume-job pairs up to `limit`."""
    count = 0
    # Cycle through all combinations
    industries = list(INDUSTRY_MATRIX.keys())

    for industry in itertools.cycle(industries):
        if count >= limit:
            break

        config = INDUSTRY_MATRIX[industry]
        niches = config.get("niches", ["General"])
        roles = config.get("roles", ["Specialist"])

        niche = random.choice(niches)
        role = random.choice(roles)
        exp_level = random.choice(EXPERIENCE_LEVELS)
        edu_required = random.choice(EDUCATION_LEVELS)
        region = random.choice(PH_REGIONS)
        career_path = random.choice(CAREER_PATHS)
        edu_level = random.choice(EDUCATION_LEVELS)

        job = _make_job(industry, config, niche, role, exp_level, edu_required, region)
        resume = _make_resume(industry, config, exp_level, edu_level, region,
                              career_path, job["required_skills"])

        confidence = _pair_confidence(resume, job)

        pair = {
            "job": job,
            "resume": resume,
            "confidence": confidence,
            "label_method": "rule_based",
            "split": _assign_split(),
            "generated_at": datetime.utcnow().isoformat(),
        }
        yield pair
        count += 1


def _assign_split() -> str:
    r = random.random()
    if r < 0.8:
        return "train"
    elif r < 0.9:
        return "val"
    return "test"


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic PH job-resume pairs")
    parser.add_argument("--limit", type=int, default=10000, help="Number of pairs to generate")
    parser.add_argument("--output", default="python_ai/data/labeled/synthetic_pairs.jsonl")
    args = parser.parse_args()

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)

    print(f"Generating {args.limit:,} synthetic pairs → {args.output}")
    count = 0
    with open(args.output, "w", encoding="utf-8") as f:
        for pair in generate_pairs(limit=args.limit):
            f.write(json.dumps(pair, ensure_ascii=False) + "\n")
            count += 1
            if count % 1000 == 0:
                print(f"  Generated {count:,}/{args.limit:,}...")

    print(f"\nDone. {count:,} pairs saved to {args.output}")
    print(f"Estimated total combinations: {_estimate_combinations():,}")


def _estimate_combinations() -> int:
    industries = len(INDUSTRY_MATRIX)
    avg_niches = sum(len(v.get("niches", [])) for v in INDUSTRY_MATRIX.values()) / industries
    avg_roles = sum(len(v.get("roles", [])) for v in INDUSTRY_MATRIX.values()) / industries
    return int(
        industries * avg_niches * avg_roles
        * len(EXPERIENCE_LEVELS) * len(EDUCATION_LEVELS)
        * len(PH_REGIONS) * len(CAREER_PATHS)
        * 100  # skill variants
    )


if __name__ == "__main__":
    main()
