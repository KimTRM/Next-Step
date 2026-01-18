/**
 * Message type definitions
 */

import type { Id } from "@/convex/_generated/dataModel";

export interface Message {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    timestamp: number;
    read: boolean;
}

export interface MessageWithUsers extends Message {
    sender?: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role: string;
    };
    receiver?: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role: string;
    };
}

export interface SendMessageInput {
    receiverId: Id<"users">;
    content: string;
}
