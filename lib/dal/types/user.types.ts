/**
 * User-related types
 */

import { Id } from "@/convex/_generated/dataModel";

export type UserRole = "student" | "mentor" | "employer";

export interface User {
    _id: Id<"users">;
    _creationTime: number;
    clerkId: string;
    name: string;
    email: string;
    role: UserRole;
    bio?: string;
    skills?: string[];
    location?: string;
    avatarUrl?: string;
    createdAt: number;
}

export interface UserSession {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatarUrl?: string;
}
