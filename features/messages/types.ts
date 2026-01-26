/**
 * Messages Feature - Type Definitions
 */

// eslint-disable-next-line no-restricted-imports
import type { Id } from "@/convex/_generated/dataModel";

// Core Message type
export type Message = {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    timestamp: number;
    read: boolean;
};

// Conversation partner (for conversation list)
export type ConversationPartner = {
    _id: Id<"users">;
    name: string;
    avatarUrl?: string;
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount?: number;
};

// Send message input
export type SendMessageInput = {
    receiverId: Id<"users">;
    content: string;
};

