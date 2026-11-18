# Plan 002: Synchronize Calendar ICS Feed Secret and Base Path

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1ea7139..HEAD -- frontend/src/app/admin/page.tsx frontend/src/app/api/calendar/interviews.ics/route.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug / correctness
- **Planned at**: commit `1ea7139`, 2026-11-18

## Why this matters

The admin dashboard provides a button "Langganan Kalender (.ICS)" to subscribe to interviews and consultations in Outlook/Google Calendar. Currently, `frontend/src/app/admin/page.tsx:802` falls back to token `'hrtech_calendar_sec_2026'` and basePath `'/recruiter'`. However, `frontend/src/app/api/calendar/interviews.ics/route.ts:28` falls back to `'dev_calendar_secret_local'`. In any local or demo environment where custom env vars are unset, clicking the calendar subscription button returns HTTP 401 Unauthorized due to token mismatch, and on standard root deployments causes a 404 from the hardcoded `/recruiter` prefix.

## Current state

In `frontend/src/app/admin/page.tsx:802-807`:
```tsx
const calToken = process.env.NEXT_PUBLIC_CALENDAR_TOKEN || 'hrtech_calendar_sec_2026';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';
return (
  <>
    <a
      href={`${basePath}/api/calendar/interviews.ics?token=${calToken}`}
```

In `frontend/src/app/api/calendar/interviews.ics/route.ts:26-28`:
```typescript
const VALID_CALENDAR_TOKEN =
  process.env.CALENDAR_FEED_SECRET ||
  (process.env.NODE_ENV !== 'production' ? 'dev_calendar_secret_local' : '');
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npx tsc -p frontend/tsconfig.json --noEmit` | exit 0, no errors |
| Test      | `npm test`               | exit 0, all pass |
| Build     | `npm run --prefix frontend build` | exit 0, all routes compiled |

## Scope

**In scope**:
- `frontend/src/app/admin/page.tsx`
- `frontend/src/app/api/calendar/interviews.ics/route.ts`
- `test/total-security-hardening.test.mjs`

**Out of scope**:
- Do not remove timingSafeEqual comparison in `interviews.ics/route.ts`.
- Do not expose production secrets in client bundles.

## Step-by-step implementation

### Step 1: Update client-side token and base path in `frontend/src/app/admin/page.tsx`

In `admin/page.tsx:802-807`:
1. Align fallback calendar token to match server:
```tsx
const calToken = process.env.NEXT_PUBLIC_CALENDAR_TOKEN || 'dev_calendar_secret_local';
```
2. Clean the base path resolution:
```tsx
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const cleanBasePath = basePath === '' ? '' : (basePath.startsWith('/') ? basePath : `/${basePath}`);
const downloadUrl = `${cleanBasePath}/api/calendar/interviews.ics?token=${calToken}`.replace(/\/+/g, '/');
```
3. Use `href={downloadUrl}` on the download anchor.

### Step 2: Accept `NEXT_PUBLIC_CALENDAR_TOKEN` in `interviews.ics/route.ts`

Ensure `VALID_CALENDAR_TOKEN` recognizes `NEXT_PUBLIC_CALENDAR_TOKEN` as a valid token source:
```typescript
const VALID_CALENDAR_TOKEN =
  process.env.CALENDAR_FEED_SECRET ||
  process.env.NEXT_PUBLIC_CALENDAR_TOKEN ||
  (process.env.NODE_ENV !== 'production' ? 'dev_calendar_secret_local' : '');
```

### Step 3: Verify and test

Run:
```bash
npx tsc -p frontend/tsconfig.json --noEmit
npm test
```
Confirm all tests pass and TypeScript check is clean.

## STOP conditions

- If `CALENDAR_FEED_SECRET` in production is empty, the route should still reject unauthorized requests (HTTP 500 server misconfiguration).
