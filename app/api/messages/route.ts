/**
 * ============================================================================
 * API ROUTE - Messages Endpoint
 * ============================================================================
 * 
 * This is the Next.js API route handler for /api/messages
 * It handles HTTP requests and calls the business logic in /server/api/messages.ts
 * 
 * ARCHITECTURE:
 * - This file: HTTP layer (request parsing, response formatting, error handling)
 * - /server/api/messages.ts: Business logic layer
 * - /server/data/messages.ts: Data access layer
 * 
 * ENDPOINTS:
 * - GET /api/messages - Returns messages for current user
 * - GET /api/messages?userId=1 - Get messages for specific user (mock auth)
 * - GET /api/messages?conversationWith=2 - Get conversation between users
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Implement real authentication (get userId from JWT token)
 * 2. Add POST endpoint for sending messages
 * 3. Add PUT endpoint for marking messages as read
 * 4. Add DELETE endpoint for deleting messages
 * 5. Implement real-time messaging with WebSockets
 * 6. Add pagination for message history
 * 7. Implement message search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMessages, getConversations } from '@/server/api/messages';

/**
 * GET handler for /api/messages
 * Returns messages for a user with optional conversation filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    
    // Mock authentication: Get userId from query param
    // In production: Get from JWT token or session
    const userId = searchParams.get('userId') || '1';
    const conversationWith = searchParams.get('conversationWith') || undefined;

    // Call business logic layer
    const result = await getMessages(userId, conversationWith);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result.messages,
      count: result.count,
    });
  } catch (error) {
    // Log error in production (use proper logging service)
    console.error('Error in GET /api/messages:', error);

    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
