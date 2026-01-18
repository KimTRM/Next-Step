/**
 * Message Data Access Layer
 * Server-side service for messaging operations
 */

import { api } from "./convex";
import { queryConvex, mutateConvex } from "./convex";
import { DALError } from "../types/common.types";
import type { Id } from "@/convex/_generated/dataModel";
import type { Message, SendMessageInput } from "../types/message.types";

export class MessageDAL {
    /**
     * Get all messages for current user
     */
    static async getUserMessages(
        auth?: string | (() => Promise<string | null>),
    ): Promise<Message[]> {
        try {
            const result = await queryConvex(
                api.messages.getUserMessages,
                {},
                auth,
            );
            return (result as Message[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch user messages",
                error,
            );
        }
    }

    /**
     * Get conversation between current user and another user
     */
    static async getConversation(
        otherUserId: Id<"users">,
        auth?: string | (() => Promise<string | null>),
    ): Promise<Message[]> {
        try {
            const result = await queryConvex(
                api.messages.getConversation,
                {
                    otherUserId,
                },
                auth,
            );
            return (result as Message[]) || [];
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to fetch conversation",
                error,
            );
        }
    }

    /**
     * Send a new message
     */
    static async sendMessage(
        input: SendMessageInput,
        auth?: string | (() => Promise<string | null>),
    ): Promise<Id<"messages">> {
        try {
            const result = await mutateConvex(
                api.messages.sendMessage,
                {
                    receiverId: input.receiverId,
                    content: input.content,
                },
                auth,
            );
            return result as Id<"messages">;
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to send message",
                error,
            );
        }
    }

    /**
     * Mark message as read
     */
    static async markAsRead(
        messageId: Id<"messages">,
        auth?: string | (() => Promise<string | null>),
    ): Promise<void> {
        try {
            await mutateConvex(
                api.messages.markMessageAsRead,
                {
                    messageId,
                },
                auth,
            );
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to mark message as read",
                error,
            );
        }
    }
}
