/**
 * Mentors API Client
 * Client-side service for mentor-related operations
 */

import { get, post } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export type Mentor = {
    _id: Id<"users">;
    name: string;
    title?: string;
    company?: string;
    expertise?: string[];
    bio?: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    hourlyRate?: number;
    availability?: string[];
    languages?: string[];
    yearsOfExperience?: number;
};

export type SearchMentorsParams = {
    expertise?: string[];
    minRating?: number;
    maxHourlyRate?: number;
    availability?: string;
    searchTerm?: string;
    limit?: number;
};

export type ConnectToMentorInput = {
    mentorId: Id<"users">;
    message: string;
};

export type BookSessionInput = {
    mentorId: Id<"users">;
    date: number;
    duration: number;
    topic: string;
    notes?: string;
};

/**
 * Search mentors with filters
 */
export async function searchMentors(
    params?: SearchMentorsParams,
): Promise<Mentor[]> {
    const queryParams =
        params ?
            {
                expertise: params.expertise?.join(","),
                minRating: params.minRating,
                maxHourlyRate: params.maxHourlyRate,
                availability: params.availability,
                searchTerm: params.searchTerm,
                limit: params.limit,
            }
        :   undefined;
    return get<Mentor[]>("/api/mentors", queryParams);
}

/**
 * Get mentor by ID
 */
export async function getMentorById(
    mentorId: Id<"users">,
): Promise<Mentor | null> {
    return get<Mentor | null>(`/api/mentors/${mentorId}`);
}

/**
 * Connect to a mentor
 */
export async function connectToMentor(
    data: ConnectToMentorInput,
): Promise<void> {
    return post<void>("/api/mentors/connect", data);
}

/**
 * Book a session with a mentor
 */
export async function bookMentorSession(data: BookSessionInput): Promise<void> {
    return post<void>("/api/mentors/book", data);
}
