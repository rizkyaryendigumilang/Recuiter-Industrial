# Backend Improvements (1 to 7) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 7 core enterprise backend improvements across PocketBase and Next.js: Real PDF Document Parser, SQLite WAL Concurrency, Rate Limiting, Audit Trail Ledger, Async Event Dispatcher, Encrypted Disaster Recovery Backup, and Object Storage Decoupling Adapter.

**Architecture:** A resilient dual-tier backend architecture combining PocketBase (SQLite + Goja hooks + Schema migrations) and Next.js 16 API Routes (Node.js engine, Edge-ready middleware, and cryptographic utilities). Security rules, append-only ledgers, and database concurrency are enforced in PocketBase; file processing, streaming text extraction, and API rate limiting are handled cleanly in Next.js server routes.

**Tech Stack:** PocketBase (v0.20+ hooks & migrations), Next.js 16 (Turbopack, TypeScript), Node.js native crypto & fs streams, SQLite WAL engine.

**Spec:** Direct user instruction based on AI Engineering Team (Backend, Architect, Security, and DevOps roles).

## Global Constraints

- Must maintain 100% backward compatibility with existing frontend client calls and schema.
- All database migrations must support both `up` (migrate) and `down` (rollback).
- Zero external heavy native C++ binary dependencies (pure JavaScript/TypeScript parsers and native Node.js APIs).
- Must pass all existing 47 unit & integration tests (`npm test`) plus new test suites.
- Next.js production build (`npm run build`) and TypeScript typecheck (`npx tsc --noEmit`) must succeed with 0 errors.

## Review Focus

1. **High Concurrency SQLite Locks**: Multiple parallel writes must not trigger `database is locked` thanks to WAL and busy_timeout.
2. **Corrupted or Password-Protected PDFs**: CV parser must gracefully handle malformed or empty PDF buffers without crashing server threads.
3. **Rate Limiting Memory Leaks**: In-memory token bucket must automatically prune stale IP buckets to prevent memory leaks during long-running server sessions.
4. **Audit Trail Immutability**: No non-admin or malicious user must be able to overwrite or delete audit logs.
5. **Storage Adapter Resilience**: If S3/R2 credentials are not set, storage operations must seamlessly fall back to local disk storage without throwing 500 errors.

---

### Task 1: Real Document / CV Parser Engine (PDF Text Extraction)

**Files:**
- Create: `frontend/src/lib/pdf-parser.ts`
- Create: `frontend/src/app/api/candidate/parse-resume/route.ts`
- Modify: `backend/pb_hooks/main.pb.js:200-256`
- Create: `test/real-cv-parser.test.mjs`

- [ ] **Step 1.1**: Write failing unit tests in `test/real-cv-parser.test.mjs` covering raw PDF text stream extraction and manufacturing keywords matching (PLC, SIO Forklift, K3 Kemnaker, ISO 9001, CNC).
- [ ] **Step 1.2**: Implement `frontend/src/lib/pdf-parser.ts` with pure JavaScript PDF text extractor (reading text objects `BT ... ET` and stream operators) and competency scoring dictionary.
- [ ] **Step 1.3**: Implement `frontend/src/app/api/candidate/parse-resume/route.ts` accepting candidate resume uploads and returning detected industrial credentials.
- [ ] **Step 1.4**: Update `backend/pb_hooks/main.pb.js` to support real parsed skills while preserving fallback capability.
- [ ] **Step 1.5**: Run `npm test` and verify Task 1 test passes.

---

### Task 2: SQLite Concurrency Tuning (WAL Mode & Busy Timeout)

**Files:**
- Create: `backend/pb_migrations/1710000004_sqlite_concurrency_wal.js`
- Modify: `backend/pb_hooks/main.pb.js:1-28`
- Create: `test/sqlite-concurrency.test.mjs`

- [ ] **Step 2.1**: Write unit tests in `test/sqlite-concurrency.test.mjs` asserting PRAGMA SQL statements for WAL mode, busy_timeout = 5000, synchronous = NORMAL, and 64MB cache.
- [ ] **Step 2.2**: Implement migration `1710000004_sqlite_concurrency_wal.js` executing `PRAGMA journal_mode = WAL;`, `PRAGMA busy_timeout = 5000;`, `PRAGMA synchronous = NORMAL;`.
- [ ] **Step 2.3**: Add initialization hook in `backend/pb_hooks/main.pb.js` to ensure runtime connections enforce SQLite concurrency limits.
- [ ] **Step 2.4**: Run `npm test` and verify Task 2 test passes.

---

### Task 3: Rate Limiting & Anti-Abuse Protection

**Files:**
- Create: `frontend/src/lib/rate-limiter.ts`
- Modify: `frontend/src/app/api/helpdesk/upload/route.ts:1-40`
- Modify: `frontend/src/app/api/auth/telegram/route.ts:33-55`
- Create: `test/rate-limiter.test.mjs`

- [ ] **Step 3.1**: Write unit tests in `test/rate-limiter.test.mjs` asserting token bucket rate limiter granting valid requests and blocking exceeding attempts.
- [ ] **Step 3.2**: Implement `frontend/src/lib/rate-limiter.ts` with sliding window algorithm and auto-eviction of stale keys.
- [ ] **Step 3.3**: Apply rate limiting to `frontend/src/app/api/helpdesk/upload/route.ts` (10 uploads / 5 mins per IP).
- [ ] **Step 3.4**: Apply rate limiting to `frontend/src/app/api/auth/telegram/route.ts` (10 auth requests / 5 mins per IP).
- [ ] **Step 3.5**: Run `npm test` and verify Task 3 test passes.

---

### Task 4: Enterprise Audit Trail & Financial Tamper-Proof Ledger

**Files:**
- Create: `backend/pb_migrations/1710000005_create_audit_logs.js`
- Modify: `backend/pb_hooks/main.pb.js:48-60,122-154`
- Create: `test/audit-ledger.test.mjs`

- [ ] **Step 4.1**: Write unit tests in `test/audit-ledger.test.mjs` asserting schema fields and append-only constraints (`createRule` allowed, `updateRule: null`, `deleteRule: null`).
- [ ] **Step 4.2**: Implement migration `1710000005_create_audit_logs.js` defining collection `audit_logs` (`actor_id`, `actor_role`, `action_type`, `target_collection`, `target_id`, `previous_state`, `new_state`, `ip_address`).
- [ ] **Step 4.3**: Update `backend/pb_hooks/main.pb.js` to log audit entries when payment is marked 'paid' and when roles are updated.
- [ ] **Step 4.4**: Run `npm test` and verify Task 4 test passes.

---

### Task 5: Asynchronous Event Dispatcher & Webhook Engine

**Files:**
- Create: `frontend/src/app/api/webhooks/status-notification/route.ts`
- Modify: `backend/pb_hooks/main.pb.js:180-195`
- Create: `test/event-dispatcher.test.mjs`

- [ ] **Step 5.1**: Write unit tests in `test/event-dispatcher.test.mjs` verifying event creation for `interview` and `hired` status transitions.
- [ ] **Step 5.2**: Implement `frontend/src/app/api/webhooks/status-notification/route.ts` handling notification dispatching with HMAC signature verification.
- [ ] **Step 5.3**: Add `onRecordAfterUpdateRequest("job_applications")` hook in `backend/pb_hooks/main.pb.js` to trigger async background notification dispatch.
- [ ] **Step 5.4**: Run `npm test` and verify Task 5 test passes.

---

### Task 6: Disaster Recovery & Encrypted Remote Backup

**Files:**
- Modify: `backend/backup-db.mjs`
- Create: `test/backup-db.test.mjs`

- [ ] **Step 6.1**: Write unit tests in `test/backup-db.test.mjs` verifying backup file creation, SHA-256 checksums, and AES-256 encryption/decryption integrity.
- [ ] **Step 6.2**: Enhance `backend/backup-db.mjs` with `--encrypt` flag using AES-256-GCM cipher and optional S3/WebDAV upload integration.
- [ ] **Step 6.3**: Run `npm test` and verify Task 6 test passes.

---

### Task 7: Object Storage (Cloudflare R2 / S3) Decoupling Adapter

**Files:**
- Create: `frontend/src/lib/storage-adapter.ts`
- Modify: `frontend/src/app/api/helpdesk/upload/route.ts:50-76`
- Create: `test/storage-adapter.test.mjs`

- [ ] **Step 7.1**: Write unit tests in `test/storage-adapter.test.mjs` verifying storage upload, URL generation, and automatic local fallback when S3 environment variables are absent.
- [ ] **Step 7.2**: Implement `frontend/src/lib/storage-adapter.ts` supporting both S3/R2 direct upload and local disk storage fallback.
- [ ] **Step 7.3**: Integrate storage adapter in `frontend/src/app/api/helpdesk/upload/route.ts`.
- [ ] **Step 7.4**: Run `npm test`, verify all 7 test suites pass, verify `npx tsc --noEmit` and `npm run build`.
