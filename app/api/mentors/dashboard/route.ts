/**
 * Mentor Dashboard API
 * GET /api/mentors/dashboard - Get mentor profile and dashboard data
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { queryConvex, api } from "@/lib/dal/server";

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

        // Get mentor profile
        const mentorProfile = await queryConvex(
            api.mentors.getMentorProfile,
            {},
            token,
        );

        return NextResponse.json({
            success: true,
            data: mentorProfile,
        });
    } catch (error: unknown) {
        console.error("Mentor dashboard fetch error:", error);

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
            { error: "Failed to fetch mentor dashboard data" },
            { status: 500 },
        );
    }
}
