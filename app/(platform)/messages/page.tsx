/**
 * ============================================================================
 * FRONTEND - Messages Page
 * ============================================================================
 * 
 * Real-time messaging interface using Convex for instant updates!
 * 
 * ARCHITECTURE:
 * - ConversationList: Left sidebar with conversation partners
 * - MessageThread: Main area displaying message history  
 * - MessageInput: Bottom input area for composing messages
 * - EmptyMessageState: Placeholder when no conversation selected
 */

'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
// UI COMPONENTS
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// FEATURE COMPONENTS
import { ConversationList, type ConversationPartner } from '@/components/features/messages/ConversationList';
import { MessageThread } from '@/components/features/messages/MessageThread';
import { MessageInput } from '@/components/features/messages/MessageInput';
import { EmptyMessageState } from '@/components/features/messages/EmptyMessageState';

type Message = {
    _id: Id<'messages'>;
    _creationTime: number;
    senderId: Id<'users'>;
    receiverId: Id<'users'>;
    content: string;
    timestamp: number;
    read: boolean;
};

type User = {
    _id: Id<'users'>;
    clerkId: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
};

export default function MessagesPage() {
    const { user: clerkUser } = useUser();
    const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);

    // Fetch all data via Convex - real-time updates!
    const messages = useQuery(api.functions.messages.getUserMessages) || [];
    const users = useQuery(api.functions.users.getAllUsers, {}) || [];
    const conversation = useQuery(
        api.functions.messages.getConversation,
        selectedUserId ? { otherUserId: selectedUserId } : "skip"
    ) || [];

    // Mutations
    const sendMessage = useMutation(api.functions.messages.sendMessage);
    const markAsRead = useMutation(api.functions.messages.markMessageAsRead);

    // Loading states
    const loading = messages === undefined || users === undefined;
    const conversationLoading = selectedUserId && conversation === undefined;

    // Get current user from users list (match by Clerk ID)
    const currentUser = users.find((u: User) => u.clerkId === clerkUser?.id);

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (conversation.length > 0 && selectedUserId && currentUser) {
            conversation.forEach((msg: Message) => {
                if (msg.receiverId === currentUser._id && !msg.read) {
                    markAsRead({ messageId: msg._id }).catch(err =>
                        console.error('Failed to mark as read:', err)
                    );
                }
            });
        }
    }, [conversation, selectedUserId, currentUser, markAsRead]);

    // Send message handler
    const handleSendMessage = async (content: string) => {
        if (!selectedUserId) return;

        try {
            await sendMessage({
                receiverId: selectedUserId,
                content: content.trim(),
            });
            toast.success('Message sent!');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
        }
    };

    // Auth check
    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="shadow-lg">
                        <CardContent className="text-center py-12">
                            <p className="text-lg text-gray-600">Please sign in to view messages</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="shadow-lg">
                        <CardContent className="text-center py-12">
                            <p className="text-lg text-gray-600">User profile not found</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // Build conversation partners list
    const conversationPartners: ConversationPartner[] = messages.reduce((acc: ConversationPartner[], msg: Message) => {
        const partnerId = msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;
        const existing = acc.find(p => p.userId === partnerId);

        if (!existing) {
            const partner = users.find((u: User) => u._id === partnerId);
            if (partner) {
                acc.push({
                    userId: partnerId,
                    user: partner,
                    lastMessage: msg,
                    unreadCount: 0
                });
            }
        } else {
            // Update to latest message
            if (msg.timestamp > existing.lastMessage.timestamp) {
                existing.lastMessage = msg;
            }
        }

        return acc;
    }, [] as ConversationPartner[]);

    // Calculate unread counts
    conversationPartners.forEach((partner: ConversationPartner) => {
        partner.unreadCount = messages.filter(
            (msg: Message) => msg.senderId === partner.userId && msg.receiverId === currentUser._id && !msg.read
        ).length;
    });

    // Sort by latest message
    conversationPartners.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

    // Calculate total unread
    const totalUnread = conversationPartners.reduce((sum: number, p: ConversationPartner) => sum + p.unreadCount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Messages</h1>
                            <p className="text-gray-600 mt-2">Connect with mentors, employers, and peers</p>
                        </div>
                        {totalUnread > 0 && (
                            <Badge variant="destructive" className="text-lg px-4 py-2">
                                {totalUnread} unread
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Messages Layout */}
                <div className="grid grid-cols-12 gap-6">
                    {/* Conversation List - Left Sidebar */}
                    <Card className="col-span-12 lg:col-span-4 shadow-lg">
                        <CardContent className="p-0">
                            <div className="p-4 border-b">
                                <h2 className="font-semibold text-lg">Conversations</h2>
                                <Badge variant="secondary" className="mt-2">
                                    {conversationPartners.length} {conversationPartners.length === 1 ? 'conversation' : 'conversations'}
                                </Badge>
                            </div>

                            {loading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} className="h-20 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <ConversationList
                                    conversations={conversationPartners}
                                    selectedUserId={selectedUserId}
                                    onSelectConversation={setSelectedUserId}
                                />
                            )}
                        </CardContent>
                    </Card>

                    {/* Message Thread - Main Area */}
                    <Card className="col-span-12 lg:col-span-8 shadow-lg flex flex-col" style={{ height: '600px' }}>
                        {!selectedUserId ? (
                            <EmptyMessageState />
                        ) : (
                            <>
                                {/* Message Thread */}
                                <div className="flex-1 overflow-hidden">
                                    {conversationLoading ? (
                                        <div className="p-4 space-y-4">
                                            {[1, 2, 3].map(i => (
                                                <Skeleton key={i} className="h-16 w-3/4" />
                                            ))}
                                        </div>
                                    ) : (
                                        <MessageThread
                                            conversation={conversation}
                                            currentUserId={currentUser._id}
                                            selectedUser={users.find((u: User) => u._id === selectedUserId)!} />
                                    )}
                                </div>

                                {/* Message Input */}
                                <div className="border-t">
                                    <MessageInput onSendMessage={handleSendMessage} />
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
