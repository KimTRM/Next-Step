/**
 * ConversationList Component
 *
 * Displays a list of conversation partners with:
 * - Last message preview
 * - Unread message badges
 * - User avatars
 * - Timestamp of last message
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import type { Id } from "@/convex/_generated/dataModel";
import type { Conversation } from "../types";
import { formatDistanceToNow } from "date-fns";

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
        <ScrollArea className="h-full">
            <div className="divide-y">
                {conversations.map((conv) => {
                    const isSelected = selectedUserId === conv.otherUserId;
                    const userName = conv.otherUser?.name || "Unknown User";
                    const userInitial = userName.charAt(0).toUpperCase();
                    const avatarUrl = conv.otherUser?.avatarUrl;

                    return (
                        <button
                            key={conv.otherUserId}
                            onClick={() => onSelectConversation(conv.otherUserId)}
                            className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${isSelected ? "bg-muted border-l-2 border-l-primary" : ""
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
                                        <span className="font-medium text-foreground truncate">
                                            {userName}
                                        </span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatDistanceToNow(conv.lastMessage.timestamp, {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm text-muted-foreground truncate">
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
        </ScrollArea>
    );
}
