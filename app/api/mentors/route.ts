/**
 * GET /api/mentors
 * List mentors with optional filtering/search
 */

import { NextRequest, NextResponse } from "next/server";
import { MentorDAL } from "@/lib/dal/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || undefined;
        const expertise = searchParams.get("expertise") || undefined;
        const limitParam = searchParams.get("limit");
        const pageParam = searchParams.get("page");
        const limit =
            Number.isFinite(Number(limitParam)) && Number(limitParam) > 0 ?
                Number(limitParam)
            :   12;
        const page =
            Number.isFinite(Number(pageParam)) && Number(pageParam) > 0 ?
                Number(pageParam)
            :   1;
        const offset = (page - 1) * limit;

        let mentors;
        let total = 0;
        if (query) {
            const results = await MentorDAL.searchMentors({
                query,
                limit: undefined,
            });
            total = results.length;
            mentors = results.slice(offset, offset + limit);
        } else if (expertise) {
            const list = expertise
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);
            const results = await MentorDAL.getMentorsByExpertise({
                expertise: list,
                limit: undefined,
            });
            total = results.length;
            mentors = results.slice(offset, offset + limit);
        } else {
            const results = await MentorDAL.getAllMentors();
            total = results.length;
            mentors = results.slice(offset, offset + limit);
        }

        return NextResponse.json({
            success: true,
            data: mentors,
            meta: { page, limit, total },
        });
    } catch (error) {
        console.error("Get mentors error:", error);
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
