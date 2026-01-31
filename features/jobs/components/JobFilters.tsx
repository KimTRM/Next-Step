"use client";

import { Search, ChevronDown, Filter, X } from 'lucide-react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/shared/lib/constants/jobs';
import type { JobType } from '@/shared/lib/constants/jobs';
import { useState, useEffect, useRef } from 'react';
import { JobFilterModal, type JobFilters } from './JobFilterModal';

interface JobFiltersProps {
    searchTerm: string;
    selectedType: 'all' | JobType;
    selectedCategory: string;
    onSearchChange: (value: string) => void;
    onTypeChange: (type: 'all' | JobType) => void;
    onCategoryChange: (category: string) => void;
    onAdvancedFiltersChange?: (filters: JobFilters) => void;
}

export function JobFilters({
    searchTerm,
    selectedType,
    selectedCategory,
    onSearchChange,
    onTypeChange,
    onCategoryChange,
    onAdvancedFiltersChange,
}: JobFiltersProps) {
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [searchSuggestionsOpen, setSearchSuggestionsOpen] = useState(false);
    const categoryDropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    const formatLabel = (str: string) => {
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const handleCategorySelect = (category: string) => {
        onCategoryChange(category);
        setCategoryDropdownOpen(false);
    };

    const handleAdvancedFilters = (filters: JobFilters) => {
        if (onAdvancedFiltersChange) {
            onAdvancedFiltersChange(filters);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
                setCategoryDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search focus and input
    const handleSearchFocus = () => {
        if (searchTerm) {
            setSearchSuggestionsOpen(true);
        }
    };

    const handleSearchInputChange = (value: string) => {
        onSearchChange(value);
        setSearchSuggestionsOpen(value.length > 0);
    };

    const handleSuggestionClick = (suggestion: string) => {
        onSearchChange(suggestion);
        setSearchSuggestionsOpen(false);
    };

    return (
        <div className="mb-8 space-y-6">
            {/* Facebook/YouTube Style Search Bar */}
            <div className="relative max-w-2xl mx-auto" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search for job title, company, or keywords..."
                        value={searchTerm}
                        onChange={(e) => handleSearchInputChange(e.target.value)}
                        onFocus={handleSearchFocus}
                        className="w-full pl-12 pr-12 py-3 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#99D34D] focus:border-transparent text-base shadow-sm hover:shadow-md transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchInputChange('')}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="h-4 w-4 text-gray-400" />
                        </button>
                    )}
                </div>
                
                {/* Quick Search Suggestions */}
                {searchSuggestionsOpen && searchTerm && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-64 overflow-y-auto">
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs text-gray-500 font-medium">SUGGESTIONS</div>
                            <button 
                                onClick={() => handleSuggestionClick(`${searchTerm} jobs`)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <span className="font-medium">{searchTerm}</span> jobs
                            </button>
                            <button 
                                onClick={() => handleSuggestionClick(`${searchTerm} positions`)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <span className="font-medium">{searchTerm}</span> positions
                            </button>
                            <button 
                                onClick={() => handleSuggestionClick(`${searchTerm} companies`)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <span className="font-medium">{searchTerm}</span> companies
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Horizontal Layout: Filter Pills on Left, Category and Advanced Filters on Right */}
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

                {/* Category and Advanced Filters - Right Side */}
                <div className="flex items-center gap-3">
                    {/* Category Dropdown */}
                    <div className="relative w-48" ref={categoryDropdownRef}>
                        <button
                            onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                            className="w-full px-5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base min-h-[44px] shadow-sm cursor-pointer text-left text-gray-700 flex items-center justify-between"
                        >
                            <span>{selectedCategory === 'all' ? 'Category' : formatLabel(selectedCategory)}</span>
                            <ChevronDown className="h-4 w-4" />
                        </button>
                        
                        {categoryDropdownOpen && (
                            <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                                {JOB_CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => handleCategorySelect(category)}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                                            selectedCategory === category ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700'
                                        }`}
                                    >
                                        {category === 'all' ? 'All Categories' : formatLabel(category)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setFilterModalOpen(true)}
                        className="px-5 py-2.5 bg-[#279341] text-white rounded-xl hover:bg-[#1F7A35] transition-all font-semibold min-h-[44px] shadow-sm hover:shadow-md flex items-center gap-2"
                    >
                        <Filter className="h-4 w-4" />
                        <span>Filter</span>
                    </button>
                </div>
            </div>

            {/* Filter Modal */}
            <JobFilterModal
                isOpen={filterModalOpen}
                onClose={() => setFilterModalOpen(false)}
                onApplyFilters={handleAdvancedFilters}
                currentFilters={{
                    searchTerm,
                    selectedType,
                    selectedCategory,
                    minSalary: 0,
                    maxSalary: 500000,
                    experienceLevel: 'all',
                    locationType: 'all',
                }}
            />
        </div>
    );
}
