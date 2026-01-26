/**
 * Mentors Feature - Type Definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

// Re-export Id type for components
export type { Id };

// Core Mentor type
export type Mentor = {
    _id: Id<"mentors">;
    _creationTime: number;
    userId: Id<"users">;
    role: string;
    company: string;
    location: string;
    bio: string;
    longBio?: string;
    tagline?: string;
    expertise: string[];
    specializations?: string[];
    languages?: string[];
    yearsOfExperience?: number;
    industry?: string;
    availability: string;
    availableDays?: string[];
    availableTimeSlots?: string[];
    timezone?: string;
    isRemoteOnly?: boolean;
    hourlyRate?: number;
    currency?: string;
    offersFreeSession?: boolean;
    rating: number;
    totalReviews?: number;
    mentees: number;
    sessionsCompleted?: number;
    responseTime?: string;
    acceptanceRate?: number;
    isVerified: boolean;
    verifiedAt?: number;
    isAvailableForNewMentees?: boolean;
    maxMentees?: number;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    twitterUrl?: string;
    mentoringStyle?: string[];
    focusAreas?: string[];
    profileImageUrl?: string;
    currentPosition?: string;
    createdAt?: number;
    updatedAt?: number;
    lastActiveAt?: number;
};

// Mentor with user data (enriched from query)
export type MentorWithUser = Mentor & {
    name: string;
    email?: string;
    avatarUrl?: string;
};

// Mentor with match score (from recommendations)
export type MentorWithMatchScore = MentorWithUser & {
    matchScore: number;
};

// Mentorship Session type
export type MentorshipSession = {
    _id: Id<"mentorshipSessions">;
    _creationTime: number;
    mentorId: Id<"users">;
    studentId: Id<"users">;
    topic: string;
    scheduledDate: number;
    duration: number;
    status: "scheduled" | "completed" | "cancelled";
};

// Mentee type (student of a mentor)
export type Mentee = {
    _id: Id<"users">;
    name: string;
    email: string;
    role: string;
    bio?: string;
    skills?: string[];
    location?: string;
};

// Create mentor profile input
export type CreateMentorInput = {
    role: string;
    company: string;
    location: string;
    expertise: string[];
    yearsOfExperience: number;
    bio: string;
    availability: string;
    hourlyRate?: number;
    currency?: string;
    timezone?: string;
    languages?: string[];
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
};

// Update mentor profile input
export type UpdateMentorInput = {
    mentorId: Id<"mentors">;
    role?: string;
    company?: string;
    location?: string;
    expertise?: string[];
    specializations?: string[];
    yearsOfExperience?: number;
    bio?: string;
    longBio?: string;
    tagline?: string;
    availability?: string;
    availableDays?: string[];
    hourlyRate?: number;
    currency?: string;
    offersFreeSession?: boolean;
    timezone?: string;
    languages?: string[];
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    twitterUrl?: string;
    mentoringStyle?: string[];
    focusAreas?: string[];
    isAvailableForNewMentees?: boolean;
    maxMentees?: number;
};

// Book session input
export type BookSessionInput = {
    mentorId: Id<"mentors">;
    topic: string;
    scheduledDate: number;
    duration: number;
    message?: string;
};
