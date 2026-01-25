/**
 * Mentor Connection Requests API
 * GET /api/mentors/dashboard/requests - Get connection requests for current mentor
 * POST /api/mentors/dashboard/requests - Accept or reject a connection request
 */

import { NextRequest, NextResponse } from "next/server";
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

        // Get connection requests
        const requests = await queryConvex(
            api.mentors.getConnectionRequests,
            {},
            token,
        );

        return NextResponse.json({
            success: true,
            data: requests,
        });
    } catch (error: unknown) {
        console.error("Connection requests fetch error:", error);

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
            { error: "Failed to fetch connection requests" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get request body
        const { requestId, action } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // For now, return success
        // TODO: Implement accept/reject logic in Convex backend
        return NextResponse.json({
            success: true,
            message: `Request ${action}ed successfully`,
        });
    } catch (error: unknown) {
        console.error("Connection request action error:", error);

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
            { error: "Failed to process connection request" },
            { status: 500 },
        );
    }
}
