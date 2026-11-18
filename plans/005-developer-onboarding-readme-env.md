# Plan 005: Create Developer Onboarding README and Frontend .env.example

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1ea7139..HEAD -- README.md frontend/.env.example`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: docs / dx
- **Planned at**: commit `1ea7139`, 2026-11-18

## Why this matters

The repository currently lacks a top-level `README.md` and `frontend/.env.example`. New engineers and autonomous agents cloning the codebase must inspect package files and source code to determine how to run tests, start the Next.js server, build the mobile Capacitor shell, or configure necessary environment variables (`NEXT_PUBLIC_PB_URL`, `CALENDAR_FEED_SECRET`, `STATUS_WEBHOOK_SECRET`, S3 storage credentials). Documenting this eliminates setup friction and prevents misconfigured local environments.

## Current state

- Root directory has `AGENTS.md` and `GLOSSARY.md`, but no `README.md`.
- `backend/` has `.env.example`, but `frontend/` has only `.env.local` (which is ignored by git), leaving frontend env vars undocumented.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Verification | `git status -s`       | clean or untracked new files |

## Scope

**In scope**:
- `README.md` (create at root)
- `frontend/.env.example` (create)

**Out of scope**:
- Never commit actual secrets or live tokens into `README.md` or `.env.example`.
- Do not modify `.gitignore`.

## Step-by-step implementation

### Step 1: Create `frontend/.env.example`

Include all standard environment variables with descriptive placeholder values:
```bash
# PocketBase Backend URLs
NEXT_PUBLIC_PB_URL=http://127.0.0.1:8090
PB_INTERNAL_URL=http://127.0.0.1:8090

# Optional Deployment Base Path (leave empty for root domain)
NEXT_PUBLIC_BASE_PATH=

# Contact & Helpdesk Integration
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890

# Security Tokens & Secrets
CALENDAR_FEED_SECRET=dev_calendar_secret_local
NEXT_PUBLIC_CALENDAR_TOKEN=dev_calendar_secret_local
WEBHOOK_SIGNING_SECRET=dev_webhook_secret_local
TELEGRAM_BOT_TOKEN=

# Object Storage (Cloudflare R2 / S3 Fallback - Optional)
# S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
# S3_BUCKET=recruiter-industrial
# S3_ACCESS_KEY=
# S3_SECRET_KEY=
# S3_REGION=auto
```

### Step 2: Create root `README.md`

Structure the `README.md` clearly:
1. Overview of Recruiter Industrial (Industrial Recruitment & Kraepelin Psychometric platform).
2. Architecture Summary (Next.js 16 frontend, PocketBase backend, Capacitor mobile wrapper).
3. Quickstart Guide (Node.js version, installation, running PocketBase, running Next.js).
4. Testing & Verification commands (`npm test`, `npx tsc -p frontend/tsconfig.json --noEmit`, `npm run build`).
5. Mobile Build instructions (`npm run build`, `npm run cap:sync`).

## STOP conditions

- If any actual API token or password is accidentally written, immediately remove it before staging.
