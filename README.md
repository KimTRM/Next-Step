# NextStep - Youth Job & Mentorship Platform

> **🚀 Modern Job & Mentorship Platform**
>
> A comprehensive jobseeker and mentorship platform designed to connect youth with career opportunities and experienced mentors. Powered by **Convex** for real-time data and **Clerk** for secure authentication!

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
- [Contributing](#contributing)

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
