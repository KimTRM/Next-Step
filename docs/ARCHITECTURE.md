# NextStep - Architecture Documentation

**Last Updated:** January 18, 2026

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture Patterns](#architecture-patterns)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Authentication Flow](#authentication-flow)
- [API Layer (DAL Pattern)](#api-layer-dal-pattern)
- [Feature Status](#feature-status)

---

## 🎯 Overview

NextStep is a career development platform built with:

- **Next.js 16.1.1** (App Router with Turbopack)
- **Convex** (Real-time serverless database)
- **Clerk** (Authentication)
- **TypeScript** (Type safety)
- **Tailwind CSS** + **shadcn/ui** (Styling)

**Architecture Pattern:** Backend API Layer (DAL) → Next.js API Routes → Client Components

---

## 🛠️ Tech Stack

| Layer        | Technology               | Purpose                          |
| ------------ | ------------------------ | -------------------------------- |
| **Frontend** | Next.js 16.1.1           | React framework with App Router  |
| **UI**       | Tailwind CSS + shadcn/ui | Component library & styling      |
| **Backend**  | Convex                   | Serverless database & API        |
| **Auth**     | Clerk                    | User authentication & management |
| **Language** | TypeScript               | Type-safe development            |
| **Build**    | Turbopack                | Fast bundling                    |

---

## 🏗️ Architecture Patterns

### DAL (Data Access Layer) Pattern

All features follow a consistent architecture:

```
Client Component (React)
    ↓ fetch()
API Route (/app/api/*)
    ↓ auth() + getToken()
DAL Service (lib/dal/server/*-service.ts)
    ↓ ConvexHttpClient + setAuth()
Convex Backend (convex/*.ts)
```

**Key Benefits:**

- ✅ Centralized auth token handling
- ✅ Type-safe data access
- ✅ Consistent error handling
- ✅ Easy testing and mocking
- ✅ Clear separation of concerns

---

## 📁 Project Structure

```
next-step/
├── app/                              # 🎨 FRONTEND
│   ├── (platform)/                   # Protected routes
│   │   ├── dashboard/
│   │   ├── jobs/                     # ✅ Complete
│   │   ├── applications/             # ✅ Complete
│   │   ├── messages/                 # ✅ Complete
│   │   ├── mentors/                  # 🟡 Partial
│   │   ├── opportunities/            # ⚪ Not started
│   │   └── profile/                  # 🟡 Partial
│   │
│   └── api/                          # 🔌 API ROUTES
│       ├── jobs/                     # ✅ Complete
│       ├── applications/             # ✅ Complete
│       ├── messages/                 # ✅ Complete
│       ├── users/
│       └── webhooks/
│
├── components/                       # 🧩 UI COMPONENTS
│   ├── ui/                           # shadcn/ui (48 components)
│   ├── layout/                       # Header, Sidebar, Navbar
│   ├── landing/                      # Landing page sections
│   └── features/                     # Feature components
│       ├── jobs/
│       ├── applications/
│       ├── messages/
│       ├── mentors/
│       └── profile/
│
├── convex/                           # 🗄️ BACKEND
│   ├── schema.ts                     # Database schema
│   ├── auth.config.js                # Clerk integration
│   ├── jobs.ts
│   ├── jobApplications.ts
│   ├── messages.ts
│   ├── users.ts
│   └── ...
│
├── lib/                              # 🔧 UTILITIES
│   ├── dal/                          # Data Access Layer
│   │   ├── types/                    # Type definitions
│   │   └── server/                   # DAL services
│   │       ├── job-service.ts
│   │       ├── job-application-service.ts
│   │       ├── message-service.ts
│   │       └── user-service.ts
│   ├── constants/
│   └── utils.ts
│
├── proxy.ts                          # 🔐 Clerk Middleware
└── docs/                             # 📚 Documentation
```

---

## 🔄 Data Flow

### Authentication Flow

```
User → Clerk Sign In → JWT Token (template: "convex")
                           ↓
Frontend fetch() → API Route → auth() check
                           ↓
                    getToken({ template: 'convex' })
                           ↓
                    DAL Service → client.setAuth(token)
                           ↓
                    Convex Query/Mutation (ctx.auth available)
```

### Data Fetching Example (Jobs)

```typescript
// 1. Client Component
const JobsPageContent = () => {
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        fetch("/api/jobs?query=engineer")
            .then((res) => res.json())
            .then((data) => setJobs(data.data));
    }, []);
};

// 2. API Route
export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return 401;

    const token = await auth().then((a) => a.getToken({ template: "convex" }));
    const result = await JobDAL.searchJobs(params, token);

    return NextResponse.json({ success: true, data: result.jobs });
}

// 3. DAL Service
export class JobDAL {
    static async searchJobs(params, auth?) {
        return await queryConvex(api.jobs.searchJobs, params, auth);
    }
}

// 4. Convex Backend
export const searchJobs = query({
    handler: async (ctx, args) => {
        // ctx.auth is available here
        return await ctx.db.query("jobs").collect();
    },
});
```

---

## 🔐 Authentication (Clerk + Convex)

### Middleware Setup (proxy.ts)

```typescript
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
    matcher: [
        /* routes */
    ],
};
```

### Token Flow in API Routes

```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) return 401;

    // 2. Get Convex token
    const token = await auth().then((auth) =>
        auth.getToken({ template: "convex" }),
    );

    // 3. Pass to DAL
    const data = await SomeDAL.getData(params, token);

    return NextResponse.json({ success: true, data });
}
```

---

## 🎯 API Layer (DAL Pattern)

### DAL Service Structure

```typescript
// lib/dal/server/job-service.ts
import { api } from "@/convex/_generated/api";
import { queryConvex, mutateConvex } from "./convex";
import { DALError } from "./dal-error";

export class JobDAL {
    static async searchJobs(params, auth?) {
        try {
            return await queryConvex(api.jobs.searchJobs, params, auth);
        } catch (error) {
            throw new DALError(
                "DATABASE_ERROR",
                "Failed to search jobs",
                error,
            );
        }
    }

    static async getJobById(id, auth?) {
        try {
            return await queryConvex(api.jobs.getJobById, { id }, auth);
        } catch (error) {
            throw new DALError("DATABASE_ERROR", "Failed to get job", error);
        }
    }
}
```

### Convex Client Wrapper

```typescript
// lib/dal/server/convex.ts
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function queryConvex(query, args, auth?) {
    if (auth) {
        const client = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
        );
        client.setAuth(auth);
        return await client.query(query, args);
    }
    return await convex.query(query, args);
}
```

---

## 📊 Feature Status

### ✅ Complete (DAL + API + Frontend)

| Feature          | Components                                    | Notes                           |
| ---------------- | --------------------------------------------- | ------------------------------- |
| **Jobs**         | JobsPageContent, JobCard, JobFilters          | Search, pagination, save button |
| **Applications** | ApplicationsPageContent                       | Status tracking, update dialog  |
| **Messages**     | ConversationList, MessageThread, MessageInput | Real-time chat                  |

### 🟡 Partial Implementation

| Feature     | Status                | Next Steps                     |
| ----------- | --------------------- | ------------------------------ |
| **Mentors** | Some API routes exist | Complete DAL, migrate frontend |
| **Profile** | Basic API exists      | Expand functionality           |

### ⚪ Not Started

- Opportunities (uses Convex hooks directly)
- Dashboard (uses Convex hooks directly)

---

## 🎨 Design System

### Colors

- Primary: Blue gradients (`from-blue-500 to-blue-600`)
- Background: Subtle gradients (`from-white via-blue-50/30`)
- Text: Gray scale hierarchy

### Components

- Cards: White + shadow-lg
- Headers: Gradient backgrounds
- Buttons: Blue gradients with hover
- Avatars: Gradient circles
- Messages: Rounded-2xl bubbles

---

## 📝 API Endpoints

### Jobs

- `GET /api/jobs` - List/search jobs
- `GET /api/jobs/[id]` - Job details
- `POST /api/jobs/apply` - Submit application

### Applications

- `GET /api/applications` - User applications
- `PATCH /api/applications/[id]` - Update status

### Messages

- `GET /api/messages` - All messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/[userId]` - Get conversation
- `PATCH /api/messages/[id]` - Mark as read

---

## 🚀 Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run convex:dev   # Start Convex
npm run build        # Production build
```

---

**Last Updated:** January 18, 2026
