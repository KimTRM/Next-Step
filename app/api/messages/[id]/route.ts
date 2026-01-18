import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MessageDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * PATCH /api/messages/[id] - Mark message as read
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in",
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

        const { id: messageId } = await params;
        if (!messageId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "messageId is required",
                    },
                },
                { status: 400 },
            );
        }

        await MessageDAL.markAsRead(messageId as Id<"messages">, token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Mark message as read error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to mark message as read",
                },
            },
            { status: 500 },
        );
    }
}
