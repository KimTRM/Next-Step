/**
 * Convex Database Schema - NextStep Platform
 *
 * Defines the structure of all collections in the Convex database
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    /**
     * Users Collection
     * Stores comprehensive user profiles (students, mentors, employers)
     *
     * Indexes:
     * - by_clerk_id: Primary lookup for authenticated users (most common query)
     * - by_email: User search and duplicate prevention
     * - by_role: Filter users by role for matching
     * - by_skills: Match users by skills for recommendations
     * - by_education_level: Group users by education for cohort features
     */
    users: defineTable({
        // Clerk Authentication
        clerkId: v.string(),
        email: v.string(),
        name: v.string(),

        // Basic Profile
        role: v.union(
            v.literal("student"),
            v.literal("mentor"),
            v.literal("employer"),
        ),
        age: v.optional(v.number()),
        location: v.optional(v.string()),
        bio: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),

        // Education
        educationLevel: v.optional(
            v.union(
                v.literal("high_school"),
                v.literal("undergraduate"),
                v.literal("graduate"),
                v.literal("phd"),
                v.literal("bootcamp"),
                v.literal("self_taught"),
            ),
        ),
        currentStatus: v.optional(v.string()), // e.g., "3rd year CS student", "Recent grad"

        // Skills & Interests
        skills: v.optional(v.array(v.string())),

        // Career
        lookingFor: v.optional(v.array(v.string())), // ["job", "mentorship", "internship", "networking"]
        timeline: v.optional(v.string()), // e.g., "3-6 months", "immediate", "exploring"

        // Social Links
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),

        // Profile Tracking
        profileCompletion: v.optional(v.number()), // 0-100 percentage
        isOnboardingComplete: v.optional(v.boolean()),

        // Metadata
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        lastSeenAt: v.optional(v.number()),

        // Onboarding fields
        onboardingCompleted: v.optional(v.boolean()),
        onboardingStep: v.optional(v.number()),

        // Basic Info
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.number()), // Unix timestamp
        gender: v.optional(
            v.union(
                v.literal("male"),
                v.literal("female"),
                v.literal("other"),
                v.literal("prefer_not_to_say"),
            ),
        ),

        // Education
        education: v.optional(
            v.array(
                v.object({
                    institution: v.string(),
                    degree: v.string(),
                    field: v.string(),
                    startDate: v.number(), // Unix timestamp
                    endDate: v.optional(v.number()), // Unix timestamp, null if current
                    isCurrent: v.boolean(),
                }),
            ),
        ),

        // Interests
        interests: v.optional(v.array(v.string())),
        workStyles: v.optional(
            v.array(
                v.union(
                    v.literal("remote"),
                    v.literal("hybrid"),
                    v.literal("onsite"),
                    v.literal("flexible"),
                ),
            ),
        ),

        // Career Goals
        careerGoals: v.optional(v.string()),
        targetIndustries: v.optional(v.array(v.string())),
        targetRoles: v.optional(v.array(v.string())),
        salaryExpectation: v.optional(v.string()),
        availability: v.optional(
            v.union(
                v.literal("immediately"),
                v.literal("within_1_month"),
                v.literal("within_3_months"),
                v.literal("within_6_months"),
                v.literal("just_exploring"),
            ),
        ),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_skills", ["skills"])
        .index("by_education_level", ["educationLevel"]),

    /**
     * Jobs Collection
     * Job listings with comprehensive details
     *
     * Indexes:
     * - by_company: Group jobs by company for company pages
     * - by_requiredSkills: Match jobs by skills for recommendations
     * - by_employmentType: Filter by full-time, part-time, contract, etc.
     * - by_location: Filter by job location
     * - by_postedDate: Sort by newest/oldest
     * - by_isActive: Filter active jobs
     * - by_isActive_postedDate: Compound index for active jobs sorted by date
     */
    jobs: defineTable({
        // Basic Information
        title: v.string(),
        company: v.string(),
        description: v.string(), // Markdown or HTML, max 5000 chars

        // Job Details
        employmentType: v.optional(
            v.union(
                v.literal("full-time"),
                v.literal("part-time"),
                v.literal("contract"),
                v.literal("internship"),
                v.literal("temporary"),
            ),
        ),
        location: v.string(),
        locationType: v.optional(
            v.union(
                v.literal("on-site"),
                v.literal("remote"),
                v.literal("hybrid"),
            ),
        ),
        minSalary: v.optional(v.number()),
        maxSalary: v.optional(v.number()),
        salaryCurrency: v.optional(v.string()), // e.g., "USD", "EUR"
        salaryPeriod: v.optional(
            v.union(v.literal("hour"), v.literal("month"), v.literal("year")),
        ),

        // Requirements
        requiredSkills: v.optional(v.array(v.string())),
        experienceLevel: v.optional(
            v.union(
                v.literal("entry"),
                v.literal("mid"),
                v.literal("senior"),
                v.literal("lead"),
                v.literal("executive"),
            ),
        ),
        education: v.optional(
            v.union(
                v.literal("high_school"),
                v.literal("associate"),
                v.literal("bachelor"),
                v.literal("master"),
                v.literal("phd"),
                v.literal("none"),
            ),
        ),

        // Application Details
        applicationDeadline: v.optional(v.number()), // Unix timestamp
        applicationUrl: v.optional(v.string()),
        howToApply: v.optional(v.string()),

        // Metadata
        postedDate: v.number(), // Unix timestamp
        expiresDate: v.optional(v.number()), // Unix timestamp
        isActive: v.boolean(),
        views: v.number(), // View count

        // Poster Information
        postedBy: v.id("users"),
        companyLogo: v.optional(v.string()),
        companyWebsite: v.optional(v.string()),

        // Categorization
        industry: v.optional(v.string()),
        jobCategory: v.optional(v.string()), // e.g., "Engineering", "Design", "Marketing"
        tags: v.optional(v.array(v.string())),
    })
        .index("by_company", ["company"])
        .index("by_requiredSkills", ["requiredSkills"])
        .index("by_employmentType", ["employmentType"])
        .index("by_location", ["location"])
        .index("by_postedDate", ["postedDate"])
        .index("by_isActive", ["isActive"])
        .index("by_isActive_postedDate", ["isActive", "postedDate"])
        .index("by_postedBy", ["postedBy"])
        .index("by_experienceLevel", ["experienceLevel"]),

    /**
     * Applications Collection
     * User applications to opportunities
     */
    applications: defineTable({
        opportunityId: v.id("opportunities"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("reviewing"),
            v.literal("interview"),
            v.literal("accepted"),
            v.literal("rejected"),
        ),
        appliedDate: v.number(), // Unix timestamp
        coverLetter: v.optional(v.string()),
    })
        .index("by_opportunity", ["opportunityId"])
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),

    /**
     * Messages Collection
     * Direct messages between users
     */
    messages: defineTable({
        senderId: v.id("users"),
        receiverId: v.id("users"),
        content: v.string(),
        timestamp: v.number(), // Unix timestamp
        read: v.boolean(),
    })
        .index("by_sender", ["senderId"])
        .index("by_receiver", ["receiverId"])
        .index("by_conversation", ["senderId", "receiverId"]),

    /**
     * Mentorship Sessions Collection
     * Scheduled sessions between mentors and students
     */
    mentorshipSessions: defineTable({
        mentorId: v.id("users"),
        studentId: v.id("users"),
        topic: v.string(),
        scheduledDate: v.number(), // Unix timestamp
        duration: v.number(), // Duration in minutes
        status: v.union(
            v.literal("scheduled"),
            v.literal("completed"),
            v.literal("cancelled"),
        ),
    })
        .index("by_mentor", ["mentorId"])
        .index("by_student", ["studentId"])
        .index("by_status", ["status"]),

    /**
     * Mentors Collection
     * Comprehensive mentor profiles with expertise, availability, and verification
     *
     * Indexes:
     * - by_user_id: Link mentor profile to user account
     * - by_rating: Sort by rating for top mentors
     * - by_is_verified: Filter verified mentors
     * - by_expertise: Match mentors by skills/expertise
     * - by_hourlyRate: Filter by price range
     * - by_rating_verified: Compound index for verified mentors sorted by rating
     */
    mentors: defineTable({
        // User Reference
        userId: v.id("users"),

        // Professional Information
        role: v.string(), // Current role/title
        company: v.string(),
        currentPosition: v.optional(v.string()), // More specific than role
        yearsOfExperience: v.optional(v.number()), // Numeric value for better filtering (TEMPORARILY optional for old data)
        industry: v.optional(v.string()),

        // Profile & Bio
        bio: v.string(), // Short bio (200 chars)
        longBio: v.optional(v.string()), // Detailed background (1000+ chars)
        profileImageUrl: v.optional(v.string()),
        tagline: v.optional(v.string()), // One-liner value proposition

        // Location & Timezone
        location: v.string(),
        timezone: v.optional(v.string()), // e.g., "Asia/Manila", "America/New_York"
        isRemoteOnly: v.optional(v.boolean()),

        // Expertise & Skills
        expertise: v.array(v.string()), // Primary areas
        specializations: v.optional(v.array(v.string())), // More specific skills
        languages: v.optional(v.array(v.string())), // e.g., ["English", "Filipino", "Spanish"]

        // Availability
        availability: v.string(), // Human-readable (e.g., "Weekends")
        availableDays: v.optional(v.array(v.string())), // ["monday", "wednesday", "friday"]
        availableTimeSlots: v.optional(v.array(v.string())), // ["morning", "evening"]

        // Pricing
        hourlyRate: v.optional(v.number()),
        currency: v.optional(v.string()), // e.g., "USD", "PHP"
        offersFreeSession: v.optional(v.boolean()),

        // Metrics & Performance
        rating: v.number(), // Average rating (0-5)
        totalReviews: v.optional(v.number()), // Number of reviews
        mentees: v.number(), // Current active mentees
        sessionsCompleted: v.optional(v.number()),
        responseTime: v.optional(v.string()), // e.g., "within 24 hours"
        acceptanceRate: v.optional(v.number()), // % of requests accepted

        // Verification & Status
        isVerified: v.boolean(),
        verifiedAt: v.optional(v.number()), // Unix timestamp
        isAvailableForNewMentees: v.optional(v.boolean()),
        maxMentees: v.optional(v.number()), // Capacity limit

        // Social Links
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),
        twitterUrl: v.optional(v.string()),

        // Mentorship Style
        mentoringStyle: v.optional(v.array(v.string())), // ["hands-on", "advisory", "career-coaching"]
        focusAreas: v.optional(v.array(v.string())), // ["career-transition", "skill-building", "interview-prep"]

        // Metadata
        createdAt: v.optional(v.number()), // TEMPORARILY optional for old data
        updatedAt: v.optional(v.number()),
        lastActiveAt: v.optional(v.number()),
    })
        .index("by_user_id", ["userId"])
        .index("by_rating", ["rating"])
        .index("by_is_verified", ["isVerified"])
        .index("by_expertise", ["expertise"])
        .index("by_hourlyRate", ["hourlyRate"])
        .index("by_rating_verified", ["isVerified", "rating"])
        .index("by_yearsOfExperience", ["yearsOfExperience"]),

    /**
     * Job Applications Collection
     * Enhanced applications tracking for jobs
     */
    jobApplications: defineTable({
        jobId: v.id("jobs"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
            v.literal("reviewing"),
            v.literal("interview"),
            v.literal("rejected"),
            v.literal("accepted"),
        ),
        appliedDate: v.number(), // Unix timestamp
        nextStep: v.optional(v.string()),
        interviewDate: v.optional(v.number()),
        notes: v.optional(v.string()),
    })
        .index("by_job", ["jobId"])
        .index("by_user", ["userId"])
        .index("by_status", ["status"]),
});
