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
            v.literal("job_seeker"),
            v.literal("student"), // Legacy - kept for backwards compatibility
            v.literal("mentor"),
            v.literal("employer"),
        ),

        // Onboarding
        onboardingStatus: v.optional(
            v.union(
                v.literal("not_started"),
                v.literal("in_progress"),
                v.literal("completed"),
            ),
        ),

        // Organization (required for employers)
        organizationName: v.optional(v.string()),

        // Goals (selected during onboarding)
        goals: v.optional(v.array(v.string())),
        age: v.optional(v.number()),
        location: v.optional(v.string()),
        bio: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        coverPhotoUrl: v.optional(v.string()),

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
        socialLinks: v.optional(
            v.array(
                v.object({
                    label: v.string(),
                    url: v.string(),
                }),
            ),
        ),

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
                    id: v.optional(v.string()), // Client-side temporary ID
                    institution: v.string(),
                    degree: v.string(),
                    field: v.optional(v.string()), // Keep for backwards compatibility
                    startDate: v.number(), // Unix timestamp
                    endDate: v.optional(v.number()), // Unix timestamp, null if current
                    isCurrent: v.boolean(),
                    description: v.optional(v.string()), // Additional description
                }),
            ),
        ),

        // Work Experience
        experience: v.optional(
            v.array(
                v.object({
                    id: v.optional(v.string()), // Client-side temporary ID
                    title: v.string(),
                    company: v.string(),
                    location: v.optional(v.string()),
                    startDate: v.number(), // Unix timestamp
                    endDate: v.optional(v.number()), // Unix timestamp, null if current
                    isCurrent: v.boolean(),
                    description: v.optional(v.string()),
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
        applicants: v.optional(v.number()), // Application count

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
     *
     * Indexes:
     * - by_receiverId: Query messages received by a user (for unread counts)
     * - by_sender_receiver: Query conversation from sender's perspective
     * - by_receiver_sender: Query conversation from receiver's perspective
     */
    messages: defineTable({
        senderId: v.id("users"),
        receiverId: v.id("users"),
        content: v.string(),
        timestamp: v.number(), // Unix timestamp (Date.now())
        isRead: v.optional(v.boolean()), // Made optional for legacy data compatibility
        read: v.optional(v.boolean()), // DEPRECATED: Legacy field from old schema
        relatedJobId: v.optional(v.id("jobs")),
    })
        .index("by_receiverId", ["receiverId"])
        .index("by_sender_receiver", ["senderId", "receiverId"])
        .index("by_receiver_sender", ["receiverId", "senderId"]),

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
        userId: v.id("users"), // User who applied
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
        coverLetter: v.optional(v.string()),
        resumeUrl: v.optional(v.string()),
    })
        .index("by_jobId", ["jobId"])
        .index("by_userId", ["userId"])
        .index("by_jobId_userId", ["jobId", "userId"])
        .index("by_status", ["status"]),

    /**
     * Connections Collection
     * User-to-user connections (friends/network)
     *
     * Indexes:
     * - by_requester: Query connections initiated by a user
     * - by_receiver: Query connections received by a user
     * - by_requester_receiver: Query specific connection between two users
     * - by_status: Filter connections by status
     * - by_receiver_status: Query pending requests for a user
     */
    connections: defineTable({
        // Connection participants
        requesterId: v.id("users"), // User who sent the request
        receiverId: v.id("users"), // User who received the request

        // Connection status
        status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("rejected"),
        ),

        // Request message (optional)
        message: v.optional(v.string()),

        // Timestamps
        createdAt: v.number(), // When request was sent
        respondedAt: v.optional(v.number()), // When request was accepted/rejected
    })
        .index("by_requester", ["requesterId"])
        .index("by_receiver", ["receiverId"])
        .index("by_requester_receiver", ["requesterId", "receiverId"])
        .index("by_status", ["status"])
        .index("by_receiver_status", ["receiverId", "status"]),

    /**
     * Notifications Collection
     * User notifications for messages and connections
     *
     * Indexes:
     * - by_user: Get all notifications for a user
     * - by_user_read: Get read/unread notifications for a user
     * - by_user_starred: Get starred notifications for a user
     * - by_type: Filter notifications by type
     */
    notifications: defineTable({
        // Recipient
        userId: v.id("users"), // User who receives the notification

        // Notification type
        type: v.union(
            v.literal("message"),
            v.literal("connection_request"),
            v.literal("connection_accepted"),
            v.literal("connection_removed"),
        ),

        // Related entities
        fromUserId: v.id("users"), // User who triggered the notification
        relatedMessageId: v.optional(v.id("messages")), // For message notifications
        relatedConnectionId: v.optional(v.id("connections")), // For connection notifications

        // Notification content (preview/summary)
        title: v.string(),
        body: v.optional(v.string()),

        // Status
        isRead: v.boolean(),
        isStarred: v.boolean(),

        // Timestamps
        createdAt: v.number(),
        readAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "isRead"])
        .index("by_user_starred", ["userId", "isStarred"])
        .index("by_type", ["type"]),
});
