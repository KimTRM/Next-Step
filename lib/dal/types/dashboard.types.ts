/**
 * Dashboard types for Data Access Layer
 */

import { Id } from "@/convex/_generated/dataModel";
import type { Opportunity } from "./opportunity.types";

export interface DashboardStats {
    applicationsCount: number;
    messagesCount: number;
    unreadMessagesCount: number;
    opportunitiesCount: number;
    applicationsByStatus: {
        pending: number;
        reviewing: number;
        interview: number;
        accepted: number;
        rejected: number;
    };
}

export interface DashboardData {
    stats: DashboardStats;
    recentOpportunities: Opportunity[];
    hasCompletedOnboarding: boolean;
}
