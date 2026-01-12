# 🚀 Quick Start Guide - NextStep Refactored

Welcome to the refactored NextStep platform! This guide will help you get up and running quickly.

## 📋 What You Need to Know

### The project now has 3 clear layers:

1. **Frontend** (`/app`, `/components`) - User interface
2. **Business Logic** (`/server/api`) - Core application logic
3. **Data Access** (`/server/data`) - Mock data (will become database queries)

## 🏃 Getting Started in 5 Minutes

### 1. Understand the Structure (2 min)

```
app/              → Pages you see in the browser
components/       → Reusable UI components
server/api/       → Business logic (filtering, validation)
server/data/      → Mock data (will become database)
lib/              → Shared code (types, utilities)
```

### 2. Find What You Need (1 min)

| I want to...     | Go to...                  |
| ---------------- | ------------------------- |
| Change a page    | `app/[page]/page.tsx`     |
| Add a component  | `components/`             |
| Modify data      | `server/data/*.ts`        |
| Change logic     | `server/api/*.ts`         |
| Add API endpoint | `app/api/[name]/route.ts` |
| Update types     | `lib/types.ts`            |

### 3. Make Your First Change (2 min)

**Example: Add a new user**

```typescript
// 1. Go to server/data/users.ts
export const users: User[] = [
    // ... existing users
    {
        id: "6",
        name: "Your Name",
        email: "you@email.com",
        role: "student",
        // ... other fields
    },
];

// 2. That's it! The change is immediately available everywhere
```

## 🎯 Common Tasks

### Task 1: Add a New Page

```typescript
// 1. Create file: app/my-page/page.tsx
export default function MyPage() {
    return <div>My New Page</div>;
}

// 2. Access at: http://localhost:3000/my-page
```

### Task 2: Add a New API Endpoint

```typescript
// 1. Create business logic: server/api/myfeature.ts
export async function getMyData() {
  return { data: [...] };
}

// 2. Create HTTP handler: app/api/myfeature/route.ts
import { getMyData } from '@/server/api/myfeature';

export async function GET() {
  const result = await getMyData();
  return NextResponse.json({ success: true, data: result.data });
}

// 3. Call from frontend:
const response = await fetch('/api/myfeature');
const data = await response.json();
```

### Task 3: Add Mock Data

```typescript
// 1. Add type: lib/types.ts
export interface MyType {
    id: string;
    name: string;
}

// 2. Add data: server/data/mydata.ts
export const myData: MyType[] = [{ id: "1", name: "Example" }];

// 3. Use in pages:
import { myData } from "@/server/data/mydata";
```

## 📖 Documentation

### For Quick Reference

-   **This file** - Quick start and common tasks
-   **README.md** - Project overview and setup

### For Deep Dives

-   **ARCHITECTURE.md** - Complete architecture explanation
-   **MIGRATION-GUIDE.md** - Detailed migration guide
-   **TODO.md** - Feature roadmap

## 💡 Pro Tips

### Tip 1: Follow the Comments

Every file has helpful comments explaining:

-   What the file does
-   How it fits in the architecture
-   What to do for production

### Tip 2: Use the Right Import

```typescript
// ✅ Good - Use specific imports
import { users } from "@/server/data/users";

// ⚠️ Works but deprecated
import { users } from "@/lib/data";
```

### Tip 3: Keep Layers Separate

```typescript
// ✅ API Route - Just HTTP handling
export async function GET(request: NextRequest) {
  const result = await getUsers();  // Call business logic
  return NextResponse.json(result);
}

// ❌ Don't put business logic in API routes
export async function GET(request: NextRequest) {
  let users = [...allUsers];
  users = users.filter(...);  // ❌ This should be in server/api
  users = users.sort(...);    // ❌ This should be in server/api
  return NextResponse.json(users);
}
```

### Tip 4: Check Existing Examples

Before creating something new, look at existing files:

-   Need to add an API? Look at `server/api/users.ts`
-   Need to add data? Look at `server/data/users.ts`
-   Need to add a page? Look at `app/dashboard/page.tsx`

## 🐛 Troubleshooting

### "Cannot find module '@/server/data/users'"

-   Make sure you're using the correct path
-   Check TypeScript paths are configured in `tsconfig.json`

### "Client component can't import server data"

-   Client components (with `'use client'`) must use API calls
-   Server components can import data directly

### "Where do I put my code?"

1. Data? → `server/data/`
2. Logic? → `server/api/`
3. HTTP? → `app/api/`
4. UI? → `app/` or `components/`
5. Types? → `lib/types.ts`
6. Utils? → `lib/utils.ts`

## 🎓 Learning Path

### Day 1: Basics

1. Read this guide ✓
2. Browse the `server/` folder
3. Look at one API route
4. Make a small change to mock data

### Day 2: Understanding

1. Read ARCHITECTURE.md
2. Trace a request from frontend to backend
3. Add a new field to existing data
4. Create a new helper function

### Day 3: Building

1. Add a new feature
2. Follow the examples in MIGRATION-GUIDE.md
3. Write comprehensive comments
4. Test your changes

## 🚀 Ready to Code?

You now know:

-   ✅ How the project is structured
-   ✅ Where to find things
-   ✅ How to make common changes
-   ✅ Where to get more help

**Start coding and refer to the docs when needed!**

---

## 📚 Quick Links

-   [../README.md](../README.md) - Project overview
-   [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture
-   [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md) - Complete migration guide
-   [TODO.md](TODO.md) - What to build next

---

**Questions?** Check the inline code comments - they're comprehensive!

**Happy coding!** 🎉
