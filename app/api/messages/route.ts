import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { MessageDAL } from "@/lib/dal/server";
import { Id } from "@/convex/_generated/dataModel";

/**
 * GET /api/messages - Get all messages for current user
 */
export async function GET() {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to view messages",
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

        const messages = await MessageDAL.getUserMessages(token);

        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        console.error("Messages fetch error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to load messages",
                },
            },
            { status: 500 },
        );
    }
}

/**
 * POST /api/messages - Send a new message
 */
export async function POST(req: NextRequest) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: "You must be logged in to send messages",
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

        const body = await req.json();
        const { receiverId, content } = body;

        if (!receiverId || typeof receiverId !== "string") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "receiverId is required",
                    },
                },
                { status: 400 },
            );
        }

        if (!content || typeof content !== "string" || content.trim() === "") {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: "INVALID_INPUT",
                        message: "content is required",
                    },
                },
                { status: 400 },
            );
        }

        const messageId = await MessageDAL.sendMessage(
            {
                receiverId: receiverId as Id<"users">,
                content: content.trim(),
            },
            token,
        );

        return NextResponse.json({
            success: true,
            data: { messageId },
        });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to send message",
                },
            },
            { status: 500 },
        );
    }
}
