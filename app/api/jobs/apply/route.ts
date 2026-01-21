/**
 * POST /api/jobs/apply
 * Submit a job application
 */

import { NextRequest, NextResponse } from "next/server";
import { JobApplicationDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to apply",
                    },
                },
                { status: 401 },
            );
        }

        const token = await getToken({ template: "convex" });
        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message:
                            "Authentication token missing. Ensure Clerk Convex template is configured.",
                    },
                },
                { status: 401 },
            );
        }

        const body = await req.json();
        const { jobId, notes } = body;

        if (!jobId || typeof jobId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "jobId is required",
                    },
                },
                { status: 400 },
            );
        }

        const applicationId = await JobApplicationDAL.createApplication(
            {
                jobId: jobId as Id<"jobs">,
                notes: notes || undefined,
            },
            token,
        );

        return NextResponse.json({
            success: true,
            data: { applicationId },
        });
    } catch (error) {
        console.error("Submit application error:", error);

        // Handle specific errors
        if (error instanceof Error) {
            if (error.message.includes("already applied")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: "ALREADY_APPLIED",
                            message: "You have already applied to this job",
                        },
                    },
                    { status: 409 },
                );
            }

            if (error.message.includes("not authenticated")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: "UNAUTHORIZED",
                            message: "You must be logged in to apply",
                        },
                    },
                    { status: 401 },
                );
            }
        }

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
