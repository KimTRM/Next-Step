/**
 * ============================================================================
 * DATA RE-EXPORTS (For Backward Compatibility)
 * ============================================================================
 * 
 * This file re-exports data from /server/data for backward compatibility.
 * 
 * DEPRECATED: This file is deprecated and maintained only for compatibility.
 * New code should import directly from /server/data/* instead.
 * 
 * MIGRATION PATH:
 * Old: import { users } from '@/lib/data';
 * New: import { users } from '@/server/data/users';
 * 
 * This file will be removed in a future update once all imports are migrated.
 */

// Re-export all data from server/data
export { users, getUserById, getUsersByRole, searchUsers } from '@/server/data/users';
export { 
  opportunities, 
  getOpportunityById, 
  getOpportunitiesByType,
  getOpportunitiesBySkills,
  getOpportunitiesByLocation 
} from '@/server/data/opportunities';
export { 
  messages, 
  getUserMessages, 
  getConversation,
  getUnreadCount 
} from '@/server/data/messages';
export { 
  applications, 
  mentorshipSessions,
  getUserApplications,
  getApplicationsByOpportunity,
  getApplicationsByStatus 
} from '@/server/data/applications';

