# Authentication Quick Reference

## Client-Side Authentication

### 1. Using the useAuth Hook (Recommended)

```typescript
import { useAuth } from '@/lib/hooks';

function MyComponent() {
    const { user, isAuthenticated, isLoading, isStudent, isMentor, isEmployer } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please sign in</div>;

    return <div>Welcome, {user?.name}!</div>;
}
```

### 2. Get Current User

```typescript
import { useCurrentUser } from "@/lib/hooks";

function MyComponent() {
    const user = useCurrentUser();
    // user: CurrentUser | null | undefined
    // - null = not authenticated
    // - undefined = loading
}
```

### 3. Get Current Session

```typescript
import { useCurrentSession } from "@/lib/hooks";

function MyComponent() {
    const session = useCurrentSession();
    // session: { id, email, name, role, avatarUrl, userId } | null | undefined
}
```

### 4. Direct Convex Query

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
    const user = useQuery(api.functions.users.getCurrentUser);
    const session = useQuery(api.functions.users.getCurrentSession);
}
```

## Server-Side Authentication

### 1. In Server Components

```typescript
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Fetch user data from Convex if needed
    return <div>Protected Content</div>;
}
```

### 2. In API Routes

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    return Response.json({ userId });
}
```

### 3. In Convex Functions

```typescript
export const myQuery = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Get user from database
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    },
});
```

## Protected Routes

### Component-Level Protection

```typescript
import { useAuth } from '@/lib/hooks';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedPage() {
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            redirect('/sign-in');
        }
    }, [isLoading, isAuthenticated]);

    if (isLoading) return <div>Loading...</div>;

    return <div>Protected Content</div>;
}
```

### Middleware Protection

In `middleware.ts`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

## Common Patterns

### Conditional Rendering by Role

```typescript
const { isStudent, isMentor, isEmployer } = useAuth();

return (
    <div>
        {isStudent && <StudentDashboard />}
        {isMentor && <MentorDashboard />}
        {isEmployer && <EmployerDashboard />}
    </div>
);
```

### Loading States

```typescript
const { user, isLoading } = useAuth();

if (isLoading) {
    return <Skeleton />;
}

return <div>{user?.name}</div>;
```

### Checking Authentication

```typescript
const { isAuthenticated } = useAuth();

return (
    <div>
        {isAuthenticated ? (
            <UserMenu />
        ) : (
            <SignInButton />
        )}
    </div>
);
```

## User Data Structure

```typescript
type CurrentUser = {
    _id: Id<"users">;
    clerkId: string;
    email: string;
    name: string;
    role: "student" | "mentor" | "employer";
    avatarUrl?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    educationLevel?: string;
    currentStatus?: string;
    lookingFor?: string[];
    profileCompletion?: number;
    isOnboardingComplete?: boolean;
    // ... more fields
};

type UserSession = {
    id: string; // Clerk ID
    email: string;
    name: string;
    role: "student" | "mentor" | "employer";
    avatarUrl?: string;
    userId: Id<"users">; // Convex user ID
};
```

## Migration Checklist

- [x] Removed `/api/auth/session` route
- [x] Removed `/api/auth/user` route
- [x] Created `useAuth` hook
- [x] Created `useCurrentUser` hook
- [x] Created `useCurrentSession` hook
- [x] Added `getCurrentSession` Convex query
- [x] Updated documentation

## Next Steps

1. Update components using old auth API routes
2. Replace API calls with Convex hooks
3. Test authentication flow
4. Verify protected routes work
5. Test role-based access control
