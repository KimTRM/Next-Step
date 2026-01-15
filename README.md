# NextStep - Youth Job & Mentorship Platform

> **🚀 Modern Job & Mentorship Platform**
>
> A comprehensive job and mentorship platform designed to connect youth with career opportunities and experienced mentors. Powered by **Convex** for real-time data and **Clerk** for secure authentication!

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8)
![Convex](https://img.shields.io/badge/Convex-Database-orange)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

**Phase 5 - Production Ready** ✅

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)

## 🎯 Overview

**NextStep** is a modern platform that empowers youth to:

- **Find Opportunities**: Browse real-time job listings and internships
- **Connect with Mentors**: Get guidance from experienced professionals
- **Track Applications**: Manage and track all job applications
- **Secure Authentication**: Sign in safely with Clerk
- **Real-time Updates**: Experience instant data synchronization with Convex

### Status

✅ Real-time database with Convex  
✅ Secure authentication with Clerk  
✅ Complete job & application system  
✅ Mentor matching system  
✅ In-app messaging  
✅ User profiles & skills management

---

## ✨ Core Features

### Implemented

- ✅ **User Profiles** - Skills, interests, and career goals
- ✅ **Authentication** - Secure sign-up/sign-in with Clerk, Google & GitHub OAuth
- ✅ **Real-time Database** - Powered by Convex for instant updates
- ✅ **Job Listings** - Browse and apply for opportunities
- ✅ **Application Tracking** - Manage and track all applications
- ✅ **Mentor System** - Connect with experienced professionals
- ✅ **In-app Messaging** - Direct communication system
- ✅ **Detail Pages** - Rich opportunity and job detail views
- ✅ **User Dashboard** - Real-time overview of all activities

### In Progress

- [ ] Enhanced search and filtering
- [ ] File uploads (avatars, resumes)
- [ ] Email notifications
- [ ] Mentor matching algorithm
- [ ] Calendar integration for mentorship sessions

---

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router & Turbopack
- **Language**: TypeScript 5.0
- **Styling**: TailwindCSS 4.0
- **UI Components**: shadcn/ui with Radix UI
- **Notifications**: Sonner toast library
- **State Management**: React Hooks + Convex Queries

### Backend

- **Database**: Convex (real-time, serverless)
- **Authentication**: Clerk (with JWT templates)
- **Webhooks**: Svix for Clerk webhooks

### Development Tools

- **Build**: Next.js with Turbopack
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

All documentation is organized in the [docs/](docs/) folder:

### Getting Started

- **[CONVEX-QUICKSTART.md](docs/CONVEX-QUICKSTART.md)** - Quick setup (START HERE!)
- **[CONVEX-CLERK-SETUP.md](docs/CONVEX-CLERK-SETUP.md)** - Complete setup guide
- **[CLERK-QUICK-SETUP.md](docs/CLERK-QUICK-SETUP.md)** - 5-minute quick reference

### Clerk Authentication

- **[CLERK-TESTING-GUIDE.md](docs/CLERK-TESTING-GUIDE.md)** - Test all auth flows (30+ issues documented)
- **[CLERK-SETUP-COMPLETION.md](docs/CLERK-SETUP-COMPLETION.md)** - Implementation summary
- **[README-CLERK.md](docs/README-CLERK.md)** - Clerk documentation index

### Technical Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design and data flow
- **[DEVELOPER-GUIDE.md](docs/DEVELOPER-GUIDE.md)** - Development patterns
- **[INTEGRATION-SUMMARY.md](docs/INTEGRATION-SUMMARY.md)** - Service integrations
- **[TODO.md](docs/TODO.md)** - Feature roadmap and planned features

---

## 📁 Project Structure

```
next-step/
├── app/                          # Next.js App Router
│   ├── (platform)/               # Protected routes
│   │   ├── dashboard/            # Dashboard page
│   │   ├── profile/              # User profile
│   │   ├── messages/             # Messaging system
│   │   ├── opportunities/[id]/   # Job/opportunity details
│   │   ├── jobs/[id]/            # Job detail pages
│   │   ├── mentors/              # Mentor system
│   │   └── applications/         # Application tracking
│   ├── (auth)/                   # Auth routes
│   │   ├── auth/page.tsx         # Login page
│   │   └── sign-up/page.tsx      # Sign-up page
│   ├── api/webhooks/clerk/       # Clerk webhook handler
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Clerk & Convex providers
│   └── middleware.ts             # Route protection
│
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── opportunities/
│   │   ├── profile/
│   │   ├── applications/
│   │   ├── messages/
│   │   └── jobs/
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── ui/                       # shadcn/ui components (50+)
│
├── convex/                       # Real-time database (Convex)
│   ├── schema.ts                 # Database schema
│   ├── auth.config.js            # Clerk authentication config
│   ├── users.ts                  # User queries
│   ├── userMutations.ts          # User mutations
│   ├── opportunities.ts          # Opportunity operations
│   ├── applications.ts           # Application operations
│   ├── messages.ts               # Message operations
│   └── seed.ts                   # Database seeding
│
├── docs/                         # Documentation (13 files)
├── lib/                          # Utilities
├── public/                       # Static assets
├── scripts/                      # Utility scripts (env validator)
│
└── Configuration Files
    ├── .env.example
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── eslint.config.mjs
    └── package.json
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
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Database Access

- **Convex Dashboard**: Run `npx convex dashboard`
- **Local Development**: Convex dev server auto-syncs
- **Production**: Use Convex Cloud dashboard

---

## 📊 Build Information

- **Routes**: 14 static + 2 dynamic = 16 total routes
- **Build Time**: ~3-4 seconds (Turbopack)
- **Type Safety**: 100% TypeScript coverage
- **Status**: ✅ All routes compile successfully, zero errors

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

- [ ] Switch to production Clerk keys (pk*live*, sk*live*)
- [ ] Deploy Convex to production (`npx convex deploy`)
- [ ] Configure production webhook URL
- [ ] Test authentication flows in production
- [ ] Enable monitoring and logging
- [ ] Set up error tracking
- [ ] Configure custom domain
- [ ] Review security settings

### Recommended Deployment Platforms

- **Frontend**: Vercel, Netlify
- **Database**: Convex Cloud
- **Auth**: Clerk Cloud
- **CDN**: Vercel Edge, Cloudflare

---

## 🔌 Convex API Structure

The application uses **Convex** for all data operations with real-time queries and mutations:

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

## 📖 Additional Resources

### Official Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Community

- [Convex Discord](https://discord.gg/convex)
- [Clerk Community](https://discord.gg/clerk)
- [Next.js Discord](https://discord.gg/nextjs)

---

## 🐛 Known Limitations

- File upload functionality not yet implemented
- Advanced search filters need enhancement
- Email notifications pending
- Calendar integration for mentorship sessions in progress
- Mobile app version not yet developed

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Getting Up and Running

1. Run `npm install`
2. Set up environment variables (`.env.local`)
3. Run `npx convex dev` (Convex development mode)
4. Run `npm run dev` (in a new terminal)
5. Visit http://localhost:3000
6. Create an account via Clerk authentication
7. Explore the dashboard and features

See [docs/CONVEX-QUICKSTART.md](docs/CONVEX-QUICKSTART.md) for detailed setup and [docs/TODO.md](docs/TODO.md) for upcoming features.

---

**Last Updated**: January 15, 2026  
**Version**: 5.0 (Phase 5 - Production Ready)

Built with modern serverless architecture. Production-ready foundation. Happy coding! 🚀

For detailed documentation, see the **[docs/](docs/)** folder. For questions, check the inline code comments.
