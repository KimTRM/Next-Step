"use client";

/**
 * Notifications Feature - API Layer
 * ONLY place that imports Convex hooks for notifications feature
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// ============================================
// QUERIES
// ============================================

/**
 * Get all notifications for the current user
 */
export function useNotifications(limit?: number) {
    return useQuery(api.notifications.index.getNotifications, { limit });
}

/**
 * Get unread notifications for the current user
 */
export function useUnreadNotifications() {
    return useQuery(api.notifications.index.getUnreadNotifications, {});
}

/**
 * Get starred notifications for the current user
 */
export function useStarredNotifications() {
    return useQuery(api.notifications.index.getStarredNotifications, {});
}

/**
 * Get unread notification count (for badge)
 */
export function useUnreadNotificationCount() {
    return useQuery(api.notifications.index.getUnreadCount, {});
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Mark a notification as read
 */
export function useMarkNotificationAsRead() {
    return useMutation(api.notifications.index.markAsRead);
}

/**
 * Mark a notification as unread
 */
export function useMarkNotificationAsUnread() {
    return useMutation(api.notifications.index.markAsUnread);
}

/**
 * Toggle star status on a notification
 */
export function useToggleNotificationStar() {
    return useMutation(api.notifications.index.toggleStar);
}

/**
 * Delete a notification
 */
export function useDeleteNotification() {
    return useMutation(api.notifications.index.deleteNotification);
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
    return useMutation(api.notifications.index.markAllAsRead);
}

/**
 * Delete all notifications
 */
export function useDeleteAllNotifications() {
    return useMutation(api.notifications.index.deleteAllNotifications);
}

// ============================================
// TYPES RE-EXPORT
// ============================================

export type {
    Notification,
    NotificationWithUser,
    NotificationType,
    NotificationFilter,
} from "./types";
