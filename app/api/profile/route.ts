/**
 * Current User Profile API
 * GET /api/profile - Get current user's profile
 * PUT /api/profile - Update current user's profile
 */

import { NextResponse } from "next/server";
import { AuthDAL } from "@/lib/dal/server/auth-service";
import { UserDAL } from "@/lib/dal/server/user-service";
import type { UpdateProfileInput } from "@/lib/dal/types/user.types";

export async function GET() {
    try {
        // Require authentication
        const userId = await AuthDAL.requireAuth();

        // Get user profile
        const user = await UserDAL.getUserByClerkId(userId);

        if (!user) {
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error: unknown) {
        console.error("Profile fetch error:", error);

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

        // Handle other errors
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 },
        );
    }
}

export async function PUT(request: Request) {
    try {
        // Require authentication
        const userId = await AuthDAL.requireAuth();

        // Parse request body
        const updates: UpdateProfileInput = await request.json();

        // Validate basic input
        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: "No updates provided" },
                { status: 400 },
            );
        }

        // Update profile
        const updatedUser = await UserDAL.updateProfile(userId, updates);

        return NextResponse.json({
            success: true,
            data: updatedUser,
        });
    } catch (error: unknown) {
        console.error("Profile update error:", error);

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
            error.message.includes("Invalid")
        ) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Handle other errors
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 },
        );
    }
}
