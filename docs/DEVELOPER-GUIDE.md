# 🚀 NextStep Platform - Developer Guide

## 📖 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Convex Integration](#convex-integration)
- [Clerk Authentication](#clerk-authentication)
- [Adding New Features](#adding-new-features)

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
# Copy .env.example to .env.local and add your keys:
# - NEXT_PUBLIC_CONVEX_URL (auto-set by Convex)
# - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# - CLERK_SECRET_KEY

# 3. Run Convex in development mode
npm run convex:dev

# 4. Run Next.js development server (in another terminal)
npm run dev

# 5. Open http://localhost:3000
```

---

## 🏗️ Architecture Overview

### **Convex + Clerk + Next.js Stack**

```
┌─────────────────────────────────────┐
│          FRONTEND (Next.js)         │
│   React Components with Hooks       │
│                                     │
│   Uses useQuery/useMutation         │
└────────────┬────────────────────────┘
             │ Real-time WebSocket
             ▼
┌─────────────────────────────────────┐
│       CONVEX (Database + API)       │
│   Query & Mutation Functions        │
│                                     │
│   Integrated with Clerk Auth        │
└────────────┬────────────────────────┘
             │ Auth Sync
             ▼
┌─────────────────────────────────────┐
│      CLERK (Authentication)         │
│   User management & sessions        │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
nextstep/
├── app/                      # 🎨 FRONTEND - Next.js Pages
│   ├── page.tsx              # Landing page (/)
│   ├── jobs/page.tsx         # Jobs listing (/jobs)
│   ├── mentors/page.tsx      # Find mentors (/mentors)
│   ├── applications/page.tsx # Track applications (/applications)
│   ├── profile/page.tsx      # User profile (/profile)
│   ├── auth/page.tsx         # Login/signup (/auth)
│   ├── layout.tsx            # Global layout (Header + Footer)
│   └── api/                  # 🔌 REST API ROUTES
│       ├── users/route.ts    # GET/POST /api/users
│       ├── opportunities/route.ts
│       └── messages/route.ts
│
├── components/               # 🧩 UI COMPONENTS
│   ├── ui/                   # shadcn/ui (48 components)
│   ├── landing/              # Landing sections (Hero, Features, etc.)
│   ├── pages/                # Full page components
│   ├── layout/               # Header, Footer
│   └── features/             # Domain-specific components
│
├── convex/                   # 🗄️ DATABASE - Convex Serverless
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User queries & mutations
│   ├── opportunities.ts      # Opportunity operations
│   ├── applications.ts       # Application tracking
│   └── messages.ts           # Messaging operations
│
├── lib/                      # 🔧 SHARED UTILITIES
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Helper functions
│
├── public/assets/            # 📁 Static files (images, logo)
└── docs/                     # 📚 Documentation
```

---

## 🔄 Development Workflow

### **1. Frontend Development**

**Location**: `/app` and `/components`

**Example**: Add a new page

```tsx
// app/courses/page.tsx
export default function CoursesPage() {
    return (
        <div>
            <h1>Courses</h1>
            {/* Your UI components */}
        </div>
    );
}
```

**Routing**: Next.js automatically creates routes from folders:

- `/app/courses/page.tsx` → URL: `/courses`
- `/app/profile/page.tsx` → URL: `/profile`

---

### **2. Backend API Development**

**Location**: `/app/api` (HTTP layer) + `/server/api` (business logic)

**Step 1**: Create business logic (pure function)

```typescript
// server/api/courses.ts
import { courses } from "@/server/data/courses";

export function getAllCourses() {
    return courses;
}

export function getCourseById(id: string) {
    return courses.find((course) => course.id === id);
}
```

**Step 2**: Create API route (HTTP endpoint)

```typescript
// app/api/courses/route.ts
import { NextResponse } from "next/server";
import { getAllCourses } from "@/server/api/courses";

export async function GET() {
    const courses = getAllCourses();
    return NextResponse.json(courses);
}
```

**Step 3**: Call from frontend

```tsx
// app/courses/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetch("/api/courses")
            .then((res) => res.json())
            .then((data) => setCourses(data));
    }, []);

    return (
        <div>
            {courses.map((course) => (
                <div key={course.id}>{course.title}</div>
            ))}
        </div>
    );
}
```

---

### **3. Data Layer**

**Location**: `/server/data`

Currently uses **mock data**. In production, replace with database queries.

```typescript
// server/data/courses.ts
export const courses = [
    { id: "1", title: "React Basics", duration: "4 weeks" },
    { id: "2", title: "TypeScript", duration: "3 weeks" },
];
```

**Future (Database)**:

```typescript
// server/data/courses.ts
import { db } from "@/lib/database";

export async function getAllCourses() {
    return await db.courses.findMany();
}
```

---

## 🔗 REST API Pattern

### **Why This Pattern?**

✅ **Clear separation**: Frontend doesn't access data directly  
✅ **Reusable logic**: Business logic works with any client (web, mobile, etc.)  
✅ **Testable**: Test business logic without HTTP layer  
✅ **Scalable**: Easy to replace mock data with real database

### **How It Works**

```
User clicks button
      ↓
Frontend calls: fetch('/api/users')
      ↓
API Route (/app/api/users/route.ts) receives request
      ↓
Calls business logic: getUsers() from /server/api/users.ts
      ↓
Business logic calls: users from /server/data/users.ts
      ↓
Returns data → API route → Frontend
```

---

## ➕ Adding New Features

### **Example: Add "Courses" Feature**

**1. Create data**

```typescript
// server/data/courses.ts
export const courses = [{ id: "1", title: "React Basics" }];
```

**2. Create business logic**

```typescript
// server/api/courses.ts
import { courses } from "@/server/data/courses";
export function getAllCourses() {
    return courses.filter((c) => c.isPublished);
}
```

**3. Create API endpoint**

```typescript
// app/api/courses/route.ts
import { getAllCourses } from "@/server/api/courses";
export async function GET() {
    return NextResponse.json(getAllCourses());
}
```

**4. Create frontend page**

```tsx
// app/courses/page.tsx
"use client";
export default function CoursesPage() {
    // Fetch from /api/courses and display
}
```

**5. Add navigation link**

```tsx
// components/layout/Header.tsx
const navItems = [
    { href: "/courses", label: "Courses" }, // Add this
];
```

---

## 🎨 UI Components

### **Using shadcn/ui**

We use 48 pre-built components from shadcn/ui:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function MyComponent() {
    return (
        <Card>
            <CardContent>
                <Input placeholder="Enter name" />
                <Button>Submit</Button>
            </CardContent>
        </Card>
    );
}
```

**Available components**: button, card, input, dialog, dropdown, tabs, accordion, alert, avatar, badge, calendar, checkbox, and more! Check `components/ui/`

---

## 🔐 Authentication (TODO)

Current: Mock auth (redirect to `/auth`)  
Future: Implement with NextAuth.js, Clerk, or Supabase

---

## 🗄️ Database Migration (TODO)

Replace mock data in `/server/data` with:

- **PostgreSQL** (via Prisma)
- **MongoDB** (via Mongoose)
- **Supabase** (PostgreSQL + Auth)

---

## 📚 Additional Resources

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Detailed architecture
- [TODO.md](docs/TODO.md) - Feature roadmap
- [QUICK-START.md](QUICK-START.md) - Development guide
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)

---

## 🤝 Contributing

1. Create a feature branch
2. Follow the architecture pattern
3. Test your changes
4. Submit a pull request

---

**Questions?** Check the docs or ask the team! 🚀
