/**
 * ProfileForm Component - NextStep Platform
 * 
 * Form for editing user profile information
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@/lib/types';

interface ProfileFormProps {
    user?: User;
    onSave?: (data: Partial<User>) => void;
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        location: user?.location || '',
        skills: user?.skills?.join(', ') || '',
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert skills string to array
        const updatedData = {
            ...formData,
            skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        };

        console.log('Saving profile:', updatedData);

        if (onSave) {
            onSave(updatedData);
        }

        alert('Profile saved! (This is a mock - implement API integration)');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-3xl">
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        '👤'
                    )}
                </div>
                <div>
                    <Button type="button" variant="outline" size="sm">
                        Upload Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                        JPG, PNG or GIF. Max size 2MB
                    </p>
                </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="City, Province/State"
                    />
                </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About You</h3>

                <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself, your goals, and what you're looking for..."
                    />
                    <p className="text-xs text-gray-500 mt-1">A good bio helps mentors and employers understand your background</p>
                </div>

                <div>
                    <Label htmlFor="skills">Skills</Label>
                    <Input
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="React, Python, Communication, etc. (comma-separated)"
                    />
                    <p className="text-xs text-gray-500 mt-1">List your skills separated by commas</p>
                </div>
            </div>

            {user?.role === 'student' && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Info</h3>
                    <div>
                        <Label htmlFor="education">Education</Label>
                        <Input
                            id="education"
                            placeholder="e.g., Computer Science, University of Toronto"
                        />
                    </div>
                    <div>
                        <Label htmlFor="graduationYear">Graduation Year</Label>
                        <Input
                            id="graduationYear"
                            type="number"
                            placeholder="2026"
                        />
                    </div>
                </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Button type="button" variant="ghost">
                    Cancel
                </Button>
                <Button type="submit" variant="default">
                    Save Changes
                </Button>
            </div>
        </form>
    );
}

