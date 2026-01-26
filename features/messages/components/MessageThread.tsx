/**
 * MessageThread Component
 * 
 * Displays the message history between two users:
 * - Chronological message list
 * - Visual distinction between sent/received messages
 * - Timestamps and read receipts
 * - Auto-scroll to latest message
 */

'use client';

import { useEffect, useRef } from 'react';
import { CardContent, CardHeader } from '@/shared/components/ui/card';
import { Id } from '@/convex/_generated/dataModel';
import { timeAgo } from '@/shared/lib/utils';

interface Message {
    _id: Id<"messages">;
    content: string;
    timestamp: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    read: boolean;
}

interface User {
    _id: Id<"users">;
    name: string;
    role: string;
}

interface MessageThreadProps {
    conversation: Message[] | undefined;
    selectedUser: User;
    currentUserId: Id<"users">;
}

export function MessageThread({
    conversation,
    selectedUser,
    currentUserId,
}: MessageThreadProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const userInitial = selectedUser.name.charAt(0).toUpperCase();

    return (
        <>
            {/* Chat Header */}
            <CardHeader className="border-b bg-linear-to-r from-blue-50 to-blue-100">
                <div className="flex items-center space-x-3">
                    <div
                        className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-md"
                        aria-hidden="true"
                    >
                        {userInitial}
                    </div>
                    <div>
                        <h2 className="font-semibold text-gray-900 text-lg">{selectedUser.name}</h2>
                        <p className="text-sm text-gray-600">{selectedUser.role}</p>
                    </div>
                </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-br from-gray-50 to-blue-50/20">
                {conversation === undefined ? (
                    <div className="text-center text-gray-500 py-12">
                        Loading conversation...
                    </div>
                ) : conversation.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    conversation.map((message) => {
                        const isSentByCurrentUser = message.senderId === currentUserId;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-md p-4 rounded-2xl shadow-sm ${isSentByCurrentUser
                                        ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white'
                                        : 'bg-white text-gray-900 border border-gray-200'
                                        }`}
                                >
                                    <p className="wrap-break-word leading-relaxed">{message.content}</p>
                                    <p
                                        className={`text-xs mt-2 flex items-center gap-1 ${isSentByCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {timeAgo(new Date(message.timestamp).toISOString())}
                                        {isSentByCurrentUser && message.read && (
                                            <>
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    ✓✓ Read
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </CardContent>
        </>
    );
}
