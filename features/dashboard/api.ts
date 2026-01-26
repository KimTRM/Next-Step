"use client";

/**
 * Dashboard Feature - API Layer
 * Aggregates data from multiple features for dashboard views
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// AGGREGATED QUERIES
// ============================================

/**
 * Get current user (for role-based dashboard)
 */
export function useCurrentUser() {
    return useQuery(api.users.index.getCurrentUser, {});
}

/**
 * Get user's job applications for dashboard stats
 */
export function useUserApplications() {
    return useQuery(api.applications.index.getUserJobApplications, {});
}

/**
 * Get user's messages for dashboard
 */
export function useUserMessages() {
    return useQuery(api.messages.index.getUserMessages, {});
}

/**
 * Get recommended jobs for user (student dashboard)
 */
export function useRecommendedJobs(
    userId: Id<"users"> | null | undefined,
    limit = 5,
) {
    return useQuery(
        api.jobs.index.getRecommendedJobs,
        userId ? { userId, limit } : "skip",
    );
}

/**
 * Get mentor profile (mentor dashboard)
 */
export function useMentorProfile() {
    return useQuery(api.mentors.index.getMentorProfile, {});
}

/**
 * Get connection requests for mentor dashboard
 */
export function useConnectionRequests(
    mentorId: Id<"mentors"> | null | undefined,
) {
    return useQuery(
        api.mentors.index.getConnectionRequests,
        mentorId ? { mentorId } : "skip",
    );
}

/**
 * Get jobs posted by employer
 */
export function useEmployerJobs(userId: Id<"users"> | null | undefined) {
    return useQuery(api.jobs.index.getJobsByUser, userId ? { userId } : "skip");
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    StudentDashboardStats,
    MentorDashboardStats,
    EmployerDashboardStats,
    DashboardActivity,
    QuickAction,
} from "./types";
