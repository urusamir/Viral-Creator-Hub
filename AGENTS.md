# AGENTS.md — Viral Creator Hub

> Adapted from [t3code AGENTS.md](https://github.com/pingdotgg/t3code) principles.
> Project-specific rules for the Viral Creator Hub codebase.

## Task Completion Requirements

- TypeScript must pass type-checking (`npm run check`) before considering tasks completed.
- Never leave `console.log` debug statements in production code. Use the structured `log()` helper in `server/index.ts` for server-side logging, and `console.error("[Supabase] ...")` pattern for client-side data layer errors only.
- Always verify database operations actually persist by querying back after writes.
- Run `npm run check` before closing out work.

## Project Snapshot

Viral Creator Hub is a full-stack influencer marketing platform for managing campaigns, scheduling creator content, tracking payments, and discovering influencers.

### Tech Stack

| Layer       | Technology                                              |
|-------------|--------------------------------------------------------|
| Frontend    | React 18 + Vite 7 + TypeScript 5.6, Tailwind CSS 3    |
| UI Library  | shadcn/ui (Radix primitives), Lucide icons, Framer Motion |
| Routing     | Wouter (lightweight client-side router)                |
| State       | React Context (auth, theme, dummy data), localStorage (slots, campaigns) |
| Backend     | Express 5 (Node.js), served on port 5000               |
| Database    | Supabase (PostgreSQL) via `@supabase/supabase-js`      |
| Auth        | Supabase Auth (primary), Passport.js + sessions (legacy server-side, optional) |
| ORM/Schema  | Drizzle ORM for server-side schema definitions          |

## Core Priorities

1. **Performance first.** The app uses a "mount once, hide with CSS" strategy in `App.tsx` so dashboard sub-pages never remount. Respect this pattern — never break the persistent mount by adding route-level code splitting inside the dashboard.
2. **Reliability first.** Every Supabase write must have error handling. Silent failures are the #1 source of past bugs. Always surface errors to the user via toasts.
3. **Keep behavior predictable** under network failures, auth token expiry, and partial saves. The app must gracefully degrade to localStorage when Supabase is unreachable.

If a tradeoff is required, choose correctness and robustness over short-term convenience.

## Maintainability

- **DRY Principle**: Before adding new functionality, check if shared logic already exists. There are already duplicated patterns that should be consolidated over time (see Known Technical Debt below).
- **Don't be afraid to refactor**: Don't take shortcuts by adding local logic to solve a problem. If a proper abstraction exists or should exist, use it or create it.
- **Colocation**: Keep related code together. Component-specific helpers should live near their components.
- **Explicit over implicit**: Prefer named exports, explicit type annotations on public APIs, and clear function signatures.

## Architecture Rules

### Directory Structure

```
client/src/
├── models/             # M: Types, interfaces, constants, static data
│   ├── calendar.types.ts       # CalendarSlot type + currencies/platforms constants
│   ├── campaign.types.ts       # Campaign type + constants + mock data + CRUD helpers
│   ├── creators.data.ts        # Static creator dataset (223KB, auto-generated)
│   └── mock-dates.ts           # Relative date helpers for mock/preview data
│
├── services/           # C: All data-fetching + business logic (Supabase)
│   ├── supabase.ts             # Supabase client singleton
│   ├── api/                    # Domain-specific Supabase CRUD operations
│   │   ├── calendar.ts
│   │   ├── creators.ts
│   │   ├── campaigns.ts
│   │   ├── lists.ts
│   │   └── admin.ts
│   ├── index.ts                # Barrel re-export of all api/ modules
│   ├── prefetch.ts             # Centralized data pre-fetch cache
│   └── queryClient.ts          # React Query config + API helpers
│
├── providers/          # Context providers (auth, theme, data)
│   ├── auth.provider.tsx       # AuthProvider + useAuth hook (Supabase Auth)
│   ├── auth-admin.provider.tsx # AdminAuthProvider + useAdminAuth hook
│   ├── prefetch.provider.tsx   # PrefetchProvider + usePrefetchedData hook
│   ├── theme.provider.tsx      # ThemeProvider + useTheme hook
│   └── dummy-data.provider.tsx # DummyDataProvider + useDummyData hook
│
├── utils/              # Pure utility functions
│   ├── format.ts               # Date formatting helpers
│   └── platform.tsx            # PlatformIcon component + platform constants
│
├── lib/                # Shared utilities (shadcn/ui compatibility)
│   └── utils.ts                # cn() helper (imported by all shadcn/ui components)
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── components/         # Reusable UI components (shadcn/ui + custom)
│   ├── ui/
│   ├── app-sidebar.tsx
│   ├── admin-sidebar.tsx
│   └── vairal-logo.tsx
│
├── pages/              # V: Page-level components (one per route)
│   ├── admin/
│   ├── auth.tsx
│   ├── admin-auth.tsx
│   ├── landing.tsx
│   ├── dashboard.tsx
│   ├── discover.tsx
│   ├── calendar.tsx
│   ├── payments.tsx
│   ├── campaigns.tsx
│   ├── campaign-wizard.tsx
│   ├── lists.tsx
│   ├── list-detail.tsx
│   ├── analytics.tsx
│   ├── onboarding.tsx
│   ├── coming-soon.tsx
│   └── not-found.tsx
│
├── App.tsx
├── main.tsx
└── index.css
```

### Database Layer

- **All Supabase interactions go through `client/src/services/api/`** (domain-specific modules) or `client/src/services/index.ts` (barrel re-export). NEVER call `supabase.from()` directly from page components.
- Every database function must:
  1. Log the operation with `console.log("[Supabase] ...")` on entry
  2. Handle errors with `console.error("[Supabase] ...")` and return a safe fallback (`[]`, `null`, `false`)
  3. Show user-facing error toasts for write failures
- Use the `user_id` column consistently across all tables for future RLS re-enablement.
- **RLS is currently DISABLED** on all tables for development. This must be re-enabled before public launch using `auth.uid() = user_id` policies.

### Data Flow Pattern: Optimistic Local-First

The app follows a **local-first, Supabase-second** pattern for all user data:

1. **Write to localStorage immediately** (instant UI feedback)
2. **Fire-and-forget to Supabase** in the background
3. **On page load**: Fetch from Supabase, merge with localStorage (Supabase wins for matching IDs, keep local-only entries)
4. **On Supabase failure**: Fall back to localStorage silently

This pattern is used in both `calendar.tsx` and `campaigns.ts`. Any new data features MUST follow this same pattern.

### Dual Auth System

The codebase has two auth systems:

| System | Location | Purpose |
|--------|----------|---------|
| **Supabase Auth** (primary) | `client/src/lib/auth.tsx` | Frontend auth, JWT-based, used by all client-side code |
| **Passport.js** (legacy) | `server/auth.ts` | Server-side sessions, only active when `DATABASE_URL` is set |

**Rule**: All new features should use Supabase Auth exclusively. The Passport.js system is legacy and should not be extended.

### State Management

- **Auth state**: `AuthProvider` context (`useAuth()` hook)
- **Theme**: `ThemeProvider` context
- **Dummy data toggle**: `DummyDataProvider` context (each page also has its own `showDummy` local state — this is a known inconsistency)
- **Calendar slots & Campaigns**: localStorage + Supabase sync (no React Query usage for these features currently)
- **React Query**: Configured but underutilized. `staleTime: Infinity` and `retry: false` are set globally.

### Page Component Pattern

Every dashboard page follows this pattern:
1. Import `useAuth()` to get the current user
2. Maintain a `showDummy` toggle for preview data vs. real data
3. Load real data from Supabase on mount, merge with localStorage
4. Listen for cross-tab sync events via `window.addEventListener`
5. Render mock data or real data based on `showDummy` state

## Known Technical Debt

These are existing issues that should be addressed over time:

### Critical
- **`creators-data.ts` is 223KB of hardcoded JSON** (10,154 lines). This should be moved to Supabase or loaded lazily. It currently gets bundled into the client JavaScript, slowing initial page load.

### Moderate
- ~~**`PlatformIcon` component is duplicated**~~ — ✅ Resolved. Centralized in `utils/platform.tsx`.
- ~~**`formatDisplayDate` utility is duplicated**~~ — ✅ Resolved. Centralized in `utils/format.ts`.
- ~~**`platformIcons` and `platformColors` maps are duplicated**~~ — ✅ Resolved. Centralized in `utils/platform.tsx`.
- **Mock data is hardcoded inline** in `calendar.tsx`, `payments.tsx`, and `dashboard.tsx`. Should be consolidated into a single `models/mock-data.ts` file.
- **`DummyDataProvider` context exists** but each page manages its own `showDummy` state independently, defeating the purpose.
- **Campaign CRUD logic mixes concerns**: `models/campaign.types.ts` contains types, constants, mock data, AND CRUD ops. Consider splitting into separate files.

### Low Priority
- **`shared/schema.ts` only defines a `users` table** with `username`/`password` fields (Passport.js legacy). The actual database has 12+ tables managed through Supabase directly. The Drizzle schema is out of sync and unused for most features.
- **`test-insert.ts` and `test-save.ts`** are leftover debug scripts in the project root that should be removed.
- **`package.json` name is `rest-express`** — should be renamed to `viral-creator-hub`.

## Error Handling (Mandatory)

- NEVER silently swallow errors. At minimum, `console.error` every catch block.
- User-facing operations (save, delete, update) must show toast notifications on both success AND failure.
- When Supabase writes fail, data must still be preserved in localStorage.
- Network failures should be retried once before surfacing an error.

## Security Notes

- **RLS is currently DISABLED** for all tables during development.
- When re-enabling RLS, create policies using `auth.uid() = user_id` on all tables.
- Never expose `service_role` keys in client-side code.
- The `VITE_SUPABASE_ANON_KEY` is a publishable key — safe for client-side.
- Environment variables with secrets must only be in `.env` (gitignored).
- The `SESSION_SECRET` in `server/auth.ts` falls back to a hardcoded default — must be set properly before production.

## Code Style

- Use TypeScript strict mode. Avoid `any` types — use `unknown` and narrow with type guards.
- Prefer `async/await` over `.then()` chains.
- Use early returns to reduce nesting.
- Component files should export a single default component. Supporting types and utilities can be named exports.
- CSS: Use Tailwind utility classes consistently. Use the design system's CSS variables (`--foreground`, `--background`, `--muted`, etc.) for colors.
- All interactive elements must have unique `data-testid` attributes for browser testing.
