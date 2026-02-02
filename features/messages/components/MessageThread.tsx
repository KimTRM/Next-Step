/**
 * MessageThread Component
 *
 * Displays the message history between two users:
 * - Chronological message list
 * - Visual distinction between sent/received messages
 * - Timestamps and read receipts
 * - Auto-scroll to latest message
 * - Actions menu (mute, pin, block) in header
 */

"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { MessageThreadProps } from "../types";
import { formatDistanceToNow } from "date-fns";
import {
    useMutedUsers,
    usePinnedUsers,
    useBlockedUsers,
    useDeletedConversations,
} from "../api";
import {
    ArrowLeft,
    Bell,
    BellOff,
    Pin,
    PinOff,
    MoreVertical,
    Trash2,
    MessageSquareDashed,
    Check,
    CheckCheck,
    Ban
} from "lucide-react";

export function MessageThread({
    messages,
    currentUserId,
    otherUser,
    loading = false,
    onBack,
    showBackButton = false,
}: MessageThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Settings hooks
    const { mutedUsers, addMuted, removeMuted } = useMutedUsers();
    const { pinnedUsers, addPinned, removePinned } = usePinnedUsers();
    const { blockedUsers, addBlocked, removeBlocked } = useBlockedUsers();
    const { deleteConversation } = useDeletedConversations();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const userName = otherUser?.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    const isMuted = otherUser ? mutedUsers.has(otherUser._id) : false;
    const isPinned = otherUser ? pinnedUsers.has(otherUser._id) : false;
    const isBlocked = otherUser ? blockedUsers.has(otherUser._id) : false;

    // Action handlers
    const handleMute = () => {
        if (!otherUser) return;
        addMuted(String(otherUser._id));
    };

    const handleUnmute = () => {
        if (!otherUser) return;
        removeMuted(String(otherUser._id));
    };

    const handlePin = () => {
        if (!otherUser) return;
        addPinned(String(otherUser._id));
    };

    const handleUnpin = () => {
        if (!otherUser) return;
        removePinned(String(otherUser._id));
    };

    const handleBlock = () => {
        if (!otherUser) return;
        if (confirm(`Are you sure you want to block ${userName}? This will hide all their messages.`)) {
            addBlocked(String(otherUser._id));
            // Navigate back after blocking
            if (onBack) onBack();
        }
    };

    const handleUnblock = (userId: string) => {
        removeBlocked(String(userId));
    };

    const handleDeleteConversation = () => {
        if (!otherUser) return;
        if (confirm(`Are you sure you want to delete this conversation? This will hide it from your list.`)) {
            deleteConversation(String(otherUser._id));
            // Navigate back after deleting
            if (onBack) onBack();
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full">
                {/* Header skeleton */}
                <div className="p-4 border-b flex items-center gap-3">
                    {showBackButton && <Skeleton className="h-8 w-8" />}
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
                {/* Messages skeleton */}
                <div className="flex-1 p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isBlocked) {
        return (
            <div className="flex flex-col h-full">
                {/* Chat Header */}
                <div className="p-4 border-b bg-white h-21 flex items-center gap-3 shrink-0">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBack}
                            className="shrink-0 lg:hidden text-[#198754]"
                            aria-label="Back to conversations"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser?.avatarUrl} alt={userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h2 className="font-semibold text-black">{userName}</h2>
                        <p className="text-xs text-muted-foreground">Blocked</p>
                    </div>
                </div>

                {/* Blocked State */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <Ban className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg mb-2">User Blocked</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        You&apos;ve blocked this user. Unblock them to resume messaging.
                    </p>
                    <Button onClick={() => otherUser && handleUnblock(otherUser._id)}>
                        Unblock {userName}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-white h-21 flex items-center gap-3 shrink-0">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="shrink-0 lg:hidden text-[#198754]"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-black">{userName}</h2>
                        {isMuted && <BellOff className="h-4 w-4 text-muted-foreground" />}
                        {isPinned && <Pin className="h-4 w-4 text-primary fill-current" />}
                    </div>
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            aria-label="Conversation actions"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {/* Mute/Unmute */}
                        {isMuted ? (
                            <DropdownMenuItem onClick={handleUnmute}>
                                <Bell className="mr-2 h-4 w-4" />
                                Unmute
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={handleMute}>
                                <BellOff className="mr-2 h-4 w-4" />
                                Mute
                            </DropdownMenuItem>
                        )}

                        {/* Pin/Unpin */}
                        {isPinned ? (
                            <DropdownMenuItem onClick={handleUnpin}>
                                <PinOff className="mr-2 h-4 w-4" />
                                Unpin
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onClick={handlePin}>
                                <Pin className="mr-2 h-4 w-4" />
                                Pin
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        {/* Block */}
                        <DropdownMenuItem
                            onClick={handleBlock}
                            className="text-destructive focus:text-destructive"
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Block
                        </DropdownMenuItem>

                        {/* Delete Conversation */}
                        <DropdownMenuItem
                            onClick={handleDeleteConversation}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Conversation
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {/* Large Profile Section at the top */}
                <div className="flex flex-col items-center justify-center py-8 pb-6">
                    <Avatar className="h-24 w-24 mb-4 md:h-32 md:w-32">
                        <AvatarImage src={otherUser?.avatarUrl} alt={userName} />
                        <AvatarFallback className="bg-[#198754] text-white text-4xl">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="font-bold text-2xl text-black mb-1">{userName}</h2>
                    {otherUser?.title && (
                        <p className="text-sm text-gray-600">{otherUser.title}</p>
                    )}
                    {otherUser?.company && (
                        <p className="text-sm text-gray-500">{otherUser.company}</p>
                    )}
                </div>

                {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquareDashed className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    messages.map((message) => {
                        const isSent = message.senderId === currentUserId;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] p-3 rounded-2xl ${isSent
                                        ? "bg-primary text-primary-foreground rounded-br-md"
                                        : "bg-muted text-foreground rounded-bl-md"
                                        }`}
                                >
                                    <p className="wrap-break-word whitespace-pre-wrap leading-relaxed">
                                        {message.content}
                                    </p>
                                    <div
                                        className={`flex items-center gap-1 mt-1 text-xs ${isSent
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        <span>
                                            {formatDistanceToNow(message.timestamp, {
                                                addSuffix: true,
                                            })}
                                        </span>
                                        {isSent && (
                                            <span className="ml-1">
                                                {message.isRead ? (
                                                    <CheckCheck className="h-3 w-3" />
                                                ) : (
                                                    <Check className="h-3 w-3" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}