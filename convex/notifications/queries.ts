/**
 * Notification Queries
 * Retrieve notification data (read-only)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all notifications for the current user
 */
export const getNotifications = query({
    args: {
        limit: v.optional(v.number()),
    },
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

        const limit = args.limit || 50;

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(limit);

        // Enrich with fromUser data
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notif) => {
                const fromUser = await ctx.db.get(notif.fromUserId);
                return {
                    ...notif,
                    fromUser: fromUser
                        ? {
                              _id: fromUser._id,
                              name: fromUser.name,
                              avatarUrl: fromUser.avatarUrl,
                          }
                        : null,
                };
            })
        );

        return enrichedNotifications;
    },
});

/**
 * Get unread notifications for the current user
 */
export const getUnreadNotifications = query({
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

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .order("desc")
            .collect();

        // Enrich with fromUser data
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notif) => {
                const fromUser = await ctx.db.get(notif.fromUserId);
                return {
                    ...notif,
                    fromUser: fromUser
                        ? {
                              _id: fromUser._id,
                              name: fromUser.name,
                              avatarUrl: fromUser.avatarUrl,
                          }
                        : null,
                };
            })
        );

        return enrichedNotifications;
    },
});

/**
 * Get starred notifications for the current user
 */
export const getStarredNotifications = query({
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

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_starred", (q) =>
                q.eq("userId", user._id).eq("isStarred", true)
            )
            .order("desc")
            .collect();

        // Enrich with fromUser data
        const enrichedNotifications = await Promise.all(
            notifications.map(async (notif) => {
                const fromUser = await ctx.db.get(notif.fromUserId);
                return {
                    ...notif,
                    fromUser: fromUser
                        ? {
                              _id: fromUser._id,
                              name: fromUser.name,
                              avatarUrl: fromUser.avatarUrl,
                          }
                        : null,
                };
            })
        );

        return enrichedNotifications;
    },
});

/**
 * Get unread notification count (for badge)
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

        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) =>
                q.eq("userId", user._id).eq("isRead", false)
            )
            .collect();

        return notifications.length;
    },
});
