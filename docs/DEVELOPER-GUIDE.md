# 🚀 NextStep - Developer Guide

**Last Updated:** January 18, 2026

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Architecture Patterns](#architecture-patterns)
- [Feature Development](#feature-development)
- [API Development](#api-development)
- [Component Development](#component-development)
- [Database Operations](#database-operations)
- [Testing](#testing)
- [Best Practices](#best-practices)

---

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone <repository-url>
cd next-step
npm install

# 2. Environment setup
cp .env.example .env.local
# Add Clerk and Convex keys

# 3. Start Convex (Terminal 1)
npm run convex:dev

# 4. Start Next.js (Terminal 2)
npm run dev

# 5. Open http://localhost:3000
```

---

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- VS Code (recommended)
- Clerk account (free)
- Convex account (free)

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### VS Code Extensions (Recommended)

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

---

## 🏗️ Architecture Patterns

### DAL (Data Access Layer) Pattern

**Every feature follows this structure:**

```
1. Define Types (lib/dal/types/*.types.ts)
2. Create DAL Service (lib/dal/server/*-service.ts)
3. Build API Routes (app/api/*)
4. Develop Components (components/features/*)
5. Create Pages (app/(platform)/*)
```

### Example: Complete Feature Implementation

#### 1. Define Types

```typescript
// lib/dal/types/job.types.ts
import { Id } from "@/convex/_generated/dataModel";

export interface Job {
    _id: Id<"jobs">;
    title: string;
    company: string;
    location: string;
    description: string;
    postedBy: Id<"users">;
    postedDate: number;
    isActive: boolean;
}

export interface JobSearchParams {
    query?: string;
    employmentType?: string;
    jobCategory?: string;
    page?: number;
    limit?: number;
}
```

#### 2. Create DAL Service

```typescript
// lib/dal/server/job-service.ts
import { api } from "@/convex/_generated/api";
import { queryConvex } from "./convex";
import { DALError } from "./dal-error";
import type { Job, JobSearchParams } from "../types/job.types";

export class JobDAL {
    /**
     * Search jobs with filters
     */
    static async searchJobs(
        params: JobSearchParams,
        auth?: string,
    ): Promise<{ jobs: Job[]; total: number }> {
        try {
            const result = await queryConvex(api.jobs.searchJobs, params, auth);
            return result as { jobs: Job[]; total: number };
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to search jobs",
                error,
            );
        }
    }

    /**
     * Get job by ID
     */
    static async getJobById(jobId: string, auth?: string): Promise<Job | null> {
        try {
            const result = await queryConvex(
                api.jobs.getJobById,
                { id: jobId },
                auth,
            );
            return result as Job | null;
        } catch (error) {
            throw new DALError("DATABASE_ERROR", "Failed to get job", error);
        }
    }
}
```

#### 3. Build API Routes

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { JobDAL } from "@/lib/dal/server";

/**
 * GET /api/jobs - Search and list jobs
 */
export async function GET(req: NextRequest) {
    try {
        // 1. AUTH CHECK
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { message: "Unauthorized" } },
                { status: 401 },
            );
        }

        // 2. GET AUTH TOKEN
        const token = await auth().then((auth) =>
            auth.getToken({ template: "convex" }),
        );

        // 3. PARSE PARAMETERS
        const { searchParams } = new URL(req.url);
        const params = {
            query: searchParams.get("query") || undefined,
            employmentType: searchParams.get("employmentType") || undefined,
            jobCategory: searchParams.get("jobCategory") || undefined,
            page: parseInt(searchParams.get("page") || "1"),
            limit: parseInt(searchParams.get("limit") || "12"),
        };

        // 4. CALL DAL
        const result = await JobDAL.searchJobs(params, token || undefined);

        // 5. RETURN RESPONSE
        return NextResponse.json({
            success: true,
            data: result.jobs,
            meta: {
                total: result.total,
                page: params.page,
                limit: params.limit,
            },
        });
    } catch (error) {
        console.error("GET /api/jobs error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        error instanceof Error ?
                            error.message
                        :   "Internal server error",
                },
            },
            { status: 500 },
        );
    }
}
```

#### 4. Develop Components

```typescript
// components/features/jobs/JobsPageContent.tsx
'use client';

import { useEffect, useState } from 'react';
import { JobCard } from './JobCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { Job } from '@/lib/dal/types/job.types';

export function JobsPageContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch jobs
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    (async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.set('query', searchTerm);

        const res = await fetch(`/api/jobs?${params.toString()}`, {
          signal: controller.signal,
        });
        const json = await res.json();

        if (res.ok && json.success) {
          setJobs(json.data || []);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Failed to load jobs:', error);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
```

#### 5. Create Pages

```typescript
// app/(platform)/jobs/page.tsx
import { JobsPageContent } from '@/components/features/jobs/JobsPageContent';

export default function JobsPage() {
  return <JobsPageContent />;
}
```

---

## 🔌 API Development

### API Route Structure

```typescript
// app/api/[feature]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FeatureDAL } from "@/lib/dal/server";

export async function GET(req: NextRequest) {
    try {
        // 1. Authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: { message: "Unauthorized" } },
                { status: 401 },
            );
        }

        // 2. Get token
        const token = await auth().then((auth) =>
            auth.getToken({ template: "convex" }),
        );

        // 3. Parse parameters
        const { searchParams } = new URL(req.url);
        const params = {
            // ... extract params
        };

        // 4. Validate input (if needed)
        if (!params.required) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: "Missing required parameter" },
                },
                { status: 400 },
            );
        }

        // 5. Call DAL
        const data = await FeatureDAL.getData(params, token || undefined);

        // 6. Return response
        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    message:
                        error instanceof Error ? error.message : "Server error",
                },
            },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId)
            return NextResponse.json({ success: false }, { status: 401 });

        const token = await auth().then((auth) =>
            auth.getToken({ template: "convex" }),
        );
        const body = await req.json();

        // Validate body
        if (!body.field) {
            return NextResponse.json(
                { success: false, error: { message: "Invalid input" } },
                { status: 400 },
            );
        }

        const result = await FeatureDAL.create(body, token || undefined);

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: { message: "Server error" } },
            { status: 500 },
        );
    }
}
```

### Response Format

**Success:**

```json
{
    "success": true,
    "data": {
        /* your data */
    },
    "meta": {
        /* optional metadata */
    }
}
```

**Error:**

```json
{
    "success": false,
    "error": {
        "code": "ERROR_CODE",
        "message": "Human-readable message"
    }
}
```

---

## 🧩 Component Development

### Component Structure

```typescript
// components/features/[feature]/ComponentName.tsx

'use client'; // If using hooks or client features

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ComponentProps {
  data: SomeType;
  onAction?: () => void;
}

export function ComponentName({ data, onAction }: ComponentProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      // Do something
      onAction?.();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold">{data.title}</h3>
      <Button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : 'Action'}
      </Button>
    </Card>
  );
}
```

### Design System Usage

```typescript
// Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Use Tailwind classes
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 className="text-4xl font-bold text-gray-900 mb-6">Title</h1>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Content */}
  </div>
</div>

// Use gradients
<div className="bg-linear-to-br from-white via-blue-50/30 to-blue-100/20">
  {/* Content */}
</div>
```

---

## 🗄️ Database Operations

### Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    jobs: defineTable({
        title: v.string(),
        company: v.string(),
        location: v.string(),
        description: v.string(),
        postedBy: v.id("users"),
        postedDate: v.number(),
        isActive: v.boolean(),
    }).index("by_company", ["company"]),
});
```

### Convex Queries

```typescript
// convex/jobs.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const searchJobs = query({
    args: {
        query: v.optional(v.string()),
        page: v.optional(v.number()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { query, page = 1, limit = 12 } = args;

        let jobsQuery = ctx.db
            .query("jobs")
            .filter((q) => q.eq(q.field("isActive"), true));

        if (query) {
            jobsQuery = jobsQuery.filter((q) =>
                q.or(
                    q.eq(q.field("title"), query),
                    q.eq(q.field("company"), query),
                ),
            );
        }

        const jobs = await jobsQuery.order("desc").take(limit * page);

        return {
            jobs: jobs.slice((page - 1) * limit, page * limit),
            total: jobs.length,
        };
    },
});
```

### Convex Mutations

```typescript
// convex/jobs.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createJob = mutation({
    args: {
        title: v.string(),
        company: v.string(),
        location: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const userId = identity.subject;

        return await ctx.db.insert("jobs", {
            ...args,
            postedBy: userId,
            postedDate: Date.now(),
            isActive: true,
        });
    },
});
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Authentication works (sign in/out)
- [ ] Protected routes redirect when not authenticated
- [ ] Data loads correctly
- [ ] Forms submit successfully
- [ ] Error states display properly
- [ ] Loading states show
- [ ] Responsive on mobile
- [ ] Browser console has no errors

### Testing API Routes

```bash
# Using curl
curl http://localhost:3000/api/jobs

# Using browser dev tools
fetch('/api/jobs')
  .then(r => r.json())
  .then(console.log)
```

---

## ✅ Best Practices

### TypeScript

```typescript
// ✅ Good: Type everything
interface User {
    id: string;
    name: string;
}

function getUser(id: string): Promise<User | null> {
    // ...
}

// ❌ Bad: Using any
function getUser(id: any): any {
    // ...
}
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
try {
    const data = await fetchData();
    return data;
} catch (error) {
    console.error("Failed to fetch:", error);
    throw new DALError("FETCH_ERROR", "Failed to fetch data", error);
}

// ❌ Bad: Swallowing errors
try {
    const data = await fetchData();
} catch (error) {
    // Silent failure
}
```

### Component Structure

```typescript
// ✅ Good: Clear, focused components
export function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{job.company}</p>
      </CardContent>
    </Card>
  );
}

// ❌ Bad: Too much in one component
export function JobsPage() {
  // 500 lines of code with everything mixed together
}
```

### API Design

```typescript
// ✅ Good: RESTful, predictable
GET    /api/jobs          // List jobs
GET    /api/jobs/[id]     // Get job
POST   /api/jobs          // Create job
PATCH  /api/jobs/[id]     // Update job
DELETE /api/jobs/[id]     // Delete job

// ❌ Bad: Unclear, inconsistent
GET /api/getJobs
POST /api/addNewJob
GET /api/job-detail?id=123
```

---

## 🚀 Common Commands

```bash
# Development
npm run dev              # Start Next.js
npm run convex:dev       # Start Convex

# Building
npm run build            # Production build
npm run type-check       # Check TypeScript

# Convex
npx convex dev           # Run Convex dev
npx convex deploy        # Deploy functions
npx convex dashboard     # Open dashboard
npx convex import        # Import data

# Git
git checkout -b feature/new-feature
git add .
git commit -m "feat: Add new feature"
git push origin feature/new-feature
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated:** January 18, 2026
