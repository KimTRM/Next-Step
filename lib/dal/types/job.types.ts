/**
 * Job-related type definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

export type JobEmploymentType =
    | "full-time"
    | "part-time"
    | "contract"
    | "internship"
    | "temporary";

export type JobLocationType = "on-site" | "remote" | "hybrid";

export type JobExperienceLevel =
    | "entry"
    | "mid"
    | "senior"
    | "lead"
    | "executive";

export interface SearchJobsInput {
    searchTerm?: string;
    skills?: string[];
    location?: string;
    employmentType?: JobEmploymentType;
    experienceLevel?: JobExperienceLevel;
    locationType?: JobLocationType;
    minSalary?: number;
    maxSalary?: number;
    industry?: string;
    jobCategory?: string;
    limit?: number;
}

export interface JobWithPoster {
    _id: Id<"jobs">;
    _creationTime: number;
    title: string;
    company: string;
    location: string;
    employmentType: JobEmploymentType;
    locationType: JobLocationType;
    jobCategory: string;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: string;
    description: string;
    requiredSkills: string[];
    experienceLevel: JobExperienceLevel;
    education?: string;
    postedBy: Id<"users">;
    postedDate: number;
    expiresDate?: number;
    views: number;
    industry?: string;
    tags?: string[];
    isActive: boolean;
    companyWebsite?: string;
    companyLogo?: string;
    applicationDeadline?: number;
    applicationUrl?: string;
    howToApply?: string;
    poster?: {
        _id: Id<"users">;
        name: string;
        role: string;
        avatarUrl?: string;
    } | null;
}
