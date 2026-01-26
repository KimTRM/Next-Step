/**
 * Authentication Hook
 * Provides current user and session information from Convex
 */

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type UserRole = "student" | "mentor" | "employer";

export type CurrentUser = {
    _id: Id<"users">;
    _creationTime: number;
    clerkId: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    educationLevel?: string;
    currentStatus?: string;
    lookingFor?: string[];
    timeline?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileCompletion?: number;
    isOnboardingComplete?: boolean;
    createdAt: number;
    updatedAt?: number;
    lastSeenAt?: number;
};

export type UserSession = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    userId: Id<"users">;
};

/**
 * Hook to get current authenticated user
 * Returns null if not authenticated or user not found
 */
export function useCurrentUser() {
    const user = useQuery(api.users.index.getCurrentUser, {});
    return user as CurrentUser | null | undefined;
}

/**
 * Hook to get current user session
 * Returns simplified session data
 */
export function useCurrentSession() {
    const session = useQuery(api.users.index.getCurrentSession, {});
    return session as UserSession | null | undefined;
}

/**
 * Hook to check authentication status
 */
export function useAuth() {
    const user = useCurrentUser();
    const session = useCurrentSession();
    return {
        user,
        session,
        isAuthenticated: user !== null && session !== null,
        isLoading: user === undefined || session === undefined,
        isStudent: user?.role === "student",
        isMentor: user?.role === "mentor",
        isEmployer: user?.role === "employer",
    };
}
