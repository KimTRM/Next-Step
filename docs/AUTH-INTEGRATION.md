# Authentication Integration with Convex

This document explains how authentication is integrated between Clerk and Convex in the Next-Step platform.

## Architecture

The authentication system uses:

- **Clerk** for user authentication and session management
- **Convex** for user data storage and real-time queries
- **Convex Queries** for fetching authenticated user data

## Configuration

### Convex Auth Config

Located at `convex/auth.config.js`:

```javascript
const authConfig = {
    providers: [
        {
            domain: "https://crisp-hyena-26.clerk.accounts.dev",
            applicationID: "convex",
        },
    ],
};
```

## Client-Side Usage

### Using the useAuth Hook

```typescript
import { useAuth, useCurrentUser, useCurrentSession } from '@/lib/hooks';

function MyComponent() {
    // Get full user object
    const user = useCurrentUser();

    // Get simplified session
    const session = useCurrentSession();

    // Get auth status
    const { user, isAuthenticated, isLoading, isStudent, isMentor } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please sign in</div>;

    return <div>Welcome, {user?.name}!</div>;
}
```

### Direct Convex Queries

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function MyComponent() {
    const currentUser = useQuery(api.functions.users.getCurrentUser);
    const session = useQuery(api.functions.users.getCurrentSession);

    // Returns null if not authenticated
    // Returns undefined while loading
}
```

## Server-Side Usage

### In Server Components or API Routes

```typescript
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET() {
    // Get user ID
    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get full user details from Clerk
    const user = await currentUser();

    // Query Convex to get user data
    const convexUser = await queryConvex(api.functions.users.getUserByClerkId, {
        clerkId: userId,
    });

    return Response.json({ user: convexUser });
}
```

### In Convex Functions

```typescript
import { mutation, query } from "./_generated/server";

export const myQuery = query({
    args: {},
    handler: async (ctx) => {
        // Get authenticated user identity
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Query user from database
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .unique();

        return user;
    },
});
```

## Available Convex Auth Functions

### Queries

#### `getCurrentUser`

Returns the full user document for the authenticated user.

```typescript
const user = useQuery(api.functions.users.getCurrentUser);
// Returns: User | null | undefined
```

#### `getCurrentSession`

Returns simplified session data.

```typescript
const session = useQuery(api.functions.users.getCurrentSession);
// Returns: { id, email, name, role, avatarUrl, userId } | null | undefined
```

#### `getUserByClerkId`

Get user by Clerk ID (useful in server-side code).

```typescript
const user = await queryConvex(api.functions.users.getUserByClerkId, {
    clerkId: "user_123",
});
```

### Mutations

#### `upsertUser`

Create or update user (typically called from Clerk webhooks).

```typescript
await mutateConvex(api.functions.userMutations.upsertUser, {
    clerkId: "user_123",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    avatarUrl: "https://...",
});
```

## User Synchronization

Users are synchronized between Clerk and Convex via:

1. **Clerk Webhooks** - When users sign up or update their profile in Clerk
2. **Webhook Handler** - Located at `/api/webhooks/clerk`
3. **Convex Mutation** - Calls `upsertUser` to create/update user in Convex

## Protected Routes

### Middleware Protection

Configure in `middleware.ts`:

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Component-Level Protection

```typescript
import { useAuth } from '@/lib/hooks';
import { redirect } from 'next/navigation';

function ProtectedPage() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) {
        redirect('/sign-in');
    }

    return <div>Protected Content</div>;
}
```

## Best Practices

1. **Use hooks for client components** - `useAuth()`, `useCurrentUser()`
2. **Use Convex queries directly** when you need real-time updates
3. **Check authentication in Convex functions** - Always verify `ctx.auth.getUserIdentity()`
4. **Don't expose sensitive data** - Use public profile queries when needed
5. **Handle loading states** - Auth queries return `undefined` while loading

## Migration from API Routes

Previously, authentication was handled through API routes:

- `/api/auth/session` ❌ Removed
- `/api/auth/user` ❌ Removed

Now use Convex queries directly:

- `useCurrentUser()` ✅
- `useCurrentSession()` ✅
- Direct Convex queries ✅

This provides:

- Real-time updates
- Better performance
- Simplified architecture
- No API route overhead
