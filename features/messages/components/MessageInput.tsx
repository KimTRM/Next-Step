/**
 * MessageInput Component
 *
 * Message composition area with:
 * - Text input field
 * - Send button
 * - Enter key support
 * - Loading/disabled states
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
    onSendMessage: (content: string) => Promise<void>;
    disabled?: boolean;
    placeholder?: string;
}

export function MessageInput({
    onSendMessage,
    disabled = false,
    placeholder = "Type a message...",
}: MessageInputProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage || isSending || disabled) return;

        setIsSending(true);
        try {
            await onSendMessage(trimmedMessage);
            setMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isDisabled = disabled || isSending || !message.trim();

    return (
        <div className="p-4 border-t bg-background">
            <div className="flex items-end gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isSending}
                    className="min-h-11 max-h-30 resize-none"
                    rows={1}
                    aria-label="Message input"
                />
                <Button
                    onClick={handleSend}
                    disabled={isDisabled}
                    size="icon"
                    className="shrink-0 h-11 w-11"
                    aria-label="Send message"
                >
                    <Send className={`h-5 w-5 ${isSending ? "animate-pulse" : ""}`} />
                </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift + Enter for new line
            </p>
        </div>
    );
}
