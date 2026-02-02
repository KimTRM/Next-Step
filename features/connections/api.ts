"use client";

/**
 * Connections Feature - API Layer
 * ONLY place that imports Convex hooks for connections feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all accepted connections for the current user
 */
export function useConnections() {
    return useQuery(api.connections.index.getConnections, {});
}

/**
 * Get pending inbound connection requests
 */
export function useInboundRequests() {
    return useQuery(api.connections.index.getInboundRequests, {});
}

/**
 * Get pending outbound connection requests
 */
export function useOutboundRequests() {
    return useQuery(api.connections.index.getOutboundRequests, {});
}

/**
 * Get connection status with another user
 */
export function useConnectionStatus(otherUserId: Id<"users"> | null | undefined) {
    return useQuery(
        api.connections.index.getConnectionStatus,
        otherUserId ? { otherUserId } : "skip"
    );
}

/**
 * Get count of pending inbound requests (for notification badge)
 */
export function usePendingRequestCount() {
    return useQuery(api.connections.index.getPendingRequestCount, {});
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Send a connection request
 */
export function useSendConnectionRequest() {
    return useMutation(api.connections.index.sendConnectionRequest);
}

/**
 * Accept a connection request
 */
export function useAcceptConnectionRequest() {
    return useMutation(api.connections.index.acceptConnectionRequest);
}

/**
 * Reject a connection request
 */
export function useRejectConnectionRequest() {
    return useMutation(api.connections.index.rejectConnectionRequest);
}

/**
 * Cancel an outbound connection request
 */
export function useCancelConnectionRequest() {
    return useMutation(api.connections.index.cancelConnectionRequest);
}

/**
 * Remove a connection (unfriend)
 */
export function useRemoveConnection() {
    return useMutation(api.connections.index.removeConnection);
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    Connection,
    ConnectionWithUser,
    InboundRequest,
    OutboundRequest,
    ConnectionStatus,
    SendConnectionRequestInput,
    SendConnectionRequestResponse,
} from "./types";
