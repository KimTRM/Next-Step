/**
 * Onboarding API
 * POST /api/profile/onboarding - Complete user onboarding
 */

import { NextResponse } from "next/server";
import { AuthDAL } from "@/lib/dal/server/auth-service";
import { UserDAL } from "@/lib/dal/server/user-service";

export async function POST() {
    try {
        // Require authentication
        const userId = await AuthDAL.requireAuth();

        // Complete onboarding
        const updatedUser = await UserDAL.completeOnboarding(userId);

        return NextResponse.json({
            success: true,
            data: updatedUser,
            message: "Onboarding completed successfully",
        });
    } catch (error: unknown) {
        console.error("Onboarding completion error:", error);

        // Handle authentication errors
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "UNAUTHORIZED"
        ) {
            return NextResponse.json(
                {
                    error:
                        (
                            "message" in error &&
                            typeof error.message === "string"
                        ) ?
                            error.message
                        :   "Unauthorized",
                },
                { status: 401 },
            );
        }

        // Handle validation errors
        if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string" &&
            error.message.includes("Profile completion")
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Handle other errors
        return NextResponse.json(
            { error: "Failed to complete onboarding" },
            { status: 500 },
        );
    }
}
