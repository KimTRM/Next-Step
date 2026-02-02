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
    field?: string; // Optional for backwards compatibility
    startDate: number; // Unix timestamp
    endDate?: number; // Unix timestamp, undefined if current
    isCurrent: boolean;
    description?: string; // Optional description
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
 * Social link entry
 */
export type SocialLinkEntry = {
    id?: string; // Temporary ID for form management (client-side only)
    label: string; // e.g., "LinkedIn", "GitHub", "Portfolio", "Twitter"
    url: string;
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
    coverPhotoUrl?: string;
    educationLevel?: EducationLevel;
    currentStatus?: string;
    skills?: string[];
    interests?: string[];
    goals?: string[];
    careerGoals?: string;
    linkedInUrl?: string; // Deprecated - keeping for backward compatibility
    githubUrl?: string; // Deprecated - keeping for backward compatibility
    portfolioUrl?: string; // Deprecated - keeping for backward compatibility
    socialLinks?: SocialLinkEntry[]; // New dynamic social links
    profileCompletion?: number;
    education?: EducationEntry[]; // Detailed education history
    experience?: ExperienceEntry[]; // Work experience
    specialization?: string; // User's specialization/expertise area
    technology?: string[]; // Technologies user works with
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
    linkedInUrl: string; // Deprecated - keeping for migration
    githubUrl: string; // Deprecated - keeping for migration
    portfolioUrl: string; // Deprecated - keeping for migration
    socialLinks: SocialLinkEntry[];
    coverPhotoUrl: string;
    avatarUrl: string;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    specialization: string;
    technology: string[];
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
