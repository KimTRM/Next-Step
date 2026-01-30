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
 * Mark message as read
 */
export function useMarkMessageAsRead() {
    return useMutation(api.messages.index.markMessageAsRead);
}

// ============================================
// TYPES RE-EXPORT
// ============================================
export type { Message, ConversationPartner, SendMessageInput } from "./types";
