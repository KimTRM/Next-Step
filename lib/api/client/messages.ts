/**
 * Messages API Client
 * Client-side service for messaging operations
 */

import { get, post } from "./base";
import type { Id } from "@/convex/_generated/dataModel";

export type Message = {
    _id: Id<"messages">;
    _creationTime: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    content: string;
    timestamp: number;
    read: boolean;
};

export type Conversation = {
    otherUserId: Id<"users">;
    otherUser?: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
    };
    lastMessage?: string;
    lastMessageAt?: number;
    unreadCount?: number;
};

export type SendMessageInput = {
    receiverId: Id<"users">;
    content: string;
};

/**
 * Get user's conversations
 */
export async function getConversations(): Promise<Conversation[]> {
    return get<Conversation[]>("/api/messages/conversations");
}

/**
 * Get messages with a specific user
 */
export async function getMessages(userId: Id<"users">): Promise<Message[]> {
    return get<Message[]>(`/api/messages/conversation/${userId}`);
}

/**
 * Send a message
 */
export async function sendMessage(data: SendMessageInput): Promise<Message> {
    return post<Message>("/api/messages", data);
}

/**
 * Mark messages as read with a specific user
 */
export async function markAsRead(userId: Id<"users">): Promise<void> {
    return post<void>(`/api/messages/conversation/${userId}/read`, {});
}
