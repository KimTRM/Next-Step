/**
 * Convex Query and Mutation Functions - Opportunities
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all opportunities with optional filtering
 */
export const getAllOpportunities = query({
  args: {
    type: v.optional(v.string()),
    location: v.optional(v.string()),
    isRemote: v.optional(v.boolean()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let opportunities = await ctx.db.query("opportunities").collect();

    // Filter by type
    if (args.type) {
      opportunities = opportunities.filter((opp) => opp.type === args.type);
    }

    // Filter by location
    if (args.location) {
      opportunities = opportunities.filter((opp) =>
        opp.location.toLowerCase().includes(args.location!.toLowerCase())
      );
    }

    // Filter by remote
    if (args.isRemote !== undefined) {
      opportunities = opportunities.filter((opp) => opp.isRemote === args.isRemote);
    }

    // Search in title and description
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      opportunities = opportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchLower) ||
          opp.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    opportunities.sort((a, b) => b.postedDate - a.postedDate);

    return opportunities;
  },
});

/**
 * Get a single opportunity by ID
 */
export const getOpportunityById = query({
  args: { id: v.id("opportunities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a new opportunity
 */
export const createOpportunity = mutation({
  args: {
    title: v.string(),
    type: v.union(v.literal("job"), v.literal("internship"), v.literal("mentorship")),
    description: v.string(),
    company: v.optional(v.string()),
    mentor: v.optional(v.string()),
    location: v.string(),
    skills: v.array(v.string()),
    isRemote: v.boolean(),
    salary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const opportunityId = await ctx.db.insert("opportunities", {
      ...args,
      postedBy: user._id,
      postedDate: Date.now(),
    });

    return opportunityId;
  },
});

/**
 * Update an opportunity
 */
export const updateOpportunity = mutation({
  args: {
    id: v.id("opportunities"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    isRemote: v.optional(v.boolean()),
    salary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete an opportunity
 */
export const deleteOpportunity = mutation({
  args: { id: v.id("opportunities") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    await ctx.db.delete(args.id);
    return true;
  },
});
