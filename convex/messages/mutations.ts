/**
 * Message Mutations
 * Send and manage messages
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Send a message
 */
export const sendMessage = mutation({
    args: {
        receiverId: v.id("users"),
        content: v.string(),
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

        const messageId = await ctx.db.insert("messages", {
            senderId: user._id,
            receiverId: args.receiverId,
            content: args.content,
            timestamp: Date.now(),
            read: false,
        });

        return messageId;
    },
});

/**
 * Mark message as read
 */
export const markMessageAsRead = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        await ctx.db.patch(args.messageId, { read: true });
        return true;
    },
});
