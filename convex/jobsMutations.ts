import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const incrementViews = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        views: (job.views || 0) + 1,
      });
    }
  },
});

export const incrementApplicants = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job) {
      await ctx.db.patch(args.jobId, {
        applicants: (job.applicants || 0) + 1,
      });
    }
  },
});
