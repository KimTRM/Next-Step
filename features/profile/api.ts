"use client";

/**
 * Profile Feature - API Layer
 * Direct access to Convex user queries/mutations for profile operations
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * Get current user profile data
 */
export function useProfile() {
    return useQuery(api.users.index.getCurrentUser, {});
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
    return useMutation(api.users.index.updateUserProfile);
}

/**
 * Upsert user mutation (for initial setup)
 */
export function useUpsertProfile() {
    return useMutation(api.users.index.upsertUser);
}
