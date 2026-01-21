import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { JobApplicationDAL } from "@/lib/dal/server";

export async function GET() {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to view applications",
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

        const applications = await JobApplicationDAL.getUserApplications(token);

        return NextResponse.json({ success: true, data: applications });
    } catch (error) {
        console.error("Applications fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to load applications",
                },
            },
            { status: 500 },
        );
    }
}
