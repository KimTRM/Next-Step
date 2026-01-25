/**
 * Convex Query and Mutation Functions - Applications
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get applications for current user
 */
export const getUserApplications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("applications")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

/**
 * Get applications for an opportunity
 */
export const getOpportunityApplications = query({
  args: { opportunityId: v.id("opportunities") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("applications")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId))
      .collect();
  },
});

/**
 * Create an application
 */
export const createApplication = mutation({
  args: {
    opportunityId: v.id("opportunities"),
    coverLetter: v.optional(v.string()),
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

    // Check if user already applied
    const existingApplication = await ctx.db
      .query("applications")
      .withIndex("by_opportunity", (q) => q.eq("opportunityId", args.opportunityId))
      .collect();

    const alreadyApplied = existingApplication.some((app) => app.userId === user._id);
    if (alreadyApplied) {
      throw new Error("You have already applied to this opportunity");
    }

    const applicationId = await ctx.db.insert("applications", {
      opportunityId: args.opportunityId,
      userId: user._id,
      status: "pending",
      appliedDate: Date.now(),
      coverLetter: args.coverLetter,
    });

    return applicationId;
  },
});

/**
 * Update application status
 */
export const updateApplicationStatus = mutation({
  args: {
    applicationId: v.id("applications"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.applicationId, { status: args.status });
    return true;
  },
});
