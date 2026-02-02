"use client";

/**
 * ConnectionRequestModal Component
 *
 * Modal for sending a connection request with an optional message
 * Used from both Mentors page and Messages page
 */

import { useState } from "react";
import { UserPlus, Loader2, Send, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { useSendConnectionRequest, useConnectionStatus } from "../api";
import type { Id } from "@/convex/_generated/dataModel";

interface ConnectionRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetUser: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role?: string;
    } | null;
    onSuccess?: () => void;
}

export function ConnectionRequestModal({
    open,
    onOpenChange,
    targetUser,
    onSuccess,
}: ConnectionRequestModalProps) {
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sendRequest = useSendConnectionRequest();
    const connectionStatus = useConnectionStatus(targetUser?._id);

    const handleSubmit = async () => {
        if (!targetUser) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await sendRequest({
                receiverId: targetUser._id,
                message: message.trim() || undefined,
            });

            if (result.autoAccepted) {
                // They had already sent us a request, it was auto-accepted
                onOpenChange(false);
                setMessage("");
                onSuccess?.();
            } else {
                onOpenChange(false);
                setMessage("");
                onSuccess?.();
            }
        } catch (err: any) {
            setError(err.message || "Failed to send connection request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setMessage("");
        setError(null);
    };

    if (!targetUser) return null;

    const userName = targetUser.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    // Check if already connected or has pending request
    const isConnected = connectionStatus?.status === "accepted";
    const hasPendingRequest = connectionStatus?.status === "pending";

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Send Connection Request
                    </DialogTitle>
                </DialogHeader>

                {/* Target User Info */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage src={targetUser.avatarUrl} alt={userName} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {userInitial}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{userName}</p>
                        {targetUser.role && (
                            <p className="text-sm text-muted-foreground capitalize">
                                {targetUser.role.replace("_", " ")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                {isConnected && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                            You are already connected with {userName}!
                        </p>
                    </div>
                )}

                {hasPendingRequest && connectionStatus?.direction === "outbound" && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700">
                            You already have a pending request to {userName}.
                        </p>
                    </div>
                )}

                {hasPendingRequest && connectionStatus?.direction === "inbound" && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700">
                            {userName} has already sent you a connection request. Sending will automatically accept their request.
                        </p>
                    </div>
                )}

                {/* Message Input */}
                {!isConnected && !(hasPendingRequest && connectionStatus?.direction === "outbound") && (
                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">
                            Add a message (optional)
                        </Label>
                        <Textarea
                            id="message"
                            placeholder="Introduce yourself or explain why you'd like to connect..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="resize-none"
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {message.length}/500
                        </p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    
                    {!isConnected && !(hasPendingRequest && connectionStatus?.direction === "outbound") && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-[#198754] hover:bg-[#198754]/90"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            {hasPendingRequest && connectionStatus?.direction === "inbound"
                                ? "Accept & Connect"
                                : "Send Request"
                            }
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
