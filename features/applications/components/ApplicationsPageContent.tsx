'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Calendar as CalendarIcon, Clock, CheckCircle2, XCircle, AlertCircle, Eye, Plus } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { useUserApplications, useUpdateApplicationStatus } from '../api';
import type { JobApplication } from '../types';

type ApplicationStatus = "pending" | "reviewing" | "interview" | "accepted" | "rejected";

interface ApplicationWithDetails extends JobApplication {
    jobTitle?: string;
    company?: string;
    location?: string;
    interviewDate?: number;
    nextStep?: string;
}

export function ApplicationsPageContent() {
    const router = useRouter();
    const [selectedStatus, setSelectedStatus] = useState<'all' | ApplicationStatus>('all');
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
    const [updating, setUpdating] = useState(false);

    const applicationsData = useUserApplications();
    const updateStatus = useUpdateApplicationStatus();

    const applications = useMemo(() => {
        return (applicationsData as ApplicationWithDetails[] | undefined) || [];
    }, [applicationsData]);
    const loading = applicationsData === undefined;

    const filteredApplications = useMemo(() => {
        if (selectedStatus === 'all') return applications;
        return applications.filter((app) => app.status === selectedStatus);
    }, [applications, selectedStatus]);

    const getStatusColor = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'reviewing':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'interview':
                return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'rejected':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'accepted':
                return 'bg-green-100 text-green-700 border-green-300';
        }
    };

    const getStatusIcon = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'reviewing':
                return <Eye className="h-4 w-4" />;
            case 'interview':
                return <AlertCircle className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            case 'accepted':
                return <CheckCircle2 className="h-4 w-4" />;
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleViewDetails = (app: ApplicationWithDetails) => {
        if (app._id) {
            router.push(`/applications/${app._id}`);
        }
    };

    const handleUpdateStatus = (app: ApplicationWithDetails) => {
        setSelectedApp(app);
        setStatusDialogOpen(true);
    };

    const handleStatusChange = async (newStatus: ApplicationStatus) => {
        if (!selectedApp) return;

        setUpdating(true);
        try {
            await updateStatus({
                applicationId: selectedApp._id,
                status: newStatus as ApplicationStatus,
            });

            toast.success('Application status updated');
            setStatusDialogOpen(false);
            setSelectedApp(null);
        } catch (error) {
            console.error('Failed to update status:', error);
            const message = error instanceof Error ? error.message : 'Failed to update status';
            toast.error(message);
        } finally {
            setUpdating(false);
        }
    };

    const getStatusCounts = () => {
        return {
            total: applications.length,
            pending: applications.filter(a => a.status === 'pending').length,
            reviewing: applications.filter(a => a.status === 'reviewing').length,
            interview: applications.filter(a => a.status === 'interview').length,
            accepted: applications.filter(a => a.status === 'accepted').length,
            rejected: applications.filter(a => a.status === 'rejected').length,
        };
    };

    const counts = getStatusCounts();

    return (
        <div className="min-h-screen bg-linear-to-br from-white via-green-50/30 to-green-100/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="display-font text-5xl mb-4">Application Tracker</h1>
                    <p className="text-lg text-muted-foreground">
                        Keep track of all your job applications, interviews, and follow-ups in one organized dashboard.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-foreground mb-1">{counts.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-gray-700 mb-1">{counts.pending}</div>
                        <div className="text-sm text-muted-foreground">Pending</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-blue-700 mb-1">{counts.reviewing}</div>
                        <div className="text-sm text-muted-foreground">Reviewing</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-purple-700 mb-1">{counts.interview}</div>
                        <div className="text-sm text-muted-foreground">Interview</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-green-700 mb-1">{counts.accepted}</div>
                        <div className="text-sm text-muted-foreground">Accepted</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-border">
                        <div className="text-2xl text-red-700 mb-1">{counts.rejected}</div>
                        <div className="text-sm text-muted-foreground">Rejected</div>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedStatus('all')}
                        className={`px-4 py-2 rounded-lg transition-all ${selectedStatus === 'all'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white text-foreground border border-border hover:border-primary'
                            }`}
                    >
                        All Applications
                    </button>
                    {(['pending', 'reviewing', 'interview', 'accepted', 'rejected'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-lg transition-all capitalize ${selectedStatus === status
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white text-foreground border border-border hover:border-primary'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                <div className="mb-6 flex items-center justify-between">
                    <h2>Your Applications ({filteredApplications.length})</h2>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-border p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start gap-4">
                                            <Skeleton className="h-12 w-12 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-5 w-1/3" />
                                                <div className="flex flex-wrap gap-3">
                                                    <Skeleton className="h-4 w-24" />
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-28" />
                                                </div>
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-6 w-24 rounded-full" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                    <div className="flex lg:flex-col gap-2 w-full lg:w-auto">
                                        <Skeleton className="h-10 w-full lg:w-32" />
                                        <Skeleton className="h-10 w-full lg:w-28" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApplications.map(app => (
                            <div
                                key={app._id}
                                className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    {/* Application Info */}
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-3">
                                            <div className="p-3 bg-primary/10 rounded-lg">
                                                <Building2 className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="mb-2">{app.jobTitle || 'Unknown Position'}</h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span>{app.company || 'Unknown Company'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{app.location || 'Unknown Location'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        <span>Applied {formatDate(new Date(app.appliedDate))}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                                    <div className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(app.status as ApplicationStatus)}`}>
                                                        {getStatusIcon(app.status as ApplicationStatus)}
                                                        <span className="capitalize">{app.status}</span>
                                                    </div>
                                                    {app.interviewDate && (
                                                        <div className="text-sm text-purple-700 flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            Interview: {formatDate(new Date(app.interviewDate))}
                                                        </div>
                                                    )}
                                                </div>

                                                {app.notes && (
                                                    <div className="text-sm text-muted-foreground">
                                                        <span className="font-medium">Notes:</span> {app.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex lg:flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetails(app)}
                                            className="flex-1 lg:flex-none px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(app)}
                                            className="flex-1 lg:flex-none px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                                        >
                                            Update Status
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredApplications.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-border">
                        <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="mb-2">No applications found</h3>
                        <p className="text-muted-foreground mb-6">
                            {selectedStatus === 'all'
                                ? "Start tracking your job applications by adding your first one!"
                                : `No applications with status "${selectedStatus}".`}
                        </p>
                    </div>
                )}

                {/* Update Status Dialog */}
                <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Update Application Status</DialogTitle>
                            <DialogDescription>
                                Change the status of your application for {selectedApp?.jobTitle}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 gap-2 py-4">
                            {(['pending', 'reviewing', 'interview', 'accepted', 'rejected'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={updating || selectedApp?.status === status}
                                    className={`px-4 py-3 rounded-lg text-left transition-all capitalize ${selectedApp?.status === status
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                                >
                                    {getStatusIcon(status)}
                                    {status}
                                    {selectedApp?.status === status && ' (Current)'}
                                </button>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setStatusDialogOpen(false)}
                                disabled={updating}
                            >
                                Cancel
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
