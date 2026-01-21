import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { JobApplicationDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

export async function PATCH(req: NextRequest) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to update applications",
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
        const { applicationId, status } = body;

        if (!applicationId || typeof applicationId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "applicationId is required",
                    },
                },
                { status: 400 },
            );
        }

        if (
            !status ||
            ![
                "pending",
                "reviewing",
                "interview",
                "rejected",
                "accepted",
            ].includes(status)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message:
                            "status must be one of: pending, reviewing, interview, rejected, accepted",
                    },
                },
                { status: 400 },
            );
        }

        await JobApplicationDAL.updateStatus(
            applicationId as Id<"jobApplications">,
            status,
            token,
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update application status error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to update application status",
                },
            },
            { status: 500 },
        );
    }
}
