/**
 * MessagesPageContent Component
 *
 * Main messages page with:
 * - Two-column layout (desktop): conversations list + message thread
 * - Stacked view (mobile): with back button navigation
 * - Real-time message updates
 * - Loading and empty states
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import type { Id } from "@/convex/_generated/dataModel";

import { Card } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { ConversationList } from "./ConversationList";
import { MessageThread } from "./MessageThread";
import { MessageInput } from "./MessageInput";
import { EmptyMessageState } from "./EmptyMessageState";

import {
  useUserConversations,
  useConversation,
  useUnreadCount,
  useSendMessage,
  useMarkAsRead,
} from "@/features/messages/api";
import { useCurrentUser } from "@/features/users/api";

export function MessagesPageContent() {
  const { user: clerkUser } = useUser();
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null,
  );

  // Fetch data via feature APIs
  const conversations = useUserConversations();
  const currentUser = useCurrentUser();
  const messages = useConversation(selectedUserId);
  const unreadCount = useUnreadCount();

  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();

  // Loading states
  const isInitialLoading =
    conversations === undefined || currentUser === undefined;
  const isConversationLoading =
    selectedUserId !== null && messages === undefined;

  // Get selected conversation's other user info
  const selectedConversation = conversations?.find(
    (c) => c.otherUserId === selectedUserId,
  );

  // Mark messages as read when conversation opens or new messages arrive
  useEffect(() => {
    if (!selectedUserId || !currentUser?._id || !messages) return;

    // Check if there are any unread messages from the other user
    const hasUnreadMessages = messages.some(
      (msg) => msg.receiverId === currentUser._id && !msg.isRead,
    );

    if (hasUnreadMessages) {
      markAsRead({ otherUserId: selectedUserId }).catch((err) =>
        console.error("Failed to mark as read:", err),
      );
    }
  }, [selectedUserId, currentUser?._id, messages, markAsRead]);

  // Handle selecting a conversation
  const handleSelectConversation = (userId: Id<"users">) => {
    setSelectedUserId(userId);
  };

  // Handle going back (mobile)
  const handleBack = () => {
    setSelectedUserId(null);
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    if (!selectedUserId) return;

    try {
      await sendMessage({
        receiverId: selectedUserId,
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      throw error;
    }
  };

  // Auth check
  if (!clerkUser) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  // Initial loading state
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-72" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-150">
            <Card className="lg:col-span-1">
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="lg:col-span-2">
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-12 w-48" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // User not found
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-12 text-center">
            <p className="text-lg text-muted-foreground">
              User profile not found. Please complete onboarding.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="w-10/12 mx-auto px-2 sm:px-4 lg:px-6 py-4 lg:py-7">

        {/* Messages Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 h-[87vh]">
          {/* Conversation List - Hidden on mobile when conversation selected */}
          <Card
            className={`lg:col-span-1 h-full overflow-hidden ${selectedUserId ? "hidden lg:flex lg:flex-col h-full" : "flex flex-col h-full"
              }`}
          >
            <div className="p-4 bg-[#198754]">
              <h2 className="font-semibold text-lg text-white">
                CONVERSATIONS
              </h2>
              {conversations && conversations.length > 0 && (
                <p className="text-sm text-white text-muted-foreground mt-1">
                  {conversations.length}{" "}
                  {conversations.length === 1
                    ? "conversation"
                    : "conversations"}
                </p>
              )}
            </div>
            <div className="flex-1 overflow-hidden h-full">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                onSelectConversation={handleSelectConversation}
                loading={false}
              />
            </div>
          </Card>

          {/* Message Thread - Full width on mobile when conversation selected */}
          <Card
            className={`lg:col-span-2 h-full overflow-hidden flex flex-col ${selectedUserId ? "flex h-full" : "hidden lg:flex h-full"
              }`}
          >
            {!selectedUserId ? (
              <EmptyMessageState />
            ) : (
              <>
                <div className="flex-1 overflow-hidden h-full">
                  <MessageThread
                    messages={messages}
                    currentUserId={currentUser._id}
                    otherUser={
                      selectedConversation?.otherUser
                        ? {
                          _id: selectedConversation.otherUser._id,
                          name: selectedConversation.otherUser.name,
                          avatarUrl: selectedConversation.otherUser.avatarUrl,
                        }
                        : null
                    }
                    loading={isConversationLoading}
                    onBack={handleBack}
                    showBackButton={true}
                  />
                </div>
                <MessageInput onSendMessage={handleSendMessage} />
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
