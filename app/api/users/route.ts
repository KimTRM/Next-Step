/**
 * ============================================================================
 * API ROUTE - Users Endpoint
 * ============================================================================
 * 
 * This is the Next.js API route handler for /api/users
 * It handles HTTP requests and calls the business logic in /server/api/users.ts
 * 
 * ARCHITECTURE:
 * - This file: HTTP layer (request parsing, response formatting, error handling)
 * - /server/api/users.ts: Business logic layer
 * - /server/data/users.ts: Data access layer
 * 
 * ENDPOINTS:
 * - GET /api/users - Returns list of all users
 * - GET /api/users?role=student - Filter by role
 * - GET /api/users?search=query - Search users
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Add authentication middleware (verify JWT token)
 * 2. Add rate limiting
 * 3. Add request validation
 * 4. Implement proper error logging (Sentry, LogRocket)
 * 5. Add CORS headers if needed for external API access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/server/api/users';

/**
 * GET handler for /api/users
 * Returns list of users with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || undefined;
    const search = searchParams.get('search') || undefined;

    // Call business logic layer
    const result = await getAllUsers({ role, search });

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result.users,
      count: result.count,
    });
  } catch (error) {
    // Log error in production (use proper logging service)
    console.error('Error in GET /api/users:', error);

    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
