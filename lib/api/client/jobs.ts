/**
 * Jobs API Client
 * Client-side service for job-related operations
 */

import { get } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export type Job = {
    _id: Id<"jobs">;
    _creationTime: number;
    title: string;
    company: string;
    location: string;
    locationType?: "remote" | "hybrid" | "onsite";
    employmentType?: "full-time" | "part-time" | "contract" | "internship";
    description?: string;
    requirements?: string[];
    skills?: string[];
    experienceLevel?: "entry" | "mid" | "senior" | "lead";
    salaryRange?: {
        min: number;
        max: number;
        currency: string;
    };
    postedBy: Id<"users">;
    status: "active" | "closed" | "draft";
    industry?: string;
    jobCategory?: string;
    benefits?: string[];
    applicationDeadline?: number;
};

export type SearchJobsParams = {
    searchTerm?: string;
    skills?: string[];
    location?: string;
    employmentType?: string;
    experienceLevel?: string;
    locationType?: string;
    minSalary?: number;
    maxSalary?: number;
    industry?: string;
    jobCategory?: string;
    limit?: number;
};

/**
 * Search jobs with filters
 */
export async function searchJobs(params?: SearchJobsParams): Promise<Job[]> {
    const queryParams = params ? {
        ...params,
        skills: params.skills?.join(','),
    } : undefined;
    return get<Job[]>("/api/jobs", queryParams);
}

/**
 * Get job by ID
 */
export async function getJobById(jobId: Id<"jobs">): Promise<Job | null> {
    return get<Job | null>(`/api/jobs/${jobId}`);
}
