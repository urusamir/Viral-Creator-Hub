---
description: Mandatory safety constraints for the Viral Creator Hub codebase. ALWAYS apply these rules when modifying any code in this project.
---

# Viral Creator Hub — Protected Code Zones

## ⛔ DO NOT MODIFY (unless explicitly asked)

The following files and systems are **protected zones**. They must NEVER be changed, refactored, or "improved" unless the user explicitly requests changes to them by name.

### 1. Supabase Client
- `client/src/lib/supabase.ts` — Singleton client with `navigator.locks` deadlock prevention
- Do NOT change the client initialization, auth storage config, or singleton pattern
- Do NOT create additional Supabase client instances

### 2. API / Data Layer
- `client/src/lib/api/calendar.ts`
- `client/src/lib/api/creators.ts`
- `client/src/lib/api/lists.ts`
- `client/src/lib/api/campaigns.ts`
- `client/src/lib/api/admin.ts`
- `client/src/lib/supabase-data.ts` (index barrel)
- Do NOT modify any function signatures, return types, Supabase queries, or error handling in these files
- Do NOT add caching, retry logic, or middleware to these functions

### 3. Authentication Providers
- `client/src/lib/auth.tsx` — Main AuthProvider (session + profile)
- `client/src/lib/auth-admin.tsx` — Admin AuthProvider
- Do NOT change session initialization flow, token handling, or logout logic
- Do NOT modify the `isLoading` gating behavior

### 4. Window Event System
- All `vairal-*` custom events (`vairal-calendar-updated`, `vairal-creators-updated`, `vairal-lists-updated`, `vairal-auth-refreshed`)
- Do NOT rename, remove, or change the dispatch/listen patterns for these events
- New events may be ADDED if needed, but existing ones must stay untouched

### 5. Database Connectivity
- All Supabase table schemas, RLS policies, and database structure
- Do NOT drop tables, alter columns, or modify RLS policies unless explicitly asked
- Do NOT change `user_id` foreign key relationships

### 6. QueryClient Configuration
- `client/src/lib/queryClient.ts` — `staleTime: Infinity`, `retry: false` settings
- Do NOT change default query options unless explicitly asked

## ✅ Pre-commit Validation Checklist

Before completing ANY code change task, mentally verify:

1. [ ] No files from the protected zones above were modified
2. [ ] All existing CRUD operations still work (create, read, update, delete)
3. [ ] Database connectivity is preserved — no broken Supabase queries
4. [ ] Window event listeners are intact — dispatch and subscribe patterns unchanged
5. [ ] Auth flow is untouched — login, signup, logout, session refresh all work
6. [ ] TypeScript compiles with zero errors (`npx tsc --noEmit`)

## When in doubt

If a task REQUIRES touching a protected zone (e.g., "add a new column to the database"), **ask the user for explicit confirmation** before making the change. State clearly which protected file/system you need to modify and why.
