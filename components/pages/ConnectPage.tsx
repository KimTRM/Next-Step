'use client';

import { useState } from 'react';
import { MessageSquare, Briefcase, MapPin, Star, Search, UserCheck, Calendar, Award, Send } from 'lucide-react';

interface Mentor {
  id: number;
  name: string;
  role: string;
  company: string;
  location: string;
  expertise: string[];
  experience: string;
  rating: number;
  mentees: number;
  bio: string;
  availability: string;
  isVerified: boolean;
}

export function ConnectPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  const expertiseAreas = ['all', 'technology', 'business', 'marketing', 'finance', 'healthcare', 'education', 'design'];

  const mentors: Mentor[] = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Senior Software Engineer',
      company: 'TechCorp Philippines',
      location: 'Manila',
      expertise: ['technology', 'programming', 'career-development'],
      experience: '8 years',
      rating: 4.9,
      mentees: 23,
      bio: 'Passionate about helping fresh graduates transition into tech careers. Specialized in web development and software engineering.',
      availability: 'Weekends',
      isVerified: true
    },
    {
      id: 2,
      name: 'Miguel Rodriguez',
      role: 'Marketing Director',
      company: 'Creative Solutions Inc.',
      location: 'Cebu City',
      expertise: ['marketing', 'branding', 'digital-marketing'],
      experience: '10 years',
      rating: 4.8,
      mentees: 31,
      bio: 'Experienced marketing professional dedicated to guiding young marketers. Expert in digital strategy and brand management.',
      availability: 'Tuesday & Thursday evenings',
      isVerified: true
    },
    {
      id: 3,
      name: 'Amanda Reyes',
      role: 'Senior Business Analyst',
      company: 'DataVision Corp',
      location: 'Makati',
      expertise: ['business', 'data-analysis', 'consulting'],
      experience: '7 years',
      rating: 4.7,
      mentees: 18,
      bio: 'Helping new graduates navigate the business world. Specialized in analytics, consulting, and strategic planning.',
      availability: 'Flexible',
      isVerified: true
    },
    {
      id: 4,
      name: 'Carlos Santos',
      role: 'Financial Advisor',
      company: 'WealthPro Consulting',
      location: 'BGC, Taguig',
      expertise: ['finance', 'accounting', 'investment'],
      experience: '12 years',
      rating: 4.9,
      mentees: 27,
      bio: 'Dedicated to empowering young professionals in finance. Expert in financial planning, accounting, and investment strategies.',
      availability: 'Monday & Wednesday',
      isVerified: true
    },
    {
      id: 5,
      name: 'Dr. Elena Martinez',
      role: 'Healthcare Administrator',
      company: 'MediCare Hospital',
      location: 'Quezon City',
      expertise: ['healthcare', 'medical', 'administration'],
      experience: '15 years',
      rating: 5.0,
      mentees: 15,
      bio: 'Experienced healthcare professional committed to mentoring the next generation of medical and healthcare workers.',
      availability: 'Weekends only',
      isVerified: true
    },
    {
      id: 6,
      name: 'James Lee',
      role: 'UX/UI Designer',
      company: 'DesignStudio Pro',
      location: 'Pasig',
      expertise: ['design', 'technology', 'creative'],
      experience: '6 years',
      rating: 4.6,
      mentees: 20,
      bio: 'Creative professional passionate about design thinking and user experience. Helping aspiring designers build their portfolios.',
      availability: 'Friday afternoons',
      isVerified: false
    },
    {
      id: 7,
      name: 'Professor Anna Cruz',
      role: 'University Professor',
      company: 'State University',
      location: 'Naga City',
      expertise: ['education', 'teaching', 'research'],
      experience: '20 years',
      rating: 4.8,
      mentees: 42,
      bio: 'Veteran educator with extensive experience in academic mentorship and career guidance for education graduates.',
      availability: 'Thursdays',
      isVerified: true
    },
    {
      id: 8,
      name: 'Ryan Gonzales',
      role: 'Startup Founder',
      company: 'InnovatePH',
      location: 'Davao City',
      expertise: ['business', 'entrepreneurship', 'technology'],
      experience: '9 years',
      rating: 4.7,
      mentees: 16,
      bio: 'Entrepreneur and startup founder helping young professionals navigate the startup ecosystem and entrepreneurship.',
      availability: 'Flexible',
      isVerified: true
    }
  ];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExpertise = selectedExpertise === 'all' || mentor.expertise.includes(selectedExpertise);
    return matchesSearch && matchesExpertise;
  });

  const handleConnectMentor = (mentor: Mentor) => {
    setSelectedMentor(mentor);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="display-font text-5xl mb-4">Find a Mentor</h1>
          <p className="text-lg text-muted-foreground">
            Connect with experienced professionals who can guide you through your career journey.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search mentors by name, role, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {expertiseAreas.map(area => (
              <button
                key={area}
                onClick={() => setSelectedExpertise(area)}
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl text-foreground">{mentors.length}</div>
                <div className="text-sm text-muted-foreground">Available Mentors</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl text-foreground">
                  {mentors.filter(m => m.isVerified).length}
                </div>
                <div className="text-sm text-muted-foreground">Verified</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl text-foreground">
                  {mentors.reduce((acc, m) => acc + m.mentees, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Active Mentorships</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Star className="h-5 w-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl text-foreground">
                  {(mentors.reduce((acc, m) => acc + m.rating, 0) / mentors.length).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentors List */}
        <div className="mb-6">
          <h2>Available Mentors ({filteredMentors.length})</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMentors.map(mentor => (
            <div
              key={mentor.id}
              className="bg-white rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all p-6"
            >
              {/* Mentor Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="mb-1 flex items-center gap-2">
                        {mentor.name}
                        {mentor.isVerified && (
                          <Award className="h-4 w-4 text-primary" aria-label="Verified Mentor" />
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">{mentor.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{mentor.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{mentor.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{mentor.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground mb-4">{mentor.bio}</p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertise.map((exp, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs capitalize"
                  >
                    {exp.replace('-', ' ')}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{mentor.experience} experience</span>
                </div>
                <div className="flex items-center gap-1">
                  <UserCheck className="h-4 w-4" />
                  <span>{mentor.mentees} mentees</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Availability:</span> {mentor.availability}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleConnectMentor(mentor)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Connect
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-border">
            <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters to find the right mentor for you.
            </p>
          </div>
        )}

        {/* Connection Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="mb-4">Connect with {selectedMentor.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Send a message to introduce yourself and explain what kind of guidance you're looking for.
              </p>
              <textarea
                placeholder="Hi, I'm a fresh graduate interested in..."
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4 h-32 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMentor(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
