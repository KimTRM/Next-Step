/**
 * Messages API Route - NextStep Platform
 * 
 * GET /api/messages - Returns messages for current user
 * GET /api/messages?userId=1 - Get messages for specific user
 * 
 * HACKATHON TODO:
 * - Add POST endpoint for sending messages
 * - Add PUT endpoint for marking messages as read
 * - Add DELETE endpoint for deleting messages
 * - Add real-time messaging with WebSockets or Pusher
 * - Add message threading/conversations
 * - Add file attachment support
 * - Implement authentication to get current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { messages, users } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '1'; // Mock current user as ID 1
    const conversationWith = searchParams.get('conversationWith');

    let filteredMessages = messages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    );

    // If conversationWith is provided, filter for conversation between two users
    if (conversationWith) {
      filteredMessages = filteredMessages.filter(
        msg =>
          (msg.senderId === userId && msg.receiverId === conversationWith) ||
          (msg.senderId === conversationWith && msg.receiverId === userId)
      );
    }

    // Enhance messages with sender/receiver info
    const enhancedMessages = filteredMessages.map(msg => {
      const sender = users.find(u => u.id === msg.senderId);
      const receiver = users.find(u => u.id === msg.receiverId);
      
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
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      data: enhancedMessages,
      count: enhancedMessages.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// TODO: Add POST endpoint for sending messages
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const { receiverId, content } = body;
//   
//   // Validate input
//   // Get current user from session/token
//   // Create message in database
//   // Send real-time notification to receiver
//   // Return created message
// }

// TODO: Get list of conversations (unique users)
// GET /api/messages/conversations
// Returns list of users the current user has conversations with
