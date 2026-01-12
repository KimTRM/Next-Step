/**
 * Utility Functions for NextStep Platform
 * 
 * HACKATHON TODO:
 * - Add date formatting helpers
 * - Add validation functions
 * - Add string manipulation utilities
 * - Add localStorage helpers for client-side state
 */

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Calculate days until a deadline
 */
export function daysUntilDeadline(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  const names = name.split(' ');
  if (names.length >= 2) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

/**
 * Check if an opportunity deadline has passed
 */
export function isDeadlinePassed(deadline?: string): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

/**
 * Get a color based on opportunity type
 */
export function getOpportunityColor(type: string): string {
  const colors: Record<string, string> = {
    job: 'blue',
    internship: 'green',
    mentorship: 'purple',
  };
  return colors[type] || 'gray';
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'yellow',
    accepted: 'green',
    rejected: 'red',
    scheduled: 'blue',
    completed: 'gray',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
}

/**
 * Format time ago (e.g., "2 days ago")
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'just now';
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate a random ID (for mock purposes)
 * TODO: Replace with UUID library or database-generated IDs
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Class name helper (similar to clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// HACKATHON EXTENSION IDEAS:
// - Add file upload helpers
// - Add API fetch wrappers with error handling
// - Add form validation utilities
// - Add localStorage/sessionStorage helpers
// - Add debounce/throttle functions for search
