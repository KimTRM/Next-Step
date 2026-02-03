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
    isRead?: boolean; // Optional for legacy data compatibility
    read?: boolean; // Legacy field
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
        isRead?: boolean; // Optional for legacy data compatibility
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

export interface ConversationListProps {
    conversations: Conversation[] | undefined;
    selectedUserId: string | null;
    onSelectConversation: (userId: string) => void;
    loading?: boolean;
}

export interface MessageThreadProps {
    messages: Message[] | undefined;
    currentUserId: Id<"users">;
    otherUser: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        title?: string;
        company?: string;
    } | null;
    loading?: boolean;
    onBack?: () => void;
    showBackButton?: boolean;
}

// Send message input
export type SendMessageInput = {
    receiverId: Id<"users">;
    content: string;
    relatedJobId?: Id<"jobs">;
};
