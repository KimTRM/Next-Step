# NextStep - Architecture Documentation

## 📁 Project Structure Overview

This document explains the refactored folder structure that separates frontend and backend concerns for better code organization and scalability.

```
nextstep/
├── app/                          # 🎨 FRONTEND - Next.js App Router Pages
│   ├── layout.tsx                # Root layout with Navbar
│   ├── page.tsx                  # Landing page
│   ├── auth/page.tsx             # Login/signup
│   ├── dashboard/page.tsx        # User dashboard
│   ├── profile/page.tsx          # User profile
│   ├── opportunities/            # Opportunities pages
│   │   ├── page.tsx              # List all opportunities
│   │   └── [id]/page.tsx         # Opportunity details
│   ├── applications/page.tsx     # Application tracking
│   ├── messages/page.tsx         # Messaging interface
│   └── api/                      # 🔌 API Route Handlers (HTTP layer)
│       ├── users/route.ts        # User endpoints
│       ├── opportunities/route.ts # Opportunity endpoints
│       └── messages/route.ts     # Message endpoints
│
├── components/                   # 🧩 FRONTEND - Reusable UI Components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/                   # Layout components
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── features/                 # Feature-specific components
│       ├── profile/ProfileForm.tsx
│       └── opportunities/OpportunityCard.tsx
│
├── server/                       # 🗄️ BACKEND - Server-Side Logic & Data
│   ├── api/                      # Business logic layer
│   │   ├── users.ts              # User business logic
│   │   ├── opportunities.ts      # Opportunity business logic
│   │   └── messages.ts           # Message business logic
│   └── data/                     # Data access layer (mock data)
│       ├── users.ts              # User data & queries
│       ├── opportunities.ts      # Opportunity data & queries
│       ├── messages.ts           # Message data & queries
│       └── applications.ts       # Application data & queries
│
├── lib/                          # 🔧 SHARED - Used by Both Frontend & Backend
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   └── data.ts                   # (DEPRECATED) Re-exports for compatibility
│
├── public/assets/                # 📁 Static assets (images, icons)
├── README.md                     # Project documentation
├── ARCHITECTURE.md               # This file
├── TODO.md                       # Feature roadmap
├── package.json                  # Dependencies
└── next.config.ts                # Next.js configuration
```

---

## 🏗️ Architecture Layers

### 1. Frontend Layer (`/app` & `/components`)

**Purpose**: User interface and user experience

**Components**:

-   **Pages** (`/app`): Next.js pages using App Router
-   **UI Components** (`/components`): Reusable React components
-   **Client Components**: Interactive components with state (marked with `'use client'`)
-   **Server Components**: Server-side rendered pages (default in App Router)

**Key Principles**:

-   Import data from `/server/data` for server components
-   Use API calls (`fetch('/api/...')`) for client components
-   Keep UI logic separate from business logic
-   Use TypeScript types from `/lib/types.ts`

**Example**:

```typescript
// Server Component (can import server data directly)
import { opportunities } from "@/server/data/opportunities";

// Client Component (should use API calls)
const response = await fetch("/api/opportunities");
const data = await response.json();
```

---

### 2. HTTP Layer (`/app/api/**/route.ts`)

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:

-   Parse request parameters
-   Call business logic functions
-   Format responses
-   Handle errors
-   Return appropriate HTTP status codes

**Key Principles**:

-   Thin layer - minimal logic
-   Delegate to business logic in `/server/api`
-   Consistent response format
-   Proper error handling

**Example**:

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAllUsers } from "@/server/api/users";

export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const result = await getAllUsers({ role: params.get("role") });
        return NextResponse.json({ success: true, data: result.users });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Failed" },
            { status: 500 }
        );
    }
}
```

---

### 3. Business Logic Layer (`/server/api`)

**Purpose**: Core application logic and data processing

**Responsibilities**:

-   Data filtering and sorting
-   Input validation
-   Business rules enforcement
-   Data transformation
-   Aggregation logic

**Key Principles**:

-   Pure functions (no HTTP concerns)
-   Reusable across different endpoints
-   Well-documented and commented
-   Easy to test

**Example**:

```typescript
// server/api/users.ts
export async function getAllUsers(filters?: { role?: string }) {
    let filteredUsers = [...users];

    if (filters?.role) {
        filteredUsers = getUsersByRole(filters.role);
    }

    return { users: filteredUsers, count: filteredUsers.length };
}
```

---

### 4. Data Access Layer (`/server/data`)

**Purpose**: Data storage and retrieval (currently mock data)

**Responsibilities**:

-   Store data (mock arrays for now)
-   Provide query functions
-   Data access helpers

**Key Principles**:

-   Abstracted from business logic
-   Easy to replace with real database
-   Includes helper functions for common queries
-   Well-documented for future migration

**Example**:

```typescript
// server/data/users.ts
export const users: User[] = [...]; // Mock data

export const getUserById = (id: string) => {
  return users.find(user => user.id === id);
};

// Future: Replace with
// return await db.users.findUnique({ where: { id } });
```

---

### 5. Shared Layer (`/lib`)

**Purpose**: Code used by both frontend and backend

**Contents**:

-   **types.ts**: TypeScript interfaces and types
-   **utils.ts**: Utility functions (formatting, validation)
-   **data.ts**: (DEPRECATED) Re-exports for backward compatibility

---

## 🔄 Data Flow

### Read Operations (GET)

```
Frontend Page
    ↓
[Server Component]
    ↓ imports
Server Data Layer (/server/data)
    ↓
Display UI

OR

Frontend Page
    ↓
[Client Component]
    ↓ fetch()
API Route (/app/api)
    ↓
Business Logic (/server/api)
    ↓
Data Layer (/server/data)
    ↓
← JSON Response
```

### Write Operations (POST/PUT/DELETE)

```
Frontend Form
    ↓
[Client Component]
    ↓ fetch() POST/PUT/DELETE
API Route (/app/api)
    ↓
Business Logic (/server/api)
    ↓ validate & process
Data Layer (/server/data)
    ↓ save/update
← Success Response
    ↓
Update UI
```

---

## 🚀 Migration Path to Production

### Phase 1: Replace Mock Data with Database

**Current**: `/server/data/*.ts` files with arrays

**Target**: Database with ORM (Prisma, Drizzle)

**Steps**:

1. Choose database (PostgreSQL, MongoDB, Supabase)
2. Set up database schema
3. Replace data arrays with database queries
4. Update helper functions to use ORM

**Example**:

```typescript
// Before (Mock)
export const getUserById = (id: string) => {
    return users.find((user) => user.id === id);
};

// After (Database)
export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
};
```

---

### Phase 2: Add Authentication

**Current**: Mock user ID (`'1'`)

**Target**: Real authentication with sessions/JWT

**Steps**:

1. Implement auth provider (NextAuth.js, Clerk, Supabase Auth)
2. Protect API routes with middleware
3. Get user ID from session/token
4. Add role-based access control

---

### Phase 3: Add Real-time Features

**Current**: Static data

**Target**: Real-time updates

**Steps**:

1. Implement WebSocket server (Socket.io, Pusher)
2. Add real-time message notifications
3. Add live application status updates
4. Implement typing indicators

---

### Phase 4: Optimize and Scale

**Improvements**:

-   Add Redis caching for frequently accessed data
-   Implement pagination and infinite scroll
-   Add full-text search (Elasticsearch)
-   Implement CDN for static assets
-   Add monitoring and logging (Sentry, LogRocket)
-   Set up CI/CD pipeline

---

## 📝 Code Comments Guide

Throughout the codebase, you'll find structured comments:

### File Headers

```typescript
/**
 * ============================================================================
 * [LAYER] - [Component Name]
 * ============================================================================
 *
 * Description of the file's purpose
 *
 * NEXT STEPS FOR PRODUCTION:
 * - Bullet points with improvement suggestions
 */
```

### Section Markers

-   `// FRONTEND:` - UI-related code
-   `// BACKEND:` - Server-side code
-   `// SHARED:` - Used by both frontend and backend
-   `// PRODUCTION:` - Code that needs replacement in production

---

## 🧪 Testing Strategy

### Unit Tests

-   `/server/api/*` - Test business logic functions
-   `/lib/utils.ts` - Test utility functions

### Integration Tests

-   `/app/api/*` - Test API endpoints
-   Test data flow from API to business logic to data layer

### End-to-End Tests

-   Test user flows from frontend to backend
-   Test critical paths (signup, apply to job, send message)

---

## 📚 Further Reading

-   [Next.js App Router Documentation](https://nextjs.org/docs/app)
-   [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
-   [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
-   [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)

---

## 🤝 Contributing

When adding new features:

1. **Frontend pages**: Add to `/app` with clear comments
2. **UI components**: Add to `/components` with proper structure
3. **API endpoints**: Add route handler in `/app/api`
4. **Business logic**: Add to `/server/api`
5. **Data models**: Add to `/server/data`
6. **Types**: Add to `/lib/types.ts`
7. **Utils**: Add to `/lib/utils.ts`

Always include:

-   Clear comments explaining purpose
-   Production improvement suggestions
-   TypeScript types
-   Error handling

---

**Last Updated**: January 12, 2026
**Version**: 2.0 (Refactored Architecture)
