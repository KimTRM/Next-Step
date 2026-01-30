'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';

// eslint-disable-next-line no-restricted-imports
import { Id } from '@/convex/_generated/dataModel';

import { toast } from 'sonner';
// UI COMPONENTS
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
// FEATURE COMPONENTS
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { MessageInput } from './MessageInput';
import { EmptyMessageState } from './EmptyMessageState';
// FEATURE API
import { useUserMessages, useConversation, useSendMessage, useMarkMessageAsRead } from '@/features/messages/api';
// import { useCurrentUser } from '@/features/users/api';

// Define local types to match component usage
interface Message {
    _id: Id<"messages">;
    _creationTime: number;
    content: string;
    timestamp: number;
    senderId: Id<"users">;
    receiverId: Id<"users">;
    read?: boolean;
    isRead?: boolean;
}

interface User {
    _id: Id<"users">;
    name: string;
    role: string;
    clerkId: string;
}

interface ConversationPartner {
    userId: Id<"users">;
    user: User;
    lastMessage: Message;
    unreadCount: number;
}

export function MessagesPageContent() {
    const { user: clerkUser } = useUser();
    const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);

    // Fetch data via feature APIs
    const messages = useUserMessages() || [];
    // const currentUser = useCurrentUser();
    // For demonstration, using clerkUser as currentUser (replace with actual user logic as needed)
    const currentUser = useMemo(() => (
        clerkUser
            ? { _id: clerkUser.id as Id<'users'>, clerkId: clerkUser.id, name: clerkUser.fullName ?? '', role: '' }
            : undefined
    ), [clerkUser]);
    const rawConversation = useConversation(selectedUserId);
    const conversation = useMemo(() => rawConversation || [], [rawConversation]);

    // Mutations
    const sendMessage = useSendMessage();
    const markAsRead = useMarkMessageAsRead();

    // Loading states
    const loading = messages === undefined || currentUser === undefined;
    const conversationLoading = selectedUserId && conversation === undefined;

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (conversation.length > 0 && selectedUserId && currentUser) {
            conversation.forEach((msg) => {
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

    // Note: Building conversation partners list requires access to all users
    // This is a limitation we'll address - for now, use the message history
    const conversationPartners: ConversationPartner[] = messages.reduce((acc: ConversationPartner[], msg: Message) => {
        const partnerId = msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;
        const existing = acc.find(p => p.userId === partnerId);

        if (!existing) {
            acc.push({
                userId: partnerId,
                user: {
                    _id: partnerId,
                    clerkId: '',
                    name: 'User',
                    role: '',
                },
                lastMessage: msg,
                unreadCount: 0
            });
        } else {
            // Update to latest message
            if (existing.lastMessage && typeof existing.lastMessage === 'object' && 'timestamp' in existing.lastMessage && msg.timestamp > existing.lastMessage.timestamp) {
                existing.lastMessage = msg;
            }
        }

        return acc;
    }, [] as ConversationPartner[]);

    // Calculate unread counts
    conversationPartners.forEach((partner: ConversationPartner) => {
        partner.unreadCount = messages.filter(
            (msg) => msg.senderId === partner.userId && msg.receiverId === currentUser._id && !msg.read
        ).length;
    });

    // Sort by latest message
    conversationPartners.sort((a, b) => {
        const aTime = typeof a.lastMessage === 'object' && 'timestamp' in a.lastMessage ? a.lastMessage.timestamp : 0;
        const bTime = typeof b.lastMessage === 'object' && 'timestamp' in b.lastMessage ? b.lastMessage.timestamp : 0;
        return bTime - aTime;
    });

    // Calculate total unread
    const totalUnread = conversationPartners.reduce((sum: number, p: ConversationPartner) => sum + p.unreadCount, 0);

    return (
        <div className="min-h-screen bg-linear-to-br from-white via-blue-50/30 to-blue-100/20">
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
                                            conversation={conversation as any}
                                            currentUserId={currentUser._id}
                                            selectedUser={{
                                                _id: selectedUserId,
                                                name: 'User',
                                                role: '',
                                            }} />
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
