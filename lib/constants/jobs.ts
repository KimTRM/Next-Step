export type JobType = "full-time" | "part-time" | "internship" | "contract";

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

export const JOB_TYPES: JobType[] = [
    "full-time",
    "part-time",
    "internship",
    "contract",
];
