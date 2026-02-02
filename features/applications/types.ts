/**
 * Applications Feature - Type Definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

// Re-export Id type for components
export type { Id };

// Application status options
export type ApplicationStatus =
    | "pending"
    | "reviewing"
    | "interview"
    | "accepted"
    | "rejected";

// Core Job Application type
export type JobApplication = {
    _id: Id<"jobApplications">;
    _creationTime: number;
    jobId: Id<"jobs">;
    userId: Id<"users">;
    status: ApplicationStatus;
    appliedDate: number;
    nextStep?: string;
    interviewDate?: number;
    notes?: string;
};

// Job Application with job details (enriched from query)
export type JobApplicationWithDetails = JobApplication & {
    jobTitle: string;
    company: string;
    location: string;
};

// Create application input
export type CreateApplicationInput = {
    jobId: Id<"jobs">;
    notes?: string;
};

// Update application status input
export type UpdateApplicationStatusInput = {
    applicationId: Id<"jobApplications">;
    status: ApplicationStatus;
    nextStep?: string;
    interviewDate?: number;
};
