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
        <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
                        <div className="text-sm text-gray-600">Total Jobs</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                        <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{totalCompanies}</div>
                        <div className="text-sm text-gray-600">Companies</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{fullTimeJobs}</div>
                        <div className="text-sm text-gray-600">Full-Time</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-50 rounded-xl">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{internships}</div>
                        <div className="text-sm text-gray-600">Internships</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
