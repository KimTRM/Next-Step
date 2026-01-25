/**
 * Onboarding Check API
 * GET /api/onboarding/check - Check if user has completed onboarding
 */

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { UserDAL } from "@/lib/dal/server/user-service";

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

        // Get user data
        const user = await UserDAL.getUserByClerkId(userId);

        if (!user) {
            return NextResponse.json(
                {
                    completed: false,
                    step: 0,
                },
                { status: 200 },
            );
        }

        return NextResponse.json({
            completed: user.onboardingCompleted || false,
            step: user.onboardingStep || 0,
        });
    } catch (error: unknown) {
        console.error("Onboarding check error:", error);

        return NextResponse.json(
            { error: "Failed to check onboarding status" },
            { status: 500 },
        );
    }
}
