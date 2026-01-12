/**
 * Users API Route - NextStep Platform
 * 
 * GET /api/users - Returns list of all users
 * GET /api/users?role=student - Filter by role
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
