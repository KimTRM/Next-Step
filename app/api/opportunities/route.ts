/**
 * Opportunities API Route - NextStep Platform
 * 
 * GET /api/opportunities - Returns all opportunities
 * GET /api/opportunities?type=job - Filter by type
 * GET /api/opportunities?skills=React,TypeScript - Filter by skills
 * 
 * HACKATHON TODO:
 * - Add POST endpoint for creating opportunities (employers/mentors)
 * - Add PUT/PATCH endpoint for updating opportunities
 * - Add DELETE endpoint for removing opportunities
 * - Add pagination support
 * - Add sorting (by date, relevance, etc.)
 * - Add advanced search and filtering
 * - Connect to real database
 */

import { NextRequest, NextResponse } from 'next/server';
import { opportunities } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const skills = searchParams.get('skills');
    const location = searchParams.get('location');
    const remote = searchParams.get('remote');

    let filteredOpportunities = [...opportunities];

    // Filter by type (job, internship, mentorship)
    if (type) {
      filteredOpportunities = filteredOpportunities.filter(
        opp => opp.type === type
      );
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.skills.some(skill =>
          skillsArray.includes(skill.toLowerCase())
        )
      );
    }

    // Filter by location
    if (location) {
      filteredOpportunities = filteredOpportunities.filter(opp =>
        opp.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by remote
    if (remote === 'true') {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.isRemote);
    }

    // Sort by date (newest first)
    filteredOpportunities.sort(
      (a, b) =>
        new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
    );

    return NextResponse.json({
      success: true,
      data: filteredOpportunities,
      count: filteredOpportunities.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

// TODO: Add POST endpoint for creating opportunities
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   // Validate input (check required fields)
//   // Verify user is employer or mentor
//   // Save to database
//   // Return created opportunity
// }
