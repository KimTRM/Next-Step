/**
 * Messages Feature - Type Definitions
 */

// eslint-disable-next-line no-restricted-imports
import type { Id } from "@/convex/_generated/dataModel";

// Core Message type - matches Convex Doc<"messages"> exactly
export type Message = {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    timestamp: number;
    isRead: boolean;
    relatedJobId?: Id<"jobs">;
};

// User info for conversations
export type ConversationUser = {
    _id: Id<"users">;
    name: string;
    avatarUrl?: string;
};

// Conversation summary (for conversation list)
export type Conversation = {
    otherUserId: Id<"users">;
    otherUser: ConversationUser | null;
    lastMessage: {
        _id: Id<"messages">;
        content: string;
        timestamp: number;
        senderId: Id<"users">;
        isRead: boolean;
    };
    unreadCount: number;
};

// Legacy type for backwards compatibility
export type ConversationPartner = {
    _id: Id<"users">;
    name: string;
    avatarUrl?: string;
    lastMessage?: string | Message;
    lastMessageTime?: number;
    unreadCount?: number;
};

// Send message input
export type SendMessageInput = {
    receiverId: Id<"users">;
    content: string;
    relatedJobId?: Id<"jobs">;
};
