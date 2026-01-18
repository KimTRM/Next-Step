/**
 * GET /api/users
 * Returns list of users with optional filtering
 */

import { NextRequest, NextResponse } from "next/server";
import { UserDAL } from "@/lib/dal/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role") || undefined;
        const search = searchParams.get("search") || undefined;

        const users = await UserDAL.getAllUsers({ role, search });

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error("Get users error:", error);
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
