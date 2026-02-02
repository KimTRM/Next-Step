"use client";

/**
 * NotificationsModal Component
 *
 * Modal for viewing and managing notifications
 * - Tabs: All, Unread, Starred
 * - Actions: Mark as Read/Unread, Star, Delete
 */

import { useState } from "react";
import {
    Bell,
    Loader2,
    Trash2,
    Star,
    Mail,
    MailOpen,
    CheckCheck,
    MessageSquare,
    UserPlus,
    UserCheck,
    UserMinus,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
    useNotifications,
    useUnreadNotifications,
    useStarredNotifications,
    useMarkNotificationAsRead,
    useMarkNotificationAsUnread,
    useToggleNotificationStar,
    useDeleteNotification,
    useMarkAllNotificationsAsRead,
    useDeleteAllNotifications,
} from "../api";
import type { NotificationWithUser, NotificationType } from "../types";

interface NotificationsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NotificationsModal({ open, onOpenChange }: NotificationsModalProps) {
    const [activeTab, setActiveTab] = useState("all");

    // Fetch data
    const allNotifications = useNotifications(100);
    const unreadNotifications = useUnreadNotifications();
    const starredNotifications = useStarredNotifications();

    // Mutations
    const markAsRead = useMarkNotificationAsRead();
    const markAsUnread = useMarkNotificationAsUnread();
    const toggleStar = useToggleNotificationStar();
    const deleteNotification = useDeleteNotification();
    const markAllAsRead = useMarkAllNotificationsAsRead();
    const deleteAll = useDeleteAllNotifications();

    // Loading states
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const handleMarkAsRead = async (notificationId: string) => {
        setProcessingId(notificationId);
        try {
            await markAsRead({ notificationId: notificationId as any });
        } catch (error) {
            console.error("Failed to mark as read:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkAsUnread = async (notificationId: string) => {
        setProcessingId(notificationId);
        try {
            await markAsUnread({ notificationId: notificationId as any });
        } catch (error) {
            console.error("Failed to mark as unread:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleToggleStar = async (notificationId: string) => {
        setProcessingId(notificationId);
        try {
            await toggleStar({ notificationId: notificationId as any });
        } catch (error) {
            console.error("Failed to toggle star:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (notificationId: string) => {
        setProcessingId(notificationId);
        try {
            await deleteNotification({ notificationId: notificationId as any });
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        setBulkProcessing(true);
        try {
            await markAllAsRead({});
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        } finally {
            setBulkProcessing(false);
        }
    };

    const handleDeleteAll = async () => {
        setBulkProcessing(true);
        try {
            await deleteAll({});
        } catch (error) {
            console.error("Failed to delete all:", error);
        } finally {
            setBulkProcessing(false);
        }
    };

    const unreadCount = unreadNotifications?.length || 0;
    const starredCount = starredNotifications?.length || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 max-h-[85vh]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Notifications
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleMarkAllAsRead}
                                disabled={bulkProcessing || unreadCount === 0}
                                className="text-xs"
                            >
                                {bulkProcessing ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                )}
                                Mark all read
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="text-xs">
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onClick={handleDeleteAll}
                                        className="text-destructive"
                                    >
                                        Delete all notifications
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="all" className="text-xs sm:text-sm">
                            All
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="text-xs sm:text-sm relative">
                            Unread
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="starred" className="text-xs sm:text-sm">
                            <Star className="h-3 w-3 mr-1" />
                            Starred
                            {starredCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                    {starredCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* All Notifications Tab */}
                    <TabsContent value="all">
                        <ScrollArea className="h-[50vh] sm:h-[400px]">
                            {allNotifications === undefined ? (
                                <LoadingState />
                            ) : allNotifications.length === 0 ? (
                                <EmptyState
                                    icon={<Bell className="h-10 w-10 text-muted-foreground" />}
                                    title="No notifications"
                                    description="You're all caught up!"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {allNotifications.map((notif: NotificationWithUser) => (
                                        <NotificationCard
                                            key={notif._id}
                                            notification={notif}
                                            onMarkAsRead={handleMarkAsRead}
                                            onMarkAsUnread={handleMarkAsUnread}
                                            onToggleStar={handleToggleStar}
                                            onDelete={handleDelete}
                                            isProcessing={processingId === notif._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Unread Notifications Tab */}
                    <TabsContent value="unread">
                        <ScrollArea className="h-[50vh] sm:h-[400px]">
                            {unreadNotifications === undefined ? (
                                <LoadingState />
                            ) : unreadNotifications.length === 0 ? (
                                <EmptyState
                                    icon={<MailOpen className="h-10 w-10 text-muted-foreground" />}
                                    title="All caught up!"
                                    description="No unread notifications"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {unreadNotifications.map((notif: NotificationWithUser) => (
                                        <NotificationCard
                                            key={notif._id}
                                            notification={notif}
                                            onMarkAsRead={handleMarkAsRead}
                                            onMarkAsUnread={handleMarkAsUnread}
                                            onToggleStar={handleToggleStar}
                                            onDelete={handleDelete}
                                            isProcessing={processingId === notif._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Starred Notifications Tab */}
                    <TabsContent value="starred">
                        <ScrollArea className="h-[50vh] sm:h-[400px]">
                            {starredNotifications === undefined ? (
                                <LoadingState />
                            ) : starredNotifications.length === 0 ? (
                                <EmptyState
                                    icon={<Star className="h-10 w-10 text-muted-foreground" />}
                                    title="No starred notifications"
                                    description="Star important notifications to find them here"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {starredNotifications.map((notif: NotificationWithUser) => (
                                        <NotificationCard
                                            key={notif._id}
                                            notification={notif}
                                            onMarkAsRead={handleMarkAsRead}
                                            onMarkAsUnread={handleMarkAsUnread}
                                            onToggleStar={handleToggleStar}
                                            onDelete={handleDelete}
                                            isProcessing={processingId === notif._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components

function LoadingState() {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
    );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case "message":
            return <MessageSquare className="h-4 w-4 text-blue-500" />;
        case "connection_request":
            return <UserPlus className="h-4 w-4 text-green-500" />;
        case "connection_accepted":
            return <UserCheck className="h-4 w-4 text-emerald-500" />;
        case "connection_removed":
            return <UserMinus className="h-4 w-4 text-orange-500" />;
        default:
            return <Bell className="h-4 w-4 text-gray-500" />;
    }
}

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
}

function NotificationCard({
    notification,
    onMarkAsRead,
    onMarkAsUnread,
    onToggleStar,
    onDelete,
    isProcessing,
}: {
    notification: NotificationWithUser;
    onMarkAsRead: (id: string) => void;
    onMarkAsUnread: (id: string) => void;
    onToggleStar: (id: string) => void;
    onDelete: (id: string) => void;
    isProcessing: boolean;
}) {
    const fromUser = notification.fromUser;
    const userName = fromUser?.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div
            className={`p-3 rounded-lg border transition-colors ${
                notification.isRead
                    ? "bg-card"
                    : "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={fromUser?.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {getNotificationIcon(notification.type)}
                            <p className={`text-sm ${notification.isRead ? "text-foreground" : "font-medium text-foreground"}`}>
                                {notification.title}
                            </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                        </span>
                    </div>
                    
                    {notification.body && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.body}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1 mt-2">
                        {/* Star Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onToggleStar(notification._id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Star
                                    className={`h-3.5 w-3.5 ${
                                        notification.isStarred
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted-foreground"
                                    }`}
                                />
                            )}
                        </Button>

                        {/* Read/Unread Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                                notification.isRead
                                    ? onMarkAsUnread(notification._id)
                                    : onMarkAsRead(notification._id)
                            }
                            disabled={isProcessing}
                            className="h-7 w-7 p-0"
                            title={notification.isRead ? "Mark as unread" : "Mark as read"}
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : notification.isRead ? (
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <MailOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </Button>

                        {/* Delete Button */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDelete(notification._id)}
                            disabled={isProcessing}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                            {isProcessing ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
