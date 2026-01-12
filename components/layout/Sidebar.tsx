/**
 * Sidebar Component - NextStep Platform
 * 
 * Sidebar navigation for dashboard pages
 * 
 * HACKATHON TODO:
 * - Add collapsible sidebar for mobile
 * - Add icons for each menu item
 * - Add nested menu items (e.g., Settings submenu)
 * - Add badge indicators (e.g., unread messages count)
 * - Add user info section at top/bottom
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    const menuItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/profile', label: 'My Profile', icon: '👤' },
        { href: '/opportunities', label: 'Opportunities', icon: '💼' },
        { href: '/applications', label: 'My Applications', icon: '📝' },
        { href: '/messages', label: 'Messages', icon: '💬' },
    ];

    const isActive = (href: string) => {
        return pathname === href;
    };

    return (
        <aside className={cn('w-64 bg-white border-r border-gray-200 h-screen sticky top-16', className)}>
            <div className="p-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Navigation
                </h2>
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                isActive(item.href)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                            )}
                        >
                            <span className="mr-3 text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Quick Actions Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                        Quick Actions
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            🔔 Notifications
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            ⚙️ Settings
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            ❓ Help & Support
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
