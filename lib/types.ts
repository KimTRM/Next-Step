/**
 * TypeScript Type Definitions for NextStep Platform
 * 
 * HACKATHON TODO:
 * - Add more fields as your features grow (e.g., ratings, reviews)
 * - Create validation schemas using Zod
 * - Add enums for status types (PENDING, ACCEPTED, etc.)
 */

export type UserRole = 'student' | 'mentor' | 'employer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  skills?: string[];
  location?: string;
  avatarUrl?: string;
  createdAt: string;
}

export type OpportunityType = 'job' | 'internship' | 'mentorship';

export interface Opportunity {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  company?: string;
  mentor?: string;
  location: string;
  skills: string[];
  postedBy: string;
  postedDate: string;
  deadline?: string;
  isRemote: boolean;
  salary?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
  coverLetter?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface MentorshipSession {
  id: string;
  mentorId: string;
  studentId: string;
  topic: string;
  scheduledDate: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
}

// HACKATHON EXTENSION IDEAS:
// - Add Notification type for real-time alerts
// - Add Event type for networking events
// - Add Resource type for learning materials
// - Add Match type for mentor-mentee matching algorithm
