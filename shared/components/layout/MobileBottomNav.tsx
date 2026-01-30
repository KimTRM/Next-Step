'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Briefcase, LayoutDashboard, MessageSquare, User } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export function MobileBottomNav() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    // Update active tab based on current pathname
    if (pathname === '/') setActiveTab('home');
    else if (pathname.startsWith('/jobs')) setActiveTab('jobs');
    else if (pathname.startsWith('/dashboard')) setActiveTab('dashboard');
    else if (pathname.startsWith('/messages')) setActiveTab('messages');
    else if (pathname.startsWith('/profile')) setActiveTab('profile');
  }, [pathname]);

  const navItems = [
    { id: 'home', href: '/', label: 'Home', icon: Home },
    { id: 'jobs', href: '/jobs', label: 'Jobs', icon: Briefcase },
    { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'messages', href: '/messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center h-full py-1 px-1 relative transition-colors',
                isActive 
                  ? 'text-green-600' 
                  : 'text-gray-500 hover:text-green-600'
              )}
              onClick={() => setActiveTab(item.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-green-600 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <Icon 
                className={cn(
                  'h-5 w-5 mb-1 transition-all duration-200',
                  isActive && 'scale-110'
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              
              <span className={cn(
                'text-xs transition-all duration-200',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
