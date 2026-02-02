/**
 * UserSearchModal Component
 *
 * Modal for searching users in the database to start a new conversation
 * - Searches users by name
 * - Displays user avatar and name
 * - Provides "Message" and "Connect" buttons
 */

"use client";

import { useState } from "react";
import { Search, Loader2, UserRoundSearch, SearchX } from "lucide-react";

// eslint-disable-next-line no-restricted-imports
import { Id } from "@/convex/_generated/dataModel";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

// eslint-disable-next-line boundaries/element-types
import { ConnectionRequestModal } from "@/features/connections/components";

import { useUserSearch } from "@/features/messages/api";

interface UserSearchModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStartConversation: (userId: string) => void;
}

export function UserSearchModal({
    open,
    onOpenChange,
    onStartConversation,
}: UserSearchModalProps) {
    const [connectTarget, setConnectTarget] = useState<{
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role?: string;
    } | null>(null);

    // Use custom hook for user search
    const {
        searchQuery,
        setSearchQuery,
        filteredUsers,
        isLoading,
        hasSearchQuery,
        showResults,
        showNoResults,
    } = useUserSearch();

    const handleMessageClick = (userId: Id<"users">) => {
        onStartConversation(userId);
        onOpenChange(false);
        setSearchQuery("");
    };

    const handleConnectClick = (user: {
        _id: Id<"users">;
        name: string;
        avatarUrl?: string;
        role?: string;
    }) => {
        setConnectTarget({
            _id: user._id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            role: user.role,
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-[95vw] max-w-md sm:max-w-lg p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Start a New Conversation</DialogTitle>
                    </DialogHeader>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search users by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm sm:text-base"
                            autoFocus
                        />
                    </div>

                    {/* Search Results */}
                    <ScrollArea className="max-h-[50vh] sm:max-h-75">
                        {/* Loading State */}
                        {isLoading && hasSearchQuery && (
                            <div className="flex items-center justify-center py-6 sm:py-8">
                                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {/* No Search Query */}
                        {!hasSearchQuery && (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-2">
                                <UserRoundSearch className="h-12 w-12 text-muted-foreground mb-3" />
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Type a name to search for users
                                </p>
                            </div>
                        )}

                        {/* No Results */}
                        {showNoResults && (
                            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center px-2">
                                <SearchX className="h-12 w-12 text-muted-foreground mb-3" />
                                <h3 className="font-semibold text-foreground mb-1 text-sm sm:text-base">No users found</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Try searching with a different name
                                </p>
                            </div>
                        )}

                        {/* Results List */}
                        {showResults && (
                            <div className="divide-y">
                                {filteredUsers.map((user) => {
                                    const userName = user.name || "Unknown User";
                                    const userInitial = userName.charAt(0).toUpperCase();

                                    return (
                                        <div
                                            key={user._id}
                                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 p-3 hover:bg-muted/50 rounded-md transition-colors"
                                        >
                                            {/* Left: Avatar and Name */}
                                            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                                                    <AvatarImage src={user.avatarUrl} alt={userName} />
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
                                                        {userInitial}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground truncate text-sm sm:text-base">
                                                        {userName}
                                                    </p>
                                                    {user.role && (
                                                        <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                                                            {user.role.replace("_", " ")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Action Buttons */}
                                            <div className="flex items-center gap-2 shrink-0 pl-11 sm:pl-0">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleMessageClick(user._id)}
                                                    className="border-[#198754] text-[#198754] hover:bg-[#198754]/10 hover:text-[#198754] text-xs sm:text-sm h-8 px-2 sm:px-3"
                                                >
                                                    Message
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleConnectClick({
                                                        _id: user._id,
                                                        name: userName,
                                                        avatarUrl: user.avatarUrl,
                                                        role: user.role,
                                                    })}
                                                    className="bg-[#198754] text-white hover:bg-[#198754]/90 text-xs sm:text-sm h-8 px-2 sm:px-3"
                                                >
                                                    Connect
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Connection Request Modal */}
            <ConnectionRequestModal
                open={!!connectTarget}
                onOpenChange={(open) => !open && setConnectTarget(null)}
                targetUser={connectTarget}
                onSuccess={() => {
                    setConnectTarget(null);
                }}
            />
        </>
    );
}
