/**
 * ============================================================================
 * FRONTEND - Messages Page
 * ============================================================================
 * 
 * Chat/messaging interface for users.
 * 
 * ARCHITECTURE:
 * - This is a client component (uses React hooks and state)
 * - Currently uses direct data imports (for development only)
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace data imports with API calls (fetch('/api/messages'))
 * 2. Implement real-time messaging with WebSockets
 * 3. Add message sending functionality with POST /api/messages
 * 4. Add file attachment support
 * 5. Implement typing indicators and read receipts
 * 6. Add pagination for message history
 * 7. Add message search functionality
 */

'use client';

import { useState } from 'react';
// BACKEND DATA: Import from server-side mock data
// WARNING: Direct imports only work in development. Replace with API calls.
import { messages } from '@/server/data/messages';
import { users } from '@/server/data/users';
// FRONTEND COMPONENTS
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// SHARED UTILITIES
import { timeAgo } from '@/lib/utils';

export default function MessagesPage() {
    // Mock current user (student with ID 1)
    const currentUserId = '1';
    const [selectedUserId, setSelectedUserId] = useState<string | null>('2');
    const [newMessage, setNewMessage] = useState('');

    // Get all messages for current user
    const userMessages = messages.filter(
        msg => msg.senderId === currentUserId || msg.receiverId === currentUserId
    );

    // Get unique conversation partners
    const conversationPartners = Array.from(
        new Set(
            userMessages.map(msg =>
                msg.senderId === currentUserId ? msg.receiverId : msg.senderId
            )
        )
    ).map(userId => {
        const user = users.find(u => u.id === userId);
        const lastMessage = userMessages
            .filter(
                msg =>
                    (msg.senderId === currentUserId && msg.receiverId === userId) ||
                    (msg.senderId === userId && msg.receiverId === currentUserId)
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        return { user, lastMessage };
    });

    // Get messages for selected conversation
    const conversationMessages = selectedUserId
        ? userMessages
            .filter(
                msg =>
                    (msg.senderId === currentUserId && msg.receiverId === selectedUserId) ||
                    (msg.senderId === selectedUserId && msg.receiverId === currentUserId)
            )
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        : [];

    const selectedUser = users.find(u => u.id === selectedUserId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        console.log('Sending message:', newMessage, 'to:', selectedUserId);
        alert('Message sent! (Mock - implement API integration)');
        setNewMessage('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-gray-600 mt-2">Chat with mentors, employers, and peers</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
                {/* Conversations List */}
                <Card className="lg:col-span-1 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-y-auto">
                        {conversationPartners.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No conversations yet
                            </div>
                        ) : (
                            conversationPartners.map(({ user, lastMessage }) => (
                                <button
                                    key={user?.id}
                                    onClick={() => setSelectedUserId(user?.id || null)}
                                    className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 text-left transition-colors ${selectedUserId === user?.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                                            👤
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {user?.name}
                                            </p>
                                            <p className="text-sm text-gray-600 truncate">
                                                {lastMessage?.content}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {timeAgo(lastMessage?.timestamp || '')}
                                            </p>
                                        </div>
                                        {lastMessage && !lastMessage.read && lastMessage.receiverId === currentUserId && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Chat Window */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        👤
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{selectedUser.name}</CardTitle>
                                        <p className="text-sm text-gray-600">{selectedUser.role}</p>
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Messages */}
                            <CardContent className="flex-1 overflow-y-auto">
                                <div className="space-y-4">
                                    {conversationMessages.map((msg) => {
                                        const isCurrentUser = msg.senderId === currentUserId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                                            }`}
                                                    >
                                                        {timeAgo(msg.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>

                            {/* Message Input */}
                            <div className="border-t p-4">
                                <form onSubmit={handleSendMessage} className="flex space-x-2">
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1"
                                    />
                                    <Button type="submit" variant="default">
                                        Send
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <CardContent className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <p className="text-lg">Select a conversation to start chatting</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}


