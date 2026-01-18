/**
 * Job Application Data Access Layer
 * Server-side service for job application operations
 */

import { api } from "./convex";
import { queryConvex, mutateConvex } from "./convex";
import { DALError } from "../types/common.types";
import type { Id } from "@/convex/_generated/dataModel";
import type {
    JobApplication,
    ApplicationWithJobDetails,
    CreateApplicationInput,
} from "../types/job-application.types";

export class JobApplicationDAL {
    /**
     * Get current user's job applications
     */
    static async getUserApplications(): Promise<ApplicationWithJobDetails[]> {
        try {
            const result = await queryConvex(
                api.jobApplications.getUserJobApplications,
                {},
            );
            return (result as ApplicationWithJobDetails[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch user applications",
                error,
            );
        }
    }

    /**
     * Get applications for a specific job
     */
    static async getJobApplications(
        jobId: Id<"jobs">,
    ): Promise<JobApplication[]> {
        try {
            const result = await queryConvex(
                api.jobApplications.getJobApplications,
                {
                    jobId,
                },
            );
            return (result as JobApplication[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch job applications",
                error,
            );
        }
    }

    /**
     * Create a new job application
     */
    static async createApplication(
        input: CreateApplicationInput,
        auth?: string | (() => Promise<string | null>),
    ): Promise<Id<"jobApplications">> {
        try {
            const result = await mutateConvex(
                api.jobApplications.createJobApplication,
                {
                    jobId: input.jobId,
                    notes: input.notes,
                },
                auth,
            );
            return result as Id<"jobApplications">;
        } catch (error) {
            // Check if error is "already applied"
            if (
                error instanceof Error &&
                error.message.includes("already applied")
            ) {
                throw new DALError(
                    "ALREADY_APPLIED",
                    "You have already applied to this job",
                    error,
                );
            }
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to submit application",
                error,
            );
        }
    }

    /**
     * Update application status
     */
    static async updateStatus(
        applicationId: Id<"jobApplications">,
        status: "pending" | "reviewing" | "interview" | "rejected" | "accepted",
    ): Promise<void> {
        try {
            await mutateConvex(api.jobApplications.updateApplicationStatus, {
                applicationId,
                status,
            });
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to update application status",
                error,
            );
        }
    }

    /**
     * Update application notes
     */
    static async updateNotes(
        applicationId: Id<"jobApplications">,
        notes: string,
    ): Promise<void> {
        try {
            await mutateConvex(api.jobApplications.updateApplicationNotes, {
                applicationId,
                notes,
            });
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to update application notes",
                error,
            );
        }
    }

    /**
     * Delete an application
     */
    static async deleteApplication(
        applicationId: Id<"jobApplications">,
    ): Promise<void> {
        try {
            await mutateConvex(api.jobApplications.deleteApplication, {
                applicationId,
            });
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to delete application",
                error,
            );
        }
    }
}
