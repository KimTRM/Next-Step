/**
 * Apply to Opportunity API
 * POST /api/opportunities/apply - Submit application to an opportunity
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OpportunityDAL, UserDAL } from "@/lib/dal/server";
import { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Get request body
        const { opportunityId, coverLetter } = await req.json();

        if (!opportunityId) {
            return NextResponse.json(
                { error: "Opportunity ID is required" },
                { status: 400 },
            );
        }

        // Get user by Clerk ID
        const user = await UserDAL.getUserByClerkId(userId);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        // Get Convex auth token
        const token = await auth().then((auth) =>
            auth.getToken({ template: "convex" }),
        );

        if (!token) {
            return NextResponse.json(
                { error: "Failed to get authentication token" },
                { status: 401 },
            );
        }

        // Apply to opportunity
        const applicationId = await OpportunityDAL.applyToOpportunity(
            opportunityId as Id<"opportunities">,
            user._id,
            coverLetter || "",
            token,
        );

        return NextResponse.json({
            success: true,
            data: { applicationId },
            message: "Application submitted successfully",
        });
    } catch (error: unknown) {
        console.error("Application submission error:", error);

        if (
            error &&
            typeof error === "object" &&
            "message" in error &&
            typeof error.message === "string"
        ) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json(
            { error: "Failed to submit application" },
            { status: 500 },
        );
    }
}
