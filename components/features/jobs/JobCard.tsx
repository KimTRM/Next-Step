import { Briefcase, Building2, MapPin, DollarSign, Eye, BookmarkPlus } from 'lucide-react';
import type { Id } from '@/convex/_generated/dataModel';

type JobType = 'full-time' | 'part-time' | 'internship' | 'contract';

interface JobCardProps {
    job: {
        _id: Id<'jobs'>;
        title: string;
        company: string;
        location: string;
        type: JobType;
        category: string;
        salary: string;
        description: string;
        postedDate: number;
        applicants: number;
    };
}

export function JobCard({ job }: JobCardProps) {
    const getTypeColor = (type: JobType) => {
        switch (type) {
            case 'full-time':
                return 'bg-green-100 text-green-700';
            case 'part-time':
                return 'bg-blue-100 text-blue-700';
            case 'internship':
                return 'bg-purple-100 text-purple-700';
            case 'contract':
                return 'bg-orange-100 text-orange-700';
        }
    };

    const formatLabel = (str: string) => {
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    };

    return (
        <div className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="mb-2">{job.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Building2 className="h-4 w-4" />
                                    <span>{job.company}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{job.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    <span>{job.salary}</span>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs ${getTypeColor(job.type)}`}>
                                    {formatLabel(job.type)}
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                    {formatLabel(job.category)}
                                </span>
                                <span className="text-xs text-muted-foreground">Posted {formatDate(job.postedDate)}</span>
                                <span className="text-xs text-muted-foreground">{job.applicants} applicants</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                    <button className="flex-1 lg:flex-none px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                    </button>
                    <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                        <BookmarkPlus className="h-4 w-4" />
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
