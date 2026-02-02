"use client";

import { X, Filter, DollarSign, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { useState } from 'react';
import { JOB_CATEGORIES, JOB_TYPES } from '@/shared/lib/constants/jobs';
import type { JobType } from '@/shared/lib/constants/jobs';
import type { EmploymentType, ExperienceLevel, LocationType } from '../types';

interface JobFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilters: (filters: JobFilters) => void;
    currentFilters: JobFilters;
}

export interface JobFilters {
    searchTerm: string;
    selectedType: 'all' | JobType;
    selectedCategory: string;
    minSalary: number;
    maxSalary: number;
    experienceLevel: 'all' | ExperienceLevel;
    locationType: 'all' | LocationType;
}

export function JobFilterModal({ isOpen, onClose, onApplyFilters, currentFilters }: JobFilterModalProps) {
    const [filters, setFilters] = useState<JobFilters>(currentFilters);
    const [activeSection, setActiveSection] = useState<string>('employment');

    const experienceLevels: ExperienceLevel[] = ['entry', 'mid', 'senior', 'lead', 'executive'];
    const locationTypes: LocationType[] = ['on-site', 'remote', 'hybrid'];

    const formatLabel = (str: string) => {
        return str
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
    };

    const handleFilterChange = (key: keyof JobFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleReset = () => {
        const defaultFilters: JobFilters = {
            searchTerm: '',
            selectedType: 'all',
            selectedCategory: 'all',
            minSalary: 0,
            maxSalary: 500000,
            experienceLevel: 'all',
            locationType: 'all',
        };
        setFilters(defaultFilters);
        onApplyFilters(defaultFilters);
        onClose();
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.selectedType !== 'all') count++;
        if (filters.selectedCategory !== 'all') count++;
        if (filters.minSalary > 0) count++;
        if (filters.maxSalary < 500000) count++;
        if (filters.experienceLevel !== 'all') count++;
        if (filters.locationType !== 'all') count++;
        return count;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden flex flex-col sm:flex-row animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-300">
                {/* Sidebar - Hidden on mobile */}
                <div className="hidden sm:block sm:w-64 bg-gray-50 p-4 sm:p-6 border-r border-gray-200">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-green-600 rounded-xl">
                            <Filter className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                            <p className="text-sm text-gray-600">
                                {getActiveFiltersCount()} active
                            </p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'employment', label: 'Employment', icon: Briefcase },
                            { id: 'category', label: 'Category', icon: Filter },
                            { id: 'salary', label: 'Salary', icon: DollarSign },
                            { id: 'experience', label: 'Experience', icon: GraduationCap },
                            { id: 'location', label: 'Location', icon: MapPin },
                        ].map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <section.icon className="h-4 w-4" />
                                <span className="font-medium">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-gray-200 gap-3 sm:gap-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {activeSection === 'employment' && 'Employment Type'}
                            {activeSection === 'category' && 'Job Category'}
                            {activeSection === 'salary' && 'Salary Range'}
                            {activeSection === 'experience' && 'Experience Level'}
                            {activeSection === 'location' && 'Location Type'}
                        </h3>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {/* Mobile Section Selector */}
                            <select
                                value={activeSection}
                                onChange={(e) => setActiveSection(e.target.value)}
                                className="sm:hidden flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#11A773] text-sm"
                            >
                                <option value="employment">Employment Type</option>
                                <option value="category">Job Category</option>
                                <option value="salary">Salary Range</option>
                                <option value="experience">Experience Level</option>
                                <option value="location">Location Type</option>
                            </select>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Content */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                        {/* Employment Type */}
                        {activeSection === 'employment' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(['all', ...JOB_TYPES] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleFilterChange('selectedType', type)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${filters.selectedType === type
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium">
                                                {type === 'all' ? 'All Types' : formatLabel(type)}
                                            </div>
                                            {type !== 'all' && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {type === 'full-time' && '40+ hours per week'}
                                                    {type === 'part-time' && 'Less than 40 hours'}
                                                    {type === 'contract' && 'Fixed-term contract'}
                                                    {type === 'internship' && 'Learning opportunity'}
                                                    {type === 'temporary' && 'Short-term position'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category */}
                        {activeSection === 'category' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-3 gap-3">
                                    {JOB_CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => handleFilterChange('selectedCategory', category)}
                                            className={`p-3 rounded-xl border-2 transition-all text-left ${filters.selectedCategory === category
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium text-sm">
                                                {category === 'all' ? 'All Categories' : formatLabel(category)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Salary Range */}
                        {activeSection === 'salary' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Salary (₱)
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.minSalary}
                                        onChange={(e) => handleFilterChange('minSalary', parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Salary (₱)
                                    </label>
                                    <input
                                        type="number"
                                        value={filters.maxSalary}
                                        onChange={(e) => handleFilterChange('maxSalary', parseInt(e.target.value) || 500000)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="500000"
                                    />
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="text-sm text-green-700">
                                        <strong>Salary Range:</strong> ₱{filters.minSalary.toLocaleString()} - ₱{filters.maxSalary.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Experience Level */}
                        {activeSection === 'experience' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {(['all', ...experienceLevels] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => handleFilterChange('experienceLevel', level)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${filters.experienceLevel === level
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium">
                                                {level === 'all' ? 'All Levels' : formatLabel(level)}
                                            </div>
                                            {level !== 'all' && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {level === 'entry' && '0-2 years experience'}
                                                    {level === 'mid' && '2-5 years experience'}
                                                    {level === 'senior' && '5-10 years experience'}
                                                    {level === 'lead' && '10+ years experience'}
                                                    {level === 'executive' && 'Leadership role'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location Type */}
                        {activeSection === 'location' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {(['all', ...locationTypes] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => handleFilterChange('locationType', type)}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${filters.locationType === type
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="font-medium">
                                                {type === 'all' ? 'All Locations' : formatLabel(type)}
                                            </div>
                                            {type !== 'all' && (
                                                <div className="text-sm text-gray-500 mt-1">
                                                    {type === 'on-site' && 'Work from office'}
                                                    {type === 'remote' && 'Work from anywhere'}
                                                    {type === 'hybrid' && 'Mix of office & remote'}
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={handleReset}
                            className="px-4 sm:px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200 touch-manipulation min-h-[44px] rounded-xl sm:rounded-none hover:bg-gray-100 sm:hover:bg-transparent hover:scale-105 active:scale-95"
                        >
                            Reset All
                        </button>
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium touch-manipulation min-h-[44px] hover:border-gray-400 hover:scale-105 active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-[#11A773] text-white rounded-xl hover:bg-[#0F9563] transition-all duration-200 font-medium shadow-lg hover:shadow-xl touch-manipulation min-h-[44px] hover:scale-105 active:scale-95"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
