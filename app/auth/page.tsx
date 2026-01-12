/**
 * Auth Page - NextStep Platform
 * Login and Sign Up
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log(isLogin ? 'Logging in...' : 'Signing up...', formData);

        // Mock successful auth
        alert(`${isLogin ? 'Login' : 'Sign up'} successful! (Mock)`);
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-blue-600">Next</span>
                            <span className="text-3xl font-bold text-gray-900">Step</span>
                        </div>
                        <CardTitle>
                            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            {isLogin
                                ? 'Log in to access your dashboard'
                                : 'Join NextStep to find opportunities and mentors'}
                        </p>
                    </CardHeader>

                    <CardBody>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            )}

                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="your.email@example.com"
                                required
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                            />

                            {!isLogin && (
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        I am a...
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="student">Student</option>
                                        <option value="mentor">Mentor</option>
                                        <option value="employer">Employer</option>
                                    </select>
                                </div>
                            )}

                            <Button type="submit" variant="primary" className="w-full">
                                {isLogin ? 'Log In' : 'Sign Up'}
                            </Button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Button variant="outline" className="w-full" type="button">
                                    🔍 Google
                                </Button>
                                <Button variant="outline" className="w-full" type="button">
                                    <span className="mr-1">💼</span> LinkedIn
                                </Button>
                            </div>
                        </div>

                        {/* Toggle between Login/Signup */}
                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                {isLogin
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Log in'}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="mt-2 text-center">
                                <button
                                    type="button"
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
