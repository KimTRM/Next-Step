/**
 * Example: Protected Dashboard Component
 * Demonstrates authentication integration with Convex
 */

'use client';

import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedDashboard() {
    const { user, isAuthenticated, isLoading, isStudent, isMentor, isEmployer } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sign-in');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Profile</h2>
                <div className="space-y-2">
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    {user.location && <p><strong>Location:</strong> {user.location}</p>}
                    {user.bio && <p><strong>Bio:</strong> {user.bio}</p>}
                    {user.profileCompletion !== undefined && (
                        <p><strong>Profile Completion:</strong> {user.profileCompletion}%</p>
                    )}
                </div>
            </div>

            {/* Role-specific content */}
            {isStudent && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-2">Student Dashboard</h3>
                    <p>Find mentors, explore opportunities, and track applications.</p>
                </div>
            )}

            {isMentor && (
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-2">Mentor Dashboard</h3>
                    <p>Manage sessions, connect with mentees, and share expertise.</p>
                </div>
            )}

            {isEmployer && (
                <div className="bg-purple-50 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-2">Employer Dashboard</h3>
                    <p>Post jobs, review applications, and find talent.</p>
                </div>
            )}

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill) => (
                            <span
                                key={skill}
                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
