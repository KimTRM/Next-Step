/**
 * ConversationList Component
 *
 * Displays a list of conversation partners with:
 * - Last message preview
 * - Unread message badges
 * - User avatars
 * - Timestamp of last message
 * - Search functionality to filter by name
 * - Actions menu (mute, pin, block) with simple local state
 * - Block list modal for managing blocked users
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { Id } from "@/convex/_generated/dataModel";
import type { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { Search, MoreVertical, BellOff, Bell, Pin, PinOff, Ban, ShieldOff, X } from "lucide-react";

interface ConversationListProps {
    conversations: Conversation[] | undefined;
    selectedUserId: Id<"users"> | null;
    onSelectConversation: (userId: Id<"users">) => void;
    loading?: boolean;
}

export function ConversationList({
    conversations,
    selectedUserId,
    onSelectConversation,
    loading = false,
}: ConversationListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isBlockListOpen, setIsBlockListOpen] = useState(false);

    // Simple local state for actions (persists during session only)
    const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
    const [pinnedUsers, setPinnedUsers] = useState<Set<string>>(new Set());
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

    // Get blocked user details
    const blockedConversations = useMemo(() => {
        if (!conversations) return [];
        return conversations.filter((conv) => blockedUsers.has(conv.otherUserId));
    }, [conversations, blockedUsers]);

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!conversations) return [];

        // Filter out blocked users
        const notBlocked = conversations.filter(
            (conv) => !blockedUsers.has(conv.otherUserId)
        );

        if (!searchQuery.trim()) return notBlocked;

        return notBlocked.filter((conv) => {
            const userName = conv.otherUser?.name || "";
            return userName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery, blockedUsers]);

    // Sort conversations: pinned first, then by timestamp
    const sortedConversations = useMemo(() => {
        return [...filteredConversations].sort((a, b) => {
            const aIsPinned = pinnedUsers.has(a.otherUserId);
            const bIsPinned = pinnedUsers.has(b.otherUserId);

            // Pinned conversations first
            if (aIsPinned && !bIsPinned) return -1;
            if (!aIsPinned && bIsPinned) return 1;

            // Then sort by timestamp
            return b.lastMessage.timestamp - a.lastMessage.timestamp;
        });
    }, [filteredConversations, pinnedUsers]);

    // Action handlers
    const handleMute = (userId: Id<"users">) => {
        setMutedUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(userId);
            return newSet;
        });
    };

    const handleUnmute = (userId: Id<"users">) => {
        setMutedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    };

    const handlePin = (userId: Id<"users">) => {
        setPinnedUsers(prev => {
            const newSet = new Set(prev);
            newSet.add(userId);
            return newSet;
        });
    };

    const handleUnpin = (userId: Id<"users">) => {
        setPinnedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    };

    const handleBlock = (userId: Id<"users">) => {
        if (confirm("Are you sure you want to block this user? This will hide all their messages.")) {
            setBlockedUsers(prev => {
                const newSet = new Set(prev);
                newSet.add(userId);
                return newSet;
            });

            // If currently selected, deselect
            if (selectedUserId === userId) {
                onSelectConversation(null as any);
            }
        }
    };

    const handleUnblock = (userId: Id<"users">) => {
        setBlockedUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    };

    if (loading) {
        return (
            <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="font-semibold text-foreground mb-1">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">
                    Start a conversation with a mentor or employer
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Search Bar */}
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                {sortedConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="font-semibold text-foreground mb-1">
                            {blockedUsers.size > 0 && filteredConversations.length === 0
                                ? "No conversations"
                                : "No matches found"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {blockedUsers.size > 0 && filteredConversations.length === 0
                                ? "All users are blocked"
                                : "Try searching with a different name"}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {sortedConversations.map((conv) => {
                            const isSelected = selectedUserId === conv.otherUserId;
                            const userName = conv.otherUser?.name || "Unknown User";
                            const userInitial = userName.charAt(0).toUpperCase();
                            const avatarUrl = conv.otherUser?.avatarUrl;

                            const isMuted = mutedUsers.has(conv.otherUserId);
                            const isPinned = pinnedUsers.has(conv.otherUserId);

                            return (
                                <div
                                    key={conv.otherUserId}
                                    className={`relative group ${isSelected ? "bg-muted border-l-2 border-l-primary" : ""
                                        }`}
                                >
                                    <button
                                        onClick={() => onSelectConversation(conv.otherUserId)}
                                        className="w-full p-4 pr-12 text-left transition-colors hover:bg-muted/50"
                                        aria-label={`Conversation with ${userName}`}
                                        aria-current={isSelected ? "true" : undefined}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <Avatar className="h-12 w-12 shrink-0">
                                                    <AvatarImage src={avatarUrl} alt={userName} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                                        {userInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isPinned && (
                                                    <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                                                        <Pin className="h-3 w-3 text-primary-foreground fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-foreground truncate">
                                                            {userName}
                                                        </span>
                                                        {isMuted && (
                                                            <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground shrink-0">
                                                        {formatDistanceToNow(conv.lastMessage.timestamp, {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm text-muted-foreground line-clamp-1 overflow-hidden text-ellipsis">
                                                        {conv.lastMessage.content}
                                                    </p>
                                                    {conv.unreadCount > 0 && !isMuted && (
                                                        <Badge variant="destructive" className="shrink-0">
                                                            {conv.unreadCount}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Actions Menu */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label="Conversation actions"
                                                >
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                {/* Mute/Unmute */}
                                                {isMuted ? (
                                                    <DropdownMenuItem onClick={() => handleUnmute(conv.otherUserId)}>
                                                        <Bell className="mr-2 h-4 w-4" />
                                                        Unmute
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleMute(conv.otherUserId)}>
                                                        <BellOff className="mr-2 h-4 w-4" />
                                                        Mute
                                                    </DropdownMenuItem>
                                                )}

                                                {/* Pin/Unpin */}
                                                {isPinned ? (
                                                    <DropdownMenuItem onClick={() => handleUnpin(conv.otherUserId)}>
                                                        <PinOff className="mr-2 h-4 w-4" />
                                                        Unpin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handlePin(conv.otherUserId)}>
                                                        <Pin className="mr-2 h-4 w-4" />
                                                        Pin
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuSeparator />

                                                {/* Block */}
                                                <DropdownMenuItem
                                                    onClick={() => handleBlock(conv.otherUserId)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Ban className="mr-2 h-4 w-4" />
                                                    Block
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>

            {/* Block List Button - Bottom Right */}
            <div className="absolute bottom-4 right-4 z-10">
                <Dialog open={isBlockListOpen} onOpenChange={setIsBlockListOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full shadow-lg bg-background hover:bg-muted"
                            aria-label="View blocked users"
                        >
                            <ShieldOff className="h-5 w-5" />
                            {blockedUsers.size > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {blockedUsers.size}
                                </Badge>
                            )}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Blocked Users</DialogTitle>
                            <DialogDescription>
                                Manage users you've blocked. Unblock them to see their messages again.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                            {blockedConversations.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShieldOff className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        No blocked users
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="max-h-[400px]">
                                    <div className="space-y-2">
                                        {blockedConversations.map((conv) => {
                                            const userName = conv.otherUser?.name || "Unknown User";
                                            const userInitial = userName.charAt(0).toUpperCase();
                                            const avatarUrl = conv.otherUser?.avatarUrl;

                                            return (
                                                <div
                                                    key={conv.otherUserId}
                                                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={avatarUrl} alt={userName} />
                                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                                {userInitial}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-sm">{userName}</p>
                                                            <p className="text-xs text-muted-foreground">Blocked</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUnblock(conv.otherUserId)}
                                                    >
                                                        Unblock
                                                    </Button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}