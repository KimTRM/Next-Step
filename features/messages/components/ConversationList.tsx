/**
 * ConversationList Component
 *
 * Displays a list of conversation partners with:
 * - Last message preview
 * - Unread message badges
 * - User avatars
 * - Timestamp of last message
 * - Search functionality to filter by name
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Input } from "@/shared/components/ui/input";
import type { Id } from "@/convex/_generated/dataModel";
import type { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";
import { useState, useMemo } from "react";
import { Search, Pin, BellOff } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/components/ui/dialog";
import {
    getSettings,
    removeBlocked,
} from "@/features/messages/settings";
import { useEffect } from "react";

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
    const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
    const [pinnedUsers, setPinnedUsers] = useState<Set<string>>(new Set());
    const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const load = () => {
            const s = getSettings();
            setMutedUsers(new Set(s.muted));
            setPinnedUsers(new Set(s.pinned));
            setBlockedUsers(new Set(s.blocked));
        };
        load();
        window.addEventListener("messages:settings:changed", load);
        window.addEventListener("storage", load);
        const openHandler = () => setIsBlockModalOpen(true);
        window.addEventListener("messages:block:open", openHandler as EventListener);
        return () => {
            window.removeEventListener("messages:settings:changed", load);
            window.removeEventListener("storage", load);
            window.removeEventListener("messages:block:open", openHandler as EventListener);
        };
    }, []);

    // Filter conversations based on search query
    const filteredConversations = useMemo(() => {
        if (!conversations) return [];
        if (!searchQuery.trim()) return conversations;

        return conversations.filter((conv) => {
            const userName = conv.otherUser?.name || "";
            return userName.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery]);

    // Sort/pinned: pinned conversations appear at top, then by last message time desc
    const displayedConversations = useMemo(() => {
        const list = filteredConversations.slice();
        list.sort((a, b) => {
            const aPinned = pinnedUsers.has(String(a.otherUserId)) ? 0 : 1;
            const bPinned = pinnedUsers.has(String(b.otherUserId)) ? 0 : 1;
            if (aPinned !== bPinned) return aPinned - bPinned;
            const aTime = new Date(a.lastMessage.timestamp).getTime();
            const bTime = new Date(b.lastMessage.timestamp).getTime();
            return bTime - aTime;
        });
        // filter out blocked
        return list.filter((c) => !blockedUsers.has(String(c.otherUserId)));
    }, [filteredConversations, pinnedUsers, blockedUsers]);

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
        <div className="flex flex-col h-full">
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
                {displayedConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="font-semibold text-foreground mb-1">No matches found</h3>
                        <p className="text-sm text-muted-foreground">
                            Try searching with a different name
                        </p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {displayedConversations.map((conv) => {
                            const isSelected = selectedUserId === conv.otherUserId;
                            const userName = conv.otherUser?.name || "Unknown User";
                            const userInitial = userName.charAt(0).toUpperCase();
                            const avatarUrl = conv.otherUser?.avatarUrl;

                            return (
                                <button
                                    key={conv.otherUserId}
                                    onClick={() => onSelectConversation(conv.otherUserId)}
                                    className={`w-full p-4 m-1 text-left transition-colors rounded-md hover:bg-muted/100 ${isSelected ? "bg-muted border-l-2 border-l-primary" : ""
                                        }`}
                                    aria-label={`Conversation with ${userName}`}
                                    aria-current={isSelected ? "true" : undefined}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Avatar */}
                                        <Avatar className="h-12 w-12 shrink-0">
                                            <AvatarImage src={avatarUrl} alt={userName} />
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {userInitial}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-medium text-foreground truncate flex items-center gap-2">
                                                    <span className="truncate">{userName}</span>
                                                    {pinnedUsers.has(String(conv.otherUserId)) && (
                                                        <Pin className="h-4 w-4 text-primary" />
                                                    )}
                                                    {mutedUsers.has(String(conv.otherUserId)) && (
                                                        <BellOff className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </span>
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
                                                {conv.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="shrink-0">
                                                        {conv.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
            {/* Blocked users dialog */}
            <Dialog open={isBlockModalOpen} onOpenChange={setIsBlockModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Blocked users</DialogTitle>
                        <DialogDescription>Unblock users to restore conversations.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                        {Array.from(blockedUsers).length === 0 && (
                            <div className="text-sm text-muted-foreground">No blocked users</div>
                        )}
                        {Array.from(blockedUsers).map((id) => {
                            const conv = conversations?.find((c) => String(c.otherUserId) === id);
                            const name = conv?.otherUser?.name || id;
                            const initial = name.charAt(0).toUpperCase();
                            return (
                                <div key={id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">{initial}</div>
                                        <div className="text-sm">{name}</div>
                                    </div>
                                    <div>
                                        <button
                                            className="text-sm text-primary"
                                            onClick={() => {
                                                removeBlocked(id);
                                                setBlockedUsers(new Set(getSettings().blocked));
                                            }}
                                        >
                                            Unblock
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}