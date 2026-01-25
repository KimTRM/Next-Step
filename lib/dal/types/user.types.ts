/**
 * User-related types
 */

import { Id } from "@/convex/_generated/dataModel";

export type UserRole = "student" | "mentor" | "employer";

export type EducationLevel =
    | "high_school"
    | "undergraduate"
    | "graduate"
    | "phd"
    | "bootcamp"
    | "self_taught";

export interface User {
    _id: Id<"users">;
    _creationTime: number;
    clerkId: string;
    name: string;
    email: string;
    role: UserRole;
    bio?: string;
    skills?: string[];
    location?: string;
    avatarUrl?: string;

    // Education
    educationLevel?: EducationLevel;
    currentStatus?: string;

    // Career
    careerGoals?: string;
    lookingFor?: string[];
    timeline?: string;

    // Personal
    age?: number;
    interests?: string[];

    // Social Links
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;

    // Profile Tracking
    profileCompletion: number;
    isOnboardingComplete: boolean;

    // Onboarding (legacy fields from schema)
    onboardingCompleted?: boolean;
    onboardingStep?: number;

    // Metadata
    createdAt: number;
    updatedAt: number;
    lastSeenAt?: number;
}

export interface UserSession {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
}

export interface UpdateProfileInput {
    name?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    age?: number;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
    lookingFor?: string[];
    timeline?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
}

export interface PublicUserProfile {
    _id: Id<"users">;
    _creationTime: number;
    name: string;
    role: UserRole;
    bio?: string;
    skills?: string[];
    location?: string;
    avatarUrl?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    careerGoals?: string;
    lookingFor?: string[];
    interests?: string[];
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileCompletion: number;
    isOnboardingComplete: boolean;
    createdAt: number;
    updatedAt: number;
}
