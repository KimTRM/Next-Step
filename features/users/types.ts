/**
 * Users Feature - Type Definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

// User role options
export type UserRole = "job_seeker" | "mentor" | "employer";

// Onboarding status options
export type OnboardingStatus = "not_started" | "in_progress" | "completed";

// Education level options
export type EducationLevel =
    | "high_school"
    | "undergraduate"
    | "graduate"
    | "phd"
    | "bootcamp"
    | "self_taught";

// Gender options
export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

// Work style options
export type WorkStyle = "remote" | "hybrid" | "onsite" | "flexible";

// Availability options
export type Availability =
    | "immediately"
    | "within_1_month"
    | "within_3_months"
    | "within_6_months"
    | "just_exploring";

// Education entry type
export type EducationEntry = {
    institution: string;
    degree: string;
    field: string;
    startDate: number;
    endDate?: number;
    isCurrent: boolean;
};

// Core User type
export type User = {
    _id: Id<"users">;
    _creationTime: number;
    clerkId: string;
    email: string;
    name: string;
    role: UserRole;
    age?: number;
    location?: string;
    bio?: string;
    avatarUrl?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    skills?: string[];
    interests?: string[];
    lookingFor?: string[];
    timeline?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileCompletion?: number;
    isOnboardingComplete?: boolean;
    onboardingStatus?: OnboardingStatus;
    organizationName?: string;
    goals?: string[];
    createdAt: number;
    updatedAt?: number;
    lastSeenAt?: number;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
    phone?: string;
    dateOfBirth?: number;
    gender?: Gender;
    education?: EducationEntry[];
    workStyles?: WorkStyle[];
    careerGoals?: string;
    targetIndustries?: string[];
    targetRoles?: string[];
    salaryExpectation?: string;
    availability?: Availability;
};

// Public user profile (sanitized fields only)
export type PublicUserProfile = {
    _id: Id<"users">;
    _creationTime: number;
    name: string;
    role: UserRole;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    lookingFor?: string[];
    profileCompletion?: number;
};

// Session data from getCurrentSession
export type UserSession = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
    userId: Id<"users">;
    onboardingStatus: OnboardingStatus;
};

// User with match score (from skill search)
export type UserWithMatchScore = User & {
    matchScore: number;
};

// Update profile input
export type UpdateProfileInput = {
    bio?: string;
    location?: string;
    age?: number;
    skills?: string[];
    interests?: string[];
    careerGoals?: string;
    lookingFor?: string[];
    timeline?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    role?: UserRole;
};
