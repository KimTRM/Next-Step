/**
 * Convex Query and Mutation Functions - Messages
 */

import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get messages for current user
 */
export const getUserMessages = query({
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

    // Get all messages where user is sender or receiver
    const sent = await ctx.db
      .query("messages")
      .withIndex("by_sender", (q) => q.eq("senderId", user._id))
      .collect();

    const received = await ctx.db
      .query("messages")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .collect();

    const allMessages = [...sent, ...received];
    allMessages.sort((a, b) => b.timestamp - a.timestamp);

    return allMessages;
  },
});

/**
 * Get conversation between two users
 */
export const getConversation = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
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

    // Get all messages between the two users
    const allMessages = await ctx.db.query("messages").collect();
    const conversation = allMessages.filter(
      (msg) =>
        (msg.senderId === user._id && msg.receiverId === args.otherUserId) ||
        (msg.senderId === args.otherUserId && msg.receiverId === user._id)
    );

    conversation.sort((a, b) => a.timestamp - b.timestamp);

    return conversation;
  },
});

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
