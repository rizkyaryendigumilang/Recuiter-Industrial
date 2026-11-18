# Plan 003: Unify PocketBase Default Port Across Client and Server Endpoints

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1ea7139..HEAD -- frontend/src/app/api/health/route.ts frontend/src/app/api/auth/telegram/route.ts frontend/src/app/api/submit-test/route.ts frontend/src/lib/pocketbase.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt / architecture
- **Planned at**: commit `1ea7139`, 2026-11-18

## Why this matters

In `frontend/src/lib/pocketbase.ts`, the default PocketBase URL falls back to port `8090` (`http://127.0.0.1:8090`). However, three server-side API routes (`/api/health`, `/api/auth/telegram`, `/api/submit-test`) fall back to port `8093` (`http://127.0.0.1:8093`). When developing locally without explicit environment variables, the browser and client SDK connect to PocketBase on port 8090, but server-side health checks and test verification requests attempt to reach port 8093, causing connection refused (`ECONNREFUSED`) errors and reporting PocketBase as offline.

## Current state

In `frontend/src/lib/pocketbase.ts:10`:
```typescript
return process.env.PB_INTERNAL_URL || 'http://127.0.0.1:8090';
```

In `frontend/src/app/api/health/route.ts:6`:
```typescript
const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8093';
```

In `frontend/src/app/api/auth/telegram/route.ts:76`:
```typescript
const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8093';
```

In `frontend/src/app/api/submit-test/route.ts:43`:
```typescript
const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8093';
```

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Typecheck | `npx tsc -p frontend/tsconfig.json --noEmit` | exit 0, no errors |
| Test      | `npm test`               | exit 0, all pass |

## Scope

**In scope**:
- `frontend/src/app/api/health/route.ts`
- `frontend/src/app/api/auth/telegram/route.ts`
- `frontend/src/app/api/submit-test/route.ts`

**Out of scope**:
- Do not modify PocketBase migration files.
- Do not change VPS deployment workflow environment variable overrides.

## Step-by-step implementation

### Step 1: Standardize default fallback port to `8090`

In:
1. `frontend/src/app/api/health/route.ts:6`
2. `frontend/src/app/api/auth/telegram/route.ts:76`
3. `frontend/src/app/api/submit-test/route.ts:43`

Replace `'http://127.0.0.1:8093'` with `'http://127.0.0.1:8090'`.

### Step 2: Verification

Run:
```bash
npx tsc -p frontend/tsconfig.json --noEmit
npm test
```
Confirm all 100 tests pass without regressions.

## STOP conditions

- If any automated test explicitly tests port 8093, inspect the test and preserve environment variable priority (`process.env.PB_INTERNAL_URL` takes precedence).
