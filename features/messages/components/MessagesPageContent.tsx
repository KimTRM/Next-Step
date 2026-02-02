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

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SquarePen, Ban } from "lucide-react";

import {
  ConversationList,
  MessageThread,
  MessageInput,
  EmptyMessageState,
  UserSearchModal
} from "@/features/messages/components"

import {
  useMessageSelection,
  useMessageConversation,
} from "@/features/messages/api";
import { useCurrentUser } from "../api";

export function MessagesPageContent() {
  const { user: clerkUser } = useUser();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Custom hooks that abstract away Convex Id types
  const { selectedUserId, selectConversation, clearSelection } =
    useMessageSelection();

  // Separate user hook from users feature
  const currentUser = useCurrentUser();

  const {
    conversations,
    messages,
    selectedConversation,
    sendMessage,
    isConversationLoading,
  } = useMessageConversation(selectedUserId, currentUser?._id);

  // Loading states
  const isInitialLoading = conversations === undefined || currentUser === undefined;

  // Handle selecting a conversation
  const handleSelectConversation = (userId: string) => {
    selectConversation(userId);
  };

  // Handle going back (mobile)
  const handleBack = () => {
    clearSelection();
  };

  // Handle sending a message
  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
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
      <div className="min-h-screen bg-green-100">
        <div className="w-full mx-auto">
          {/* Messages Layout Skeleton */}
          <div className="grid grid-cols-1 p-0 md:p-4 lg:p-4 lg:grid-cols-10 gap-2 h-[90vh]">
            {/* Conversation List Skeleton */}
            <Card className="lg:col-span-3 h-full border-0 rounded-md overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-4 bg-[#198754]">
                <Skeleton className="h-6 w-40 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20 mt-2" />
              </div>

              {/* Conversation Items */}
              <div className="flex-1 bg-white p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3 p-2">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Message Thread Skeleton - Empty State Style */}
            <Card className="hidden lg:flex lg:col-span-7 h-full rounded-md border-0 overflow-hidden flex-col">
              {/* Centered Empty State */}
              <div className="flex-1 bg-white flex flex-col items-center justify-center p-8">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
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
    <div className="min-h-screen bg-green-100">
      <div className="w-full mx-auto">

        {/* Messages Layout */}
        <div className="grid grid-cols-1 p-0 md:p-4 lg:p-4 lg:grid-cols-10 gap-2 h-[90vh]">
          {/* Conversation List - 30% width on desktop */}
          <Card
            className={`lg:col-span-3 h-full border-0 rounded-md overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 ${selectedUserId ? "hidden lg:flex lg:flex-col" : "flex flex-col"
              }`}
          >
            <div className="p-4 bg-[#198754] sticky top-0 z-10">
              <h2 className="font-semibold text-lg text-white">
                CONVERSATIONS
              </h2>
              {conversations && conversations.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {conversations.length}{" "}
                  {conversations.length === 1
                    ? "conversation"
                    : "conversations"}
                </p>
              )}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  className="bg-white/10 hover:bg-white/20 rounded-md px-2 py-1 text-white"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new Event("messages:block:open"));
                    }
                  }}
                  aria-label="Open blocked users"
                >
                  <Ban className="h-5 w-5" />
                </button>
                <button
                  className="relative"
                  onClick={() => setIsSearchModalOpen(true)}
                  aria-label="Start new conversation"
                >
                  <SquarePen className="h-7 w-7 text-white mt-2" />
                </button>
              </div>
            </div>

            {/* User Search Modal */}
            <UserSearchModal
              open={isSearchModalOpen}
              onOpenChange={setIsSearchModalOpen}
              onStartConversation={handleSelectConversation}
            />
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedUserId={selectedUserId}
                onSelectConversation={handleSelectConversation}
                loading={false}
              />
            </div>
          </Card>

          {/* Message Thread - 80% width on desktop */}
          <Card
            className={`lg:col-span-7 h-full rounded-md border-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 flex flex-col ${selectedUserId ? "flex" : "hidden lg:flex"
              }`}
          >
            {!selectedUserId ? (
              <EmptyMessageState />
            ) : (
              <>
                <div className="flex-1 overflow-hidden">
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