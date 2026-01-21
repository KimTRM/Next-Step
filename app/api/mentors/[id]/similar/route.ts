/**
 * GET /api/mentors/[id]/similar
 * Get similar mentors based on a mentor
 */

import { NextRequest, NextResponse } from "next/server";
import { MentorDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { searchParams } = new URL(req.url);
        const limit =
            searchParams.get("limit") ?
                Number(searchParams.get("limit"))
            :   undefined;
        const resolved = await params; // This line remains unchanged
        const mentorId = resolved.id as Id<"mentors">;
        const mentors = await MentorDAL.getSimilarMentors({ mentorId, limit });
        return NextResponse.json({ success: true, data: mentors });
    } catch (error) {
        console.error("Get similar mentors error:", error);
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
