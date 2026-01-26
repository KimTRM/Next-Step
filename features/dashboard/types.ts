/**
 * Dashboard Feature - Type Definitions
 */

import type { Id } from "@/convex/_generated/dataModel";
import type { ApplicationStatus } from "../applications/types";

// Dashboard stats for students
export type StudentDashboardStats = {
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    acceptedOffers: number;
    recentActivity: DashboardActivity[];
};

// Dashboard stats for mentors
export type MentorDashboardStats = {
    totalMentees: number;
    upcomingSessions: number;
    completedSessions: number;
    pendingRequests: number;
    rating: number;
    recentActivity: DashboardActivity[];
};

// Dashboard stats for employers
export type EmployerDashboardStats = {
    activeJobs: number;
    totalApplications: number;
    newApplicationsThisWeek: number;
    scheduledInterviews: number;
    recentActivity: DashboardActivity[];
};

// Generic activity item
export type DashboardActivity = {
    id: string;
    type: "application" | "interview" | "message" | "session" | "job_posted";
    title: string;
    description: string;
    timestamp: number;
    status?: ApplicationStatus | "scheduled" | "completed";
    relatedId?: Id<"jobs"> | Id<"applications"> | Id<"mentorshipSessions">;
};

// Quick action item
export type QuickAction = {
    id: string;
    label: string;
    description: string;
    href: string;
    icon?: string;
};
