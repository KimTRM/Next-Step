/**
 * ============================================================================
 * FRONTEND - Messages Page
 * ============================================================================
 * 
 * Real-time messaging interface - now using backend API!
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
    const [messages, setMessages] = useState<Message[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [conversation, setConversation] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [conversationLoading, setConversationLoading] = useState(false);

    // Fetch all messages and users
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        (async () => {
            try {
                const [messagesRes, usersRes] = await Promise.all([
                    fetch('/api/messages', { signal: controller.signal }),
                    fetch('/api/users', { signal: controller.signal }),
                ]);

                const messagesJson = await messagesRes.json();
                const usersJson = await usersRes.json();

                if (messagesRes.ok && messagesJson.success) {
                    setMessages(messagesJson.data || []);
                }
                if (usersRes.ok && usersJson.success) {
                    setUsers(usersJson.data || []);
                }
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('Failed to load messages:', error);
                    toast.error('Failed to load messages');
                }
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    // Fetch specific conversation when user is selected
    useEffect(() => {
        if (!selectedUserId) {
            setConversation([]);
            return;
        }

        const controller = new AbortController();
        setConversationLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/messages/conversation/${selectedUserId}`, {
                    signal: controller.signal,
                });
                const json = await res.json();

                if (res.ok && json.success) {
                    setConversation(json.data || []);
                } else {
                    throw new Error(json?.error?.message || 'Failed to load conversation');
                }
            } catch (error) {
                if (!(error instanceof DOMException && error.name === 'AbortError')) {
                    console.error('Failed to load conversation:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to load conversation');
                }
                setConversation([]);
            } finally {
                setConversationLoading(false);
            }
        })();
        return () => controller.abort();
    }, [selectedUserId]);

    // Get current user from users list (match by Clerk ID)
    const currentUser = users.find(u => u.clerkId === clerkUser?.id);

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (conversation.length > 0 && selectedUserId && currentUser) {
            conversation.forEach(msg => {
                if (msg.receiverId === currentUser._id && !msg.read) {
                    fetch(`/api/messages/${msg._id}`, {
                        method: 'PATCH',
                    }).catch(err => console.error('Failed to mark as read:', err));
                }
            });
        }
    }, [conversation, selectedUserId, currentUser]);

    // Send message handler
    const handleSendMessage = async (content: string) => {
        if (!selectedUserId) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiverId: selectedUserId,
                    content: content.trim(),
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json?.error?.message || 'Failed to send message');
            }

            // Refetch the conversation to get the complete message with all fields
            const conversationRes = await fetch(`/api/messages/conversation/${selectedUserId}`);
            const conversationJson = await conversationRes.json();
            
            if (conversationRes.ok && conversationJson.success) {
                setConversation(conversationJson.data || []);
            }

            // Also refetch all messages to update the conversation list
            const messagesRes = await fetch('/api/messages');
            const messagesJson = await messagesRes.json();
            
            if (messagesRes.ok && messagesJson.success) {
                setMessages(messagesJson.data || []);
            }

            toast.success('Message sent');
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to send message');
        }
    };

    // Loading state with skeleton
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="mb-8">
                        <Skeleton className="h-10 w-64 mb-2" />
                        <Skeleton className="h-6 w-96" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <Skeleton className="h-150 w-full" />
                        </div>
                        <div className="md:col-span-2">
                            <Skeleton className="h-150 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Auth check
    if (!clerkUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
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
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
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
    const conversationPartners: ConversationPartner[] = messages.reduce((acc, msg) => {
        const partnerId = msg.senderId === currentUser._id ? msg.receiverId : msg.senderId;
        const existing = acc.find(p => p.userId === partnerId);

        if (!existing) {
            const partner = users.find(u => u._id === partnerId);
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
    conversationPartners.forEach(partner => {
        partner.unreadCount = messages.filter(
            msg => msg.senderId === partner.userId &&
                msg.receiverId === currentUser._id &&
                !msg.read
        ).length;
    });

    // Sort by most recent message
    conversationPartners.sort((a, b) => b.lastMessage.timestamp - a.lastMessage.timestamp);

    // Get selected user details
    const selectedUser = users.find(u => u._id === selectedUserId);

    // Total unread count for badge
    const totalUnread = conversationPartners.reduce((sum, p) => sum + p.unreadCount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-blue-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                            <p className="text-gray-600 text-lg">Connect with mentors, employers, and peers</p>
                        </div>
                        {totalUnread > 0 && (
                            <Badge variant="destructive" className="text-lg px-4 py-2">
                                {totalUnread} unread
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Main messaging interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: '600px' }}>
                {/* Conversations List */}
                <ConversationList
                    conversations={conversationPartners}
                    selectedUserId={selectedUserId}
                    onSelectConversation={setSelectedUserId}
                />

                {/* Message Thread */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden shadow-lg">
                    {selectedUser ? (
                        <>
                            {conversationLoading ? (
                                <div className="flex-1 p-6 space-y-4">
                                    <Skeleton className="h-16 w-3/4" />
                                    <Skeleton className="h-16 w-2/3 ml-auto" />
                                    <Skeleton className="h-16 w-3/4" />
                                    <Skeleton className="h-16 w-2/3 ml-auto" />
                                </div>
                            ) : (
                                <>
                                    <MessageThread
                                        conversation={conversation || []}
                                        selectedUser={selectedUser}
                                        currentUserId={currentUser._id}
                                    />
                                    <MessageInput onSendMessage={handleSendMessage} />
                                </>
                            )}
                        </>
                    ) : (
                        <EmptyMessageState />
                    )}
                </Card>
                </div>
            </div>
        </div>
    );
}


