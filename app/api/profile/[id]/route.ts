/**
 * Public User Profile API
 * GET /api/profile/[id] - Get public profile by user ID
 */

import { NextResponse } from "next/server";
import { UserDAL } from "@/lib/dal/server/user-service";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        // Get public profile
        const profile = await UserDAL.getPublicProfile(id as Id<"users">);

        if (!profile) {
            return NextResponse.json(
                { error: "Profile not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: profile,
        });
    } catch (error: unknown) {
        console.error("Public profile fetch error:", error);

        // Handle other errors
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 },
        );
    }
}
