/**
 * EmptyMessageState Component
 *
 * Placeholder shown when no conversation is selected
 */

"use client";

import { MessageSquare } from "lucide-react";

export function EmptyMessageState() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-12 w-12 text-[#198754]" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a conversation
            </h3>
            <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the list to start messaging, or connect with
                a mentor or employer to begin a new conversation.
            </p>
        </div>
    );
}
