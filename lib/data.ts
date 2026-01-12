/**
 * Mock Data for NextStep Platform
 */

import { User, Opportunity, Message, Application, MentorshipSession } from './types';

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

export const messages: Message[] = [
  {
    id: 'msg-1',
    senderId: '2',
    receiverId: '1',
    content: 'Hi Alex! I saw your application for mentorship. Would love to chat about your goals.',
    timestamp: '2026-01-10T14:30:00Z',
    read: true,
  },
  {
    id: 'msg-2',
    senderId: '1',
    receiverId: '2',
    content: 'Thanks Sarah! I\'m really interested in learning more about system design and backend development.',
    timestamp: '2026-01-10T15:00:00Z',
    read: true,
  },
  {
    id: 'msg-3',
    senderId: '2',
    receiverId: '1',
    content: 'Great! Let\'s schedule a kickoff session next week. What days work for you?',
    timestamp: '2026-01-10T15:15:00Z',
    read: false,
  },
  {
    id: 'msg-4',
    senderId: '3',
    receiverId: '4',
    content: 'Emily, we received your application for the Marketing Internship. Can you come in for an interview?',
    timestamp: '2026-01-11T10:00:00Z',
    read: true,
  },
  {
    id: 'msg-5',
    senderId: '4',
    receiverId: '3',
    content: 'Absolutely! I\'m available next week on Tuesday or Wednesday afternoon.',
    timestamp: '2026-01-11T11:30:00Z',
    read: false,
  },
];

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

// HACKATHON HELPER FUNCTIONS
// Add these utility functions to filter and search data

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getOpportunityById = (id: string): Opportunity | undefined => {
  return opportunities.find(opp => opp.id === id);
};

export const getOpportunitiesByType = (type: string): Opportunity[] => {
  return opportunities.filter(opp => opp.type === type);
};

export const getUserApplications = (userId: string): Application[] => {
  return applications.filter(app => app.userId === userId);
};

export const getUserMessages = (userId: string): Message[] => {
  return messages.filter(msg => msg.senderId === userId || msg.receiverId === userId);
};
