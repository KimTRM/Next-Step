import { Search } from 'lucide-react';
import { EXPERTISE_AREAS } from '@/shared/lib/constants/mentors';

interface MentorFiltersProps {
    searchTerm: string;
    selectedExpertise: string;
    onSearchChange: (value: string) => void;
    onExpertiseChange: (value: string) => void;
}

export function MentorFilters({
    searchTerm,
    selectedExpertise,
    onSearchChange,
    onExpertiseChange,
}: MentorFiltersProps) {
    return (
        <div className="mb-8 space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search mentors by name, role, or company..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {EXPERTISE_AREAS.map((area) => (
                    <button
                        key={area}
                        onClick={() => onExpertiseChange(area)}
                        className={`px-4 py-2 rounded-lg transition-all capitalize ${selectedExpertise === area
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-white text-foreground border border-border hover:border-primary'
                            }`}
                    >
                        {area}
                    </button>
                ))}
            </div>
        </div>
    );
}
