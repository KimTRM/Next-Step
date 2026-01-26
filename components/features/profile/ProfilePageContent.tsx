'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import { User, Mail, MapPin, Award, FileText, Plus, Edit3, Save } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePageContent() {
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const currentUser = useQuery(api.functions.users.getCurrentUser);
  const upsertUser = useMutation(api.functions.userMutations.upsertUser);
  const updateProfile = useMutation(api.functions.userMutations.updateUserProfile);

  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-create user in Convex if signed in with Clerk but no Convex record
  useEffect(() => {
    const createUser = async () => {
      if (clerkUser && currentUser === null && !isCreatingUser) {
        setIsCreatingUser(true);
        try {
          await upsertUser({
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: clerkUser.fullName || clerkUser.firstName || 'User',
            avatarUrl: clerkUser.imageUrl,
          });
        } catch (error) {
          console.error('Failed to create user:', error);
        } finally {
          setIsCreatingUser(false);
        }
      }
    };
    createUser();
  }, [clerkUser, currentUser, upsertUser, isCreatingUser]);

  // Initialize form data when user data loads for the first time
  useEffect(() => {
    if (currentUser && !hasInitialized) {
      // Batch state updates to avoid multiple re-renders
      setBio(currentUser.bio || '');
      setLocation(currentUser.location || '');
      setSkills(currentUser.skills || []);
      setHasInitialized(true);
    }
  }, [currentUser, hasInitialized]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        skills: skills.length > 0 ? skills : undefined,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  // Show loading while mounting or while Clerk and Convex are initializing
  if (!mounted || !clerkLoaded || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Not signed in with Clerk
  if (!clerkUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center flex-col gap-4">
        <p className="text-lg text-gray-600">Please sign in to view your profile</p>
        <a
          href="/auth"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Sign In
        </a>
      </div>
    );
  }

  // Signed in but no Convex user record yet
  if (currentUser === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-green-50/30 to-green-100/20 flex items-center justify-center flex-col gap-4">
        <p className="text-lg text-gray-600">Setting up your profile...</p>
        <p className="text-sm text-gray-500">Signed in as {clerkUser.emailAddresses[0]?.emailAddress}</p>
        <p className="text-xs text-gray-400">If this persists, try refreshing the page</p>
      </div>
    );
  }

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
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-primary" />
                  )}
                </div>
                <h2 className="mb-2">{currentUser.name}</h2>
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full capitalize">
                  {currentUser.role}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>{currentUser.email}</span>
                </div>

                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary mt-1" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your location"
                      className="flex-1 px-2 py-1 bg-input-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  ) : (
                    <span>{location || 'No location set'}</span>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  Member since {new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Bio and Skills */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  About Me
                </h3>
              </div>
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your goals, and what you're looking for..."
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] resize-none"
                />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {bio || 'No bio added yet. Click "Edit Profile" to add information about yourself.'}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Skills
                </h3>
              </div>

              {isEditing && (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    placeholder="Add a skill (press Enter)"
                    className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No skills added yet. {isEditing ? 'Add your skills above.' : 'Click "Edit Profile" to add skills.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
