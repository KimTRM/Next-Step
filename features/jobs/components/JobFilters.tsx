import { Search } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/shared/lib/constants/jobs';
import type { JobType } from '@/shared/lib/constants/jobs';

interface JobFiltersProps {
    searchTerm: string;
    selectedType: 'all' | JobType;
    selectedCategory: string;
    onSearchChange: (value: string) => void;
    onTypeChange: (type: 'all' | JobType) => void;
    onCategoryChange: (category: string) => void;
}

export function JobFilters({
    searchTerm,
    selectedType,
    selectedCategory,
    onSearchChange,
    onTypeChange,
    onCategoryChange,
}: JobFiltersProps) {
    const formatLabel = (str: string) => {
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    return (
        <div className="mb-6 sm:mb-8 space-y-4">
            <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
            </div>

            <div className="space-y-4">
                {/* Type Filter */}
                <div>
                    <label className="block text-sm font-medium mb-2">Job Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', ...JOB_TYPES] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => onTypeChange(type)}
                                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all text-sm font-medium min-h-[44px] ${selectedType === type
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-white text-foreground border border-border hover:border-primary'
                                    }`}
                            >
                                {type === 'all' ? 'All' : formatLabel(type)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-base min-h-[44px]"
                    >
                        {JOB_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                                {formatLabel(category)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
