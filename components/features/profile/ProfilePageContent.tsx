'use client';

import { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Award, FileText, Plus, Edit3, Save, Calendar } from 'lucide-react';

export function ProfilePageContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@email.com',
    phone: '+63 912 345 6789',
    location: 'Naga City, Camarines Sur',
    education: 'Bachelor of Science in Computer Science',
    university: 'University of Naga',
    graduationYear: '2025',
    bio: 'Fresh graduate passionate about technology and eager to start my career in software development. Strong foundation in programming and problem-solving.',
  });

  const [skills, setSkills] = useState([
    'JavaScript',
    'Python',
    'React',
    'Node.js',
    'SQL',
    'Git',
    'Problem Solving',
    'Team Collaboration'
  ]);

  const [interests, setInterests] = useState([
    'Web Development',
    'Mobile Apps',
    'AI/Machine Learning',
    'Cloud Computing'
  ]);

  const [goals, setGoals] = useState([
    { id: 1, text: 'Land my first developer role within 3 months', completed: false },
    { id: 2, text: 'Build a portfolio of 5 projects', completed: true },
    { id: 3, text: 'Connect with 3 mentors in the tech industry', completed: false },
    { id: 4, text: 'Complete an online certification course', completed: true }
  ]);

  const [experience, setExperience] = useState([
    {
      id: 1,
      role: 'Intern - Web Developer',
      company: 'Tech Startup Inc.',
      duration: 'Jun 2024 - Aug 2024',
      description: 'Assisted in developing responsive web applications using React and Node.js'
    },
    {
      id: 2,
      role: 'Capstone Project Lead',
      company: 'University of Naga',
      duration: 'Jan 2025 - May 2025',
      description: 'Led a team of 4 students to develop a campus management system'
    }
  ]);

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to a backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="display-font text-5xl mb-4">My Profile</h1>
            <p className="text-lg text-muted-foreground">
              Build and showcase your professional profile to attract employers and mentors.
            </p>
          </div>
          <button
            onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            ) : (
              <>
                <Edit3 className="h-5 w-5" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2 text-center"
                  />
                ) : (
                  <h2 className="mb-2">{profileData.name}</h2>
                )}
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-center"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground text-center">{profileData.education}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="flex-1 px-2 py-1 bg-input-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{profileData.email}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="flex-1 px-2 py-1 bg-input-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{profileData.phone}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      className="flex-1 px-2 py-1 bg-input-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{profileData.location}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.university}
                      onChange={(e) => setProfileData({ ...profileData, university: e.target.value })}
                      className="flex-1 px-2 py-1 bg-input-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{profileData.university}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Class of {profileData.graduationYear}</span>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="mb-4">Profile Strength</h3>
              <div className="mb-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">75% Complete</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-green-600">
                  <Award className="h-4 w-4" />
                  Basic info added
                </li>
                <li className="flex items-center gap-2 text-green-600">
                  <Award className="h-4 w-4" />
                  Skills listed
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  Upload resume (recommended)
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                />
              ) : (
                <p className="text-muted-foreground">{profileData.bio}</p>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Skills</h3>
                {isEditing && (
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Experience</h3>
                {isEditing && (
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Experience
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-primary pl-4">
                    <h4 className="mb-1">{exp.role}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {exp.company} • {exp.duration}
                    </p>
                    <p className="text-sm text-muted-foreground">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Goals */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Career Goals</h3>
                {isEditing && (
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Goal
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <div key={goal.id} className="flex items-start gap-3">
                    <div className={`mt-1 ${goal.completed ? 'text-green-600' : 'text-gray-400'}`}>
                      {goal.completed ? (
                        <Award className="h-5 w-5" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded" />
                      )}
                    </div>
                    <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                      {goal.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3>Areas of Interest</h3>
                {isEditing && (
                  <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Interest
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-border p-6">
              <h3 className="mb-4">Documents & Attachments</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm">Resume.pdf</p>
                      <p className="text-xs text-muted-foreground">Updated Jan 5, 2026</p>
                    </div>
                  </div>
                  <button className="text-sm text-primary hover:text-primary/80">View</button>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all">
                  Upload Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
