"use client";

/**
 * Users Feature - API Layer
 * ONLY place that imports Convex hooks for users feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all users with optional filtering
 */
export function useAllUsers(filters?: { role?: string; search?: string }) {
    return useQuery(api.users.index.getAllUsers, filters || {});
}

/**
 * Get a single user by ID
 */
export function useUserById(id: Id<"users"> | null | undefined) {
    return useQuery(api.users.index.getUserById, id ? { id } : "skip");
}

/**
 * Get user by Clerk ID
 */
export function useUserByClerkId(clerkId: string | null | undefined) {
    return useQuery(
        api.users.index.getUserByClerkId,
        clerkId ? { clerkId } : "skip",
    );
}

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
    return useQuery(api.users.index.getCurrentUser, {});
}

/**
 * Get current user session info
 */
export function useCurrentSession() {
    return useQuery(api.users.index.getCurrentSession, {});
}

/**
 * Get public user profile (sanitized fields only)
 */
export function usePublicUserProfile(id: Id<"users"> | null | undefined) {
    return useQuery(api.users.index.getUserByIdPublic, id ? { id } : "skip");
}

/**
 * Search users by skills
 */
export function useSearchUsersBySkills(
    skills: string[],
    options?: { role?: string; limit?: number },
) {
    return useQuery(api.users.index.searchUsersBySkills, {
        skills,
        role: options?.role,
        limit: options?.limit,
    });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create or update user (upsert)
 */
export function useUpsertUser() {
    return useMutation(api.users.index.upsertUser);
}

/**
 * Update user profile
 */
export function useUpdateUserProfile() {
    return useMutation(api.users.index.updateUserProfile);
}

/**
 * Mark onboarding as complete
 */
export function useCompleteOnboarding() {
    return useMutation(api.users.index.completeOnboarding);
}

/**
 * Update user with onboarding data
 */
export function useUpdateUser() {
    return useMutation(api.users.index.updateUser);
}

/**
 * Delete user
 */
export function useDeleteUser() {
    return useMutation(api.users.index.deleteUser);
}

/**
 * Create user if missing (fallback after Clerk auth)
 */
export function useCreateUserIfMissing() {
    return useMutation(api.users.index.createUserIfMissing);
}

/**
 * Set onboarding status
 */
export function useSetOnboardingStatus() {
    return useMutation(api.users.index.setOnboardingStatus);
}

/**
 * Set user role during onboarding
 */
export function useSetRole() {
    return useMutation(api.users.index.setRole);
}

/**
 * Set user goals during onboarding
 */
export function useSetGoals() {
    return useMutation(api.users.index.setGoals);
}

/**
 * Save onboarding profile (role-based fields)
 */
export function useSaveOnboardingProfile() {
    return useMutation(api.users.index.saveOnboardingProfile);
}

// ============================================
// AUTH HELPER HOOK
// ============================================

/**
 * Combined auth hook for checking user state
 */
export function useAuth() {
    const user = useCurrentUser();
    const session = useCurrentSession();

    const isLoading = user === undefined || session === undefined;
    const isAuthenticated = !!user && !!session;

    return {
        user,
        session,
        isLoading,
        isAuthenticated,
        isJobSeeker: user?.role === "job_seeker",
        isMentor: user?.role === "mentor",
        isEmployer: user?.role === "employer",
    };
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    User,
    UserRole,
    OnboardingStatus,
    UserSession,
    PublicUserProfile,
    UserWithMatchScore,
    UpdateProfileInput,
    EducationLevel,
    Gender,
    WorkStyle,
    Availability,
    EducationEntry,
} from "./types";
