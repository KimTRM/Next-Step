/**
 * Applications API Client
 * Client-side service for job application operations
 */

import { get, patch } from "./base";
import type { Id } from "@/convex/_generated/dataModel";
import type { ApplicationStatus } from "@/lib/dal/types/job-application.types";

export type Application = {
    _id: Id<"jobApplications">;
    _creationTime: number;
    jobId: Id<"jobs">;
    userId: Id<"users">;
    status: ApplicationStatus;
    appliedDate: number;
    nextStep?: string;
    interviewDate?: number;
    notes?: string;
    jobTitle?: string;
    company?: string;
    location?: string;
};

export type UpdateApplicationStatusInput = {
    status: ApplicationStatus;
    nextStep?: string;
    interviewDate?: number;
    notes?: string;
};

/**
 * Get current user's applications
 */
export async function getUserApplications(): Promise<Application[]> {
    return get<Application[]>("/api/applications");
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
    applicationId: Id<"jobApplications">,
    data: UpdateApplicationStatusInput,
): Promise<Application> {
    return patch<Application>(`/api/applications/${applicationId}`, data);
}
