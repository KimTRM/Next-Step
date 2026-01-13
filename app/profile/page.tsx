/**
 * ============================================================================
 * FRONTEND - Profile Page
 * ============================================================================
 * 
 * User profile view and edit.
 * 
 * NEXT STEPS FOR PRODUCTION:
 * 1. Get current user from authentication session
 * 2. Replace data import with API call to fetch user profile
 * 3. Add profile update API integration
 * 4. Implement image upload for avatar
 * 5. Add profile visibility settings (public/private)
 */

// BACKEND DATA: Import from server-side mock data
import { users } from '@/server/data/users';
// FRONTEND COMPONENTS
import ProfileForm from '@/components/features/profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
    // Mock current user (student with ID 1)
    const currentUserId = '1';
    const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser) {
        return <div>User not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-2">
                    Manage your personal information and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Overview - Sidebar */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="text-center">
                            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-4">
                                {currentUser.avatarUrl ? (
                                    <img
                                        src={currentUser.avatarUrl}
                                        alt={currentUser.name}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    '👤'
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {currentUser.name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">{currentUser.email}</p>
                            <div className="mt-4">
                                <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                    {currentUser.role.toUpperCase()}
                                </span>
                            </div>
                            <div className="mt-4 text-left">
                                <p className="text-sm text-gray-600">📍 {currentUser.location}</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    📅 Member since {new Date(currentUser.createdAt).getFullYear()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Card */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Skills</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {currentUser.skills && currentUser.skills.length > 0 ? (
                                    currentUser.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                                        >
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No skills added yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Profile Form - Main Content */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProfileForm user={currentUser} />
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Bio</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">
                                {currentUser.bio || 'No bio added yet. Tell others about yourself!'}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

