/**
 * Mentor Data Access Layer Types
 */

import type { Id } from "@/convex/_generated/dataModel";

export interface Mentor {
    _id: Id<"mentors">;
    _creationTime: number;
    userId: Id<"users">;
    name: string;
    email?: string;
    avatarUrl?: string;
    role: string;
    company: string;
    location: string;
    expertise: string[];
    yearsOfExperience?: number;
    rating: number;
    mentees: number;
    bio: string;
    availability: string;
    isVerified: boolean;
    profileImageUrl?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
    languages?: string[];
    hourlyRate?: number;
    currency?: string;
    offersFreeSession?: boolean;
    sessionsCompleted?: number;
    responseTime?: string;
    timezone?: string;
    availableDays?: string[];
    availableTimeSlots?: string[];
    specializations?: string[];
    testimonialCount?: number;
}

export interface CreateMentorInput {
    userId: Id<"users">;
    role: string;
    company: string;
    location: string;
    expertise: string[];
    bio: string;
    availability?: string;
    yearsOfExperience?: number;
    hourlyRate?: number;
    currency?: string;
    offersFreeSession?: boolean;
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
    languages?: string[];
    timezone?: string;
    availableDays?: string[];
    availableTimeSlots?: string[];
    specializations?: string[];
}

export interface UpdateMentorInput {
    role?: string;
    company?: string;
    location?: string;
    expertise?: string[];
    bio?: string;
    availability?: string;
    yearsOfExperience?: number;
    hourlyRate?: number;
    currency?: string;
    offersFreeSession?: boolean;
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
    languages?: string[];
    timezone?: string;
    availableDays?: string[];
    availableTimeSlots?: string[];
    specializations?: string[];
    profileImageUrl?: string;
}

export interface MentorSearchParams {
    expertise?: string[];
    location?: string;
    minRating?: number;
    maxHourlyRate?: number;
    availability?: string;
    isVerified?: boolean;
    languages?: string[];
    limit?: number;
    offset?: number;
}

export interface BookSessionInput {
    mentorId: Id<"mentors">;
    topic: string;
    scheduledDate: number;
    duration: number;
    message?: string;
}

export interface RateMentorInput {
    mentorId: Id<"mentors">;
    rating: number;
    review?: string;
}
