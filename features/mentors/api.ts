"use client";

/**
 * Mentors Feature - API Layer
 * ONLY place that imports Convex hooks for mentors feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all mentors with user enrichment
 */
export function useAllMentors() {
    return useQuery(api.mentors.queries.getAllMentors, {});
}

/**
 * Get verified mentors only
 */
export function useVerifiedMentors() {
    return useQuery(api.mentors.queries.getVerifiedMentors, {});
}

/**
 * Get a single mentor by ID
 */
export function useMentorById(mentorId: Id<"mentors"> | null | undefined) {
    return useQuery(
        api.mentors.queries.getMentorById,
        mentorId ? { mentorId } : "skip",
    );
}

/**
 * Search mentors
 */
export function useSearchMentors(searchTerm: string, expertise?: string) {
    return useQuery(api.mentors.queries.searchMentors, {
        searchTerm,
        expertise,
    });
}

/**
 * Get top-rated mentors
 */
export function useTopRatedMentors(limit?: number) {
    return useQuery(api.mentors.queries.getTopRatedMentors, { limit });
}

/**
 * Get recommended mentors for a user
 */
export function useRecommendedMentors(
    userId: Id<"users"> | null | undefined,
    limit?: number,
) {
    return useQuery(
        api.mentors.queries.getRecommendedMentors,
        userId ? { userId, limit } : "skip",
    );
}

/**
 * Get mentors by specific expertise
 */
export function useMentorsByExpertise(expertise: string, limit?: number) {
    return useQuery(api.mentors.queries.getMentorsByExpertise, {
        expertise,
        limit,
    });
}

/**
 * Get similar mentors based on expertise and industry
 */
export function useSimilarMentors(
    mentorId: Id<"mentors"> | null | undefined,
    limit?: number,
) {
    return useQuery(
        api.mentors.queries.getSimilarMentors,
        mentorId ? { mentorId, limit } : "skip",
    );
}

/**
 * Get current user's mentor profile
 */
export function useMentorProfile() {
    return useQuery(api.mentors.queries.getMentorProfile, {});
}

/**
 * Get mentees for a mentor
 */
export function useMentees(mentorId: Id<"mentors"> | null | undefined) {
    return useQuery(
        api.mentors.queries.getMentees,
        mentorId ? { mentorId } : "skip",
    );
}

/**
 * Alias: Get mentees for a mentor (mentor dashboard context)
 */
export function useMentorMentees(mentorId: Id<"mentors"> | null | undefined) {
    return useMentees(mentorId);
}

/**
 * Get connection requests for a mentor
 */
export function useConnectionRequests(
    mentorId: Id<"mentors"> | null | undefined,
) {
    return useQuery(
        api.mentors.queries.getConnectionRequests,
        mentorId ? { mentorId } : "skip",
    );
}

/**
 * Alias: Get connection requests for a mentor (mentor dashboard context)
 */
export function useMentorConnectionRequests(
    mentorId: Id<"mentors"> | null | undefined,
) {
    return useConnectionRequests(mentorId);
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new mentor profile
 */
export function useCreateMentor() {
    return useMutation(api.mentors.mutations.createMentor);
}

/**
 * Update mentor profile
 */
export function useUpdateMentor() {
    return useMutation(api.mentors.mutations.updateMentor);
}

/**
 * Update mentor rating
 */
export function useUpdateMentorRating() {
    return useMutation(api.mentors.mutations.updateMentorRating);
}

/**
 * Increment mentee count
 */
export function useIncrementMentees() {
    return useMutation(api.mentors.mutations.incrementMentees);
}

/**
 * Verify mentor (admin only)
 */
export function useVerifyMentor() {
    return useMutation(api.mentors.mutations.verifyMentor);
}

/**
 * Book a mentorship session
 */
export function useBookSession() {
    return useMutation(api.mentors.mutations.bookSession);
}

/**
 * Send connection request to mentor
 */
export function useSendConnectionRequest() {
    return useMutation(api.mentors.mutations.sendConnectionRequest);
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    Mentor,
    MentorWithUser,
    MentorWithMatchScore,
    MentorshipSession,
    Mentee,
    CreateMentorInput,
    UpdateMentorInput,
    BookSessionInput,
} from "./types";
