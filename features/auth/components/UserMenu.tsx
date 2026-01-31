"use client";

/**
 * UserMenu Component
 * Dropdown menu with user info and sign-out
 */

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { LogOut, User, Settings, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSignOut } from "../api";

type UserMenuProps = {
    className?: string;
};

export function UserMenu({ className = "" }: UserMenuProps) {
    const { user, isLoaded } = useUser();
    const { signOut, isLoading: isSigningOut } = useSignOut();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close menu on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    if (!isLoaded) {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        );
    }

    if (!user) {
        return null;
    }

    const userInitials = user.firstName && user.lastName
        ? `${user.firstName[0]}${user.lastName[0]}`
        : user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0]?.toUpperCase() || "U";

    return (
        <div ref={menuRef} className={`relative ${className}`}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {user.imageUrl ? (
                    <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium">
                        {userInitials}
                    </div>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user.fullName || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                            {user.primaryEmailAddress?.emailAddress}
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                        <Link
                            href="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4" />
                            My Profile
                        </Link>
                        <Link
                            href="/profile/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            Settings
                        </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="border-t border-gray-100 pt-1">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                signOut();
                            }}
                            disabled={isSigningOut}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                            {isSigningOut ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <LogOut className="w-4 h-4" />
                            )}
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
