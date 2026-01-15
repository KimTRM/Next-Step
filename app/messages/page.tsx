/**
 * ============================================================================
 * FRONTEND - Messages Page
 * ============================================================================
 * 
 * Chat/messaging interface for users with real-time Convex integration.
 * 
 * ARCHITECTURE:
 * - Client component using Convex real-time queries
 * - Uses useQuery for live message updates
 * - Uses useMutation for sending messages
 */

'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
// FRONTEND COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// SHARED UTILITIES
import { timeAgo } from '@/lib/utils';

export default function MessagesPage() {
    const [newMessage, setNewMessage] = useState('');

    // Fetch user messages using Convex
    const messages = useQuery(api.messages.getUserMessages);
    const users = useQuery(api.users.getAllUsers, {});

    // If data is loading
    if (messages === undefined || users === undefined) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">Chat with mentors, employers, and peers</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your Messages</CardTitle>
                </CardHeader>
                <CardContent>
                    {messages && messages.length > 0 ? (
                        <div className="space-y-4">
                            {messages.map((message) => {
                                const sender = users?.find(u => u._id === message.senderId);
                                const receiver = users?.find(u => u._id === message.receiverId);
                                return (
                                    <div key={message._id} className="p-4 border border-gray-200 rounded-lg">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold">{sender?.name} → {receiver?.name}</span>
                                            <span className="text-sm text-gray-500">
                                                {timeAgo(new Date(message.timestamp).toISOString())}
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{message.content}</p>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No messages yet. Start a conversation!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


