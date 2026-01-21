import { Search } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/lib/constants/jobs';
import type { JobType } from '@/lib/constants/jobs';

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
        <div className="mb-8 space-y-4">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search jobs by title, company, or location..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                {/* Type Filter */}
                <div className="flex-1">
                    <label className="block text-sm mb-2">Job Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {(['all', ...JOB_TYPES] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => onTypeChange(type)}
                                className={`px-4 py-2 rounded-lg transition-all ${selectedType === type
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
                <div className="flex-1">
                    <label className="block text-sm mb-2">Category</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
