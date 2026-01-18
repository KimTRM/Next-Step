/**
 * GET /api/jobs/[id]/related
 * Get related jobs based on current job
 */

import { NextRequest, NextResponse } from "next/server";
import { JobDAL } from "@/lib/dal/server";
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
        const resolved = await params;
        const jobId = resolved.id as Id<"jobs">;
        const jobs = await JobDAL.getRelatedJobs({ jobId, limit });
        return NextResponse.json({ success: true, data: jobs });
    } catch (error) {
        console.error("Get related jobs error:", error);
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
