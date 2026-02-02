"use client";

/**
 * ConnectionsModal Component
 *
 * Modal for viewing connections list and managing connection requests
 * - Tabs: Connections, Inbound Requests, Outbound Requests
 * - Actions: Accept/Reject inbound, Cancel outbound, Remove connection
 */

import { useState } from "react";
import { Users, UserPlus, Send, Loader2, X, Check, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Badge } from "@/shared/components/ui/badge";

// eslint-disable-next-line no-restricted-imports
import { Id } from "@/convex/_generated/dataModel";
import {
    useConnections,
    useInboundRequests,
    useOutboundRequests,
    useAcceptConnectionRequest,
    useRejectConnectionRequest,
    useCancelConnectionRequest,
    useRemoveConnection,
} from "../api";
import type { ConnectionWithUser, InboundRequest, OutboundRequest } from "../types";

interface ConnectionsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConnectionsModal({ open, onOpenChange }: ConnectionsModalProps) {
    const [activeTab, setActiveTab] = useState("connections");

    // Fetch data
    const connections = useConnections();
    const inboundRequests = useInboundRequests();
    const outboundRequests = useOutboundRequests();

    // Mutations
    const acceptRequest = useAcceptConnectionRequest();
    const rejectRequest = useRejectConnectionRequest();
    const cancelRequest = useCancelConnectionRequest();
    const removeConnection = useRemoveConnection();

    // Loading states
    const [processingId, setProcessingId] = useState<Id<"connections"> | null>(null);

    const handleAccept = async (connectionId: Id<"connections">) => {
        setProcessingId(connectionId);
        try {
            await acceptRequest({ connectionId });
        } catch (error) {
            console.error("Failed to accept request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (connectionId: Id<"connections">) => {
        setProcessingId(connectionId);
        try {
            await rejectRequest({ connectionId });
        } catch (error) {
            console.error("Failed to reject request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (connectionId: Id<"connections">) => {
        setProcessingId(connectionId);
        try {
            await cancelRequest({ connectionId });
        } catch (error) {
            console.error("Failed to cancel request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemove = async (connectionId: Id<"connections">) => {
        setProcessingId(connectionId);
        try {
            await removeConnection({ connectionId });
        } catch (error) {
            console.error("Failed to remove connection:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const inboundCount = inboundRequests?.length || 0;
    const outboundCount = outboundRequests?.length || 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6 max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        My Connections
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="connections" className="text-xs sm:text-sm">
                            <Users className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Connections</span>
                            <span className="sm:hidden">All</span>
                        </TabsTrigger>
                        <TabsTrigger value="inbound" className="text-xs sm:text-sm relative">
                            <UserPlus className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Requests</span>
                            <span className="sm:hidden">In</span>
                            {inboundCount > 0 && (
                                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                    {inboundCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="outbound" className="text-xs sm:text-sm">
                            <Send className="h-4 w-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Sent</span>
                            <span className="sm:hidden">Out</span>
                            {outboundCount > 0 && (
                                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1 text-xs">
                                    {outboundCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Connections Tab */}
                    <TabsContent value="connections">
                        <ScrollArea className="h-[50vh] sm:h-100">
                            {connections === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : connections.length === 0 ? (
                                <EmptyState
                                    icon={<Users className="h-10 w-10 text-muted-foreground" />}
                                    title="No connections yet"
                                    description="Connect with mentors and other users to build your network"
                                />
                            ) : (
                                <div className="space-y-2">
                                    {connections.map((conn: ConnectionWithUser) => (
                                        <ConnectionCard
                                            key={conn._id}
                                            user={conn.connectedUser}
                                            onRemove={() => handleRemove(conn._id)}
                                            isProcessing={processingId === conn._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Inbound Requests Tab */}
                    <TabsContent value="inbound">
                        <ScrollArea className="h-[50vh] sm:h-100">
                            {inboundRequests === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : inboundRequests.length === 0 ? (
                                <EmptyState
                                    icon={<UserPlus className="h-10 w-10 text-muted-foreground" />}
                                    title="No pending requests"
                                    description="You don't have any incoming connection requests"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {inboundRequests.map((req: InboundRequest) => (
                                        <InboundRequestCard
                                            key={req._id}
                                            request={req}
                                            onAccept={() => handleAccept(req._id)}
                                            onReject={() => handleReject(req._id)}
                                            isProcessing={processingId === req._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    {/* Outbound Requests Tab */}
                    <TabsContent value="outbound">
                        <ScrollArea className="h-[50vh] sm:h-100">
                            {outboundRequests === undefined ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : outboundRequests.length === 0 ? (
                                <EmptyState
                                    icon={<Send className="h-10 w-10 text-muted-foreground" />}
                                    title="No pending requests"
                                    description="You haven't sent any connection requests"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {outboundRequests.map((req: OutboundRequest) => (
                                        <OutboundRequestCard
                                            key={req._id}
                                            request={req}
                                            onCancel={() => handleCancel(req._id)}
                                            isProcessing={processingId === req._id}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// Helper Components

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}

function ConnectionCard({
    user,
    onRemove,
    isProcessing,
}: {
    user: { name?: string; avatarUrl?: string; role?: string } | null;
    onRemove: () => void;
    isProcessing: boolean;
}) {
    if (!user) return null;

    const userName = user.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{userName}</p>
                    {user.role && (
                        <p className="text-xs text-muted-foreground capitalize">
                            {user.role.replace("_", " ")}
                        </p>
                    )}
                </div>
            </div>
            <Button
                size="sm"
                variant="ghost"
                onClick={onRemove}
                disabled={isProcessing}
                className="text-muted-foreground hover:text-destructive shrink-0"
            >
                {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <X className="h-4 w-4" />
                )}
            </Button>
        </div>
    );
}

function InboundRequestCard({
    request,
    onAccept,
    onReject,
    isProcessing,
}: {
    request: InboundRequest;
    onAccept: () => void;
    onReject: () => void;
    isProcessing: boolean;
}) {
    const user = request.requesterUser;
    if (!user) return null;

    const userName = user.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{userName}</p>
                    {user.role && (
                        <p className="text-xs text-muted-foreground capitalize">
                            {user.role.replace("_", " ")}
                        </p>
                    )}
                    {request.message && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="flex items-start gap-1.5">
                                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    &quot;{request.message}&quot;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2 mt-3 pl-13">
                <Button
                    size="sm"
                    onClick={onAccept}
                    disabled={isProcessing}
                    className="flex-1 bg-[#198754] hover:bg-[#198754]/90"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                        </>
                    )}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onReject}
                    disabled={isProcessing}
                    className="flex-1"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <X className="h-4 w-4 mr-1" />
                            Decline
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

function OutboundRequestCard({
    request,
    onCancel,
    isProcessing,
}: {
    request: OutboundRequest;
    onCancel: () => void;
    isProcessing: boolean;
}) {
    const user = request.receiverUser;
    if (!user) return null;

    const userName = user.name || "Unknown User";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="p-3 rounded-lg border bg-card">
            <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatarUrl} alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{userName}</p>
                            {user.role && (
                                <p className="text-xs text-muted-foreground capitalize">
                                    {user.role.replace("_", " ")}
                                </p>
                            )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                            Pending
                        </Badge>
                    </div>
                    {request.message && (
                        <div className="mt-2 p-2 bg-muted rounded-md">
                            <div className="flex items-start gap-1.5">
                                <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                                <p className="text-xs text-muted-foreground italic line-clamp-2">
                                    &quot;{request.message}&quot;
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-3 pl-13">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-full text-muted-foreground hover:text-destructive hover:border-destructive"
                >
                    {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel Request
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
