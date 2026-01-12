/**
 * ============================================================================
 * BACKEND - Mock Messages Data
 * ============================================================================
 * 
 * This file contains mock messaging data for development.
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace with database tables for messages
 * 2. Implement real-time messaging with WebSockets (Socket.io, Pusher)
 * 3. Add message encryption for security
 * 4. Implement message threading/conversations
 * 5. Add file attachment support with cloud storage (AWS S3, Cloudinary)
 * 6. Implement message read receipts and typing indicators
 * 7. Add pagination for message history
 */

import { Message } from '@/lib/types';

/**
 * Mock messages database
 * In production: Replace with database queries
 */
export const messages: Message[] = [
  {
    id: 'msg-1',
    senderId: '2',
    receiverId: '1',
    content: 'Hi Alex! I saw your application for mentorship. Would love to chat about your goals.',
    timestamp: '2026-01-10T14:30:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: '1',
    receiverId: '2',
    content: 'Thanks Sarah! I\'m really interested in learning more about system design and backend development.',
    timestamp: '2026-01-10T15:00:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    senderId: '2',
    receiverId: '1',
    content: 'Great! Let\'s schedule a kickoff session next week. What days work for you?',
    timestamp: '2026-01-10T15:15:00Z',
    read: false,
  },
  {
    id: 'msg-4',
    senderId: '3',
    receiverId: '4',
    content: 'Emily, we received your application for the Marketing Internship. Can you come in for an interview?',
    timestamp: '2026-01-11T10:00:00Z',
    read: true,
  },
  {
    id: 'msg-5',
    senderId: '4',
    receiverId: '3',
    content: 'Absolutely! I\'m available next week on Tuesday or Wednesday afternoon.',
    timestamp: '2026-01-11T11:30:00Z',
    read: false,
  },
];

/**
 * Helper function to get messages for a user
 * In production: Use indexed database queries for performance
 * Example: await db.messages.findMany({ 
 *   where: { OR: [{ senderId: userId }, { receiverId: userId }] },
 *   orderBy: { timestamp: 'desc' }
 * })
 */
export const getUserMessages = (userId: string): Message[] => {
  return messages.filter(msg => msg.senderId === userId || msg.receiverId === userId);
};

/**
 * Helper function to get conversation between two users
 * In production: Optimize with proper indexing on sender/receiver pairs
 */
export const getConversation = (userId1: string, userId2: string): Message[] => {
  return messages.filter(
    msg =>
      (msg.senderId === userId1 && msg.receiverId === userId2) ||
      (msg.senderId === userId2 && msg.receiverId === userId1)
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

/**
 * Helper function to get unread message count
 * In production: Use COUNT queries for efficiency
 */
export const getUnreadCount = (userId: string): number => {
  return messages.filter(msg => msg.receiverId === userId && !msg.read).length;
};
