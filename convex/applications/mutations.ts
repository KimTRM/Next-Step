/**
 * Application Mutations
 * Create and manage job applications
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Create a new job application
 */
export const createJobApplication = mutation({
    args: {
        jobId: v.id("jobs"),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated to apply");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Check if already applied
        const existing = await ctx.db
            .query("jobApplications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("jobId"), args.jobId))
            .unique();

        if (existing) {
            throw new Error("Already applied to this job");
        }

        const applicationId = await ctx.db.insert("jobApplications", {
            jobId: args.jobId,
            userId: user._id,
            status: "pending",
            appliedDate: Date.now(),
            notes: args.notes,
        });

        // Note: Applicant count is now calculated from applications table, not stored on job
        // No need to increment a counter

        return applicationId;
    },
});

/**
 * Update application status
 */
export const updateApplicationStatus = mutation({
    args: {
        applicationId: v.id("jobApplications"),
        status: v.union(
            v.literal("pending"),
            v.literal("reviewing"),
            v.literal("interview"),
            v.literal("rejected"),
            v.literal("accepted"),
        ),
        nextStep: v.optional(v.string()),
        interviewDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { applicationId, ...updates } = args;

        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const application = await ctx.db.get(applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        await ctx.db.patch(applicationId, updates);
    },
});

/**
 * Update application notes
 */
export const updateApplicationNotes = mutation({
    args: {
        applicationId: v.id("jobApplications"),
        notes: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const application = await ctx.db.get(args.applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || application.userId !== user._id) {
            throw new Error("Not authorized to update this application");
        }

        await ctx.db.patch(args.applicationId, {
            notes: args.notes,
        });
    },
});

/**
 * Delete application
 */
export const deleteApplication = mutation({
    args: { applicationId: v.id("jobApplications") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const application = await ctx.db.get(args.applicationId);
        if (!application) {
            throw new Error("Application not found");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || application.userId !== user._id) {
            throw new Error("Not authorized to delete this application");
        }

        await ctx.db.delete(args.applicationId);

        // Note: Applicant count is now calculated from applications table, not stored on job
        // No need to decrement a counter
    },
});
