/**
 * GET /api/auth/session
 * Returns current user session information
 */

import { NextResponse } from "next/server";
import { AuthDAL } from "@/lib/dal/server";

export async function GET() {
    try {
        const session = await AuthDAL.getSession();

        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "NOT_AUTHENTICATED",
                        message: "No active session",
                    },
                },
                { status: 401 },
            );
        }

        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        console.error("Session error:", error);
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
