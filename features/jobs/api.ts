"use client";

/**
 * Jobs Feature - API Layer
 * ONLY place that imports Convex hooks for jobs feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type {
    JobSearchFilters,
    CreateJobInput,
    EmploymentType,
    ExperienceLevel,
    LocationType,
} from "./types";

// ============================================
// QUERIES
// ============================================

/**
 * Get all active jobs with optional pagination
 */
export function useAllJobs(paginationOpts?: {
    numItems: number;
    cursor: string | null;
}) {
    return useQuery(api.jobs.queries.getAllJobs, { paginationOpts });
}

/**
 * Get a single job by ID with poster information
 */
export function useJobById(jobId: Id<"jobs"> | null | undefined) {
    return useQuery(api.jobs.queries.getJobById, jobId ? { jobId } : "skip");
}

/**
 * Search jobs with filters
 */
export function useSearchJobs(filters: JobSearchFilters) {
    return useQuery(api.jobs.queries.searchJobs, {
        searchTerm: filters.searchTerm || undefined,
        skills: filters.skills,
        location: filters.location,
        employmentType: filters.employmentType,
        experienceLevel: filters.experienceLevel,
        locationType: filters.locationType,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
        industry: filters.industry,
        jobCategory: filters.jobCategory,
        limit: filters.limit,
    });
}

/**
 * List jobs with basic filters (for pages)
 * Simpler alternative to useSearchJobs for common page use cases
 */
export function useJobsList(filters: Partial<JobSearchFilters>) {
    return useSearchJobs(filters as JobSearchFilters);
}

/**
 * Get jobs posted by a specific company
 */
export function useJobsByCompany(company: string, activeOnly = true) {
    return useQuery(api.jobs.queries.getJobsByCompany, { company, activeOnly });
}

/**
 * Get jobs posted by a specific user
 */
export function useJobsByUser(userId: Id<"users"> | null | undefined) {
    return useQuery(
        api.jobs.queries.getJobsByUser,
        userId ? { userId } : "skip",
    );
}

/**
 * Get recommended jobs for a user based on their skills
 */
export function useRecommendedJobs(
    userId: Id<"users"> | null | undefined,
    limit?: number,
) {
    return useQuery(
        api.jobs.queries.getRecommendedJobs,
        userId ? { userId, limit } : "skip",
    );
}

/**
 * Get related jobs based on current job's skills and company
 */
export function useRelatedJobs(
    jobId: Id<"jobs"> | null | undefined,
    limit?: number,
) {
    return useQuery(
        api.jobs.queries.getRelatedJobs,
        jobId ? { jobId, limit } : "skip",
    );
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new job listing
 */
export function useCreateJob() {
    return useMutation(api.jobs.mutations.createJob);
}

/**
 * Update an existing job listing
 */
export function useUpdateJob() {
    return useMutation(api.jobs.mutations.updateJob);
}

/**
 * Deactivate a job listing (soft delete)
 */
export function useDeactivateJob() {
    return useMutation(api.jobs.mutations.deactivateJob);
}

/**
 * Reactivate a deactivated job listing
 */
export function useReactivateJob() {
    return useMutation(api.jobs.mutations.reactivateJob);
}

/**
 * Increment the view count for a job
 */
export function useIncrementViews() {
    return useMutation(api.jobs.mutations.incrementViews);
}

// ============================================
// TYPES RE-EXPORT
// ============================================

// Re-export types for convenience
export type {
    Job,
    JobWithPoster,
    JobWithMatchScore,
    JobSearchFilters,
    CreateJobInput,
    EmploymentType,
    ExperienceLevel,
    LocationType,
} from "./types";
