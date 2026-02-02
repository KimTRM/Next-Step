/**
 * Connection Queries
 * Retrieve connection data (read-only)
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Get all accepted connections for the current user
 */
export const getConnections = query({
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

        // Get connections where user is requester
        const asRequester = await ctx.db
            .query("connections")
            .withIndex("by_requester", (q) => q.eq("requesterId", user._id))
            .filter((q) => q.eq(q.field("status"), "accepted"))
            .collect();

        // Get connections where user is receiver
        const asReceiver = await ctx.db
            .query("connections")
            .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
            .filter((q) => q.eq(q.field("status"), "accepted"))
            .collect();

        // Get user details for all connections
        const connections = [...asRequester, ...asReceiver];
        const enrichedConnections = await Promise.all(
            connections.map(async (conn) => {
                const otherUserId = conn.requesterId === user._id ? conn.receiverId : conn.requesterId;
                const otherUser = await ctx.db.get(otherUserId);
                return {
                    ...conn,
                    connectedUser: otherUser,
                };
            })
        );

        return enrichedConnections;
    },
});

/**
 * Get pending connection requests received by current user (inbound)
 */
export const getInboundRequests = query({
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

        const requests = await ctx.db
            .query("connections")
            .withIndex("by_receiver_status", (q) =>
                q.eq("receiverId", user._id).eq("status", "pending")
            )
            .collect();

        // Enrich with requester user data
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const requester = await ctx.db.get(req.requesterId);
                return {
                    ...req,
                    requesterUser: requester,
                };
            })
        );

        return enrichedRequests;
    },
});

/**
 * Get pending connection requests sent by current user (outbound)
 */
export const getOutboundRequests = query({
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

        const requests = await ctx.db
            .query("connections")
            .withIndex("by_requester", (q) => q.eq("requesterId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        // Enrich with receiver user data
        const enrichedRequests = await Promise.all(
            requests.map(async (req) => {
                const receiver = await ctx.db.get(req.receiverId);
                return {
                    ...req,
                    receiverUser: receiver,
                };
            })
        );

        return enrichedRequests;
    },
});

/**
 * Get connection status between current user and another user
 */
export const getConnectionStatus = query({
    args: {
        otherUserId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return { status: "none" as const };
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            return { status: "none" as const };
        }

        // Check if current user sent request
        const sentRequest = await ctx.db
            .query("connections")
            .withIndex("by_requester_receiver", (q) =>
                q.eq("requesterId", user._id).eq("receiverId", args.otherUserId)
            )
            .unique();

        if (sentRequest) {
            return {
                status: sentRequest.status,
                connectionId: sentRequest._id,
                direction: "outbound" as const,
            };
        }

        // Check if current user received request
        const receivedRequest = await ctx.db
            .query("connections")
            .withIndex("by_requester_receiver", (q) =>
                q.eq("requesterId", args.otherUserId).eq("receiverId", user._id)
            )
            .unique();

        if (receivedRequest) {
            return {
                status: receivedRequest.status,
                connectionId: receivedRequest._id,
                direction: "inbound" as const,
            };
        }

        return { status: "none" as const };
    },
});

/**
 * Get count of pending inbound requests (for notification badge)
 */
export const getPendingRequestCount = query({
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

        const requests = await ctx.db
            .query("connections")
            .withIndex("by_receiver_status", (q) =>
                q.eq("receiverId", user._id).eq("status", "pending")
            )
            .collect();

        return requests.length;
    },
});
