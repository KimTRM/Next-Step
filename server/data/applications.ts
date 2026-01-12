/**
 * ============================================================================
 * BACKEND - Mock Applications Data
 * ============================================================================
 * 
 * This file contains mock application data for development.
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace with database tables for applications
 * 2. Add proper relations between applications, users, and opportunities
 * 3. Implement application workflow/status tracking
 * 4. Add email notifications for application status changes
 * 5. Implement application analytics and reporting
 */

import { Application, MentorshipSession } from '@/lib/types';

/**
 * Mock applications database
 * In production: Replace with database queries
 */
export const applications: Application[] = [
  {
    id: 'app-1',
    opportunityId: 'opp-3',
    userId: '1',
    status: 'accepted',
    appliedDate: '2026-01-06T00:00:00Z',
    coverLetter: 'I am very interested in learning web development best practices...',
  },
  {
    id: 'app-2',
    opportunityId: 'opp-1',
    userId: '1',
    status: 'pending',
    appliedDate: '2026-01-08T00:00:00Z',
    coverLetter: 'I have been working with React for 2 years during my studies...',
  },
  {
    id: 'app-3',
    opportunityId: 'opp-2',
    userId: '4',
    status: 'accepted',
    appliedDate: '2026-01-07T00:00:00Z',
    coverLetter: 'My experience in social media and content creation makes me a great fit...',
  },
  {
    id: 'app-4',
    opportunityId: 'opp-4',
    userId: '1',
    status: 'rejected',
    appliedDate: '2026-01-09T00:00:00Z',
  },
];

/**
 * Mock mentorship sessions database
 * In production: Replace with database queries
 */
export const mentorshipSessions: MentorshipSession[] = [
  {
    id: 'session-1',
    mentorId: '2',
    studentId: '1',
    topic: 'Introduction to System Design',
    scheduledDate: '2026-01-20T14:00:00Z',
    duration: 60,
    status: 'scheduled',
  },
  {
    id: 'session-2',
    mentorId: '5',
    studentId: '4',
    topic: 'Building a Product Roadmap',
    scheduledDate: '2026-01-18T15:00:00Z',
    duration: 45,
    status: 'scheduled',
  },
];

/**
 * Helper function to get applications by user
 * In production: await db.applications.findMany({ where: { userId } })
 */
export const getUserApplications = (userId: string): Application[] => {
  return applications.filter(app => app.userId === userId);
};

/**
 * Helper function to get applications by opportunity
 * In production: await db.applications.findMany({ where: { opportunityId } })
 */
export const getApplicationsByOpportunity = (opportunityId: string): Application[] => {
  return applications.filter(app => app.opportunityId === opportunityId);
};

/**
 * Helper function to get applications by status
 * In production: Add indexed queries for filtering
 */
export const getApplicationsByStatus = (userId: string, status: string): Application[] => {
  return applications.filter(app => app.userId === userId && app.status === status);
};
