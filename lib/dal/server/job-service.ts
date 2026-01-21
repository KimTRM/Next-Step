/**
 * Job Data Access Layer
 * Server-side service for job-related operations
 */

import { api } from "./convex";
import { queryConvex } from "./convex";
import { DALError } from "../types/common.types";
import type { Id } from "@/convex/_generated/dataModel";
import type { SearchJobsInput, JobWithPoster } from "../types/job.types";

export class JobDAL {
    /**
     * Search jobs with filters
     */
    static async searchJobs(input: SearchJobsInput): Promise<JobWithPoster[]> {
        try {
            // Build query object with only defined values
            const queryObj: Record<string, unknown> = {};
            if (input.searchTerm !== undefined)
                queryObj.searchTerm = input.searchTerm;
            if (input.skills !== undefined) queryObj.skills = input.skills;
            if (input.location !== undefined)
                queryObj.location = input.location;
            if (input.employmentType !== undefined)
                queryObj.employmentType = input.employmentType;
            if (input.experienceLevel !== undefined)
                queryObj.experienceLevel = input.experienceLevel;
            if (input.locationType !== undefined)
                queryObj.locationType = input.locationType;
            if (input.minSalary !== undefined)
                queryObj.minSalary = input.minSalary;
            if (input.maxSalary !== undefined)
                queryObj.maxSalary = input.maxSalary;
            if (input.industry !== undefined)
                queryObj.industry = input.industry;
            if (input.jobCategory !== undefined)
                queryObj.jobCategory = input.jobCategory;
            if (input.limit !== undefined) queryObj.limit = input.limit;

            const result = await queryConvex(api.jobs.searchJobs, queryObj);
            return result as JobWithPoster[];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to search jobs",
                error,
            );
        }
    }

    /**
     * Get all active jobs
     */
    static async getAllJobs(): Promise<JobWithPoster[]> {
        try {
            const result = await queryConvex(api.jobs.getAllJobs, {});
            return (Array.isArray(result) ? result : []) as JobWithPoster[];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch all jobs",
                error,
            );
        }
    }

    /**
     * Get job by ID with poster information
     */
    static async getJobById(jobId: Id<"jobs">): Promise<JobWithPoster | null> {
        try {
            const result = await queryConvex(api.jobs.getJobById, { jobId });
            return (result as JobWithPoster) || null;
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch job by ID",
                error,
            );
        }
    }

    /**
     * Get related jobs based on current job
     */
    static async getRelatedJobs(params: {
        jobId: Id<"jobs">;
        limit?: number;
    }): Promise<JobWithPoster[]> {
        try {
            const result = await queryConvex(api.jobs.getRelatedJobs, params);
            return (result as JobWithPoster[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch related jobs",
                error,
            );
        }
    }

    /**
     * Get recommended jobs for a user
     */
    static async getRecommendedJobs(params: {
        userId: Id<"users">;
        limit?: number;
    }): Promise<JobWithPoster[]> {
        try {
            const result = await queryConvex(
                api.jobs.getRecommendedJobs,
                params,
            );
            return (result as JobWithPoster[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch recommended jobs",
                error,
            );
        }
    }

    /**
     * Get jobs by company
     */
    static async getJobsByCompany(params: {
        company: string;
        activeOnly?: boolean;
    }): Promise<JobWithPoster[]> {
        try {
            const result = await queryConvex(api.jobs.getJobsByCompany, params);
            return (result as JobWithPoster[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch jobs by company",
                error,
            );
        }
    }

    /**
     * Get jobs posted by a specific user
     */
    static async getJobsByUser(userId: Id<"users">): Promise<JobWithPoster[]> {
        try {
            const result = await queryConvex(api.jobs.getJobsByUser, {
                userId,
            });
            return (result as JobWithPoster[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch jobs by user",
                error,
            );
        }
    }
}
