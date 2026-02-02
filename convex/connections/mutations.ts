/**
 * Connection Mutations
 * Create, update, and manage connections
 */

import { mutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

/**
 * Send a connection request
 */
export const sendConnectionRequest = mutation({
    args: {
        receiverId: v.id("users"),
        message: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Must be authenticated to send connection request");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        // Can't connect with yourself
        if (user._id === args.receiverId) {
            throw new Error("Cannot send connection request to yourself");
        }

        // Check if receiver exists
        const receiver = await ctx.db.get(args.receiverId);
        if (!receiver) {
            throw new Error("Receiver not found");
        }

        // Check if connection already exists (either direction)
        const existingAsRequester = await ctx.db
            .query("connections")
            .withIndex("by_requester_receiver", (q) =>
                q.eq("requesterId", user._id).eq("receiverId", args.receiverId)
            )
            .unique();

        if (existingAsRequester) {
            if (existingAsRequester.status === "rejected") {
                // Previous request was rejected, delete it and allow new request
                await ctx.db.delete(existingAsRequester._id);
            } else if (existingAsRequester.status === "pending") {
                throw new Error("Connection request already sent");
            } else {
                // Status is "accepted" - already connected
                throw new Error("Connection already exists");
            }
        }

        const existingAsReceiver = await ctx.db
            .query("connections")
            .withIndex("by_requester_receiver", (q) =>
                q.eq("requesterId", args.receiverId).eq("receiverId", user._id)
            )
            .unique();

        if (existingAsReceiver) {
            if (existingAsReceiver.status === "rejected") {
                // They rejected our previous request to them, delete and allow new request
                await ctx.db.delete(existingAsReceiver._id);
            } else if (existingAsReceiver.status === "pending") {
                // They already sent us a request, auto-accept it
                await ctx.db.patch(existingAsReceiver._id, {
                    status: "accepted",
                    respondedAt: Date.now(),
                });

                // Notify them that we accepted (by connecting back)
                await ctx.scheduler.runAfter(0, internal.notifications.index.createNotification, {
                    userId: args.receiverId,
                    type: "connection_accepted",
                    fromUserId: user._id,
                    title: `${user.name} accepted your connection request`,
                    relatedConnectionId: existingAsReceiver._id,
                });

                return { connectionId: existingAsReceiver._id, autoAccepted: true };
            } else {
                // Status is "accepted" - already connected
                throw new Error("Connection already exists");
            }
        }

        // Create new connection request
        const connectionId = await ctx.db.insert("connections", {
            requesterId: user._id,
            receiverId: args.receiverId,
            status: "pending",
            message: args.message,
            createdAt: Date.now(),
        });

        // Create notification for the receiver
        await ctx.scheduler.runAfter(0, internal.notifications.index.createNotification, {
            userId: args.receiverId,
            type: "connection_request",
            fromUserId: user._id,
            title: `${user.name} sent you a connection request`,
            body: args.message,
            relatedConnectionId: connectionId,
        });

        return { connectionId, autoAccepted: false };
    },
});

/**
 * Accept a connection request
 */
export const acceptConnectionRequest = mutation({
    args: {
        connectionId: v.id("connections"),
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

        const connection = await ctx.db.get(args.connectionId);
        if (!connection) {
            throw new Error("Connection request not found");
        }

        // Only the receiver can accept
        if (connection.receiverId !== user._id) {
            throw new Error("Only the receiver can accept this request");
        }

        if (connection.status !== "pending") {
            throw new Error("This request has already been responded to");
        }

        await ctx.db.patch(args.connectionId, {
            status: "accepted",
            respondedAt: Date.now(),
        });

        // Notify the requester that their request was accepted
        await ctx.scheduler.runAfter(0, internal.notifications.index.createNotification, {
            userId: connection.requesterId,
            type: "connection_accepted",
            fromUserId: user._id,
            title: `${user.name} accepted your connection request`,
            relatedConnectionId: args.connectionId,
        });

        return { success: true };
    },
});

/**
 * Reject a connection request
 */
export const rejectConnectionRequest = mutation({
    args: {
        connectionId: v.id("connections"),
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

        const connection = await ctx.db.get(args.connectionId);
        if (!connection) {
            throw new Error("Connection request not found");
        }

        // Only the receiver can reject
        if (connection.receiverId !== user._id) {
            throw new Error("Only the receiver can reject this request");
        }

        if (connection.status !== "pending") {
            throw new Error("This request has already been responded to");
        }

        await ctx.db.patch(args.connectionId, {
            status: "rejected",
            respondedAt: Date.now(),
        });

        // No notification for rejection (to avoid negativity)

        return { success: true };
    },
});

/**
 * Cancel an outbound connection request
 */
export const cancelConnectionRequest = mutation({
    args: {
        connectionId: v.id("connections"),
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

        const connection = await ctx.db.get(args.connectionId);
        if (!connection) {
            throw new Error("Connection request not found");
        }

        // Only the requester can cancel
        if (connection.requesterId !== user._id) {
            throw new Error("Only the requester can cancel this request");
        }

        if (connection.status !== "pending") {
            throw new Error("Can only cancel pending requests");
        }

        await ctx.db.delete(args.connectionId);

        return { success: true };
    },
});

/**
 * Remove a connection (unfriend)
 */
export const removeConnection = mutation({
    args: {
        connectionId: v.id("connections"),
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

        const connection = await ctx.db.get(args.connectionId);
        if (!connection) {
            throw new Error("Connection not found");
        }

        // Either party can remove the connection
        if (connection.requesterId !== user._id && connection.receiverId !== user._id) {
            throw new Error("You are not part of this connection");
        }

        if (connection.status !== "accepted") {
            throw new Error("Can only remove accepted connections");
        }

        // Determine the other user
        const otherUserId = connection.requesterId === user._id 
            ? connection.receiverId 
            : connection.requesterId;

        await ctx.db.delete(args.connectionId);

        // Notify the other user that they were removed
        await ctx.scheduler.runAfter(0, internal.notifications.index.createNotification, {
            userId: otherUserId,
            type: "connection_removed",
            fromUserId: user._id,
            title: `${user.name} removed you from their connections`,
        });

        return { success: true };
    },
});
