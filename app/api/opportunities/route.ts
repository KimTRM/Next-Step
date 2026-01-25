/**
 * Opportunities API
 * GET /api/opportunities - Get all opportunities with optional filtering
 */

import { NextRequest, NextResponse } from "next/server";
import { OpportunityDAL } from "@/lib/dal/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Extract filter parameters
        const filters = {
            type: searchParams.get("type") || undefined,
            location: searchParams.get("location") || undefined,
            isRemote: searchParams.get("isRemote") === "true" ? true : searchParams.get("isRemote") === "false" ? false : undefined,
            search: searchParams.get("search") || undefined,
        };

        // Get opportunities (no auth required for public listing)
        const opportunities = await OpportunityDAL.getAllOpportunities(filters);

        return NextResponse.json({
            success: true,
            data: opportunities,
        });
    } catch (error: unknown) {
        console.error("Opportunities fetch error:", error);

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
            { error: "Failed to fetch opportunities" },
            { status: 500 },
        );
    }
}
