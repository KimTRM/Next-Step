import { Briefcase, Building2, TrendingUp, Clock } from 'lucide-react';

interface JobStatsProps {
    jobs: Array<{
        employmentType?: string;
        company: string;
    }>;
}

export function JobStats({ jobs }: JobStatsProps) {
    const totalCompanies = new Set(jobs.map((job) => job.company)).size;
    const fullTimeJobs = jobs.filter((job) => job.employmentType === 'full-time').length;
    const internships = jobs.filter((job) => job.employmentType === 'internship').length;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{jobs.length}</div>
                        <div className="text-sm text-muted-foreground">Total Jobs</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{totalCompanies}</div>
                        <div className="text-sm text-muted-foreground">Companies</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{fullTimeJobs}</div>
                        <div className="text-sm text-muted-foreground">Full-Time</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                        <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                        <div className="text-2xl text-foreground">{internships}</div>
                        <div className="text-sm text-muted-foreground">Internships</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
