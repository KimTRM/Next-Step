/**
 * Dashboard Data Access Layer
 * Provides aggregated data for dashboard views
 */

import { api } from "@/convex/_generated/api";
import { queryConvex } from "./convex";
import { DALError } from "../types/common.types";
import type { DashboardStats, DashboardData } from "../types/dashboard.types";
import type { Opportunity } from "../types/opportunity.types";

type AuthProvider = string | (() => Promise<string | null>);

export class DashboardDAL {
    /**
     * Get aggregated dashboard data for a user
     */
    static async getUserDashboardData(
        auth: AuthProvider,
    ): Promise<DashboardData> {
        try {
            // Fetch all required data in parallel
            const [
                currentUser,
                opportunities,
                applications,
                messages,
            ] = await Promise.all([
                queryConvex(api.users.getCurrentUser, {}, auth),
                queryConvex<Opportunity[]>(api.opportunities.getAllOpportunities, {}, auth),
                queryConvex(api.applications.getUserApplications, {}, auth),
                queryConvex(api.messages.getUserMessages, {}, auth),
            ]);

            // Calculate stats
            const applicationsArray = Array.isArray(applications) ? applications : [];
            const messagesArray = Array.isArray(messages) ? messages : [];

            // Count applications by status
            const applicationsByStatus = {
                pending: applicationsArray.filter((app: any) => app.status === "pending").length,
                reviewing: applicationsArray.filter((app: any) => app.status === "reviewing").length,
                interview: applicationsArray.filter((app: any) => app.status === "interview").length,
                accepted: applicationsArray.filter((app: any) => app.status === "accepted").length,
                rejected: applicationsArray.filter((app: any) => app.status === "rejected").length,
            };

            // Count unread messages
            const currentUserId = (currentUser as any)?._id;
            const unreadMessagesCount = messagesArray.filter(
                (msg: any) => !msg.read && msg.receiverId === currentUserId
            ).length;

            const stats: DashboardStats = {
                applicationsCount: applicationsArray.length,
                messagesCount: messagesArray.length,
                unreadMessagesCount,
                opportunitiesCount: opportunities?.length || 0,
                applicationsByStatus,
            };

            // Get recent opportunities (last 3)
            const recentOpportunities = opportunities?.slice(0, 3) || [];

            return {
                stats,
                recentOpportunities,
                hasCompletedOnboarding: (currentUser as any)?.onboardingCompleted || (currentUser as any)?.isOnboardingComplete || false,
            };
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch dashboard data",
                error,
            );
        }
    }

    /**
     * Get application status breakdown for charts
     */
    static async getApplicationStatusBreakdown(
        auth: AuthProvider,
    ): Promise<DashboardStats["applicationsByStatus"]> {
        try {
            const applications = await queryConvex(
                api.applications.getUserApplications,
                {},
                auth,
            );

            const applicationsArray = Array.isArray(applications) ? applications : [];

            return {
                pending: applicationsArray.filter((app: any) => app.status === "pending").length,
                reviewing: applicationsArray.filter((app: any) => app.status === "reviewing").length,
                interview: applicationsArray.filter((app: any) => app.status === "interview").length,
                accepted: applicationsArray.filter((app: any) => app.status === "accepted").length,
                rejected: applicationsArray.filter((app: any) => app.status === "rejected").length,
            };
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch application breakdown",
                error,
            );
        }
    }

    /**
     * Get recent opportunities
     */
    static async getRecentOpportunities(
        limit: number = 5,
        auth?: AuthProvider,
    ): Promise<Opportunity[]> {
        try {
            const opportunities = await queryConvex<Opportunity[]>(
                api.opportunities.getAllOpportunities,
                {},
                auth,
            );

            return opportunities?.slice(0, limit) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch recent opportunities",
                error,
            );
        }
    }
}
