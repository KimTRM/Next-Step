import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MessageDAL } from "@/lib/dal/server";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * GET /api/messages/conversation/[userId] - Get conversation with specific user
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> },
) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to view conversations",
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

        const { userId: otherUserId } = await params;
        if (!otherUserId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "userId parameter is required",
                    },
                },
                { status: 400 },
            );
        }

        const conversation = await MessageDAL.getConversation(
            otherUserId as Id<"users">,
            token,
        );

        return NextResponse.json({ success: true, data: conversation });
    } catch (error) {
        console.error("Conversation fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to load conversation",
                },
            },
            { status: 500 },
        );
    }
}
