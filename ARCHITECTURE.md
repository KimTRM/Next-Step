# Feature-Based Architecture Guide

This document describes the feature-based architecture used in this Next.js + Convex project.

## Overview

The codebase is organized using a **strict feature-based architecture** that:

- Reduces refactoring churn
- Improves long-term maintainability
- Makes feature ownership explicit
- Keeps pages thin and declarative
- Enforces one-way dependencies between layers

## Directory Structure

```
next-step/
├── app/                          # Next.js routes (thin, glue-only)
│   ├── (auth)/                   # Auth route group
│   ├── (platform)/               # Platform route group
│   └── page.tsx                  # Landing page
│
├── features/                     # Feature modules
│   ├── jobs/
│   │   ├── api.ts                # ONLY place that talks to Convex
│   │   ├── types.ts              # Feature-specific types
│   │   ├── constants.ts          # Feature constants
│   │   ├── index.ts              # Public exports
│   │   └── components/           # Feature UI components
│   │
│   ├── users/
│   ├── mentors/
│   ├── applications/
│   ├── messages/
│   └── dashboard/
│
├── shared/                       # Truly shared code
│   └── utils/                    # Shared utilities
│
├── components/                   # Legacy shared components
│   ├── ui/                       # Shadcn UI components
│   ├── layout/                   # Layout components
│   └── landing/                  # Landing page components
│
├── convex/                       # Backend (Convex)
│   ├── schema.ts                 # Global schema
│   ├── api.ts                    # API routing
│   ├── jobs/                     # Jobs feature
│   │   ├── queries.ts
│   │   └── mutations.ts
│   ├── users/
│   ├── mentors/
│   ├── applications/
│   └── messages/
│
└── lib/                          # Legacy utilities (being migrated)
```

## Architectural Principles

### 1. Feature Ownership

All product-related code lives inside a feature. A feature owns:
- Its UI components (`components/`)
- Its hooks (via `api.ts`)
- Its frontend API layer (`api.ts`)
- Its Convex backend logic (`convex/{feature}/`)

### 2. Thin Routes (Glue-Only Pages)

Next.js `app/` routes should:
- Compose features
- Handle layout and routing
- Contain minimal logic

Pages should read like: "assemble Feature A + Feature B"

```tsx
// app/(platform)/jobs/page.tsx
import { JobsPageContent } from "@/features/jobs";

export default function JobsPage() {
  return <JobsPageContent />;
}
```

### 3. Self-Contained Features

Each feature is a mini-application. A feature folder contains:

```
features/{name}/
├── api.ts          # Convex hook wrappers (ONLY Convex imports here)
├── types.ts        # Feature-specific types
├── constants.ts    # Feature constants
├── index.ts        # Public exports
└── components/     # Feature UI components
```

### 4. One-Way Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                          app/                                │
│                    (can import features)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        features/                             │
│              (can import shared, NOT other features)         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         shared/                              │
│                  (can only import shared)                    │
└─────────────────────────────────────────────────────────────┘
```

**Rules:**
- Features may NOT import from other features
- Features may import ONLY their own files and shared code
- Routes may import features
- Shared code may NOT import features

### 5. API Layer Isolation

Only `features/{feature}/api.ts` can import Convex hooks:

```tsx
// features/jobs/api.ts (ALLOWED)
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSearchJobs(filters) {
  return useQuery(api.jobs.searchJobs, filters);
}
```

```tsx
// features/jobs/components/JobCard.tsx (NOT ALLOWED)
// ❌ import { useQuery } from "convex/react"; // ESLint error
// ✅ import { useSearchJobs } from "../api";  // Correct
```

## Feature Modules

### Jobs (`features/jobs/`)

Handles job listings, search, recommendations.

**Exports:**
- `useSearchJobs`, `useJobById`, `useRecommendedJobs`, etc.
- `Job`, `JobWithPoster`, `JobSearchFilters` types
- `JOB_CATEGORIES`, `JOB_TYPES` constants

### Users (`features/users/`)

Handles user profiles, authentication, onboarding.

**Exports:**
- `useCurrentUser`, `useAuth`, `useUpdateUserProfile`, etc.
- `User`, `UserSession`, `PublicUserProfile` types

### Mentors (`features/mentors/`)

Handles mentor profiles, search, booking, sessions.

**Exports:**
- `useSearchMentors`, `useMentorById`, `useBookSession`, etc.
- `Mentor`, `MentorWithUser`, `MentorshipSession` types
- `EXPERTISE_AREAS`, `SESSION_DURATIONS` constants

### Applications (`features/applications/`)

Handles job application tracking.

**Exports:**
- `useUserApplications`, `useCreateApplication`, `useUpdateApplicationStatus`
- `JobApplication`, `ApplicationStatus` types
- `APPLICATION_STATUS_LABELS`, `APPLICATION_STATUS_COLORS` constants

### Messages (`features/messages/`)

Handles direct messaging.

**Exports:**
- `useUserMessages`, `useConversation`, `useSendMessage`
- `Message`, `ConversationPartner` types

### Dashboard (`features/dashboard/`)

Aggregates data for dashboard views.

**Exports:**
- `useCurrentUser`, `useUserApplications`, `useRecommendedJobs`
- `StudentDashboardStats`, `MentorDashboardStats` types

## ESLint Boundary Enforcement

The project uses `eslint-plugin-boundaries` to enforce architectural rules.

**Current rules (set to "warn" during migration):**
- Features cannot import other features
- Convex imports restricted to `api.ts` files
- Shared code cannot import features

To check boundaries:
```bash
npm run lint
```

To upgrade to strict enforcement, change `"warn"` to `"error"` in `eslint.config.mjs`.

## Migration Guide

### Moving Components to Features

1. Create the feature folder structure
2. Create `api.ts` with Convex hook wrappers
3. Move types to `types.ts`
4. Move constants to `constants.ts`
5. Move components to `components/`
6. Update imports to use local `api.ts`
7. Export from `index.ts`

### Example: Migrating a Component

Before:
```tsx
// app/(platform)/jobs/_components/JobsPageContent.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function JobsPageContent() {
  const jobs = useQuery(api.jobs.searchJobs, { ... });
  // ...
}
```

After:
```tsx
// features/jobs/components/JobsPageContent.tsx
import { useSearchJobs } from "../api";

export function JobsPageContent() {
  const jobs = useSearchJobs({ ... });
  // ...
}
```

## Trade-offs

This structure may feel restrictive. That restriction is a **FEATURE**, not a flaw:

1. **Explicit dependencies**: You can see exactly what a feature depends on
2. **Easy refactoring**: Features are isolated, so changes are contained
3. **Clear ownership**: Each feature has one responsible owner
4. **Testability**: Features can be tested in isolation
5. **Scalability**: New features follow the same pattern

## Commands

```bash
# Check for boundary violations
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build

# Run Convex development server
npx convex dev
```
