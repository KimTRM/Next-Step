"use client";

/**
 * Messages Feature - API Layer
 * ONLY place that imports Convex hooks for messages feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================
// QUERIES
// ============================================

/**
 * Get all messages for current user
 */
export function useUserMessages() {
    return useQuery(api.messages.index.getUserMessages, {});
}

/**
 * Get conversation between current user and another user
 */
export function useConversation(otherUserId: Id<"users"> | null | undefined) {
    return useQuery(
        api.messages.index.getConversation,
        otherUserId ? { otherUserId } : "skip",
    );
}

/**
 * Get all conversations for current user with last message and unread count
 */
export function useUserConversations() {
    return useQuery(api.messages.index.getUserConversations, {});
}

/**
 * Get total unread message count for current user
 */
export function useUnreadCount() {
    return useQuery(api.messages.index.getUnreadCount, {});
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Send a message
 */
export function useSendMessage() {
    return useMutation(api.messages.index.sendMessage);
}

/**
 * Mark all messages as read in a conversation
 */
export function useMarkAsRead() {
    return useMutation(api.messages.index.markAsRead);
}

/**
 * Mark single message as read (backwards compatibility)
 */
export function useMarkMessageAsRead() {
    return useMutation(api.messages.index.markMessageAsRead);
}

// ============================================
// TYPES RE-EXPORT
// ============================================
export type {
    Message,
    Conversation,
    ConversationUser,
    ConversationPartner,
    SendMessageInput,
} from "./types";
