"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Fetch user by Clerk ID
export function useUserByClerkId(clerkId: string | null | undefined) {
    return useQuery(
        api.users.index.getUserByClerkId,
        clerkId ? { clerkId } : "skip",
    );
}

// Update user with onboarding data
export function useUpdateUser() {
    return useMutation(api.users.index.updateUser);
}

// Mark onboarding as complete
export function useCompleteOnboarding() {
    return useMutation(api.users.index.completeOnboarding);
}
