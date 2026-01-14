# Migration Guide - Refactored Architecture

This guide helps you understand the changes made to the NextStep project structure and how to work with the new architecture.

## 🔄 What Changed?

### Before (Old Structure)

```
├── app/
│   ├── api/
│   │   └── users/route.ts        # ❌ Mixed HTTP + business logic + data
│   └── dashboard/page.tsx         # Used: import { users } from '@/lib/data'
├── lib/
│   └── data.ts                    # ❌ All data in one large file
```

### After (New Structure)

```
├── app/
│   ├── api/
│   │   └── users/route.ts        # ✅ Only HTTP handling
│   └── dashboard/page.tsx         # Uses: import { users } from '@/server/data/users'
├── server/
│   ├── api/
│   │   └── users.ts               # ✅ Business logic layer
│   └── data/
│       └── users.ts                # ✅ Data access layer
```

---

## 📦 Key Changes

### 1. Data Split into Separate Files

**Old**: All data in `lib/data.ts`

```typescript
// lib/data.ts
export const users = [...];
export const opportunities = [...];
export const messages = [...];
```

**New**: Organized by domain in `server/data/`

```typescript
// server/data/users.ts
export const users = [...];
export const getUserById = (id) => {...};

// server/data/opportunities.ts
export const opportunities = [...];
export const getOpportunityById = (id) => {...};

// server/data/messages.ts
export const messages = [...];
export const getUserMessages = (userId) => {...};
```

### 2. Business Logic Extracted

**Old**: Logic mixed in API routes

```typescript
// app/api/users/route.ts
export async function GET(request) {
    let filteredUsers = [...users];
    if (role) {
        filteredUsers = filteredUsers.filter((user) => user.role === role);
    }
    // ... more logic
    return NextResponse.json({ data: filteredUsers });
}
```

**New**: Logic in separate layer

```typescript
// server/api/users.ts
export async function getAllUsers(filters?: { role?: string }) {
    let filteredUsers = [...users];
    if (filters?.role) {
        filteredUsers = getUsersByRole(filters.role);
    }
    return { users: filteredUsers, count: filteredUsers.length };
}

// app/api/users/route.ts
export async function GET(request) {
    const role = request.nextUrl.searchParams.get("role");
    const result = await getAllUsers({ role });
    return NextResponse.json({ success: true, data: result.users });
}
```

### 3. Import Paths Updated

**Old Imports** (still work for backward compatibility):

```typescript
import { users, opportunities, messages } from "@/lib/data";
```

**New Imports** (recommended):

```typescript
// For frontend pages
import { users } from "@/server/data/users";
import { opportunities } from "@/server/data/opportunities";
import { messages } from "@/server/data/messages";

// For API logic
import { getAllUsers } from "@/server/api/users";
import { getAllOpportunities } from "@/server/api/opportunities";
import { getMessages } from "@/server/api/messages";
```

---

## 🚀 How to Work with the New Structure

### Adding a New Feature

#### Example: Add "Bookmarks" Feature

**Step 1: Add Type Definition**

```typescript
// lib/types.ts
export interface Bookmark {
    id: string;
    userId: string;
    opportunityId: string;
    createdAt: string;
}
```

**Step 2: Create Data Layer**

```typescript
// server/data/bookmarks.ts
import { Bookmark } from "@/lib/types";

export const bookmarks: Bookmark[] = [];

export const getUserBookmarks = (userId: string): Bookmark[] => {
    return bookmarks.filter((b) => b.userId === userId);
};
```

**Step 3: Create Business Logic**

```typescript
// server/api/bookmarks.ts
import { bookmarks, getUserBookmarks } from "@/server/data/bookmarks";

export async function getBookmarksForUser(userId: string) {
    const userBookmarks = getUserBookmarks(userId);
    return { bookmarks: userBookmarks, count: userBookmarks.length };
}

export async function addBookmark(userId: string, opportunityId: string) {
    // Validation logic
    // Add bookmark
    // Return result
}
```

**Step 4: Create API Route**

```typescript
// app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getBookmarksForUser, addBookmark } from "@/server/api/bookmarks";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const result = await getBookmarksForUser(userId);
    return NextResponse.json({ success: true, data: result.bookmarks });
}

export async function POST(request: NextRequest) {
    const { userId, opportunityId } = await request.json();
    const result = await addBookmark(userId, opportunityId);
    return NextResponse.json({ success: true, data: result });
}
```

**Step 5: Use in Frontend**

```typescript
// app/dashboard/page.tsx
const response = await fetch("/api/bookmarks?userId=1");
const { data } = await response.json();
```

---

## 🔍 Finding Things

### "Where do I find...?"

| What                 | Location                 | Purpose                                |
| -------------------- | ------------------------ | -------------------------------------- |
| User data            | `server/data/users.ts`   | Mock user records                      |
| User queries         | `server/data/users.ts`   | Helper functions (getUserById, etc.)   |
| User filtering logic | `server/api/users.ts`    | Business logic for filtering/searching |
| User API endpoint    | `app/api/users/route.ts` | HTTP request handler                   |
| User interface       | `app/profile/page.tsx`   | Profile page UI                        |
| User types           | `lib/types.ts`           | TypeScript interfaces                  |

### "Where do I add...?"

| What to Add        | Where to Add It                          |
| ------------------ | ---------------------------------------- |
| New data field     | `lib/types.ts` → Update interface        |
| New data record    | `server/data/*.ts` → Add to array        |
| New query function | `server/data/*.ts` → Export function     |
| New business logic | `server/api/*.ts` → Export function      |
| New API endpoint   | `app/api/[name]/route.ts` → Create route |
| New page           | `app/[name]/page.tsx` → Create page      |
| New component      | `components/` → Create component         |

---

## ✅ Checklist for Code Reviews

When reviewing code, check:

-   [ ] Is data in `/server/data`?
-   [ ] Is business logic in `/server/api`?
-   [ ] Are API routes thin (just HTTP handling)?
-   [ ] Are types defined in `/lib/types.ts`?
-   [ ] Are imports using new paths (`@/server/data/*`)?
-   [ ] Are there helpful comments explaining the code?
-   [ ] Are production improvement suggestions included?
-   [ ] Is error handling implemented?

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/server/data/users'"

**Solution**: Make sure TypeScript paths are configured in `tsconfig.json`:

```json
{
    "compilerOptions": {
        "paths": {
            "@/*": ["./*"]
        }
    }
}
```

### Issue: "Module not found: Can't resolve '@/lib/data'"

**Solution**: Either:

1. Update import to new path: `@/server/data/users`
2. Or use the deprecated `@/lib/data` (still works but not recommended)

### Issue: Client component can't import server data directly

**Problem**:

```typescript
"use client";
import { users } from "@/server/data/users"; // ❌ Error
```

**Solution**: Use API calls in client components:

```typescript
"use client";
const response = await fetch("/api/users");
const { data } = await response.json(); // ✅ Correct
```

---

## 📚 Additional Resources

-   [ARCHITECTURE.md](ARCHITECTURE.md) - Complete architecture documentation
-   [TODO.md](TODO.md) - Feature roadmap and tasks
-   [Next.js App Router Docs](https://nextjs.org/docs/app) - Official Next.js docs

---

## 🤝 Getting Help

If you have questions about the new structure:

1. Check [ARCHITECTURE.md](ARCHITECTURE.md) for detailed explanations
2. Look at existing examples in the codebase
3. Check the inline comments in the code
4. Ask in the team chat

---

**Remember**: The goal of this refactoring is to make the codebase:

-   ✅ Easier to understand
-   ✅ Easier to test
-   ✅ Easier to scale
-   ✅ Ready for production database integration

Happy coding! 🚀
