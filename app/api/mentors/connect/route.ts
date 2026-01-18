/**
 * POST /api/mentors/connect
 * Send a connection request to a mentor
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthDAL, MentorDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

export async function POST(req: NextRequest) {
    try {
        // Require authentication
        await AuthDAL.requireAuth();

        const body = (await req.json()) as {
            mentorId?: Id<"mentors">;
            message?: string;
        };

        const mentorId = body.mentorId as Id<"mentors"> | undefined;
        const message = body.message?.trim();

        if (!mentorId || !message) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "mentorId and message are required",
                    },
                },
                { status: 400 },
            );
        }

        await MentorDAL.sendConnectionRequest({ mentorId, message });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        if (err?.code === "AUTH_REQUIRED") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "AUTH_REQUIRED",
                        message: err.message || "Authentication required",
                    },
                },
                { status: 401 },
            );
        }

        console.error("Send connection request error:", error);
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
