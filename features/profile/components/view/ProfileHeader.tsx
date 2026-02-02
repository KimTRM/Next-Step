"use client";

import { Camera, Edit3, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import type { User as UserType } from "../../types";

interface ProfileHeaderProps {
    user: UserType;
    onEditClick: () => void;
}

export function ProfileHeader({ user, onEditClick }: ProfileHeaderProps) {
    return (
        <>
            {/* Cover Banner */}
            <div className="relative rounded-t-xl overflow-hidden h-48 bg-gradient-to-br from-green-400 via-green-300 to-emerald-200">
                <button className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow transition-colors">
                    <Camera className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Profile Header (overlapping) */}
            <div className="bg-white rounded-b-xl shadow-sm px-6 pb-5 pt-0 relative">
                <div className="flex items-end gap-4 -mt-12">
                    {/* Avatar */}
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md shrink-0 bg-emerald-50">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 text-3xl">
                            <User className="h-12 w-12 text-emerald-600" />
                        </AvatarFallback>
                    </Avatar>

                    {/* Name + badge + subtitle */}
                    <div className="pb-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                            <Badge className="bg-emerald-600 text-white text-xs font-semibold px-3 py-0.5 uppercase tracking-wide">
                                {user.role?.replace("_", " ") || "Job Seeker"}
                            </Badge>
                            <button
                                onClick={onEditClick}
                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                            >
                                <Edit3 className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {user.currentStatus || user.educationLevel?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Job Seeker"}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
