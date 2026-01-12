/**
 * ============================================================================
 * FRONTEND - Opportunities Page
 * ============================================================================
 * 
 * Browse all jobs, internships, and mentorships.
 * 
 * ARCHITECTURE:
 * - This is a server component that fetches data on the server side
 * - Imports mock data from /server/data for now
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Replace with client component and use API calls (fetch('/api/opportunities'))
 * 2. Implement real search and filtering functionality
 * 3. Add pagination or infinite scroll
 * 4. Add bookmarking/saving opportunities
 * 5. Implement personalized recommendations
 */

// BACKEND DATA: Import from server-side mock data
import { opportunities } from '@/server/data/opportunities';
// FRONTEND COMPONENTS
import { OpportunityList } from '@/components/features/opportunities/OpportunityCard';
import Card, { CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function OpportunitiesPage() {
    // Group opportunities by type
    const jobs = opportunities.filter(o => o.type === 'job');
    const internships = opportunities.filter(o => o.type === 'internship');
    const mentorships = opportunities.filter(o => o.type === 'mentorship');

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
                <p className="text-gray-600 mt-2">
                    Discover jobs, internships, and mentorships tailored for you
                </p>
            </div>

            <Card className="mb-8">
                <CardBody>
                    <div className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Search opportunities..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Types</option>
                            <option value="job">Jobs</option>
                            <option value="internship">Internships</option>
                            <option value="mentorship">Mentorships</option>
                        </select>
                        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All Locations</option>
                            <option value="remote">Remote</option>
                            <option value="toronto">Toronto</option>
                            <option value="vancouver">Vancouver</option>
                        </select>
                        <Button variant="primary">Search</Button>
                    </div>
                </CardBody>
            </Card>

            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-green-700 border-b-2 border-green-700">
                    All ({opportunities.length})
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Jobs ({jobs.length})
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Internships ({internships.length})
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">
                    Mentorships ({mentorships.length})
                </button>
            </div>

            {/* Opportunities Grid */}
            <OpportunityList opportunities={opportunities} />
        </div>
    );
}
