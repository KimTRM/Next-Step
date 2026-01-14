/**
 * ============================================================================
 * BACKEND - Mock User Data
 * ============================================================================
 * 
 * This file contains mock user data for development purposes.
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace this with a real database (PostgreSQL, MongoDB, Supabase)
 * 2. Add database ORM/query builder (Prisma, Drizzle, TypeORM)
 * 3. Implement proper data validation (Zod schemas)
 * 4. Add database migrations and seeding scripts
 * 5. Implement caching layer (Redis) for frequently accessed data
 */

import { User } from '@/lib/types';

/**
 * Mock user database
 * In production: Replace with database queries
 */
export const users: User[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.j@email.com',
    role: 'student',
    bio: 'Computer Science student passionate about web development',
    skills: ['React', 'TypeScript', 'Node.js'],
    location: 'Toronto, ON',
    avatarUrl: '/assets/avatars/alex.jpg',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah.c@email.com',
    role: 'mentor',
    bio: 'Senior Software Engineer at TechCorp with 8 years experience',
    skills: ['JavaScript', 'Python', 'System Design', 'Career Guidance'],
    location: 'Vancouver, BC',
    avatarUrl: '/assets/avatars/sarah.jpg',
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.b@company.com',
    role: 'employer',
    bio: 'HR Manager at StartupXYZ looking for talented interns',
    skills: [],
    location: 'Montreal, QC',
    avatarUrl: '/assets/avatars/michael.jpg',
    createdAt: '2025-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    role: 'student',
    bio: 'Marketing major interested in digital marketing and UX design',
    skills: ['Figma', 'Content Writing', 'Social Media'],
    location: 'Calgary, AB',
    avatarUrl: '/assets/avatars/emily.jpg',
    createdAt: '2025-01-04T00:00:00Z',
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.k@techcompany.com',
    role: 'mentor',
    bio: 'Product Manager helping youth navigate tech careers',
    skills: ['Product Management', 'Agile', 'Leadership'],
    location: 'Toronto, ON',
    avatarUrl: '/assets/avatars/david.jpg',
    createdAt: '2025-01-05T00:00:00Z',
  },
];

/**
 * Helper function to get user by ID
 * In production: Replace with database query
 * Example: await db.users.findUnique({ where: { id } })
 */
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

/**
 * Helper function to get users by role
 * In production: Replace with database query with indexing
 * Example: await db.users.findMany({ where: { role } })
 */
export const getUsersByRole = (role: string): User[] => {
  return users.filter(user => user.role === role);
};

/**
 * Helper function to search users
 * In production: Use full-text search or Elasticsearch
 */
export const searchUsers = (query: string): User[] => {
  const queryLower = query.toLowerCase();
  return users.filter(
    user =>
      user.name.toLowerCase().includes(queryLower) ||
      user.email.toLowerCase().includes(queryLower) ||
      user.bio?.toLowerCase().includes(queryLower)
  );
};
