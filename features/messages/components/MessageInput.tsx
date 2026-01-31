/**
 * MessageInput Component
 *
 * Message composition area with:
 * - Text input field
 * - Send button
 * - Enter key support
 * - Loading/disabled states
 * - File and image attachments
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Send, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";

interface Attachment {
    file: File;
    preview?: string;
    type: "image" | "file";
}

interface MessageInputProps {
    onSendMessage: (content: string, attachments?: File[]) => Promise<void>;
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
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    // Cleanup preview URLs on unmount
    useEffect(() => {
        return () => {
            attachments.forEach((att) => {
                if (att.preview) {
                    URL.revokeObjectURL(att.preview);
                }
            });
        };
    }, [attachments]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const newAttachments: Attachment[] = files.map((file) => {
            const isImage = file.type.startsWith("image/");
            return {
                file,
                type: isImage ? "image" : "file",
                preview: isImage ? URL.createObjectURL(file) : undefined,
            };
        });

        setAttachments((prev) => [...prev, ...newAttachments]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => {
            const newAttachments = [...prev];
            const removed = newAttachments.splice(index, 1)[0];

            // Cleanup preview URL
            if (removed.preview) {
                URL.revokeObjectURL(removed.preview);
            }

            return newAttachments;
        });
    };

    const handleSend = async () => {
        const trimmedMessage = message.trim();
        if ((!trimmedMessage && attachments.length === 0) || isSending || disabled) return;

        setIsSending(true);
        try {
            const files = attachments.map((att) => att.file);
            await onSendMessage(trimmedMessage, files);
            setMessage("");

            // Cleanup and clear attachments
            attachments.forEach((att) => {
                if (att.preview) {
                    URL.revokeObjectURL(att.preview);
                }
            });
            setAttachments([]);
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

    const isDisabled = disabled || isSending || (!message.trim() && attachments.length === 0);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="p-4 border-t bg-background">
            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                        <div
                            key={index}
                            className="relative group rounded-lg border bg-muted p-2 flex items-center gap-2 max-w-xs"
                        >
                            {attachment.type === "image" && attachment.preview ? (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <img
                                        src={attachment.preview}
                                        alt={attachment.file.name}
                                        className="h-12 w-12 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {attachment.file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(attachment.file.size)}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {attachment.file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(attachment.file.size)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 shrink-0"
                                onClick={() => removeAttachment(index)}
                                aria-label="Remove attachment"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    onChange={handleFileSelect}
                    className="hidden"
                    aria-label="File input"
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-11 w-11"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending}
                    aria-label="Attach file"
                >
                    <Paperclip className="h-5 w-5" />
                </Button>

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