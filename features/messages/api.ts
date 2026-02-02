"use client";

/**
 * Messages Feature - API Layer
 * ONLY place that imports Convex hooks for messages feature
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import {
    getSettings,
    addMuted as addMutedSetting,
    removeMuted as removeMutedSetting,
    addPinned as addPinnedSetting,
    removePinned as removePinnedSetting,
    addBlocked as addBlockedSetting,
    removeBlocked as removeBlockedSetting,
    addDeleted as addDeletedSetting,
} from "./settings";

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
// CUSTOM HOOKS (ABSTRACTED FROM CONVEX)
// ============================================

/**
 * Hook to manage message selection state
 * Abstracts away Convex Id type from components
 */
export function useMessageSelection() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const selectConversation = useCallback((userId: string) => {
        setSelectedUserId(userId);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedUserId(null);
    }, []);

    return {
        selectedUserId,
        selectConversation,
        clearSelection,
    };
}

/**
 * Hook to manage message data and actions for a selected conversation
 * Abstracts Convex operations from components
 * Note: Does not include currentUser - import useCurrentUser from @/features/users/api separately
 */
export function useMessageConversation(
    selectedUserId: string | null,
    currentUserId?: string,
) {
    const conversations = useUserConversations();
    const messages = useConversation(selectedUserId as Id<"users"> | null);

    const sendMessageMutation = useSendMessage();
    const markAsReadMutation = useMarkAsRead();

    // Get selected conversation's other user info
    const selectedConversation = conversations?.find(
        (c) => c.otherUserId === selectedUserId,
    );

    // Mark messages as read when conversation opens or new messages arrive
    useEffect(() => {
        if (!selectedUserId || !currentUserId || !messages) return;

        // Check if there are any unread messages from the other user
        const hasUnreadMessages = messages.some(
            (msg) => msg.receiverId === currentUserId && !msg.isRead,
        );

        if (hasUnreadMessages) {
            markAsReadMutation({
                otherUserId: selectedUserId as Id<"users">,
            }).catch((err) => console.error("Failed to mark as read:", err));
        }
    }, [selectedUserId, currentUserId, messages, markAsReadMutation]);

    // Handle sending a message
    const sendMessage = useCallback(
        async (content: string) => {
            if (!selectedUserId) return;

            try {
                await sendMessageMutation({
                    receiverId: selectedUserId as Id<"users">,
                    content,
                });
            } catch (error) {
                console.error("Failed to send message:", error);
                toast.error("Failed to send message");
                throw error;
            }
        },
        [selectedUserId, sendMessageMutation],
    );

    return {
        conversations,
        messages,
        selectedConversation,
        sendMessage,
        isConversationLoading:
            selectedUserId !== null && messages === undefined,
    };
}

/**
 * Hook to manage user search for starting conversations
 * Abstracts user fetching and filtering from components
 */
export function useUserSearch() {
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all users based on search query
    const allUsers = useAllUsers({ search: searchQuery || undefined });
    const currentUser = useCurrentUser();

    // Filter out the current user from search results
    const filteredUsers = useMemo(() => {
        if (!allUsers || !currentUser) return [];
        return allUsers.filter((user) => user._id !== currentUser._id);
    }, [allUsers, currentUser]);

    const isLoading = allUsers === undefined;
    const hasSearchQuery = searchQuery.trim().length > 0;
    const showResults = hasSearchQuery && filteredUsers.length > 0;
    const showNoResults =
        hasSearchQuery && !isLoading && filteredUsers.length === 0;

    return {
        searchQuery,
        setSearchQuery,
        filteredUsers,
        isLoading,
        hasSearchQuery,
        showResults,
        showNoResults,
    };
}

// ============================================
// TYPES RE-EXPORT
// ============================================

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
    return useQuery(api.users.index.getCurrentUser, {});
}

/**
 * Get all users with optional filtering
 */
export function useAllUsers(filters?: { role?: string; search?: string }) {
    return useQuery(api.users.index.getAllUsers, filters || {});
}

// ============================================
// SETTINGS HOOKS
// ============================================

/**
 * Hook to manage muted users state
 */
export function useMutedUsers() {
    const [mutedUsers, setMutedUsers] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            const s = getSettings();
            return new Set(s.muted);
        }
        return new Set();
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const onChange = () => {
            const ss = getSettings();
            setMutedUsers(new Set(ss.muted));
        };

        window.addEventListener("messages:settings:changed", onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener("messages:settings:changed", onChange);
            window.removeEventListener("storage", onChange);
        };
    }, []);

    const addMuted = useCallback((userId: string) => {
        addMutedSetting(userId);
        setMutedUsers(new Set(getSettings().muted));
    }, []);

    const removeMuted = useCallback((userId: string) => {
        removeMutedSetting(userId);
        setMutedUsers(new Set(getSettings().muted));
    }, []);

    return {
        mutedUsers,
        addMuted,
        removeMuted,
    };
}

/**
 * Hook to manage pinned users state
 */
export function usePinnedUsers() {
    const [pinnedUsers, setPinnedUsers] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            const s = getSettings();
            return new Set(s.pinned);
        }
        return new Set();
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const onChange = () => {
            const ss = getSettings();
            setPinnedUsers(new Set(ss.pinned));
        };

        window.addEventListener("messages:settings:changed", onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener("messages:settings:changed", onChange);
            window.removeEventListener("storage", onChange);
        };
    }, []);

    const addPinned = useCallback((userId: string) => {
        addPinnedSetting(userId);
        setPinnedUsers(new Set(getSettings().pinned));
    }, []);

    const removePinned = useCallback((userId: string) => {
        removePinnedSetting(userId);
        setPinnedUsers(new Set(getSettings().pinned));
    }, []);

    return {
        pinnedUsers,
        addPinned,
        removePinned,
    };
}

/**
 * Hook to manage blocked users state
 */
export function useBlockedUsers() {
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(() => {
        if (typeof window !== "undefined") {
            const s = getSettings();
            return new Set(s.blocked);
        }
        return new Set();
    });

    useEffect(() => {
        if (typeof window === "undefined") return;

        const onChange = () => {
            const ss = getSettings();
            setBlockedUsers(new Set(ss.blocked));
        };

        window.addEventListener("messages:settings:changed", onChange);
        window.addEventListener("storage", onChange);
        return () => {
            window.removeEventListener("messages:settings:changed", onChange);
            window.removeEventListener("storage", onChange);
        };
    }, []);

    const addBlocked = useCallback((userId: string) => {
        addBlockedSetting(userId);
        setBlockedUsers(new Set(getSettings().blocked));
    }, []);

    const removeBlocked = useCallback((userId: string) => {
        removeBlockedSetting(userId);
        setBlockedUsers(new Set(getSettings().blocked));
    }, []);

    return {
        blockedUsers,
        addBlocked,
        removeBlocked,
    };
}

/**
 * Hook to manage deleted conversations
 */
export function useDeletedConversations() {
    const deleteConversation = useCallback((userId: string) => {
        addDeletedSetting(userId);
    }, []);

    return {
        deleteConversation,
    };
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
