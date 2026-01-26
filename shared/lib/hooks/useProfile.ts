/**
 * Profile Management Hooks
 * Client-side hooks for profile operations
 *
 * TODO: Migrate to Convex - currently using legacy API routes
 */

"use client";

import { useState, useCallback } from "react";
import type { User } from "@/shared/lib/types/index";
import type { Id } from "@/convex/_generated/dataModel";

// TODO: These types should be defined in lib/types/index.ts or migrated to Convex
type UpdateProfileInput = Partial<User>;
type PublicUserProfile = Omit<User, "email">;

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

/**
 * Hook to get current user's profile
 */
export function useCurrentProfile() {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/profile");
            const data: ApiResponse<User> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch profile");
            }

            setProfile(data.data);
            return data.data;
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to fetch profile";
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { profile, loading, error, fetchProfile, refetch: fetchProfile };
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateProfile = useCallback(async (updates: UpdateProfileInput) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            });

            const data: ApiResponse<User> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            return data.data;
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to update profile";
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateProfile, loading, error };
}

/**
 * Hook to complete onboarding
 */
export function useCompleteOnboarding() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const completeOnboarding = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/profile/onboarding", {
                method: "POST",
            });

            const data: ApiResponse<User> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to complete onboarding");
            }

            return data.data;
        } catch (err) {
            const errorMsg =
                err instanceof Error ?
                    err.message
                :   "Failed to complete onboarding";
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { completeOnboarding, loading, error };
}

/**
 * Hook to get public user profile by ID
 */
export function usePublicProfile(userId: Id<"users"> | null) {
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (id: Id<"users">) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/profile/${id}`);
            const data: ApiResponse<PublicUserProfile> = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch profile");
            }

            setProfile(data.data);
            return data.data;
        } catch (err) {
            const errorMsg =
                err instanceof Error ? err.message : "Failed to fetch profile";
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-fetch when userId changes
    useState(() => {
        if (userId) {
            fetchProfile(userId);
        }
    });

    return {
        profile,
        loading,
        error,
        fetchProfile,
        refetch: () => userId && fetchProfile(userId),
    };
}

/**
 * Hook to search users by skills
 */
export function useSearchUsersBySkills() {
    const [users, setUsers] = useState<PublicUserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchUsers = useCallback(
        async (params: { skills: string[]; role?: string; limit?: number }) => {
            setLoading(true);
            setError(null);

            try {
                const searchParams = new URLSearchParams({
                    skills: params.skills.join(","),
                });

                if (params.role) {
                    searchParams.append("role", params.role);
                }

                if (params.limit) {
                    searchParams.append("limit", params.limit.toString());
                }

                const response = await fetch(
                    `/api/users/search?${searchParams}`,
                );
                const data: ApiResponse<PublicUserProfile[]> & {
                    count: number;
                } = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Failed to search users");
                }

                setUsers(data.data);
                return data.data;
            } catch (err) {
                const errorMsg =
                    err instanceof Error ?
                        err.message
                    :   "Failed to search users";
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { users, loading, error, searchUsers };
}
