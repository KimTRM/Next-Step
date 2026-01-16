/**
 * ============================================================================
 * FRONTEND - Messages Page
 * ============================================================================
 * 
 * Real-time messaging interface with Convex - now using extracted components!
 * 
 * ARCHITECTURE:
 * - ConversationList: Left sidebar with conversation partners
 * - MessageThread: Main area displaying message history  
 * - MessageInput: Bottom input area for composing messages
 * - EmptyMessageState: Placeholder when no conversation selected
 */

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { Id } from '@/convex/_generated/dataModel';
// UI COMPONENTS
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// FEATURE COMPONENTS
import { ConversationList, type ConversationPartner } from '@/components/features/messages/ConversationList';
import { MessageThread } from '@/components/features/messages/MessageThread';
import { MessageInput } from '@/components/features/messages/MessageInput';
import { EmptyMessageState } from '@/components/features/messages/EmptyMessageState';

export default function MessagesPage() {
    const { user: clerkUser } = useUser();
    const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);

    // Fetch all messages for current user
    const messages = useQuery(api.messages.getUserMessages);
    const users = useQuery(api.users.getAllUsers, {});

    // Fetch specific conversation when user is selected
    const conversation = useQuery(
        api.messages.getConversation,
        selectedUserId ? { otherUserId: selectedUserId } : "skip"
    );

    // Mutations
    const sendMessage = useMutation(api.messages.sendMessage);
    const markAsRead = useMutation(api.messages.markMessageAsRead);

    // Get current user from Convex (match by Clerk ID)
    const currentUser = users?.find(u => u.clerkId === clerkUser?.id);

    // Mark messages as read when conversation opens
    useEffect(() => {
        if (conversation && selectedUserId && currentUser) {
            conversation.forEach(msg => {
                if (msg.receiverId === currentUser._id && !msg.read) {
                    markAsRead({ messageId: msg._id });
                }
            });
        }
    }, [conversation, selectedUserId, currentUser, markAsRead]);

    // Loading state
    if (messages === undefined || users === undefined) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-150 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // Auth check
    if (!clerkUser) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-lg text-gray-600">Please sign in to view messages</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-lg text-gray-600">User profile not found</p>
                    </CardContent>
                </Card>
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

    // Handle send message
    const handleSendMessage = async (content: string) => {
        if (!selectedUserId) return;

        await sendMessage({
            receiverId: selectedUserId,
            content,
        });
    };

    // Total unread count for badge
    const totalUnread = conversationPartners.reduce((sum, p) => sum + p.unreadCount, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
                    <p className="text-gray-600 mt-2">Real-time chat with mentors, employers, and peers</p>
                </div>
                {totalUnread > 0 && (
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                        {totalUnread} unread
                    </Badge>
                )}
            </div>

            {/* Main messaging interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-150">
                {/* Conversations List */}
                <ConversationList
                    conversations={conversationPartners}
                    selectedUserId={selectedUserId}
                    onSelectConversation={setSelectedUserId}
                />

                {/* Message Thread */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden">
                    {selectedUser ? (
                        <>
                            <MessageThread
                                conversation={conversation}
                                selectedUser={selectedUser}
                                currentUserId={currentUser._id}
                            />
                            <MessageInput onSendMessage={handleSendMessage} />
                        </>
                    ) : (
                        <EmptyMessageState />
                    )}
                </Card>
            </div>
        </div>
    );
}


