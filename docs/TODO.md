# NextStep Platform - TODO List

This document contains all planned features and improvements for the NextStep platform.

---

## ✅ Recently Completed

### Integration & Architecture (January 2026)

-   [x] Integrated NextStep Vite app components into Next.js
-   [x] **Converted to proper Next.js App Router with file-based routing**
-   [x] **Implemented REST API pattern (Frontend → API → Business Logic → Data)**
-   [x] Added NextStep logo asset (`/assets/logo.png`)
-   [x] Updated Header with Next.js Link and usePathname
-   [x] Created proper routes: /, /jobs, /mentors, /applications, /profile
-   [x] Fixed all shadcn/ui component imports (button, card, input)
-   [x] Renamed UI components to lowercase for consistency
-   [x] Integrated 48 shadcn/ui components
-   [x] Applied monochromatic green color scheme
-   [x] Added Placard Condensed display font
-   [x] Created comprehensive developer documentation

---

## 📁 Authentication & User Management

### Auth Page (`app/auth/page.tsx`)

-   [ ] Implement actual authentication (NextAuth.js, Clerk, or Supabase Auth)
-   [ ] Add OAuth providers (Google, GitHub, LinkedIn)
-   [ ] Add password validation
-   [ ] Add "Forgot Password" functionality
-   [ ] Add email verification
-   [ ] Add role selection during signup
-   [ ] Redirect to dashboard after successful login
-   [ ] Implement OAuth buttons functionality

---

## 👤 Profile Management

### Profile Form (`components/features/profile/ProfileForm.tsx`)

-   [ ] Add image upload for avatar
-   [ ] Add skills tags input (multi-select)
-   [ ] Add form validation with error handling
-   [ ] Add save/cancel functionality with API integration
-   [ ] Add success/error toast notifications
-   [ ] Add role-specific fields based on user role

---

## 📋 Applications

### Applications Page (`app/applications/page.tsx`)

-   [ ] Fetch data from API route
-   [ ] Add filtering by status (pending, accepted, rejected)
-   [ ] Make filter tabs functional
-   [ ] Add sorting options
-   [ ] Add withdraw application functionality
-   [ ] Show application timeline/history
-   [ ] Add notes/comments on applications

---

## 🔔 Navigation & Layout

### Navbar (`components/layout/Navbar.tsx`)

-   [ ] Add mobile responsive menu (hamburger)
-   [ ] Add notifications dropdown
-   [ ] Add user profile dropdown with logout
-   [ ] Add search functionality in navbar
-   [ ] Highlight active page
-   [ ] Replace with actual user state
-   [ ] Implement mobile menu

### Sidebar (`components/layout/Sidebar.tsx`)

-   [ ] Add collapsible sidebar for mobile
-   [ ] Add icons for each menu item
-   [ ] Add nested menu items (e.g., Settings submenu)
-   [ ] Add badge indicators (e.g., unread messages count)
-   [ ] Add user info section at top/bottom

---

## 💼 Opportunities

### Opportunity Card (`components/features/opportunities/OpportunityCard.tsx`)

-   [ ] Add bookmark/save functionality
-   [ ] Add share functionality
-   [ ] Add apply button with modal
-   [ ] Add tags for skills with colors
-   [ ] Add company logo display

---

## 🎨 UI Components

### Button Component (`components/ui/Button.tsx`)

-   [ ] Add loading state with spinner
-   [ ] Add icon support (left/right icons)
-   [ ] Add disabled state styling
-   [ ] Consider using a UI library like shadcn/ui or Material-UI

---

## 🏠 Pages

### Landing Page (`app/page.tsx`)

-   [ ] Add hero section with compelling copy
-   [ ] Add features section
-   [ ] Add testimonials
-   [ ] Add statistics/impact numbers
-   [ ] Add footer with links
-   [ ] Make it responsive and visually appealing

### Dashboard Page (`app/dashboard/page.tsx`)

-   [ ] Add charts/graphs for activity stats
-   [ ] Add quick actions (apply to job, message mentor)
-   [ ] Add recent activity feed
-   [ ] Customize dashboard based on user role
-   [ ] Add notifications panel
-   [ ] Add upcoming mentorship sessions calendar

---

## 🔌 API Routes

### Opportunities API (`app/api/opportunities/route.ts`)

-   [ ] Add POST endpoint for creating opportunities (employers/mentors)
-   [ ] Add PUT/PATCH endpoint for updating opportunities
-   [ ] Add DELETE endpoint for removing opportunities
-   [ ] Add pagination support
-   [ ] Add sorting (by date, relevance, etc.)
-   [ ] Add advanced search and filtering
-   [ ] Connect to real database

### Users API (`app/api/users/route.ts`)

-   [ ] Add POST endpoint for user registration
-   [ ] Add PUT endpoint for updating user profile
-   [ ] Add GET /api/users/[id] for single user
-   [ ] Add authentication and authorization
-   [ ] Connect to real database (MongoDB, PostgreSQL, Supabase)
-   [ ] Add input validation and error handling

---

## 💾 Data Layer

### Mock Data (`lib/data.ts`)

-   [ ] Replace with real database (MongoDB, PostgreSQL, Supabase)
-   [ ] Add more diverse sample data
-   [ ] Create seed scripts for database population
-   [ ] Add search function for opportunities by skills
-   [ ] Add filtering by location, remote options
-   [ ] Add sorting by date, relevance
-   [ ] Add pagination helpers

### Type Definitions (`lib/types.ts`)

-   [ ] Add more fields as features grow (e.g., ratings, reviews)
-   [ ] Create validation schemas using Zod
-   [ ] Add enums for status types (PENDING, ACCEPTED, etc.)

---

## 💬 Messages

### Messages Page (`app/messages/page.tsx`)

-   [ ] Fetch data from API route
-   [ ] Add real-time messaging (WebSockets/Pusher/Socket.io)
-   [ ] Add conversation list/sidebar
-   [ ] Add message input and send functionality
-   [ ] Add file attachments
-   [ ] Add read receipts
-   [ ] Add typing indicators
-   [ ] Add search conversations
-   [ ] Send message to API

### Messages API (`app/api/messages/route.ts`)

-   [ ] Add POST endpoint for sending messages
-   [ ] Add PUT endpoint for marking messages as read
-   [ ] Add DELETE endpoint for deleting messages
-   [ ] Add real-time messaging with WebSockets or Pusher
-   [ ] Add message threading/conversations
-   [ ] Add file attachment support
-   [ ] Implement authentication to get current user
-   [ ] Get list of conversations (unique users)

---

## 💼 Opportunities (Extended)

### Opportunities Page (`app/opportunities/page.tsx`)

-   [ ] Add search functionality
-   [ ] Add filters (type, location, remote, skills)
-   [ ] Make search and filters functional
-   [ ] Make filter tabs functional
-   [ ] Add sorting options
-   [ ] Add pagination
-   [ ] Add bookmarking/saving opportunities
-   [ ] Fetch data from API instead of importing directly

### Opportunity Detail Page (`app/opportunities/[id]/page.tsx`)

-   [ ] Fetch data from API route
-   [ ] Add "Apply" button with modal/form
-   [ ] Add "Save" bookmark functionality
-   [ ] Add "Share" functionality
-   [ ] Show related opportunities
-   [ ] Display company/mentor profile
-   [ ] Add application deadline countdown
-   [ ] Add more sections to opportunity details
-   [ ] Expand company/mentor information

---

## 👤 Profile (Extended)

### Profile Page (`app/profile/page.tsx`)

-   [ ] Add view/edit mode toggle
-   [ ] Add portfolio section (projects, links)
-   [ ] Add resume upload
-   [ ] Add education history
-   [ ] Add work experience section
-   [ ] Add achievements/certifications
-   [ ] Make profile public/private
-   [ ] Implement additional profile sections

---

## 🎨 UI Components (Extended)

### Card Component (`components/ui/Card.tsx`)

-   [ ] Add card variants (elevated, outlined, filled)
-   [ ] Add hover effects for interactive cards
-   [ ] Add card actions (buttons in footer)
-   [ ] Add card media support (images, videos)

### Input Component (`components/ui/Input.tsx`)

-   [ ] Add input types (email, password, number, textarea)
-   [ ] Add character counter for text areas
-   [ ] Add input validation and error messages
-   [ ] Add prefix/suffix support (icons, text)

---

## 🛠️ Utilities

### Utility Functions (`lib/utils.ts`)

-   [ ] Add date formatting helpers
-   [ ] Add validation functions
-   [ ] Add string manipulation utilities
-   [ ] Add localStorage helpers for client-side state
-   [ ] Replace generateId with UUID library or database-generated IDs

---

## 📝 Priority Matrix

### High Priority (Core Functionality)

1. Implement real authentication system
2. Connect to real database
3. Build API endpoints for CRUD operations
4. Add input validation and error handling

### Medium Priority (Enhanced Features)

1. Add filtering and sorting across all pages
2. Implement user profile management
3. Add notifications system
4. Mobile responsiveness

### Low Priority (Nice to Have)

1. Charts and graphs
2. OAuth providers
3. Advanced search
4. Testimonials and marketing content

---

**Last Updated:** January 12, 2026
