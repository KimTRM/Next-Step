# NextStep - Youth Job & Mentorship Platform

> **🚀 Modern Job & Mentorship Platform**
>
> A comprehensive job and mentorship platform designed to connect youth with career opportunities and experienced mentors. Powered by **Convex** for real-time data and **Clerk** for secure authentication!

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8)
![Convex](https://img.shields.io/badge/Convex-Database-orange)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Project Structure](#project-structure)

## 🎯 Overview

**NextStep** is a modern platform that empowers youth to:

- **Find Opportunities**: Browse real-time job listings and internships
- **Connect with Mentors**: Get guidance from experienced professionals
- **Track Applications**: Manage and track all job applications
- **Secure Authentication**: Sign in safely with Clerk
- **Real-time Updates**: Experience instant data synchronization with Convex

### Current Status

✅ **Phase 5 - Production Ready**

- Real-time database with Convex
- Secure authentication with Clerk
- Complete job & application system
- Mentor matching system
- In-app messaging
- User profiles & skills

---

## ✨ Core Features

### Implemented Features

- ✅ **User Profiles** - Skills, interests, and career goals
- ✅ **Authentication** - Secure sign-up/sign-in with Clerk, social auth (Google, GitHub)
- ✅ **Real-time Database** - Powered by Convex for instant updates
- ✅ **Job Listings** - Browse and apply for opportunities
- ✅ **Application Tracking** - Manage and track all applications
- ✅ **Mentor System** - Connect with experienced professionals
- ✅ **In-app Messaging** - Direct communication system
- ✅ **Detail Pages** - Rich opportunity and job detail views with applications
- ✅ **User Dashboard** - Overview of all activities

### Authentication Methods

- Email/Password with verification
- Google OAuth
- GitHub OAuth
- Secure session management

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router & Turbopack
- **Language**: TypeScript 5.0
- **Styling**: TailwindCSS 4.0
- **UI Components**: shadcn/ui with Radix UI
- **Notifications**: Sonner toast library

### Backend

- **Database**: Convex (real-time, serverless)
- **Authentication**: Clerk (with JWT templates)
- **Webhooks**: Svix for Clerk webhooks

### Development Tools

- **Build**: Next.js built-in bundler with Turbopack
- **Linting**: ESLint with Next.js config
- **Type Safety**: TypeScript strict mode

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Clerk account (https://clerk.com)
- Convex account (https://convex.dev)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/KimTRM/next-step.git
cd next-step

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Add Clerk API keys to .env.local
# Get from: https://dashboard.clerk.com → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 5. Start Convex development server
npx convex dev

# 6. In another terminal, start Next.js
npm run dev

# 7. Open http://localhost:3000
```

### First Run Checklist

- [ ] Clerk keys added to `.env.local`
- [ ] JWT template "convex" created in Clerk Dashboard
- [ ] `convex/auth.config.js` updated with your Clerk domain
- [ ] `npx convex dev` running successfully
- [ ] `npm run dev` running successfully
- [ ] Can sign up and receive verification email
- [ ] Can sign in and see profile
- [ ] User appears in Convex dashboard

---

## 📚 Documentation

### Getting Started

- **[Quick Setup](docs/CLERK-QUICK-SETUP.md)** - 5-minute setup guide
- **[Complete Setup Guide](docs/CONVEX-CLERK-SETUP.md)** - Detailed configuration

### Clerk Authentication

- **[Testing Guide](docs/CLERK-TESTING-GUIDE.md)** - Test all auth flows (30+ issues documented)
- **[Setup Completion](docs/CLERK-SETUP-COMPLETION.md)** - Implementation summary
- **[Clerk Index](docs/README-CLERK.md)** - Clerk documentation index

### Technical Documentation

- **[Architecture](docs/ARCHITECTURE.md)** - System design and data flow
- **[Developer Guide](docs/DEVELOPER-GUIDE.md)** - Development patterns
- **[Integration Summary](docs/INTEGRATION-SUMMARY.md)** - Service integrations

### Quick Reference

- **[Clerk Quick Setup](docs/CLERK-QUICK-SETUP.md)** - Get running in 5 minutes
- **[Documentation Index](docs/README-CLERK.md)** - Navigate all docs

---

## 📁 Project Structure

```
next-step/
├── app/                          # Next.js App Router
│   ├── (platform)/               # Protected routes
│   │   ├── dashboard/            # Dashboard page
│   │   ├── profile/              # User profile
│   │   ├── messages/             # Messaging system
│   │   ├── opportunities/        # Jobs & opportunities
│   │   │   └── [id]/             # Detail page
│   │   ├── jobs/                 # Job listings
│   │   │   └── [id]/             # Job detail
│   │   ├── mentors/              # Mentor system
│   │   └── applications/         # Application tracking
│   ├── api/
│   │   ├── webhooks/clerk/       # Clerk webhook handler
│   │   ├── messages/             # Message endpoints
│   │   ├── opportunities/        # Opportunity endpoints
│   │   ├── users/                # User endpoints
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Clerk & Convex providers
│   └── middleware.ts             # Route protection
│
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── opportunities/        # Opportunity components
│   │   ├── profile/              # Profile components
│   │   └── applications/         # Application components
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   ├── pages/                    # Page-level components
│   └── ui/                       # shadcn/ui components
│
├── convex/
│   ├── schema.ts                 # Database schema
│   ├── auth.config.js            # Clerk auth configuration
│   ├── users.ts                  # User queries
│   ├── userMutations.ts          # User mutations
│   ├── opportunities.ts          # Opportunity queries & mutations
│   ├── jobs.ts                   # Job queries & mutations
│   ├── applications.ts           # Application queries & mutations
│   ├── messages.ts               # Message queries & mutations
│   └── seed.ts                   # Database seeding
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # System architecture
│   ├── CONVEX-CLERK-SETUP.md     # Complete setup guide
│   ├── CLERK-QUICK-SETUP.md      # 5-minute quick start
│   ├── CLERK-TESTING-GUIDE.md    # Testing & troubleshooting
│   ├── CLERK-SETUP-COMPLETION.md # Implementation summary
│   ├── README-CLERK.md           # Clerk documentation index
│   ├── DEVELOPER-GUIDE.md        # Development patterns
│   ├── INTEGRATION-SUMMARY.md    # Service integrations
│   ├── MIGRATION-GUIDE.md        # Migration information
│   ├── REFACTORING-SUMMARY.md    # Refactoring notes
│   └── TODO.md                   # Future enhancements
│
├── lib/
│   ├── cn.ts                     # Classname utility
│   ├── types.ts                  # TypeScript types
│   ├── utils.ts                  # Helper utilities
│   └── data.ts                   # Mock/seed data
│
├── public/
│   └── assets/                   # Images and static files
│
├── scripts/
│   └── check-env.js              # Environment validation
│
└── Configuration Files
    ├── .env.example              # Environment template
    ├── .env.local                # Environment variables (gitignored)
    ├── convex.json               # Convex configuration
    ├── next.config.ts            # Next.js configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── tailwind.config.ts        # Tailwind configuration
    ├── eslint.config.mjs          # ESLint configuration
    └── package.json              # Dependencies
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build           # Build for production
npm start               # Start production server

# Database
npx convex dev          # Start Convex dev server
npx convex dashboard    # Open Convex dashboard
npx convex run seed:seedAll  # Seed database

# Validation
node scripts/check-env.js    # Validate environment variables

# Linting
npm run lint            # Run ESLint
```

### Environment Variables

**Required**:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Optional**:

```bash
CLERK_WEBHOOK_SECRET=whsec_...  # For webhook auto-sync
```

### Database Access

- **Convex Dashboard**: Run `npx convex dashboard`
- **Local Development**: Convex dev server auto-syncs
- **Production**: Use Convex Cloud dashboard

---

## 📊 Build Information

- **Routes**: 14 static + 2 dynamic = 16 total routes
- **Build Time**: ~3-4 seconds (Turbopack)
- **Bundle Size**: Optimized with tree-shaking
- **Type Safety**: 100% TypeScript coverage

### Build Status

```
✅ All routes compile successfully
✅ No TypeScript errors
✅ No console warnings
✅ Production-ready
```

---

## 🧪 Testing

### Authentication Testing

Follow the [Testing Guide](docs/CLERK-TESTING-GUIDE.md) to test:

- Sign-up with email verification
- Sign-in with credentials
- Social auth (Google, GitHub)
- Session persistence
- Sign-out flow
- Webhook integration

### Testing Tools

- Browser DevTools
- Clerk Dashboard
- Convex Dashboard
- Terminal logs

---

## 🚀 Deployment

### Production Checklist

- [ ] Switch to production Clerk keys
- [ ] Deploy Convex to production
- [ ] Configure production webhook URL
- [ ] Test authentication flows
- [ ] Enable monitoring and logging
- [ ] Set up error tracking
- [ ] Configure custom domain
- [ ] Review security settings

### Deployment Platforms

Recommended platforms:

- **Frontend**: Vercel, Netlify
- **Database**: Convex Cloud
- **Auth**: Clerk Cloud
- **CDN**: Vercel Edge, Cloudflare

---

## 📖 Additional Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Community

- [Convex Discord](https://discord.gg/convex)
- [Clerk Community](https://discord.gg/clerk)
- [Next.js Discord](https://discord.gg/nextjs)

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎯 Future Enhancements

See [TODO.md](docs/TODO.md) for:

- Planned features
- Known limitations
- Performance optimizations
- Security improvements

---

**Last Updated**: January 15, 2026  
**Version**: 5.0 (Phase 5 - Production Ready)  
**Status**: ✅ Complete & Tested

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
- **[DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)** - Developer best practices

### 📋 Planning & Tasks

- **[TODO.md](docs/TODO.md)** - Feature roadmap and planned features

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
├── lib/                           # 🔧 UTILITIES - Shared utilities
│   ├── types.ts                   # TypeScript type definitions
│   ├── utils.ts                   # Helper functions
│   └── cn.ts                      # Tailwind utility
├── lib/                           # 🔧 UTILITIES - Shared utilities
│   ├── types.ts                   # TypeScript type definitions
│   ├── utils.ts                   # Helper functions
│   └── cn.ts                      # Tailwind utility
│
├── public/                        # 📁 STATIC ASSETS
│   └── assets/                    # Images, logos, icons
│
└── docs/                          # 📚 DOCUMENTATION
    ├── README.md                  # Documentation index
    ├── ARCHITECTURE.md            # System architecture
    ├── DEVELOPER-GUIDE.md         # Developer handbook
    ├── CONVEX-QUICKSTART.md       # Quick setup guide
    ├── CONVEX-CLERK-SETUP.md      # Complete setup documentation
    ├── QUICK-START.md             # Get started in 5 minutes
    └── TODO.md                    # Feature roadmap
```

### Architecture Highlights

**Modern Serverless Architecture**:

- **Frontend Layer** (`/app`, `/components`): Next.js 16 with React 19
- **Authentication** (Clerk): Secure user management and sessions
- **Database** (Convex): Real-time serverless database with TypeScript
- **Real-time Sync**: Automatic data synchronization across all clients

**Key Features**:

- ✅ Real-time data updates without polling
- ✅ Type-safe database queries with TypeScript
- ✅ Secure authentication with social logins
- ✅ Automatic user sync between Clerk and Convex
- ✅ Serverless deployment - no infrastructure management
- ✅ Optimistic updates for instant UI feedback

---

## 🚀 Current Status

### ✅ Completed Features

- [x] Next.js 16 App Router setup
- [x] Convex real-time database integration
- [x] Clerk authentication with social logins
- [x] User profiles and management
- [x] Opportunities browsing (jobs, internships, mentorships)
- [x] Application tracking system
- [x] Real-time messaging interface
- [x] Protected routes with authentication
- [x] Responsive UI with TailwindCSS 4.0
- [x] 48+ shadcn/ui components
- [x] Database seeding scripts
- [x] Webhook integration for user sync

### 🔄 In Progress

- [ ] Enhanced search and filtering
- [ ] File uploads (avatars, resumes)
- [ ] Email notifications
- [ ] Mentor matching algorithm
- [ ] Calendar integration for mentorship sessions

### 🎯 Planned Features

See [docs/TODO.md](docs/TODO.md) for the complete roadmap.

---

## 🔌 API Structure

The application uses **Convex** for all data operations. Instead of REST API routes, the app uses real-time queries and mutations:

### Convex Queries (Read Data)

- `api.users.getUsers` - Get all users with filtering
- `api.opportunities.getOpportunities` - Browse opportunities
- `api.applications.getUserApplications` - Get user applications
- `api.messages.getConversations` - Get user conversations

### Convex Mutations (Write Data)

- `api.userMutations.createUser` - Create new user
- `api.opportunities.createOpportunity` - Post new opportunity
- `api.applications.submitApplication` - Submit application
- `api.messages.sendMessage` - Send message

### Usage in Components

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Read data (real-time)
const opportunities = useQuery(api.opportunities.getOpportunities);

// Write data
const createApplication = useMutation(api.applications.submitApplication);
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# Convex (automatically set by `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
CONVEX_DEPLOYMENT=your_deployment_name

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Optional: Override Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

See [docs/CONVEX-CLERK-SETUP.md](docs/CONVEX-CLERK-SETUP.md) for detailed setup instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## 🐛 Known Limitations

- File upload functionality not yet implemented
- Advanced search filters need enhancement
- Email notifications pending
- Calendar integration for mentorship sessions in progress
- Mobile app version not yet developed

---

## 📄 License

MIT License - feel free to use this project for your hackathon!

## 🎉 Quick Start Checklist

- [ ] Run `npm install`
- [ ] Set up environment variables (`.env.local`)
- [ ] Run `npm run convex:dev` (Convex development mode)
- [ ] Run `npm run dev` (in a new terminal)
- [ ] Visit http://localhost:3000
- [ ] Create an account via Clerk authentication
- [ ] Explore the dashboard and features
- [ ] Read [docs/CONVEX-QUICKSTART.md](docs/CONVEX-QUICKSTART.md) for setup details
- [ ] Check [docs/TODO.md](docs/TODO.md) for upcoming features
- [ ] Start building!

---

**Built with modern serverless architecture. Production-ready foundation. Happy coding! 🚀**

For detailed documentation, see the **[docs/](docs/)** folder. For questions, check the inline code comments.
