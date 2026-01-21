/**
 * POST /api/mentors/book
 * Book a mentorship session
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthDAL, MentorDAL } from "@/lib/dal/server";
import type { BookSessionInput } from "@/lib/dal/types/mentor.types";

export async function POST(req: NextRequest) {
    try {
        // Ensure authenticated
        await AuthDAL.requireAuth();

        const body = (await req.json()) as Partial<BookSessionInput>;
        const { mentorId, topic, scheduledDate, duration, message } = body;

        if (!mentorId || !topic || !scheduledDate || !duration) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message:
                            "mentorId, topic, scheduledDate, and duration are required",
                    },
                },
                { status: 400 },
            );
        }

        await MentorDAL.bookSession({
            mentorId,
            topic,
            scheduledDate,
            duration,
            message,
        } as BookSessionInput);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        if (
            error instanceof Error &&
            "code" in error &&
            (error as any).code === "AUTH_REQUIRED"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "AUTH_REQUIRED",
                        message: "Authentication required",
                    },
                },
                { status: 401 },
            );
        }

        console.error("Book session error:", error);
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
