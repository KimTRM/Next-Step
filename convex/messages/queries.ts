/**
 * Message Queries
 * Retrieve message data
 */

import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";

/**
 * Get conversation between current user and another user
 * Fetches messages where (senderId = A AND receiverId = B) OR (senderId = B AND receiverId = A)
 * Sorted by timestamp ASC (oldest first)
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

        // Get messages sent from current user to other user
        const sentMessages = await ctx.db
            .query("messages")
            .withIndex("by_sender_receiver", (q) =>
                q.eq("senderId", user._id).eq("receiverId", args.otherUserId),
            )
            .collect();

        // Get messages received from other user
        const receivedMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiver_sender", (q) =>
                q.eq("receiverId", user._id).eq("senderId", args.otherUserId),
            )
            .collect();

        // Combine and sort by timestamp ASC
        const allMessages = [...sentMessages, ...receivedMessages];
        allMessages.sort((a, b) => a.timestamp - b.timestamp);

        return allMessages;
    },
});

/**
 * Get all conversations for the current user
 * Returns unique conversations with last message preview and unread count
 */
export const getUserConversations = query({
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

        // Get all messages involving the current user
        const sentMessages = await ctx.db
            .query("messages")
            .withIndex("by_sender_receiver", (q) => q.eq("senderId", user._id))
            .collect();

        const receivedMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiverId", (q) => q.eq("receiverId", user._id))
            .collect();

        const allMessages = [...sentMessages, ...receivedMessages];

        // Group messages by conversation partner
        const conversationMap = new Map<
            string,
            {
                otherUserId: Id<"users">;
                messages: Doc<"messages">[];
                unreadCount: number;
            }
        >();

        for (const message of allMessages) {
            const otherUserId =
                message.senderId === user._id ?
                    message.receiverId
                :   message.senderId;
            const key = otherUserId;

            if (!conversationMap.has(key)) {
                conversationMap.set(key, {
                    otherUserId,
                    messages: [],
                    unreadCount: 0,
                });
            }

            const conv = conversationMap.get(key)!;
            conv.messages.push(message);

            // Count unread messages (messages received by current user that are unread)
            if (message.receiverId === user._id && !message.isRead) {
                conv.unreadCount++;
            }
        }

        // Build conversation list with user details
        const conversations = await Promise.all(
            Array.from(conversationMap.values()).map(async (conv) => {
                const otherUser = await ctx.db.get(conv.otherUserId);

                // Sort messages by timestamp to get the last one
                conv.messages.sort((a, b) => b.timestamp - a.timestamp);
                const lastMessage = conv.messages[0];

                return {
                    otherUserId: conv.otherUserId,
                    otherUser:
                        otherUser ?
                            {
                                _id: otherUser._id,
                                name: otherUser.name,
                                avatarUrl: otherUser.avatarUrl,
                            }
                        :   null,
                    lastMessage: {
                        _id: lastMessage._id,
                        content: lastMessage.content,
                        timestamp: lastMessage.timestamp,
                        senderId: lastMessage.senderId,
                        isRead: lastMessage.isRead,
                    },
                    unreadCount: conv.unreadCount,
                };
            }),
        );

        // Sort conversations by last message timestamp (most recent first)
        conversations.sort(
            (a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp,
        );

        return conversations;
    },
});

/**
 * Get total unread message count for the current user
 */
export const getUnreadCount = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return 0;
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            return 0;
        }

        // Get all unread messages where current user is the receiver
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_receiverId", (q) => q.eq("receiverId", user._id))
            .filter((q) => q.eq(q.field("isRead"), false))
            .collect();

        return unreadMessages.length;
    },
});

/**
 * Get messages for current user (kept for backwards compatibility)
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
            .withIndex("by_sender_receiver", (q) => q.eq("senderId", user._id))
            .collect();

        const received = await ctx.db
            .query("messages")
            .withIndex("by_receiverId", (q) => q.eq("receiverId", user._id))
            .collect();

        const allMessages = [...sent, ...received];
        allMessages.sort((a, b) => b.timestamp - a.timestamp);

        return allMessages;
    },
});
