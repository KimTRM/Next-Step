/**
 * Notification Mutations
 * Create, update, and manage notifications
 */

import { mutation, internalMutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Mark a notification as read
 */
export const markAsRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        // Only the recipient can mark as read
        if (notification.userId !== user._id) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.notificationId, {
            isRead: true,
            readAt: Date.now(),
        });

        return { success: true };
    },
});

/**
 * Mark a notification as unread
 */
export const markAsUnread = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        if (notification.userId !== user._id) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.notificationId, {
            isRead: false,
            readAt: undefined,
        });

        return { success: true };
    },
});

/**
 * Toggle star status on a notification
 */
export const toggleStar = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        if (notification.userId !== user._id) {
            throw new Error("Not authorized");
        }

        await ctx.db.patch(args.notificationId, {
            isStarred: !notification.isStarred,
        });

        return { success: true, isStarred: !notification.isStarred };
    },
});

/**
 * Delete a notification
 */
export const deleteNotification = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const notification = await ctx.db.get(args.notificationId);
        if (!notification) {
            throw new Error("Notification not found");
        }

        if (notification.userId !== user._id) {
            throw new Error("Not authorized");
        }

        await ctx.db.delete(args.notificationId);

        return { success: true };
    },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .collect();

        const now = Date.now();
        await Promise.all(
            unreadNotifications.map((notif) =>
                ctx.db.patch(notif._id, {
                    isRead: true,
                    readAt: now,
                })
            )
        );

        return { success: true, count: unreadNotifications.length };
    },
});

/**
 * Delete all notifications
 */
export const deleteAllNotifications = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        await Promise.all(
            notifications.map((notif) => ctx.db.delete(notif._id))
        );

        return { success: true, count: notifications.length };
    },
});

/**
 * Internal: Create a notification (called from other mutations)
 */
export const createNotification = internalMutation({
    args: {
        userId: v.id("users"),
        type: v.union(
            v.literal("message"),
            v.literal("connection_request"),
            v.literal("connection_accepted"),
            v.literal("connection_removed")
        ),
        fromUserId: v.id("users"),
        title: v.string(),
        body: v.optional(v.string()),
        relatedMessageId: v.optional(v.id("messages")),
        relatedConnectionId: v.optional(v.id("connections")),
    },
    handler: async (ctx, args) => {
        const notificationId = await ctx.db.insert("notifications", {
            userId: args.userId,
            type: args.type,
            fromUserId: args.fromUserId,
            title: args.title,
            body: args.body,
            relatedMessageId: args.relatedMessageId,
            relatedConnectionId: args.relatedConnectionId,
            isRead: false,
            isStarred: false,
            createdAt: Date.now(),
        });

        return notificationId;
    },
});
