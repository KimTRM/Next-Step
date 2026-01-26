/**
 * Jobs Feature - Constants
 */

import type { EmploymentType } from "./types";

// Job categories for filtering
export const JOB_CATEGORIES = [
    "all",
    "technology",
    "business",
    "marketing",
    "customer-service",
    "healthcare",
    "finance",
    "education",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

// Employment types
export const JOB_TYPES: EmploymentType[] = [
    "full-time",
    "part-time",
    "internship",
    "contract",
    "temporary",
];

// Experience levels with labels
export const EXPERIENCE_LEVELS = [
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior Level" },
    { value: "lead", label: "Lead" },
    { value: "executive", label: "Executive" },
] as const;

// Location types with labels
export const LOCATION_TYPES = [
    { value: "on-site", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
] as const;

// Education levels with labels
export const EDUCATION_LEVELS = [
    { value: "none", label: "No Requirement" },
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate Degree" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
] as const;

// Employment type labels
export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
    "full-time": "Full-time",
    "part-time": "Part-time",
    contract: "Contract",
    internship: "Internship",
    temporary: "Temporary",
};
