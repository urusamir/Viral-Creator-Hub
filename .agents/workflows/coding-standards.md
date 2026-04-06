---
description: Mandatory safety constraints for the Viral Creator Hub codebase. ALWAYS apply these rules when modifying any code in this project.
---

# Viral Creator Hub — Protected Code Zones

> **Updated 2026-04-06** after MVC architecture reorganization.
> Old `lib/` paths are now under `models/`, `services/`, `providers/`, and `utils/`.

## 🔒 Mandatory Workflow Rules

These rules apply to **every single task**, no exceptions:

### Step 0: Read This File First
- **ALWAYS** read this `coding-standards.md` file at the very start of every task before writing any code or running any commands.

### When to Use the Debugging / Code Review Skill
| Scenario | Action |
|---|---|
| User reports a **bug or issue** | **MUST** use the debugging workflow + code review skill before writing any fix |
| **Major changes** being pushed (multi-file edits, architecture changes, new features) | **MUST** use the code review skill to audit all changes before committing |
| **Minor / trivial fixes** (typo, single-line tweak, formatting, comment) | May ship directly — no skill invocation needed |

### Skill Invocation Order
1. Read `coding-standards.md` (this file)
2. Read the relevant skill (`SKILL.md`) — debugging workflow or code review
3. Follow the skill's methodology (predictions, scratchpad, root cause analysis, etc.)
4. Only then proceed to implement the fix or change

## ⛔ DO NOT MODIFY (unless explicitly asked)

The following files and systems are **protected zones**. They must NEVER be changed, refactored, or "improved" unless the user explicitly requests changes to them by name.

### 1. Supabase Client
- `client/src/services/supabase.ts` — Singleton client with `navigator.locks` deadlock prevention
- Do NOT change the client initialization, auth storage config, or singleton pattern
- Do NOT create additional Supabase client instances

### 2. API / Data Layer
- `client/src/services/api/calendar.ts`
- `client/src/services/api/creators.ts`
- `client/src/services/api/lists.ts`
- `client/src/services/api/campaigns.ts`
- `client/src/services/api/admin.ts`
- `client/src/services/index.ts` (barrel re-export)
- Do NOT modify any function signatures, return types, Supabase queries, or error handling in these files
- Do NOT add caching, retry logic, or middleware to these functions

### 3. Authentication Providers
- `client/src/providers/auth.provider.tsx` — Main AuthProvider (session + profile)
- `client/src/providers/auth-admin.provider.tsx` — Admin AuthProvider
- Do NOT change session initialization flow, token handling, or logout logic
- Do NOT modify the `isLoading` gating behavior

### 4. Prefetch System
- `client/src/services/prefetch.ts` — Centralized data pre-fetch cache
- `client/src/providers/prefetch.provider.tsx` — PrefetchProvider + event listeners
- Do NOT change the cache shape, slice refresh logic, or event handler wiring

### 5. Window Event System
- All `vairal-*` custom events:
  - `vairal-calendar-updated`
  - `vairal-creators-updated`
  - `vairal-lists-updated`
  - `vairal-campaigns-updated`
  - `vairal-auth-refreshed`
- Do NOT rename, remove, or change the dispatch/listen patterns for these events
- New events may be ADDED if needed, but existing ones must stay untouched

### 6. Database Connectivity
- All Supabase table schemas, RLS policies, and database structure
- Do NOT drop tables, alter columns, or modify RLS policies unless explicitly asked
- Do NOT change `user_id` foreign key relationships

### 7. QueryClient Configuration
- `client/src/services/queryClient.ts` — `staleTime: Infinity`, `retry: false` settings
- Do NOT change default query options unless explicitly asked

### 8. Models / Type Definitions
- `client/src/models/campaign.types.ts` — Campaign type + mappers + CRUD helpers
- `client/src/models/calendar.types.ts` — CalendarSlot type + constants
- `client/src/models/creators.data.ts` — Static creator dataset (223KB)
- Do NOT modify type interfaces, shared mapper functions (`mapDbRowToCampaign`, `mapDbRowToCalendarSlot`, `mapCampaignToDbPayload`), or mock data unless explicitly asked

### 9. App Shell / Routing
- `client/src/App.tsx` — Root component with "mount once, hide with CSS" strategy
- `client/src/pages/admin/layout.tsx` — Admin layout with prefetch and auth gating
- Do NOT change the routing structure, mount strategy, or provider nesting order

## ✅ Pre-commit Validation Checklist

Before completing ANY code change task, verify:

1. [ ] No files from the protected zones above were modified (unless user explicitly asked)
2. [ ] All existing CRUD operations still work (create, read, update, delete)
3. [ ] Database connectivity is preserved — no broken Supabase queries
4. [ ] Window event listeners are intact — dispatch and subscribe patterns unchanged
5. [ ] Auth flow is untouched — login, signup, logout, session refresh all work
6. [ ] Prefetch system is intact — all slices refresh correctly
7. [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)

## When in doubt

If a task REQUIRES touching a protected zone (e.g., "fix a bug in the auth provider"), **ask the user for explicit confirmation** before making the change. State clearly which protected file/system you need to modify and why.
