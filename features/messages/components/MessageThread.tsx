/**
 * MessageThread Component
 *
 * Displays the message history between two users:
 * - Chronological message list
 * - Visual distinction between sent/received messages
 * - Timestamps and read receipts
 * - Auto-scroll to latest message
 */

"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import type { Message } from "../types";
import { formatDistanceToNow } from "date-fns";

interface MessageThreadProps {
    messages: Message[] | undefined;
    currentUserId: Id<"users">;
    otherUser: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
    } | null;
    loading?: boolean;
    onBack?: () => void;
    showBackButton?: boolean;
}

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

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const userName = otherUser?.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

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

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/30 flex items-center gap-3 shrink-0">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="shrink-0 lg:hidden"
                        aria-label="Back to conversations"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                )}
                <Avatar className="h-10 w-10">
                    <AvatarImage src={otherUser?.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold text-foreground">{userName}</h2>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-4xl mb-3">👋</div>
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
