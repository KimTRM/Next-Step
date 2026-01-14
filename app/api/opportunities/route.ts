/**
 * ============================================================================
 * API ROUTE - Opportunities Endpoint
 * ============================================================================
 * 
 * This is the Next.js API route handler for /api/opportunities
 * It handles HTTP requests and calls the business logic in /server/api/opportunities.ts
 * 
 * ARCHITECTURE:
 * - This file: HTTP layer (request parsing, response formatting, error handling)
 * - /server/api/opportunities.ts: Business logic layer
 * - /server/data/opportunities.ts: Data access layer
 * 
 * ENDPOINTS:
 * - GET /api/opportunities - Returns all opportunities
 * - GET /api/opportunities?type=job - Filter by type
 * - GET /api/opportunities?skills=React,TypeScript - Filter by skills
 * - GET /api/opportunities?location=Toronto - Filter by location
 * - GET /api/opportunities?remote=true - Filter remote opportunities
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Add authentication for protected endpoints
 * 2. Add POST endpoint for creating opportunities (employers/mentors only)
 * 3. Add PUT/PATCH for updating opportunities
 * 4. Add DELETE for removing opportunities
 * 5. Implement pagination
 * 6. Add rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllOpportunities } from '@/server/api/opportunities';

/**
 * GET handler for /api/opportunities
 * Returns list of opportunities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const skillsParam = searchParams.get('skills');
    const location = searchParams.get('location') || undefined;
    const remoteParam = searchParams.get('remote');
    const search = searchParams.get('search') || undefined;

    // Parse skills array
    const skills = skillsParam
      ? skillsParam.split(',').map(s => s.trim())
      : undefined;

    // Parse remote boolean
    const isRemote = remoteParam === 'true' ? true : remoteParam === 'false' ? false : undefined;

    // Call business logic layer
    const result = await getAllOpportunities({
      type,
      skills,
      location,
      isRemote,
      search,
    });

    // Return successful response
    return NextResponse.json({
      success: true,
      data: result.opportunities,
      count: result.count,
    });
  } catch (error) {
    // Log error in production (use proper logging service)
    console.error('Error in GET /api/opportunities:', error);

    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch opportunities',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
