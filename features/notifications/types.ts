/**
 * Notifications Feature - Types
 */

import type { Id, Doc } from "@/convex/_generated/dataModel";

/**
 * Notification types
 */
export type NotificationType = 
    | "message" 
    | "connection_request" 
    | "connection_accepted" 
    | "connection_removed";

/**
 * Base notification type from database
 */
export type Notification = Doc<"notifications">;

/**
 * Notification with fromUser enrichment
 */
export interface NotificationWithUser extends Notification {
    fromUser: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
    } | null;
}

/**
 * Notification filter options
 */
export type NotificationFilter = "all" | "unread" | "starred";
