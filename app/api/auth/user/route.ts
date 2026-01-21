/**
 * GET /api/auth/user
 * Returns current user profile from Convex database
 */

import { NextResponse } from "next/server";
import { AuthDAL, UserDAL } from "@/lib/dal/server";

export async function GET() {
    try {
        const userId = await AuthDAL.requireAuth();
        const user = await UserDAL.getUserByClerkId(userId);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "USER_NOT_FOUND",
                        message: "User not found",
                    },
                },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: user });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "AUTH_REQUIRED"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: error.code, message: error.message },
                },
                { status: 401 },
            );
        }

        console.error("Get user error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Internal server error",
                },
            },
            { status: 500 },
        );
    }
}
