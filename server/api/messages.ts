/**
 * ============================================================================
 * BACKEND - Messages API Logic
 * ============================================================================
 * 
 * This file contains the business logic for messaging operations.
 * The actual Next.js API route (app/api/messages/route.ts) calls these functions.
 * 
 * SEPARATION OF CONCERNS:
 * - This file: Pure business logic (message filtering, conversation management)
 * - app/api/messages/route.ts: HTTP handling (request/response)
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Implement real-time messaging with WebSockets (Socket.io, Pusher)
 * 2. Add message encryption for security
 * 3. Implement message threading/conversations
 * 4. Add file attachment support
 * 5. Implement read receipts and typing indicators
 * 6. Add message search functionality
 * 7. Implement message pagination for performance
 * 8. Add push notifications for new messages
 */

import { messages, getUserMessages, getConversation, getUnreadCount } from '@/server/data/messages';
import { users, getUserById } from '@/server/data/users';
import { Message } from '@/lib/types';

/**
 * Enhanced message with sender/receiver details
 */
export interface EnhancedMessage extends Message {
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
  receiver: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
}

/**
 * Get messages for a user with optional conversation filtering
 * 
 * @param userId - Current user ID
 * @param conversationWith - Optional user ID to filter conversation
 * @returns Enhanced messages with sender/receiver info
 * 
 * PRODUCTION IMPROVEMENTS:
 * - Add pagination (limit, offset or cursor-based)
 * - Implement real-time updates with WebSockets
 * - Add message caching
 * - Optimize database queries with proper indexing
 */
export async function getMessages(
  userId: string,
  conversationWith?: string
): Promise<{ messages: EnhancedMessage[]; count: number }> {
  let filteredMessages: Message[] = [];

  if (conversationWith) {
    // Get conversation between two users
    filteredMessages = getConversation(userId, conversationWith);
  } else {
    // Get all messages for user
    filteredMessages = getUserMessages(userId);
  }

  // Enhance messages with sender/receiver info
  const enhancedMessages: EnhancedMessage[] = filteredMessages.map(msg => {
    const sender = getUserById(msg.senderId);
    const receiver = getUserById(msg.receiverId);

    return {
      ...msg,
      sender: sender
        ? { id: sender.id, name: sender.name, avatarUrl: sender.avatarUrl }
        : null,
      receiver: receiver
        ? { id: receiver.id, name: receiver.name, avatarUrl: receiver.avatarUrl }
        : null,
    };
  });

  // Sort by timestamp (newest first)
  enhancedMessages.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    messages: enhancedMessages,
    count: enhancedMessages.length,
  };
}

/**
 * Get list of conversations for a user
 * 
 * @param userId - Current user ID
 * @returns List of unique conversation partners with last message
 * 
 * PRODUCTION IMPROVEMENTS:
 * - Add unread count per conversation
 * - Sort by last message timestamp
 * - Add conversation metadata (archived, muted, etc.)
 */
export async function getConversations(userId: string): Promise<any[]> {
  const userMessages = getUserMessages(userId);

  // Get unique conversation partners
  const conversationPartnersSet = new Set(
    userMessages.map(msg =>
      msg.senderId === userId ? msg.receiverId : msg.senderId
    )
  );

  const conversations = Array.from(conversationPartnersSet).map(partnerId => {
    const partner = getUserById(partnerId);
    const conversationMessages = getConversation(userId, partnerId);
    const lastMessage = conversationMessages[conversationMessages.length - 1];

    return {
      partner: partner
        ? { id: partner.id, name: partner.name, avatarUrl: partner.avatarUrl }
        : null,
      lastMessage,
      unreadCount: conversationMessages.filter(msg => msg.receiverId === userId && !msg.read).length,
    };
  });

  // Sort by last message timestamp
  conversations.sort((a, b) => {
    if (!a.lastMessage || !b.lastMessage) return 0;
    return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime();
  });

  return conversations;
}

/**
 * Send a new message
 * 
 * @param senderId - ID of the sender
 * @param receiverId - ID of the receiver
 * @param content - Message content
 * @returns Created message object
 * 
 * PRODUCTION IMPROVEMENTS:
 * - Validate users exist and can message each other
 * - Sanitize message content
 * - Emit real-time event to receiver
 * - Send push notification
 * - Check for blocked users
 */
export async function sendMessage(
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  // Mock implementation
  // In production: Insert into database, emit WebSocket event, send notification
  throw new Error('Not implemented - Add database integration');
}

/**
 * Mark a message as read
 * 
 * @param messageId - Message ID
 * @param userId - User marking the message as read
 * @returns Updated message
 * 
 * PRODUCTION IMPROVEMENTS:
 * - Verify user is the receiver
 * - Emit read receipt event to sender
 * - Update unread count cache
 */
export async function markMessageAsRead(messageId: string, userId: string): Promise<Message | null> {
  // Mock implementation
  // In production: Update in database and emit read receipt
  throw new Error('Not implemented - Add database integration');
}

/**
 * Delete a message
 * 
 * @param messageId - Message ID
 * @param userId - User deleting the message
 * @returns Success status
 * 
 * PRODUCTION IMPROVEMENTS:
 * - Verify user owns the message
 * - Implement soft delete
 * - Optionally delete for both users
 */
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  // Mock implementation
  // In production: Soft delete message in database
  throw new Error('Not implemented - Add database integration');
}
