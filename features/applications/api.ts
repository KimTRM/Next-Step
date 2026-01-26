"use client";

/**
 * Applications Feature - API Layer
 * ONLY place that imports Convex hooks for applications feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all job applications for current user
 */
export function useUserApplications() {
    return useQuery(api.applications.index.getUserJobApplications, {});
}

/**
 * Get applications for a specific job
 */
export function useJobApplications(jobId: Id<"jobs"> | null | undefined) {
    return useQuery(
        api.applications.index.getJobApplications,
        jobId ? { jobId } : "skip",
    );
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new job application
 */
export function useCreateApplication() {
    return useMutation(api.applications.index.createJobApplication);
}

/**
 * Update application status
 */
export function useUpdateApplicationStatus() {
    return useMutation(api.applications.index.updateApplicationStatus);
}

/**
 * Update application notes
 */
export function useUpdateApplicationNotes() {
    return useMutation(api.applications.index.updateApplicationNotes);
}

/**
 * Delete application
 */
export function useDeleteApplication() {
    return useMutation(api.applications.index.deleteApplication);
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    ApplicationStatus,
    JobApplication,
    JobApplicationWithDetails,
    CreateApplicationInput,
    UpdateApplicationStatusInput,
} from "./types";
