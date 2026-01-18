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
        interests: v.optional(v.array(v.string())),

        // Career
        careerGoals: v.optional(v.string()),
        lookingFor: v.optional(v.array(v.string())), // ["job", "mentorship", "internship", "networking"]
        timeline: v.optional(v.string()), // e.g., "3-6 months", "immediate", "exploring"

        // Social Links
        linkedInUrl: v.optional(v.string()),
        githubUrl: v.optional(v.string()),
        portfolioUrl: v.optional(v.string()),

        // Profile Tracking
        profileCompletion: v.number(), // 0-100 percentage
        isOnboardingComplete: v.boolean(),

        // Metadata
        createdAt: v.number(),
        updatedAt: v.number(),
        lastSeenAt: v.optional(v.number()),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_skills", ["skills"])
        .index("by_education_level", ["educationLevel"]),

    /**
     * Opportunities Collection
     * Jobs, internships, and mentorship opportunities
     */
    opportunities: defineTable({
        title: v.string(),
        type: v.union(
            v.literal("job"),
            v.literal("internship"),
            v.literal("mentorship"),
        ),
        description: v.string(),
        company: v.optional(v.string()),
        mentor: v.optional(v.string()),
        location: v.string(),
        skills: v.array(v.string()),
        postedBy: v.id("users"), // Reference to user who posted
        postedDate: v.number(), // Unix timestamp
        deadline: v.optional(v.number()), // Unix timestamp
        isRemote: v.boolean(),
        salary: v.optional(v.string()),
    })
        .index("by_type", ["type"])
        .index("by_posted_by", ["postedBy"])
        .index("by_posted_date", ["postedDate"]),

    /**
     * Applications Collection
     * User applications to opportunities
     */
    applications: defineTable({
        opportunityId: v.id("opportunities"),
        userId: v.id("users"),
        status: v.union(
            v.literal("pending"),
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
     * Jobs Collection
     * Job postings for fresh graduates
     */
    jobs: defineTable({
        title: v.string(),
        company: v.string(),
        location: v.string(),
        type: v.union(
            v.literal("full-time"),
            v.literal("part-time"),
            v.literal("internship"),
            v.literal("contract"),
        ),
        category: v.string(),
        salary: v.string(),
        description: v.string(),
        postedDate: v.number(), // Unix timestamp
        postedBy: v.id("users"),
        applicants: v.number(), // Count of applicants
        isActive: v.boolean(),
    })
        .index("by_type", ["type"])
        .index("by_category", ["category"])
        .index("by_posted_by", ["postedBy"])
        .index("by_posted_date", ["postedDate"])
        .index("by_is_active", ["isActive"]),

    /**
     * Mentors Collection
     * Mentor profiles with expertise and availability
     */
    mentors: defineTable({
        userId: v.id("users"), // Reference to user account
        role: v.string(), // Professional role
        company: v.string(),
        location: v.string(),
        expertise: v.array(v.string()),
        experience: v.string(), // e.g., "8 years"
        rating: v.number(),
        mentees: v.number(), // Number of current mentees
        bio: v.string(),
        availability: v.string(),
        isVerified: v.boolean(),
    })
        .index("by_user_id", ["userId"])
        .index("by_rating", ["rating"])
        .index("by_is_verified", ["isVerified"]),

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
