# NextStep - Youth Job & Mentorship Platform

> **🚀 Hackathon-Ready Next.js Project**
>
> A comprehensive jobseeker and mentorship platform designed to connect youth with career opportunities and experienced mentors.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Tech Stack](#tech-stack)
-   [Getting Started](#getting-started)
-   [Project Structure](#project-structure)
-   [Development Roadmap](#development-roadmap)
-   [API Routes](#api-routes)
-   [Hackathon Extension Ideas](#hackathon-extension-ideas)

## 🎯 Overview

**NextStep** is a platform that empowers youth to:

-   **Find Opportunities**: Browse jobs, internships, and mentorships
-   **Connect with Mentors**: Get guidance from experienced professionals
-   **Track Progress**: Manage applications and career development

This scaffold provides a complete foundation with mock data, UI components, and API routes ready for immediate hackathon development.

---

## ✨ Core Features

### MVP Features (Current Implementation)

-   ✅ **User Profiles** - Skills, interests, and career goals
-   ✅ **Student-friendly Job Listings** - Jobs, internships, and company information
-   ✅ **Application Tracking Dashboard** - Manage and track all applications
-   ✅ **Mentor Matching** - Connect with experienced professionals
-   ✅ **In-app Messaging** - Direct communication with mentors and employers

### Technical Implementation

-   ✅ **Authentication Pages** - Login/signup UI (ready for backend integration)
-   ✅ **Dashboard** - Overview of applications, messages, and opportunities
-   ✅ **Opportunities Browser** - Search and filter jobs, internships, mentorships
-   ✅ **Profile Management** - User profile editing with skills
-   ✅ **Applications Tracking** - View and manage all applications
-   ✅ **Messaging System** - Chat interface (ready for real-time integration)
-   ✅ **Mock API Routes** - RESTful endpoints with sample data
-   ✅ **Reusable Components** - Button, Input, Card, Navbar, Sidebar
-   ✅ **TypeScript Types** - Full type safety across the app

> **Note:** The current build uses sample data to demonstrate the complete user flow.

---

## 🛠 Tech Stack

-   **Framework**: Next.js 15 (App Router)
-   **Language**: TypeScript
-   **Styling**: TailwindCSS
-   **State Management**: React Hooks
-   **Architecture**: API-driven architecture
-   **Database**: Relational database (planned)
-   **Current Data**: Mock data for demonstration purposes

> The platform is built with scalability in mind, ready for database integration and production deployment.

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+ installed
-   npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### First Run

1. Visit the landing page at `/`
2. Click "Get Started" to go to `/auth`
3. Sign up/login (mock - no backend yet)
4. Explore the dashboard at `/dashboard`
5. Browse opportunities at `/opportunities`

## 📁 Project Structure

> **📖 For detailed documentation, see the [docs/](docs/) folder**
>
> **Quick Links:**
>
> -   **[Quick Start Guide](docs/QUICK-START.md)** - Get started in 5 minutes
> -   **[Architecture Guide](docs/ARCHITECTURE.md)** - Detailed architecture documentation
> -   **[Migration Guide](docs/MIGRATION-GUIDE.md)** - How to work with the codebase
> -   **[TODO List](docs/TODO.md)** - Feature roadmap

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
│   └── api/                       # 🔌 HTTP API route handlers
│       ├── users/route.ts         # Users API endpoint
│       ├── opportunities/route.ts # Opportunities API endpoint
│       └── messages/route.ts      # Messages API endpoint
│
├── components/                    # 🧩 FRONTEND - Reusable UI components
│   ├── ui/                        # Base UI components
│   │   ├── Button.tsx             # Button component
│   │   ├── Input.tsx              # Input & textarea
│   │   └── Card.tsx               # Card container
│   ├── layout/                    # Layout components
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
│   ├── README.md                  # Documentation index
│   ├── QUICK-START.md             # Quick start guide (5 min)
│   ├── ARCHITECTURE.md            # Detailed architecture (20 min)
│   ├── MIGRATION-GUIDE.md         # Feature development guide (15 min)
│   ├── REFACTORING-SUMMARY.md     # Project history (10 min)
│   └── TODO.md                    # Feature roadmap (5 min)
│
├── public/assets/                 # 📁 Static assets
└── README.md                      # This file
```

### Architecture Highlights

**Layered Architecture**:

-   **Frontend Layer** (`/app`, `/components`): User interface
-   **HTTP Layer** (`/app/api`): Request/response handling
-   **Business Logic Layer** (`/server/api`): Core application logic
-   **Data Layer** (`/server/data`): Data access and mock storage

**Benefits**:

-   ✅ Clear separation between frontend and backend
-   ✅ Easy to replace mock data with real database
-   ✅ Business logic is reusable and testable
-   ✅ API routes are thin and focused on HTTP concerns
-   ✅ Well-documented with inline comments

**Migration Path**:

1. Replace `/server/data` arrays with database queries
2. Add authentication middleware to `/app/api` routes
3. Implement real-time features with WebSockets
4. Add caching and optimization

---

## 🗓 Development Roadmap

### Day 1-2: Foundation & Core Features

-   [x] Set up project structure
-   [x] Create UI components
-   [x] Implement landing page
-   [x] Build dashboard with mock data
-   [x] Create opportunities browsing
-   [ ] Add authentication (NextAuth.js, Clerk, or Supabase)
-   [ ] Set up database (MongoDB, PostgreSQL, or Supabase)
-   [ ] Connect API routes to database

### Day 3-4: User Features

-   [ ] Implement profile editing with image upload
-   [ ] Add application submission functionality
-   [ ] Build filtering and search for opportunities
-   [ ] Add real-time messaging (WebSockets/Pusher)
-   [ ] Create notifications system
-   [ ] Add bookmarking/saved opportunities

### Day 5: Polish & Deploy

-   [ ] Fix bugs and edge cases
-   [ ] Add loading states and error handling
-   [ ] Implement responsive design improvements
-   [ ] Add animations and transitions
-   [ ] Write documentation
-   [ ] Deploy to Vercel/Netlify
-   [ ] Prepare demo and presentation

## 🔌 API Routes

### GET /api/users

Returns list of users. Supports filtering:

-   `?role=student` - Filter by role
-   `?search=john` - Search by name/email

### GET /api/opportunities

Returns opportunities. Supports filtering:

-   `?type=job` - Filter by type (job, internship, mentorship)
-   `?skills=React,TypeScript` - Filter by skills
-   `?location=Toronto` - Filter by location
-   `?remote=true` - Filter remote only

### GET /api/messages

Returns messages for current user:

-   `?userId=1` - Get messages for specific user
-   `?conversationWith=2` - Get conversation between two users

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

-   `TODO:` - Immediate next steps
-   `HACKATHON TODO:` - Extension ideas for hackathon
-   `NOTE:` - Important information
-   Inline explanations of complex logic

## 🤝 Contributing During Hackathon

1. **Divide and Conquer**: Split team by features (auth, messaging, etc.)
2. **Use Branches**: Create feature branches for parallel work
3. **Mock First**: Test UI with mock data before integrating backend
4. **Iterate Fast**: Build MVP first, polish later
5. **Document**: Update README as you add features

## 📚 Resources

-   **[Full Documentation](docs/)** - All project documentation
-   [Next.js Documentation](https://nextjs.org/docs)
-   [TailwindCSS Docs](https://tailwindcss.com/docs)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
-   [NextAuth.js Guide](https://next-auth.js.org/getting-started/example)

## 🐛 Known Issues & Limitations

-   Authentication is UI-only (no backend)
-   All data is mock/hardcoded
-   Messages are not real-time
-   No file upload functionality yet
-   Search and filters are not functional
-   No data persistence (refreshes reset state)

## 📄 License

MIT License - feel free to use this project for your hackathon!

## 🎉 Quick Start Checklist

-   [ ] Run `npm install`
-   [ ] Run `npm run dev`
-   [ ] Visit http://localhost:3000
-   [ ] Explore all pages
-   [ ] **Read [docs/QUICK-START.md](docs/QUICK-START.md)** for a 5-minute intro
-   [ ] Check [docs/TODO.md](docs/TODO.md) for feature ideas
-   [ ] Pick features to implement
-   [ ] Start coding!

---

**Built for hackathons. Ready to extend. Good luck! 🚀**

For detailed documentation, see the **[docs/](docs/)** folder. For questions, check the inline code comments.
