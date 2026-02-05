/**
 * User Mutations
 * Create, update, and manage user profiles
 */

import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { calculateProfileCompletion } from "./helpers";

// ============================================
// INTERNAL MUTATIONS (for HTTP actions/webhooks)
// ============================================

/**
 * Internal: Create or update user from webhook
 * Called from Convex HTTP action for Clerk webhooks
 */
export const upsertUserInternal = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            // Update existing user (don't overwrite onboardingStatus or role)
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
            });
            console.log(`[upsertUserInternal] Updated user: ${args.clerkId}`);
            return existingUser._id;
        } else {
            // Create new user with onboardingStatus = "not_started"
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                name: args.name,
                email: args.email,
                role: "job_seeker",
                avatarUrl: args.avatarUrl,
                onboardingStatus: "not_started",
                createdAt: Date.now(),
            });
            console.log(`[upsertUserInternal] Created user: ${args.clerkId}`);
            return userId;
        }
    },
});

/**
 * Internal: Delete user from webhook
 * Called from Convex HTTP action for Clerk webhooks
 */
export const deleteUserInternal = internalMutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.delete(user._id);
            console.log(`[deleteUserInternal] Deleted user: ${args.clerkId}`);
        }
        return true;
    },
});

/**
 * Internal: Repair mentor profiles for users with role "mentor" but no mentor entry
 * This is a data migration/repair function to fix existing data
 */
export const repairMentorProfiles = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Find all users with role "mentor"
        const mentorUsers = await ctx.db
            .query("users")
            .withIndex("by_role", (q) => q.eq("role", "mentor"))
            .collect();

        let created = 0;
        let skipped = 0;

        for (const user of mentorUsers) {
            // Check if mentor profile exists (using collect() to handle duplicates)
            const existingMentors = await ctx.db
                .query("mentors")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            if (existingMentors.length === 0) {
                // Create mentor profile
                await ctx.db.insert("mentors", {
                    userId: user._id,
                    role: "Mentor",
                    company: "",
                    location: user.location || "",
                    expertise: user.skills || [],
                    bio: user.bio || "",
                    availability: "To be determined",
                    rating: 0,
                    mentees: 0,
                    sessionsCompleted: 0,
                    totalReviews: 0,
                    isVerified: false,
                    isAvailableForNewMentees: true,
                    createdAt: Date.now(),
                });
                created++;
                console.log(
                    `[repairMentorProfiles] Created mentor profile for user: ${user._id} (${user.email})`,
                );
            } else {
                skipped++;
            }
        }

        console.log(
            `[repairMentorProfiles] Complete. Created: ${created}, Skipped: ${skipped}`,
        );
        return { created, skipped, total: mentorUsers.length };
    },
});

// ============================================
// PUBLIC MUTATIONS
// ============================================

/**
 * Create or update user (upsert)
 * Called from Clerk webhook when user signs up/updates
 */
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        role: v.optional(
            v.union(
                v.literal("job_seeker"),
                v.literal("mentor"),
                v.literal("employer"),
            ),
        ),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            // Update existing user (don't overwrite onboardingStatus)
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                avatarUrl: args.avatarUrl,
            });
            return existingUser._id;
        } else {
            // Create new user with onboardingStatus = "not_started"
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                name: args.name,
                email: args.email,
                role: args.role || "job_seeker",
                avatarUrl: args.avatarUrl,
                onboardingStatus: "not_started",
                createdAt: Date.now(),
            });
            return userId;
        }
    },
});

/**
 * Create user if not exists (called after Clerk sign-up/sign-in)
 * This is the primary mutation for ensuring user exists in Convex after auth
 */
export const createUserIfMissing = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            // User already exists, return their ID
            return existingUser._id;
        }

        // Create new user with onboardingStatus = "not_started"
        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            role: "job_seeker", // Default role, will be set during onboarding
            avatarUrl: args.avatarUrl,
            onboardingStatus: "not_started",
            createdAt: Date.now(),
        });

        return userId;
    },
});

/**
 * Set onboarding status
 */
export const setOnboardingStatus = mutation({
    args: {
        status: v.union(
            v.literal("not_started"),
            v.literal("in_progress"),
            v.literal("completed"),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            onboardingStatus: args.status,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Update user profile
 * Recalculates profile completion after update
 */
export const updateUserProfile = mutation({
    args: {
        name: v.optional(v.string()),
        bio: v.optional(v.string()),
        location: v.optional(v.string()),
        age: v.optional(v.number()),
        skills: v.optional(v.array(v.string())),
        interests: v.optional(v.array(v.string())),
        careerGoals: v.optional(v.string()),
        lookingFor: v.optional(v.array(v.string())),
        timeline: v.optional(v.string()),
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
        currentStatus: v.optional(v.string()),
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
        coverPhotoUrl: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        role: v.optional(
            v.union(
                v.literal("job_seeker"),
                v.literal("mentor"),
                v.literal("employer"),
            ),
        ),
        // Education and Experience arrays
        education: v.optional(
            v.array(
                v.object({
                    institution: v.string(),
                    degree: v.string(),
                    field: v.optional(v.string()), // Field of study
                    startDate: v.number(),
                    endDate: v.optional(v.number()),
                    isCurrent: v.boolean(),
                    description: v.optional(v.string()),
                }),
            ),
        ),
        experience: v.optional(
            v.array(
                v.object({
                    title: v.string(),
                    company: v.string(),
                    location: v.optional(v.string()),
                    startDate: v.number(),
                    endDate: v.optional(v.number()),
                    isCurrent: v.boolean(),
                    description: v.optional(v.string()),
                }),
            ),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Merge existing user data with updates for completion calculation
        const updatedProfile = { ...user, ...args };
        const profileCompletion = calculateProfileCompletion(updatedProfile);

        await ctx.db.patch(user._id, {
            ...args,
            profileCompletion,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Start onboarding - mark as in_progress
 */
export const startOnboarding = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Only update if not already in progress or completed
        if (user.onboardingStatus === "not_started") {
            await ctx.db.patch(user._id, {
                onboardingStatus: "in_progress",
                updatedAt: Date.now(),
            });
        }

        return user._id;
    },
});

/**
 * Mark onboarding as complete
 */
export const completeOnboarding = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            onboardingStatus: "completed",
            isOnboardingComplete: true,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Update user with onboarding data
 */
export const updateUser = mutation({
    args: {
        clerkId: v.string(),
        onboardingCompleted: v.boolean(),
        onboardingStep: v.optional(v.number()),
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.number()),
        gender: v.optional(
            v.union(
                v.literal("male"),
                v.literal("female"),
                v.literal("other"),
                v.literal("prefer_not_to_say"),
            ),
        ),
        education: v.optional(
            v.array(
                v.object({
                    id: v.string(),
                    institution: v.string(),
                    degree: v.string(),
                    field: v.string(),
                    startDate: v.number(),
                    endDate: v.optional(v.number()),
                    isCurrent: v.boolean(),
                }),
            ),
        ),
        skills: v.optional(v.array(v.string())),
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
        coverPhotoUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Remove clerkId from args as it's not part of the update
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { clerkId, ...updateData } = args;

        await ctx.db.patch(user._id, updateData);
        return user._id;
    },
});

/**
 * Delete user
 */
export const deleteUser = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.delete(user._id);
        }
        return true;
    },
});

/**
 * Set user role during onboarding
 * If role is "mentor", also creates a basic mentor profile in the mentors table
 */
export const setRole = mutation({
    args: {
        role: v.union(
            v.literal("job_seeker"),
            v.literal("mentor"),
            v.literal("employer"),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Update user role
        await ctx.db.patch(user._id, {
            role: args.role,
            updatedAt: Date.now(),
        });

        // If role is mentor, create a basic mentor profile if it doesn't exist
        if (args.role === "mentor") {
            const existingMentors = await ctx.db
                .query("mentors")
                .withIndex("by_user_id", (q) => q.eq("userId", user._id))
                .collect();

            if (existingMentors.length === 0) {
                // Create a basic mentor profile that can be completed later
                await ctx.db.insert("mentors", {
                    userId: user._id,
                    role: "Mentor", // Default role, user can update later
                    company: "", // To be filled later
                    location: user.location || "", // Use user's location if available
                    expertise: user.skills || [], // Use user's skills as initial expertise
                    bio: user.bio || "", // Use user's bio if available
                    availability: "To be determined", // Default availability
                    rating: 0,
                    mentees: 0,
                    sessionsCompleted: 0,
                    totalReviews: 0,
                    isVerified: false,
                    isAvailableForNewMentees: true,
                    createdAt: Date.now(),
                });
                console.log(
                    `[setRole] Created mentor profile for user: ${user._id}`,
                );
            }
        }

        return user._id;
    },
});

/**
 * Set user goals during onboarding
 */
export const setGoals = mutation({
    args: {
        goals: v.array(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            goals: args.goals,
            updatedAt: Date.now(),
        });

        return user._id;
    },
});

/**
 * Save onboarding profile based on role
 * Job Seeker: name, field (currentStatus), level (educationLevel), skills
 * Mentor: expertise (skills), experience (bio), bio
 * Employer: organizationName (REQUIRED)
 */
export const saveOnboardingProfile = mutation({
    args: {
        // Common fields
        name: v.optional(v.string()),
        bio: v.optional(v.string()),

        // Job Seeker fields
        currentStatus: v.optional(v.string()), // field
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
        skills: v.optional(v.array(v.string())),

        // Employer field
        organizationName: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Validate employer has organization name
        if (user.role === "employer" && !args.organizationName) {
            throw new Error("Organization name is required for employers");
        }

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) updateData.name = args.name;
        if (args.bio !== undefined) updateData.bio = args.bio;
        if (args.currentStatus !== undefined)
            updateData.currentStatus = args.currentStatus;
        if (args.educationLevel !== undefined)
            updateData.educationLevel = args.educationLevel;
        if (args.skills !== undefined) updateData.skills = args.skills;
        if (args.organizationName !== undefined)
            updateData.organizationName = args.organizationName;

        await ctx.db.patch(user._id, updateData);

        return user._id;
    },
});
