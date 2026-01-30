/**
 * ConversationList Component
 * 
 * Displays a list of conversation partners with:
 * - Last message preview
 * - Unread message badges
 * - User avatars with initials
 * - Timestamp of last message
 */

'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Id } from '@/convex/_generated/dataModel';
import { timeAgo } from '@/shared/lib/utils';

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

export interface ConversationPartner {
    userId: Id<"users">;
    user: User;
    lastMessage: Message;
    unreadCount: number;
}

interface ConversationListProps {
    conversations: ConversationPartner[];
    selectedUserId: Id<"users"> | null;
    onSelectConversation: (userId: Id<"users">) => void;
}

export function ConversationList({
    conversations,
    selectedUserId,
    onSelectConversation,
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <Card className="lg:col-span-1 overflow-hidden flex flex-col shadow-lg">
                <CardHeader className="border-b bg-linear-to-r from-blue-50 to-blue-100">
                    <CardTitle className="text-xl font-semibold">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-gray-500">
                    <div className="py-8">
                        <div className="text-4xl mb-3">💬</div>
                        <p className="text-base">No conversations yet.</p>
                        <p className="text-sm mt-2">Send a message to start chatting!</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="lg:col-span-1 overflow-hidden flex flex-col shadow-lg">
            <CardHeader className="border-b bg-linear-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-xl font-semibold">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
                {conversations.map((partner) => {
                    const isSelected = selectedUserId === partner.userId;
                    const userInitial = partner.user.name.charAt(0).toUpperCase();

                    return (
                        <button
                            key={partner.userId}
                            onClick={() => onSelectConversation(partner.userId)}
                            className={`w-full p-4 border-b hover:bg-blue-50 text-left transition-all duration-200 ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600 shadow-sm' : ''
                                }`}
                            aria-label={`Conversation with ${partner.user.name}`}
                        >
                            <div className="flex items-center space-x-3">
                                {/* User Avatar */}
                                <div
                                    className="w-12 h-12 bg-linear-to-br from-blue-400 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shrink-0 shadow-md"
                                    aria-hidden="true"
                                >
                                    {userInitial}
                                </div>

                                {/* Conversation Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {partner.user.name}
                                        </p>
                                        {partner.unreadCount > 0 && (
                                            <Badge variant="destructive" className="ml-2 text-xs">
                                                {partner.unreadCount}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">
                                        {partner.lastMessage.content}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {timeAgo(new Date(partner.lastMessage.timestamp).toISOString())}
                                    </p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}
