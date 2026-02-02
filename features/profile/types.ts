/**
 * Profile Feature - Type Definitions
 */

// Generic ID type for Convex documents
type GenericId<T extends string> = string & { __tableName: T };

// User role options
export type UserRole = "job_seeker" | "student" | "mentor" | "employer";

// Education level options
export type EducationLevel =
    | "high_school"
    | "undergraduate"
    | "graduate"
    | "phd"
    | "bootcamp"
    | "self_taught";

/**
 * Education entry for detailed education history
 */
export type EducationEntry = {
    id?: string; // Temporary ID for form management (client-side only)
    institution: string;
    degree: string;
    field: string;
    startDate: number; // Unix timestamp
    endDate?: number; // Unix timestamp, undefined if current
    isCurrent: boolean;
    description?: string;
};

/**
 * Work experience entry
 */
export type ExperienceEntry = {
    id?: string; // Temporary ID for form management (client-side only)
    title: string;
    company: string;
    location?: string;
    startDate: number; // Unix timestamp
    endDate?: number; // Unix timestamp, undefined if current
    isCurrent: boolean;
    description?: string;
};

/**
 * Document/attachment entry
 */
export type DocumentEntry = {
    id: string;
    name: string;
    url?: string;
    type?: string; // e.g., "resume", "certificate", "portfolio"
    uploadedAt?: number;
    size?: number;
};

// Core User type (subset needed for profile)
export type User = {
    _id: GenericId<"users">;
    _creationTime: number;
    clerkId: string;
    email: string;
    name: string;
    role: UserRole;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    skills?: string[];
    interests?: string[];
    goals?: string[];
    careerGoals?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileCompletion?: number;
    education?: EducationEntry[]; // Detailed education history
    experience?: ExperienceEntry[]; // Work experience
};

/**
 * Profile form data structure (extended)
 */
export type ProfileFormData = {
    name: string;
    location: string;
    educationLevel: EducationLevel | "";
    bio: string;
    careerGoals: string;
    skills: string[];
    interests: string[];
    linkedInUrl: string;
    githubUrl: string;
    portfolioUrl: string;
    education: EducationEntry[];
    experience: ExperienceEntry[];
};

/**
 * Profile completion result
 */
export type ProfileCompletion = {
    percentage: number;
    incomplete: string[];
};

/**
 * Profile field configuration for completion calculation
 */
export type ProfileField = {
    key: string;
    label: string;
    weight: number;
    isArray?: boolean;
};

/**
 * Validation error for profile fields
 */
export type ProfileValidationError = {
    field: string;
    message: string;
};

/**
 * Incomplete section information
 */
export type IncompleteSection = {
    section: string;
    fields: string[];
    priority: "high" | "medium" | "low";
};
