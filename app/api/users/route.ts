/**
 * Users API Route - NextStep Platform
 * 
 * GET /api/users - Returns list of all users
 * GET /api/users?role=student - Filter by role
 * 
 * HACKATHON TODO:
 * - Add POST endpoint for user registration
 * - Add PUT endpoint for updating user profile
 * - Add GET /api/users/[id] for single user
 * - Add authentication and authorization
 * - Connect to real database (MongoDB, PostgreSQL, Supabase)
 * - Add input validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let filteredUsers = [...users];

    // Filter by role if provided
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Search by name or email if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(
        user =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredUsers,
      count: filteredUsers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// TODO: Add POST endpoint for creating users
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   // Validate input
//   // Save to database
//   // Return created user
// }
