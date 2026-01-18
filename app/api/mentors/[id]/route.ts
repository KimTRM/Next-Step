/**
 * GET /api/mentors/[id]
 * Get mentor by id
 */

import { NextRequest, NextResponse } from "next/server";
import { MentorDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const resolved = await params;
        const id = resolved.id as Id<"mentors">;
        const mentor = await MentorDAL.getMentorById(id);
        if (!mentor) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "NOT_FOUND", message: "Mentor not found" },
                },
                { status: 404 },
            );
        }
        return NextResponse.json({ success: true, data: mentor });
    } catch (error) {
        console.error("Get mentor error:", error);
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
