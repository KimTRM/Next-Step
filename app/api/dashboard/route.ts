/**
 * Dashboard API
 * GET /api/dashboard - Get aggregated dashboard data for current user
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DashboardDAL } from "@/lib/dal/server/dashboard-service";

export async function GET() {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get Convex auth token
        const token = await auth().then((auth) =>
            auth.getToken({ template: "convex" }),
        );

        if (!token) {
            return NextResponse.json(
                { error: "Failed to get authentication token" },
                { status: 401 },
            );
        }

        // Get dashboard data
        const dashboardData = await DashboardDAL.getUserDashboardData(token);

        return NextResponse.json({
            success: true,
            data: dashboardData,
        });
    } catch (error: unknown) {
        console.error("Dashboard data fetch error:", error);

        if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
        ) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 },
        );
    }
}
