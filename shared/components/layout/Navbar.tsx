'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Menu, X, Search, Bell, User } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/messages', label: 'Messages' },
        { href: '/profile', label: 'Profile' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-1">
                            <span className="text-xl sm:text-2xl font-bold text-green-700">Next</span>
                            <span className="text-xl sm:text-2xl font-bold text-green-700">Step</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'text-sm font-medium transition-colors py-2',
                                    isActive(link.href)
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-700 hover:text-blue-600'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop User Actions */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                        <Link
                            href="/profile"
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <User className="h-5 w-5" />
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <Search className="h-5 w-5" />
                        </button>
                        <button 
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-4">
                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        'block px-3 py-3 text-base font-medium transition-colors min-h-[48px] flex items-center',
                                        isActive(link.href)
                                            ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    )}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="border-t border-gray-200 pt-4 mt-4">
                                <Link
                                    href="/profile"
                                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 min-h-[48px] flex items-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <User className="h-5 w-5 mr-3" />
                                    Profile Settings
                                </Link>
                                <Link
                                    href="/auth"
                                    className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 min-h-[48px] flex items-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Sign In / Sign Up
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
