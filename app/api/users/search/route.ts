/**
 * User Search API
 * GET /api/users/search - Search users by skills
 */

import { NextResponse } from "next/server";
import { UserDAL } from "@/lib/dal/server/user-service";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Get query parameters
        const skillsParam = searchParams.get("skills");
        const role = searchParams.get("role");
        const limitParam = searchParams.get("limit");

        // Validate skills parameter
        if (!skillsParam) {
            return NextResponse.json(
                { error: "Skills parameter is required" },
                { status: 400 },
            );
        }

        // Parse skills (comma-separated)
        const skills = skillsParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (skills.length === 0) {
            return NextResponse.json(
                { error: "At least one skill is required" },
                { status: 400 },
            );
        }

        // Parse limit
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Search users
        const users = await UserDAL.searchBySkills({
            skills,
            role: role || undefined,
            limit,
        });

        return NextResponse.json({
            success: true,
            data: users,
            count: users.length,
        });
    } catch (error: unknown) {
        console.error("User search error:", error);

        return NextResponse.json(
            { error: "Failed to search users" },
            { status: 500 },
        );
    }
}
