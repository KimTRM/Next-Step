# NextStep - Youth Job & Mentorship Platform

> **🚀 Modern Job & Mentorship Platform**
>
> A comprehensive jobseeker and mentorship platform designed to connect youth with career opportunities and experienced mentors. Now powered by **Convex** for real-time data and **Clerk** for secure authentication!

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8)
![Convex](https://img.shields.io/badge/Convex-Database-orange)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Development Roadmap](#development-roadmap)
- [API Routes](#api-routes)
- [Hackathon Extension Ideas](#hackathon-extension-ideas)

## 🎯 Overview

**NextStep** is a platform that empowers youth to:

- **Find Opportunities**: Browse jobs, internships, and mentorships in real-time
- **Connect with Mentors**: Get guidance from experienced professionals
- **Track Progress**: Manage applications and career development
- **Secure Authentication**: Sign in safely with Clerk
- **Real-time Updates**: Experience instant data synchronization with Convex

---

## ✨ Core Features

### MVP Features (Implemented)

- ✅ **User Profiles** - Skills, interests, and career goals
- ✅ **Authentication** - Secure sign-up/sign-in with Clerk
- ✅ **Real-time Database** - Powered by Convex for instant updates
- ✅ **Student-friendly Job Listings** - Jobs, internships, and mentorships
- ✅ **Application Tracking Dashboard** - Manage and track all applications
- ✅ **Mentor Matching** - Connect with experienced professionals
- ✅ **In-app Messaging** - Direct communication system

### Technical Implementation

- ✅ **Clerk Authentication** - Production-ready auth with social logins
- ✅ **Convex Database** - Real-time serverless database
- ✅ **Protected Routes** - Middleware-based route protection
- ✅ **Dashboard** - Real-time overview of applications and messages
- ✅ **Opportunities Browser** - Live data with search and filtering
- ✅ **Profile Management** - User profile editing with skills
- ✅ **Applications Tracking** - Real-time application status
- ✅ **Messaging System** - Live chat interface
- ✅ **Database Schema** - Fully typed Convex schema
- ✅ **Reusable Components** - Button, Input, Card, Navbar, Sidebar
- ✅ **TypeScript Types** - Full type safety across the app

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4.0
- **Database**: Convex (Real-time serverless)
- **Authentication**: Clerk
- **State Management**: React Hooks + Convex Queries
- **Architecture**: API-driven with real-time subscriptions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free tier available)
- Convex account (optional - can run locally)

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Set up Clerk (see CONVEX-CLERK-SETUP.md for details)
# Add your Clerk keys to .env.local

# 4. Start Convex (local or cloud)
npm run convex:dev

# 5. Seed the database
npm run seed

# 6. Start Next.js development server
npm run dev

# 7. Open browser at http://localhost:3000
```

### Detailed Setup

For complete setup instructions including Clerk configuration, Convex deployment, and webhook setup, see:

📖 **[docs/CONVEX-QUICKSTART.md](./docs/CONVEX-QUICKSTART.md)** - Quick setup guide  
📖 **[docs/CONVEX-CLERK-SETUP.md](./docs/CONVEX-CLERK-SETUP.md)** - Complete documentation  
📖 **[docs/](./docs/)** - All documentation

### First Run

1. Visit the landing page at `/`
2. Click "Sign Up" to create an account
3. Complete Clerk authentication
4. Explore the dashboard at `/dashboard`
5. Browse opportunities at `/opportunities`
6. Try the messaging system at `/messages`

---

## 📚 Documentation

All documentation is organized in the [docs/](docs/) folder:

### 🚀 Getting Started

- **[CONVEX-QUICKSTART.md](docs/CONVEX-QUICKSTART.md)** - Quick setup for Convex + Clerk (START HERE!)
- **[QUICK-START.md](docs/QUICK-START.md)** - Get productive in 5 minutes
- **[CONVEX-CLERK-SETUP.md](docs/CONVEX-CLERK-SETUP.md)** - Complete setup guide

### 📖 Understanding the Project

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture and design
- **[INTEGRATION-SUMMARY.md](docs/INTEGRATION-SUMMARY.md)** - What's been integrated
- **[MIGRATION-GUIDE.md](docs/MIGRATION-GUIDE.md)** - How to work with the codebase

### 📋 Planning & Tasks

- **[TODO.md](docs/TODO.md)** - Feature roadmap and tasks
- **[REFACTORING-SUMMARY.md](docs/REFACTORING-SUMMARY.md)** - Project history

**👉 See [docs/README.md](docs/README.md) for the complete documentation index**

---

## 📁 Project Structure

The project follows a clean separation of concerns with distinct frontend and backend layers:

```
Next-Step/
├── app/                           # 🎨 FRONTEND - Next.js pages & UI
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── page.tsx                   # Landing page
│   ├── auth/page.tsx              # Login/signup
│   ├── dashboard/page.tsx         # User dashboard
│   ├── profile/page.tsx           # User profile
│   ├── opportunities/             # Opportunities pages
│   │   ├── page.tsx               # Browse all opportunities
│   │   └── [id]/page.tsx          # Single opportunity detail
│   ├── applications/page.tsx      # Application tracking
│   ├── messages/page.tsx          # Messaging interface
│   ├── providers.tsx              # 🔐 Clerk + Convex providers
│   └── api/                       # 🔌 HTTP API route handlers
│       ├── users/route.ts         # Users API endpoint (legacy)
│       ├── opportunities/route.ts # Opportunities API endpoint (legacy)
│       ├── messages/route.ts      # Messages API endpoint (legacy)
│       └── webhooks/clerk/        # Clerk webhook for user sync
│
├── convex/                        # 🗄️ REAL-TIME DATABASE (Convex)
│   ├── schema.ts                  # Database schema definition
│   ├── users.ts                   # User queries
│   ├── userMutations.ts           # User create/update/delete
│   ├── opportunities.ts           # Opportunity queries & mutations
│   ├── applications.ts            # Application queries & mutations
│   ├── messages.ts                # Message queries & mutations
│   ├── seed.ts                    # Database seeding script
│   └── auth.config.js             # Clerk authentication config
│
├── components/                    # 🧩 FRONTEND - Reusable UI components
│   ├── ui/                        # Base UI components
│   │   ├── Button.tsx             # Button component
│   │   ├── Input.tsx              # Input & textarea
│   │   └── Card.tsx               # Card container
│   ├── layout/                    # Layout components
│   │   ├── Header.tsx             # Header with auth buttons
│   │   ├── Navbar.tsx             # Main navigation
│   │   └── Sidebar.tsx            # Dashboard sidebar
│   └── features/                  # Feature-specific components
│       ├── profile/ProfileForm.tsx
│       └── opportunities/OpportunityCard.tsx
│
├── server/                        # 🗄️ BACKEND - Business logic & data
│   ├── api/                       # Business logic layer
│   │   ├── users.ts               # User operations & filtering
│   │   ├── opportunities.ts       # Opportunity operations
│   │   └── messages.ts            # Message operations
│   └── data/                      # Data access layer (mock data)
│       ├── users.ts               # User data & queries
│       ├── opportunities.ts       # Opportunity data & queries
│       ├── messages.ts            # Message data & queries
│       └── applications.ts        # Application data & queries
│
├── lib/                           # 🔧 SHARED - Used by frontend & backend
│   ├── types.ts                   # TypeScript interfaces
│   ├── utils.ts                   # Utility functions
│   └── data.ts                    # (DEPRECATED) Re-exports
│
├── docs/                          # 📚 PROJECT DOCUMENTATION
│   ├── README.md                  # Documentation index & navigation
│   ├── CONVEX-QUICKSTART.md       # ⚡ Quick Convex + Clerk setup
│   ├── CONVEX-CLERK-SETUP.md      # 🔐 Complete setup guide
│   ├── INTEGRATION-SUMMARY.md     # 📋 What's been integrated
│   ├── QUICK-START.md             # 🚀 Get started in 5 minutes
│   ├── ARCHITECTURE.md            # 📐 System architecture (20 min)
│   ├── DEVELOPER-GUIDE.md         # 👨‍💻 Developer handbook
│   ├── MIGRATION-GUIDE.md         # 🗺️ Feature development guide
│   ├── REFACTORING-SUMMARY.md     # 📊 Project history
│   └── TODO.md                    # ✅ Feature roadmap
│
├── public/assets/                 # 📁 Static assets
└── README.md                      # This file
```

### Architecture Highlights

**Layered Architecture**:

- **Frontend Layer** (`/app`, `/components`): User interface
- **HTTP Layer** (`/app/api`): Request/response handling
- **Business Logic Layer** (`/server/api`): Core application logic
- **Data Layer** (`/server/data`): Data access and mock storage

**Benefits**:

- ✅ Clear separation between frontend and backend
- ✅ Easy to replace mock data with real database
- ✅ Business logic is reusable and testable
- ✅ API routes are thin and focused on HTTP concerns
- ✅ Well-documented with inline comments

**Migration Path**:

1. Replace `/server/data` arrays with database queries
2. Add authentication middleware to `/app/api` routes
3. Implement real-time features with WebSockets
4. Add caching and optimization

---

## 🗓 Development Roadmap

### Day 1-2: Foundation & Core Features

- [x] Set up project structure
- [x] Create UI components
- [x] Implement landing page
- [x] Build dashboard with mock data
- [x] Create opportunities browsing
- [ ] Add authentication (NextAuth.js, Clerk, or Supabase)
- [ ] Set up database (MongoDB, PostgreSQL, or Supabase)
- [ ] Connect API routes to database

### Day 3-4: User Features

- [ ] Implement profile editing with image upload
- [ ] Add application submission functionality
- [ ] Build filtering and search for opportunities
- [ ] Add real-time messaging (WebSockets/Pusher)
- [ ] Create notifications system
- [ ] Add bookmarking/saved opportunities

### Day 5: Polish & Deploy

- [ ] Fix bugs and edge cases
- [ ] Add loading states and error handling
- [ ] Implement responsive design improvements
- [ ] Add animations and transitions
- [ ] Write documentation
- [ ] Deploy to Vercel/Netlify
- [ ] Prepare demo and presentation

## 🔌 API Routes

### GET /api/users

Returns list of users. Supports filtering:

- `?role=student` - Filter by role
- `?search=john` - Search by name/email

### GET /api/opportunities

Returns opportunities. Supports filtering:

- `?type=job` - Filter by type (job, internship, mentorship)
- `?skills=React,TypeScript` - Filter by skills
- `?location=Toronto` - Filter by location
- `?remote=true` - Filter remote only

### GET /api/messages

Returns messages for current user:

- `?userId=1` - Get messages for specific user
- `?conversationWith=2` - Get conversation between two users

## 💡 Hackathon Extension Ideas

### High Priority

1. **Authentication** - Implement real user auth (NextAuth.js recommended)
2. **Database** - Replace mock data with real DB (Supabase quick setup)
3. **Search & Filters** - Make opportunity filtering functional
4. **Application System** - Allow users to apply with cover letters
5. **Real-time Messaging** - Add WebSockets for live chat

### Medium Priority

6. **File Uploads** - Profile pictures and resume uploads
7. **Matching Algorithm** - Smart mentor-mentee matching
8. **Calendar Integration** - Schedule mentorship sessions
9. **Email Notifications** - Send updates for applications
10. **Admin Dashboard** - Manage users and opportunities

### Nice to Have

11. **AI Resume Review** - Use OpenAI to review resumes
12. **Skills Assessment** - Quiz-based skill verification
13. **Video Calls** - Integrate Zoom/Google Meet for mentorship
14. **Analytics Dashboard** - Track user engagement
15. **Mobile App** - React Native version

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Third-party services
UPLOADTHING_SECRET=your_uploadthing_secret
PUSHER_APP_ID=your_pusher_app_id
OPENAI_API_KEY=your_openai_key
```

## 📝 Code Comments Guide

Throughout the codebase, you'll find:

- `TODO:` - Immediate next steps
- `HACKATHON TODO:` - Extension ideas for hackathon
- `NOTE:` - Important information
- Inline explanations of complex logic

## 🤝 Contributing During Hackathon

1. **Divide and Conquer**: Split team by features (auth, messaging, etc.)
2. **Use Branches**: Create feature branches for parallel work
3. **Mock First**: Test UI with mock data before integrating backend
4. **Iterate Fast**: Build MVP first, polish later
5. **Document**: Update README as you add features

## 📚 Resources

- **[Full Documentation](docs/)** - All project documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/example)

## 🐛 Known Issues & Limitations

- Authentication is UI-only (no backend)
- All data is mock/hardcoded
- Messages are not real-time
- No file upload functionality yet
- Search and filters are not functional
- No data persistence (refreshes reset state)

## 📄 License

MIT License - feel free to use this project for your hackathon!

## 🎉 Quick Start Checklist

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Explore all pages
- [ ] **Read [docs/QUICK-START.md](docs/QUICK-START.md)** for a 5-minute intro
- [ ] Check [docs/TODO.md](docs/TODO.md) for feature ideas
- [ ] Pick features to implement
- [ ] Start coding!

---

**Built for hackathons. Ready to extend. Good luck! 🚀**

For detailed documentation, see the **[docs/](docs/)** folder. For questions, check the inline code comments.
