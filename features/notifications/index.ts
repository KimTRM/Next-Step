/**
 * Notifications Feature - Public API
 */

// API hooks
export {
    useNotifications,
    useUnreadNotifications,
    useStarredNotifications,
    useUnreadNotificationCount,
    useMarkNotificationAsRead,
    useMarkNotificationAsUnread,
    useToggleNotificationStar,
    useDeleteNotification,
    useMarkAllNotificationsAsRead,
    useDeleteAllNotifications,
} from "./api";

// Types
export type {
    Notification,
    NotificationWithUser,
    NotificationType,
    NotificationFilter,
} from "./types";

// Components
export { NotificationsModal } from "./components/NotificationsModal";
