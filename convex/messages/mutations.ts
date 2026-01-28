/**
 * Message Mutations
 * Send and manage messages
 */

import { mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Send a message to another user
 * Creates a message with isRead = false and timestamp = Date.now()
 */
export const sendMessage = mutation({
    args: {
        receiverId: v.id("users"),
        content: v.string(),
        relatedJobId: v.optional(v.id("jobs")),
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

        // Prevent sending message to self
        if (user._id === args.receiverId) {
            throw new Error("Cannot send message to yourself");
        }

        const messageId = await ctx.db.insert("messages", {
            senderId: user._id,
            receiverId: args.receiverId,
            content: args.content,
            timestamp: Date.now(),
            isRead: false,
            relatedJobId: args.relatedJobId,
        });

        return messageId;
    },
});

/**
 * Mark all messages as read for a conversation
 * Marks all unread messages from otherUserId to current user as read
 */
export const markAsRead = mutation({
    args: { otherUserId: v.id("users") },
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

        // Get all unread messages from otherUser to current user
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiverId", user._id).eq("senderId", args.otherUserId),
            )
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect();

        // Mark each message as read
        for (const message of unreadMessages) {
            await ctx.db.patch(message._id, { isRead: true });
        }

        return unreadMessages.length;
    },
});

/**
 * Mark a single message as read (kept for backwards compatibility)
 */
export const markMessageAsRead = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const message = await ctx.db.get(args.messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        // Only the receiver can mark a message as read
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user || user._id !== message.receiverId) {
            throw new Error("Not authorized to mark this message as read");
        }

        await ctx.db.patch(args.messageId, { isRead: true });
        return true;
    },
});
