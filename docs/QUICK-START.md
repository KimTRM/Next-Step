# 🚀 Quick Start Guide - NextStep

Welcome to the NextStep platform! This guide will help you get up and running quickly.

## 📋 What You Need to Know

### The app follows a clean REST API architecture:

1. **Frontend** (`app/`) - Next.js pages with proper routing
2. **REST API** (`app/api/`) - HTTP endpoints
3. **Business Logic** (`server/api/`) - Pure functions
4. **Data Layer** (`server/data/`) - Mock data (future: database)
5. **UI Components** (`components/ui/`) - 48 shadcn/ui components

## 🏃 Getting Started in 5 Minutes

### 1. Understand the Structure (2 min)

```
app/              → Pages & API routes
  ├─ page.tsx     → Landing page (/)
  ├─ jobs/        → Jobs page (/jobs)
  ├─ api/         → REST API endpoints
components/       → UI components
server/api/       → Business logic
server/data/      → Mock data
```

### 2. How Navigation Works (1 min)

Next.js **file-based routing**:

```
app/jobs/page.tsx     → URL: /jobs
app/profile/page.tsx  → URL: /profile
```

Navigation:

```tsx
import Link from "next/link";
<Link href="/jobs">View Jobs</Link>;
```

| I want to...    | Go to...              |
| --------------- | --------------------- |
| Change a page   | `app/[page]/page.tsx` |
| Add a component | `components/`         |
| Modify database | `convex/*.ts`         |
| Update types    | `lib/types.ts`        |
| Add webhook     | `app/api/webhooks/`   |

### 3. Make Your First Change (2 min)

**Example: Query users in a component**

```typescript
// In any React component
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MyComponent() {
    const users = useQuery(api.users.getUsers);

    return (
        <div>
            {users?.map(user => (
                <div key={user._id}>{user.name}</div>
            ))}
        </div>
    );
}
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

### Task 2: Add a Database Mutation

```typescript
// 1. Add to convex/myfeature.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createItem = mutation({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const itemId = await ctx.db.insert("items", { name: args.name });
        return itemId;
    },
});

// 2. Use in component
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const createItem = useMutation(api.myfeature.createItem);
await createItem({ name: "My Item" });
```

### Task 3: Query Data in a Component

```typescript
// Use Convex real-time queries
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function MyComponent() {
  const opportunities = useQuery(api.opportunities.getOpportunities);

  if (!opportunities) return <div>Loading...</div>;

  return (
    <div>
      {opportunities.map(opp => (
        <div key={opp._id}>{opp.title}</div>
      ))}
    </div>
  );
}
```

## 📖 Documentation

### For Quick Reference

- **This file** - Quick start and common tasks
- **README.md** - Project overview and setup

### For Deep Dives

- **ARCHITECTURE.md** - Complete architecture explanation
- **DEVELOPER-GUIDE.md** - Development workflow and patterns
- **TODO.md** - Feature roadmap

## 💡 Pro Tips

### Tip 1: Use Convex Real-Time Queries

```typescript
// ✅ Automatically updates when data changes
const users = useQuery(api.users.getUsers);

// No need for manual refetching!
```

### Tip 2: Mutations for Data Changes

```typescript
// ✅ Use mutations for all data modifications
const updateProfile = useMutation(api.userMutations.updateUser);
await updateProfile({ userId, ...updates });
```

### Tip 3: Check Existing Examples

Before creating something new, look at existing files:

- Need to add a query? Look at `convex/users.ts`
- Need to add a mutation? Look at `convex/userMutations.ts`
- Need to add a page? Look at `app/dashboard/page.tsx`
- Need to use auth? Look at `app/profile/page.tsx`

## 🐛 Troubleshooting

### "Cannot find module '@/convex/\_generated/api'"

- Make sure Convex is running: `npm run convex:dev`
- Check that code generation completed successfully

### "useQuery is not a function"

- Ensure component is wrapped in ConvexProvider (check `app/providers.tsx`)
- Make sure you're using `"use client"` directive in client components

- Client components (with `'use client'`) must use API calls
- Server components can import data directly

### "Where do I put my code?"

1. Data? → `server/data/`
2. Logic? → `server/api/`
3. HTTP? → `app/api/`
4. UI? → `app/` or `components/`
5. Types? → `lib/types.ts`
6. Utils? → `lib/utils.ts`

## 🎓 Learning Path

### Authentication errors

- Verify Clerk keys in `.env.local`
- Check webhook configuration
- Ensure user is signed in before accessing protected data

## 📅 Learning Path

### Day 1: Setup & Basics

1. Read this guide ✓
2. Set up Convex + Clerk (see CONVEX-QUICKSTART.md)
3. Browse the `convex/` folder
4. Make a test query in a component

### Day 2: Understanding

1. Read ARCHITECTURE.md
2. Trace data flow from UI to database
3. Try creating a simple mutation
4. Explore the dashboard page implementation

### Day 3: Building

1. Add a new feature
2. Follow the examples in DEVELOPER-GUIDE.md
3. Use TypeScript types effectively
4. Test your changes

## 🚀 Ready to Code?

You now know:

- ✅ How the project is structured
- ✅ Where to find things
- ✅ How to make common changes
- ✅ Where to get more help

**Start coding and refer to the docs when needed!**

---

## 📚 Quick Links

- [../README.md](../README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Detailed architecture
- [DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md) - Development guide
- [TODO.md](TODO.md) - What to build next
- [Convex Docs](https://docs.convex.dev/) - Database documentation
- [Clerk Docs](https://clerk.com/docs) - Authentication documentation

---

**Questions?** Check the documentation or the inline code comments!

**Happy coding!** 🎉
