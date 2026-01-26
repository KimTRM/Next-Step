/**
 * Convex-based Type Definitions
 * Central type definitions derived from Convex schema
 */

import type { Id } from "@/convex/_generated/dataModel";

// Application Status Types
export type ApplicationStatus =
    | "pending"
    | "reviewing"
    | "interview"
    | "accepted"
    | "rejected";

// Application Types
// TODO: Update opportunityId to Id<"opportunities"> when opportunities table is created
export type Application = {
    _id: Id<"applications">;
    _creationTime: number;
    opportunityId: string; // Using string until opportunities table is migrated
    userId: Id<"users">;
    status: ApplicationStatus; // Using expanded ApplicationStatus type
    appliedDate: number;
    coverLetter?: string;
};

// Job Application Types (for jobs specifically)
export type JobApplication = {
    _id: Id<"jobApplications">;
    _creationTime: number;
    jobId: Id<"jobs">;
    userId: Id<"users">;
    status: ApplicationStatus;
    appliedDate: number;
    nextStep?: string;
    interviewDate?: number;
    notes?: string;
};

// Job Types
export type Job = {
    _id: Id<"jobs">;
    _creationTime: number;
    title: string;
    company: string;
    description: string;
    employmentType?:
        | "full-time"
        | "part-time"
        | "contract"
        | "internship"
        | "temporary";
    location: string;
    locationType?: "on-site" | "remote" | "hybrid";
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryPeriod?: "hour" | "month" | "year";
    requiredSkills?: string[];
    experienceLevel?: "entry" | "mid" | "senior" | "lead" | "executive";
    education?:
        | "high_school"
        | "associate"
        | "bachelor"
        | "master"
        | "phd"
        | "none";
    applicationDeadline?: number;
    applicationUrl?: string;
    howToApply?: string;
    postedDate: number;
    expiresDate?: number;
    isActive: boolean;
    views: number;
    postedBy: Id<"users">;
    companyLogo?: string;
    companyWebsite?: string;
    industry?: string;
    jobCategory?: string;
    tags?: string[];
};

// Mentor Types
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

// Message Types
export type Message = {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    timestamp: number;
    read: boolean;
};

// User Types
export type UserRole = "student" | "mentor" | "employer";

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
    educationLevel?:
        | "high_school"
        | "undergraduate"
        | "graduate"
        | "phd"
        | "bootcamp"
        | "self_taught";
    currentStatus?: string;
    skills?: string[];
    lookingFor?: string[];
    timeline?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileCompletion?: number;
    isOnboardingComplete?: boolean;
    createdAt: number;
    updatedAt?: number;
    lastSeenAt?: number;
    onboardingCompleted?: boolean;
    onboardingStep?: number;
    phone?: string;
    dateOfBirth?: number;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    education?: Array<{
        institution: string;
        degree: string;
        field: string;
        startDate: number;
        endDate?: number;
        isCurrent: boolean;
    }>;
    interests?: string[];
    workStyles?: ("remote" | "hybrid" | "onsite" | "flexible")[];
    careerGoals?: string;
    targetIndustries?: string[];
    targetRoles?: string[];
    salaryExpectation?: string;
    availability?:
        | "immediately"
        | "within_1_month"
        | "within_3_months"
        | "within_6_months"
        | "just_exploring";
};

// Opportunity Types
// TODO: Update to use Id<"opportunities"> when opportunities table is created
export type OpportunityType = "job" | "internship" | "mentorship";

export type Opportunity = {
    _id: string; // Using string until opportunities table is migrated
    _creationTime: number;
    title: string;
    type: OpportunityType;
    description: string;
    company?: string;
    mentor?: string;
    location: string;
    skills: string[];
    postedBy: Id<"users">;
    postedDate: number;
    deadline?: number;
    isRemote: boolean;
    salary?: string;
};

// Mentorship Session Types
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

// Enriched types (with joined data from queries)
export type MentorWithUser = Mentor & {
    name: string;
    email?: string;
    avatarUrl?: string;
};

export type JobWithPoster = Job & {
    poster?: {
        _id: Id<"users">;
        name: string;
        role: string;
        avatarUrl?: string;
    } | null;
};

export type ApplicationWithDetails = Application & {
    opportunity?: Opportunity;
    user?: {
        _id: Id<"users">;
        name: string;
        email: string;
    };
};
