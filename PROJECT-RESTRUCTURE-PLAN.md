# NextStep Project - Cleanup & Restructure Plan

## 🔍 Current Project Analysis

### Real Features (Connected to Convex Backend)

✅ **Dashboard** - Working with Convex

- Real-time data fetching
- User profile
- Opportunities overview
- Applications tracking
- Messages preview

✅ **Messages** - Fully Implemented with Convex

- Real-time messaging
- Conversation list
- Message threads
- User-to-user communication
- Read/unread status

✅ **Opportunities** - Working with Convex

- Browse opportunities
- Application system
- Real-time updates

### Mock/Placeholder Features (NOT Connected to Backend)

❌ **Jobs Page** (app/jobs → MaterialsPage)

- Currently using MOCK_JOBS data
- Name mismatch: "MaterialsPage" but shows jobs
- No Convex integration

❌ **Mentors Page** (app/mentors → ConnectPage)

- Currently using MOCK_MENTORS data
- Name mismatch: "ConnectPage" but shows mentors
- No Convex integration

❌ **Profile Page** (app/profile → StudyPage)

- Currently using StudyPage with study sessions/pomodoro
- Name mismatch: Profile page showing study features
- Mock data only

❌ **Applications Page** (app/applications → CalendarPage)

- Currently using CalendarPage with application tracking
- Name mismatch: Applications page showing calendar
- Mock data only

❌ **Game Hub** (components/pages/GameHubPage)

- Educational games (quiz, memory, typing, etc.)
- No backend connection
- Not linked to any app route

❌ **Unused Components**

- HomePage.tsx (duplicate of app/page.tsx)
- Various placeholder pages

## 🎯 What This Project Should Offer

Based on the Convex schema and implemented features, NextStep is:
**A career development platform for fresh graduates in the Philippines**

### Core Features:

1. **Dashboard** - Overview of all activities
2. **Opportunities** - Browse job/internship opportunities
3. **Applications** - Track application status
4. **Messages** - Real-time messaging with mentors/recruiters
5. **Profile** - User profile management
6. **Mentors** - Connect with career mentors (Future)
7. **Resources** - Learning materials (Future)

## 📋 Restructuring TODO List

### Phase 1: Fix Naming & Structure Issues

- [ ] Rename MaterialsPage → JobsPageContent
- [ ] Rename ConnectPage → MentorsPageContent
- [ ] Rename StudyPage → ProfilePageContent
- [ ] Rename CalendarPage → ApplicationsPageContent
- [ ] Delete unused HomePage.tsx (duplicate)
- [ ] Move page content components to proper locations

### Phase 2: Remove Mock Data & Integrate with Convex

- [ ] Create Convex schema for jobs/opportunities (if not exists)
- [ ] Create Convex schema for mentors
- [ ] Create Convex schema for applications tracking
- [ ] Replace MOCK_JOBS with Convex queries
- [ ] Replace MOCK_MENTORS with Convex queries
- [ ] Replace mock applications with Convex queries

### Phase 3: Clean Component Structure

- [ ] Move all page content to app/ folder (eliminate components/pages/)
- [ ] Keep only reusable components in components/features/
- [ ] Consolidate constants files
- [ ] Remove GameHubPage or integrate properly

### Phase 4: Fix Route Structure

```
app/
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (dashboard)/
│   ├── dashboard/          ✅ Working
│   ├── opportunities/      ✅ Working
│   ├── applications/       ❌ Needs Convex
│   ├── messages/          ✅ Working
│   ├── mentors/           ❌ Needs Convex
│   ├── jobs/              ❌ Needs Convex
│   └── profile/           ❌ Needs Convex
└── page.tsx               ✅ Landing page
```

### Phase 5: Database Schema Updates Needed

```typescript
// convex/jobs.ts - NEW
- Define job postings table
- CRUD operations
- Search/filter functions

// convex/mentors.ts - NEW
- Define mentors table
- Mentor-mentee relationships
- Connection requests

// convex/applications.ts - UPDATE
- Track job applications
- Status updates
- Interview scheduling
```

## 🗑️ Files to Delete

- [ ] components/pages/HomePage.tsx (duplicate)
- [ ] components/pages/GameHubPage.tsx (or move to dedicated route)
- [ ] All MOCK\_\* data after Convex integration

## 🔧 Files to Rename

1. `components/pages/MaterialsPage.tsx` → Content should be in `app/jobs/page.tsx`
2. `components/pages/ConnectPage.tsx` → Content should be in `app/mentors/page.tsx`
3. `components/pages/StudyPage.tsx` → Content should be in `app/profile/page.tsx`
4. `components/pages/CalendarPage.tsx` → Content should be in `app/applications/page.tsx`

## 🎨 Proposed Clean Structure

```
app/
├── (landing)/
│   └── page.tsx                 # Public landing page
├── (auth)/
│   ├── sign-in/
│   └── sign-up/
├── (platform)/
│   ├── layout.tsx              # Authenticated layout with sidebar
│   ├── dashboard/
│   │   └── page.tsx           # Dashboard (KEEP - Working)
│   ├── opportunities/
│   │   ├── page.tsx           # Browse opportunities (KEEP)
│   │   └── [id]/
│   │       └── page.tsx       # Opportunity details
│   ├── applications/
│   │   └── page.tsx           # My applications (REBUILD with Convex)
│   ├── messages/
│   │   └── page.tsx           # Messages (KEEP - Working)
│   ├── mentors/
│   │   └── page.tsx           # Find mentors (REBUILD with Convex)
│   ├── jobs/
│   │   └── page.tsx           # Browse jobs (REBUILD with Convex)
│   └── profile/
│       └── page.tsx           # User profile (REBUILD with Convex)
│
components/
├── features/                   # Feature-specific components
│   ├── dashboard/
│   ├── opportunities/
│   ├── applications/          # NEW - Reusable application components
│   ├── messages/             # KEEP - Working components
│   ├── mentors/              # KEEP - Rename from current
│   ├── jobs/                 # KEEP - Rename from current
│   └── profile/              # NEW - Profile components
├── landing/                   # KEEP - Landing page components
├── layout/                    # KEEP - Navbar, Sidebar, etc.
└── ui/                       # KEEP - shadcn components

lib/
├── constants/
│   └── (remove mock data after Convex integration)
├── utils.ts
└── cn.ts

convex/
├── schema.ts                 # Add jobs, mentors schemas
├── jobs.ts                   # NEW
├── mentors.ts                # NEW
├── applications.ts           # UPDATE
├── messages.ts              # KEEP - Working
├── opportunities.ts          # KEEP - Working
└── users.ts                 # KEEP - Working
```

## ⚡ Quick Wins (Do First)

1. Rename page components to match their actual purpose
2. Delete duplicate HomePage
3. Fix import paths after renaming
4. Update route files to use correctly named components
5. Test build after each change

## 🚀 Implementation Order

1. **Phase 1** - Fix naming (30 min)
2. **Phase 3** - Clean component structure (30 min)
3. **Phase 2** - Add Convex schemas (2 hours)
4. **Phase 2** - Integrate Convex queries (3 hours)
5. **Phase 4** - Finalize route structure (1 hour)

## 📊 Expected Outcomes

- ✅ Clear separation: Real features vs. Planned features
- ✅ Consistent naming throughout
- ✅ No duplicate code
- ✅ All features use Convex backend
- ✅ Proper Next.js 14 App Router structure
- ✅ Easier to maintain and extend

---

**Next Step**: Start with Phase 1 - Fix the naming mess first!
