export type UserRole = 'employer' | 'job_seeker' | 'mentor';

export type EducationLevel = 
  | 'high_school'
  | 'undergraduate'
  | 'graduate'
  | 'phd'
  | 'bootcamp'
  | 'self_taught';

export type Goal = 
  | 'find_job'
  | 'find_internship'
  | 'get_mentorship'
  | 'build_skills'
  | 'expand_network';

export interface OnboardingData {
  role: UserRole | null;
  firstName: string;
  lastName: string;
  currentSituation: string;
  educationLevel: EducationLevel;
  skills: string[];
  goals: Goal[];
}

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle?: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "What brings you here?",
    subtitle: "Select the option that best describes you. This helps us personalize your experience."
  },
  {
    id: 2,
    title: "Tell us about yourself",
    subtitle: "Help us match you with the right opportunities."
  },
  {
    id: 3,
    title: "What are your goals?",
    subtitle: "Select 1-3 goals that best describe what you're looking for."
  },
  {
    id: 4,
    title: "You're all set!",
    subtitle: "Review your profile and complete your setup."
  }
];

export const ROLE_OPTIONS = [
  {
    value: 'employer' as UserRole,
    title: 'Employer',
    description: "I'm hiring talent for my organization or company.",
    icon: 'building'
  },
  {
    value: 'job_seeker' as UserRole,
    title: 'Job Seeker',
    description: "I'm looking for job opportunities, internships, or career growth.",
    icon: 'briefcase'
  },
  {
    value: 'mentor' as UserRole,
    title: 'Mentor',
    description: "I want to guide and help others in their career journey.",
    icon: 'people'
  }
];

export const GOAL_OPTIONS = [
  {
    value: 'find_job' as Goal,
    title: 'Find a Job',
    description: 'Discover full-time opportunities that match your skills'
  },
  {
    value: 'find_internship' as Goal,
    title: 'Find an Internship',
    description: 'Gain valuable experience through internships'
  },
  {
    value: 'get_mentorship' as Goal,
    title: 'Get Mentorship',
    description: 'Connect with experienced professionals in your field'
  },
  {
    value: 'build_skills' as Goal,
    title: 'Build Skills',
    description: 'Access resources to develop new competencies'
  },
  {
    value: 'expand_network' as Goal,
    title: 'Expand My Network',
    description: 'Build meaningful professional connections'
  }
];

export const EDUCATION_LEVELS = [
  { value: 'high_school' as EducationLevel, label: 'High School' },
  { value: 'undergraduate' as EducationLevel, label: 'Undergraduate' },
  { value: 'graduate' as EducationLevel, label: 'Graduate' },
  { value: 'phd' as EducationLevel, label: 'PhD' },
  { value: 'bootcamp' as EducationLevel, label: 'Bootcamp' },
  { value: 'self_taught' as EducationLevel, label: 'Self Taught' }
];

export const SUGGESTED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'HTML/CSS',
  'SQL',
  'Git',
  'AWS',
  'Docker',
  'MongoDB',
  'PostgreSQL',
  'GraphQL',
  'Vue.js',
  'Angular',
  'Java',
  'C#',
  'Go',
  'Rust',
  'Swift'
];
