/**
 * ============================================================================
 * BACKEND - Mock Opportunities Data
 * ============================================================================
 * 
 * This file contains mock opportunity data (jobs, internships, mentorships).
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace with database tables for opportunities
 * 2. Add proper indexing on frequently queried fields (type, skills, location)
 * 3. Implement full-text search for descriptions
 * 4. Add geolocation-based search for location filtering
 * 5. Implement recommendation engine based on user skills and interests
 */

import { Opportunity } from '@/lib/types';

/**
 * Mock opportunities database
 * In production: Replace with database queries
 */
export const opportunities: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'Junior Frontend Developer',
    type: 'job',
    description: 'Join our team to build modern web applications using React and TypeScript. Perfect for recent graduates or students looking for their first role.',
    company: 'TechStart Inc',
    location: 'Toronto, ON',
    skills: ['React', 'TypeScript', 'CSS'],
    postedBy: '3',
    postedDate: '2025-12-15T00:00:00Z',
    deadline: '2026-02-15T00:00:00Z',
    isRemote: true,
    salary: '$50,000 - $65,000',
  },
  {
    id: 'opp-2',
    title: 'Summer Marketing Internship',
    type: 'internship',
    description: 'Gain hands-on experience in digital marketing, content creation, and social media management.',
    company: 'BrandBoost Agency',
    location: 'Vancouver, BC',
    skills: ['Content Writing', 'Social Media', 'Analytics'],
    postedBy: '3',
    postedDate: '2025-12-20T00:00:00Z',
    deadline: '2026-03-01T00:00:00Z',
    isRemote: false,
    salary: '$18/hour',
  },
  {
    id: 'opp-3',
    title: 'Web Development Mentorship',
    type: 'mentorship',
    description: 'Learn best practices in modern web development, code reviews, and career guidance from an experienced developer.',
    mentor: 'Sarah Chen',
    location: 'Remote',
    skills: ['JavaScript', 'React', 'Career Development'],
    postedBy: '2',
    postedDate: '2026-01-05T00:00:00Z',
    isRemote: true,
  },
  {
    id: 'opp-4',
    title: 'Data Analyst Internship',
    type: 'internship',
    description: 'Work with real datasets to derive business insights. Learn SQL, Python, and data visualization tools.',
    company: 'DataDriven Corp',
    location: 'Montreal, QC',
    skills: ['Python', 'SQL', 'Excel'],
    postedBy: '3',
    postedDate: '2026-01-08T00:00:00Z',
    deadline: '2026-02-28T00:00:00Z',
    isRemote: true,
    salary: '$20/hour',
  },
  {
    id: 'opp-5',
    title: 'Product Management Coaching',
    type: 'mentorship',
    description: 'One-on-one sessions covering product strategy, roadmapping, and stakeholder management.',
    mentor: 'David Kim',
    location: 'Remote',
    skills: ['Product Management', 'Strategy'],
    postedBy: '5',
    postedDate: '2026-01-10T00:00:00Z',
    isRemote: true,
  },
  {
    id: 'opp-6',
    title: 'Full Stack Developer',
    type: 'job',
    description: 'Build scalable applications with Node.js, React, and PostgreSQL. 1-2 years experience preferred.',
    company: 'CloudSolutions Ltd',
    location: 'Calgary, AB',
    skills: ['Node.js', 'React', 'PostgreSQL', 'Docker'],
    postedBy: '3',
    postedDate: '2026-01-12T00:00:00Z',
    deadline: '2026-03-15T00:00:00Z',
    isRemote: true,
    salary: '$60,000 - $80,000',
  },
];

/**
 * Helper function to get opportunity by ID
 * In production: await db.opportunities.findUnique({ where: { id } })
 */
export const getOpportunityById = (id: string): Opportunity | undefined => {
  return opportunities.find(opp => opp.id === id);
};

/**
 * Helper function to get opportunities by type
 * In production: await db.opportunities.findMany({ where: { type } })
 */
export const getOpportunitiesByType = (type: string): Opportunity[] => {
  return opportunities.filter(opp => opp.type === type);
};

/**
 * Helper function to filter opportunities by skills
 * In production: Use proper JOIN queries or search engine
 */
export const getOpportunitiesBySkills = (skills: string[]): Opportunity[] => {
  return opportunities.filter(opp =>
    opp.skills.some(skill =>
      skills.some(s => s.toLowerCase() === skill.toLowerCase())
    )
  );
};

/**
 * Helper function to filter opportunities by location
 * In production: Use geolocation queries for proximity search
 */
export const getOpportunitiesByLocation = (location: string): Opportunity[] => {
  return opportunities.filter(opp =>
    opp.location.toLowerCase().includes(location.toLowerCase())
  );
};
