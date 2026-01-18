/**
 * Job Application type definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

export type ApplicationStatus =
    | "pending"
    | "reviewing"
    | "interview"
    | "rejected"
    | "accepted";

export interface JobApplication {
    _id: Id<"jobApplications">;
    _creationTime: number;
    jobId: Id<"jobs">;
    userId: Id<"users">;
    status: ApplicationStatus;
    appliedDate: number;
    nextStep?: string;
    interviewDate?: number;
    notes?: string;
}

export interface CreateApplicationInput {
    jobId: Id<"jobs">;
    notes?: string;
}

export interface ApplicationWithJobDetails extends JobApplication {
    jobTitle?: string;
    company?: string;
    location?: string;
}
