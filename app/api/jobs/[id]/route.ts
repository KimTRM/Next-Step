/**
 * GET /api/jobs/[id]
 * Get job by id with poster information
 */

import { NextRequest, NextResponse } from "next/server";
import { JobDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const resolved = await params;
        const id = resolved.id as Id<"jobs">;
        const job = await JobDAL.getJobById(id);
        if (!job) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "NOT_FOUND", message: "Job not found" },
                },
                { status: 404 },
            );
        }
        return NextResponse.json({ success: true, data: job });
    } catch (error) {
        console.error("Get job error:", error);
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
