/**
 * Opportunity Detail API
 * GET /api/opportunities/[id] - Get a single opportunity by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { OpportunityDAL } from "@/lib/dal/server";
import { Id } from "@/convex/_generated/dataModel";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const opportunityId = resolvedParams.id as Id<"opportunities">;

        // Get opportunity
        const opportunity = await OpportunityDAL.getOpportunityById(
            opportunityId,
        );

        if (!opportunity) {
            return NextResponse.json(
                { error: "Opportunity not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: opportunity,
        });
    } catch (error: unknown) {
        console.error("Opportunity fetch error:", error);

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
            { error: "Failed to fetch opportunity" },
            { status: 500 },
        );
    }
}
