/**
 * Jobs Feature - Type Definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

// Employment type options
export type EmploymentType =
    | "full-time"
    | "part-time"
    | "contract"
    | "internship"
    | "temporary";

// Location type options
export type LocationType = "on-site" | "remote" | "hybrid";

// Experience level options
export type ExperienceLevel = "entry" | "mid" | "senior" | "lead" | "executive";

// Education level options
export type EducationLevel =
    | "high_school"
    | "associate"
    | "bachelor"
    | "master"
    | "phd"
    | "none";

// Salary period options
export type SalaryPeriod = "hour" | "month" | "year";

// Core Job type
export type Job = {
    _id: Id<"jobs">;
    _creationTime: number;
    title: string;
    company: string;
    description: string;
    employmentType?: EmploymentType;
    location: string;
    locationType?: LocationType;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: SalaryPeriod;
    requiredSkills?: string[];
    experienceLevel?: ExperienceLevel;
    education?: EducationLevel;
    applicationDeadline?: number;
    applicationUrl?: string;
    howToApply?: string;
    postedDate: number;
    expiresDate?: number;
    isActive: boolean;
    views: number;
    postedBy: Id<"users">;
    companyLogo?: string;
    companyWebsite?: string;
    industry?: string;
    jobCategory?: string;
    tags?: string[];
};

// Job with poster information (enriched from query)
export type JobWithPoster = Job & {
    poster?: {
        _id: Id<"users">;
        name: string;
        role: string;
        avatarUrl?: string;
    } | null;
};

// Job with match score (from recommendations)
export type JobWithMatchScore = Job & {
    matchScore: number;
};

// Search filters for jobs
export type JobSearchFilters = {
    searchTerm?: string;
    skills?: string[];
    location?: string;
    employmentType?: EmploymentType;
    experienceLevel?: ExperienceLevel;
    locationType?: LocationType;
    minSalary?: number;
    maxSalary?: number;
    industry?: string;
    jobCategory?: string;
    limit?: number;
};

// Create job input
export type CreateJobInput = {
    title: string;
    company: string;
    description: string;
    employmentType: EmploymentType;
    location: string;
    locationType: LocationType;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: SalaryPeriod;
    requiredSkills: string[];
    experienceLevel: ExperienceLevel;
    education?: EducationLevel;
    applicationDeadline?: number;
    applicationUrl?: string;
    howToApply?: string;
    expiresDate?: number;
    companyLogo?: string;
    companyWebsite?: string;
    industry?: string;
    jobCategory?: string;
    tags?: string[];
    postedBy: Id<"users">;
};
