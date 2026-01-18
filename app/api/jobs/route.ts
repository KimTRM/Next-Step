/**
 * GET /api/jobs
 * List and search jobs with optional filters
 */

import { NextRequest, NextResponse } from "next/server";
import { JobDAL } from "@/lib/dal/server";
import type { SearchJobsInput } from "@/lib/dal/types/job.types";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const searchTerm = searchParams.get("query") || undefined;
        const skills = searchParams
            .get("skills")
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const location = searchParams.get("location") || undefined;
        const employmentTypeValue = searchParams.get("employmentType");
        const employmentType =
            employmentTypeValue ?
                (employmentTypeValue as SearchJobsInput["employmentType"])
            :   undefined;
        const experienceLevelValue = searchParams.get("experienceLevel");
        const experienceLevel =
            experienceLevelValue ?
                (experienceLevelValue as SearchJobsInput["experienceLevel"])
            :   undefined;
        const locationTypeValue = searchParams.get("locationType");
        const locationType =
            locationTypeValue ?
                (locationTypeValue as SearchJobsInput["locationType"])
            :   undefined;
        const industry = searchParams.get("industry") || undefined;
        const jobCategory = searchParams.get("jobCategory") || undefined;
        const minSalary =
            searchParams.get("minSalary") ?
                Number(searchParams.get("minSalary"))
            :   undefined;
        const maxSalary =
            searchParams.get("maxSalary") ?
                Number(searchParams.get("maxSalary"))
            :   undefined;

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

        const input: SearchJobsInput = {
            searchTerm,
            skills,
            location,
            employmentType,
            experienceLevel,
            locationType,
            industry,
            jobCategory,
            minSalary,
            maxSalary,
            limit: undefined, // Get all, slice after
        };

        const results = await JobDAL.searchJobs(input);
        const total = results.length;
        const jobs = results.slice(offset, offset + limit);

        return NextResponse.json({
            success: true,
            data: jobs,
            meta: { page, limit, total },
        });
    } catch (error) {
        console.error("Get jobs error:", error);
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
