# Vairal - AI-Powered Influencer Marketing Platform

## Overview
Influencer marketing platform with landing page, auth, and brand dashboard. Dark-themed with blue brand accents (#3B82F6). Built with React + Express + Vite.

## Recent Changes
- 2026-02-23: Added Campaigns module with sidebar item (Megaphone icon), list page with table/empty state, and 8-step campaign creation wizard. Campaign data stored in localStorage. Steps: New Campaign, Campaign Setup, Budget & Payment, Choose Creators, Campaign Brief, Deliverables Setup, Reporting Setup, Review & Submit. Supports DRAFT/PUBLISHED statuses, save draft, publish validation, read-only mode for published campaigns.
- 2026-02-18: Payments page rebuilt with Calendar slot sync, date filter dropdown, dynamic summary cards, receipt upload modal, payment status tracking (paymentStatus/receiptData fields). Shared calendar-slots module extracted for cross-page data access.
- 2026-02-18: Added Calendar page with month grid, slot CRUD, localStorage persistence, mock data, filters sidebar. Merged onboarding into sign-up flow (3-step). Separated login vs signup on auth page. Removed LoginModal from landing page, buttons now navigate directly to /auth. Removed standalone /onboarding page.
- 2026-02-11: Initial landing page build with all sections. Dashboard with sidebar nav (Dashboard, Discover, Analytics, Payments). Auth system with sessions. Discover page with captiv8.io-style creator cards.

## Project Architecture
- Frontend: React with Tailwind CSS, framer-motion animations, Shadcn UI components
- Backend: Express server with session-based auth, PostgreSQL database
- Routing: wouter
- Auth: scrypt password hashing, httpOnly session cookies
- Calendar data: localStorage for user-created slots, mock data toggled separately
- Campaign data: localStorage for campaigns, mock data toggled via DummyData context

## Routes
- `/` - Landing page
- `/auth` - Sign up (default) or Login (?mode=login)
- `/coming-soon` - Creator coming soon page
- `/dashboard` - Main dashboard
- `/dashboard/discover` - Creator discovery (captiv8.io style)
- `/dashboard/analytics` - Analytics
- `/dashboard/payments` - Payments
- `/dashboard/calendar` - Calendar with slot management
- `/dashboard/campaigns` - Campaigns list
- `/dashboard/campaigns/new` - Create new campaign (wizard)
- `/dashboard/campaigns/:id` - Edit/view campaign (wizard)

## Key Files
- `client/src/pages/landing.tsx` - Landing page (hero, features, pricing, CTA, footer)
- `client/src/pages/auth.tsx` - Login view + 3-step sign-up with onboarding
- `client/src/pages/calendar.tsx` - Calendar page with slot modals, filters, localStorage
- `client/src/pages/campaigns.tsx` - Campaigns list page with table, mock data, empty state
- `client/src/pages/campaign-wizard.tsx` - 8-step campaign creation/edit wizard with left stepper
- `client/src/App.tsx` - App router with DashboardLayout
- `client/src/components/app-sidebar.tsx` - Sidebar navigation (includes Campaigns with Megaphone icon)
- `client/src/components/vairal-logo.tsx` - Reusable logo component
- `client/src/lib/dummy-data.tsx` - Shared dummy data toggle context
- `client/src/lib/calendar-slots.ts` - Shared CalendarSlot type, localStorage CRUD, currency helpers
- `client/src/lib/campaigns.ts` - Campaign type, localStorage CRUD, constants, mock data, mock creator results
- `client/src/lib/auth.tsx` - Auth context provider
- `shared/schema.ts` - Database schema (users table with onboarding fields)

## User Preferences
- Dark theme with blue brand colors (#3B82F6)
- Inter font family
- Inspired by captiv8.io, modash.io, influencermarketing.ai, passionfroot.me
- VairalLogo uses dark:brightness-0 dark:invert for theme support
