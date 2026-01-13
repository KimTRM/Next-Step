'use client';

import { useState } from 'react';
import { Briefcase, Building2, MapPin, DollarSign, Clock, Search, TrendingUp, Eye, BookmarkPlus } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  category: string;
  salary: string;
  postedDate: string;
  description: string;
  applicants: number;
}

export function MaterialsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'full-time' | 'part-time' | 'internship' | 'contract'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'technology', 'business', 'marketing', 'customer-service', 'healthcare', 'finance', 'education'];

  const jobs: Job[] = [
    {
      id: 1,
      title: 'Junior Software Developer',
      company: 'TechStart Solutions',
      location: 'Naga City, Camarines Sur',
      type: 'full-time',
      category: 'technology',
      salary: '₱20,000 - ₱28,000/month',
      postedDate: '2026-01-02',
      description: 'Looking for fresh graduates with strong programming fundamentals and eagerness to learn.',
      applicants: 23
    },
    {
      id: 2,
      title: 'Marketing Assistant',
      company: 'Creative Minds Agency',
      location: 'Naga City, Camarines Sur',
      type: 'full-time',
      category: 'marketing',
      salary: '₱18,000 - ₱22,000/month',
      postedDate: '2025-12-28',
      description: 'Entry-level position perfect for communication graduates ready to start their marketing career.',
      applicants: 41
    },
    {
      id: 3,
      title: 'Customer Support Intern',
      company: 'BPO Connect',
      location: 'Naga City, Camarines Sur',
      type: 'internship',
      category: 'customer-service',
      salary: '₱8,000 - ₱12,000/month',
      postedDate: '2026-01-04',
      description: '3-month internship program with potential for full-time employment. Training provided.',
      applicants: 67
    },
    {
      id: 4,
      title: 'Junior Business Analyst',
      company: 'DataDrive Corp',
      location: 'Naga City, Camarines Sur',
      type: 'full-time',
      category: 'business',
      salary: '₱22,000 - ₱30,000/month',
      postedDate: '2025-12-30',
      description: 'Fresh graduates with analytical mindset welcome. Experience with Excel and data analysis a plus.',
      applicants: 34
    },
    {
      id: 5,
      title: 'Teaching Assistant',
      company: 'NextGen Academy',
      location: 'Naga City, Camarines Sur',
      type: 'part-time',
      category: 'education',
      salary: '₱300 - ₱500/hour',
      postedDate: '2026-01-01',
      description: 'Part-time opportunity for education graduates to assist in classroom instruction and tutoring.',
      applicants: 18
    },
    {
      id: 6,
      title: 'Junior Accountant',
      company: 'Finance Plus Inc.',
      location: 'Naga City, Camarines Sur',
      type: 'full-time',
      category: 'finance',
      salary: '₱18,000 - ₱25,000/month',
      postedDate: '2025-12-29',
      description: 'Looking for accounting graduates to join our growing finance team. Fresh graduates encouraged to apply.',
      applicants: 29
    },
    {
      id: 7,
      title: 'Healthcare Associate',
      company: 'MediCare Solutions',
      location: 'Naga City, Camarines Sur',
      type: 'contract',
      category: 'healthcare',
      salary: '₱15,000 - ₱20,000/month',
      postedDate: '2026-01-03',
      description: '6-month contract position for healthcare graduates. Patient coordination and administrative support.',
      applicants: 15
    },
    {
      id: 8,
      title: 'Web Design Intern',
      company: 'Design Studio Pro',
      location: 'Naga City, Camarines Sur',
      type: 'internship',
      category: 'technology',
      salary: '₱10,000 - ₱15,000/month',
      postedDate: '2026-01-05',
      description: 'Perfect opportunity for IT/multimedia students to gain real-world experience in web design.',
      applicants: 52
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getTypeColor = (type: Job['type']) => {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="display-font text-5xl mb-4">Job Opportunities</h1>
          <p className="text-lg text-muted-foreground">
            Discover entry-level positions and internships perfect for fresh graduates and first-time jobseekers in Naga City.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Type Filter */}
            <div className="flex-1">
              <label className="block text-sm mb-2">Job Type</label>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'full-time', 'part-time', 'internship', 'contract'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg transition-all ${selectedType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white text-foreground border border-border hover:border-primary'
                      }`}
                  >
                    {type === 'all' ? 'All' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
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
                <div className="text-2xl text-foreground">
                  {new Set(jobs.map(j => j.company)).size}
                </div>
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
                <div className="text-2xl text-foreground">
                  {jobs.filter(j => j.type === 'full-time').length}
                </div>
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
                <div className="text-2xl text-foreground">
                  {jobs.filter(j => j.type === 'internship').length}
                </div>
                <div className="text-sm text-muted-foreground">Internships</div>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="mb-6 flex items-center justify-between">
          <h2>Available Positions ({filteredJobs.length})</h2>
        </div>

        <div className="space-y-4">
          {filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6"
            >
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
                          {job.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {job.category.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Posted {formatDate(job.postedDate)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {job.applicants} applicants
                        </span>
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
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No jobs found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
