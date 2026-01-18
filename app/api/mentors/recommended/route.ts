/**
 * GET /api/mentors/recommended
 * Get recommended mentors for current user
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthDAL, UserDAL, MentorDAL } from "@/lib/dal/server";

export async function GET(req: NextRequest) {
    try {
        const clerkId = await AuthDAL.requireAuth();
        const user = await UserDAL.getUserByClerkId(clerkId);
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

        const { searchParams } = new URL(req.url);
        const limit =
            searchParams.get("limit") ?
                Number(searchParams.get("limit"))
            :   undefined;

        const mentors = await MentorDAL.getRecommendedMentors({
            userId: user._id,
            limit,
        });

        return NextResponse.json({ success: true, data: mentors });
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err?.code === "AUTH_REQUIRED") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "AUTH_REQUIRED",
                        message: err.message || "Authentication required",
                    },
                },
                { status: 401 },
            );
        }

        console.error("Get recommended mentors error:", error);
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
