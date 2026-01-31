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
        <div className="mb-8 space-y-6">
            {/* Centered Search Bar */}
            <div className="relative w-[70%] mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search for job title, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base shadow-sm"
                />
            </div>

            {/* Horizontal Layout: Filter Pills on Left, Category on Right */}
            <div className="flex items-center justify-between gap-6">
                {/* Filter Pills - Left Side */}
                <div className="flex items-center gap-3 flex-1">
                    {(['all', 'full-time', 'part-time', 'internship', 'contract'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => onTypeChange(type)}
                            className={`px-5 py-2.5 rounded-xl transition-all text-sm font-semibold min-h-[44px] shadow-sm ${selectedType === type
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:border-green-500 hover:shadow-md'
                                }`}
                        >
                            {type === 'all' ? 'All' : formatLabel(type)}
                        </button>
                    ))}
                </div>

                {/* Category Input - Right Side */}
                <div className="w-32">
                    <button
                        onClick={() => onCategoryChange('all')}
                        className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base min-h-[44px] shadow-sm cursor-pointer text-left text-gray-700"
                    >
                        Category
                    </button>
                </div>
            </div>
        </div>
    );
}
