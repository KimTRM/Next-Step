/**
 * Connections Feature - Types
 */

// eslint-disable-next-line no-restricted-imports
import type { Id, Doc } from "@/convex/_generated/dataModel";

/**
 * Base connection type from database
 */
export type Connection = Doc<"connections">;

/**
 * Connection with connected user enrichment
 */
export interface ConnectionWithUser extends Connection {
    connectedUser: Doc<"users"> | null;
}

/**
 * Inbound request with requester user enrichment
 */
export interface InboundRequest extends Connection {
    requesterUser: Doc<"users"> | null;
}

/**
 * Outbound request with receiver user enrichment
 */
export interface OutboundRequest extends Connection {
    receiverUser: Doc<"users"> | null;
}

/**
 * Connection status response
 */
export interface ConnectionStatus {
    status: "none" | "pending" | "accepted" | "rejected";
    connectionId?: Id<"connections">;
    direction?: "inbound" | "outbound";
}

/**
 * Send connection request input
 */
export interface SendConnectionRequestInput {
    receiverId: Id<"users">;
    message?: string;
}

/**
 * Send connection request response
 */
export interface SendConnectionRequestResponse {
    connectionId: Id<"connections">;
    autoAccepted: boolean;
}

export interface ConnectionRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetUser: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role?: string;
    } | null;
    onSuccess?: () => void;
}
