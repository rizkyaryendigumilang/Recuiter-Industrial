# Plan 001: Capture SQLite WAL and SHM Files in Automated Database Backups

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1ea7139..HEAD -- backend/backup-db.mjs test/backup-db.test.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: correctness / data integrity
- **Planned at**: commit `1ea7139`, 2026-11-18

## Why this matters

The platform enables WAL mode (`PRAGMA journal_mode = WAL`) in migration `1710000004_sqlite_concurrency_wal.js` to support high concurrency. In SQLite WAL mode, recent uncheckpointed writes reside in `data.db-wal` and index shared memory in `data.db-shm`. Currently, `backend/backup-db.mjs` only copies `['data.db', 'auxiliary.db', 'storage']`, ignoring `-wal` and `-shm` files. A backup taken during active candidate testing can omit recent transactions or result in a corrupted database upon restoration.

## Current state

The target files list in `backend/backup-db.mjs:80`:
```javascript
// backend/backup-db.mjs:80
  // List of critical targets to copy
  const targets = ['data.db', 'auxiliary.db', 'storage'];
  let filesCopiedCount = 0;
```

Existing verification test in `test/backup-db.test.mjs`:
- Tests `encryptBackupBuffer` and `generateBackupManifest`.
- Does not currently assert that WAL and SHM files are backed up when present.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Run tests | `npm test`               | 100+ tests pass, exit 0 |
| Run backup| `node backend/backup-db.mjs` | Backup completed! exit 0 |

## Scope

**In scope**:
- `backend/backup-db.mjs`
- `test/backup-db.test.mjs`

**Out of scope**:
- Do not modify PocketBase migration files or runtime database settings.
- Do not touch `backend/backup-crypto.mjs`.

## Step-by-step implementation

### Step 1: Update target files list in `backend/backup-db.mjs`

Expand `targets` to dynamically include WAL and SHM journal files if they exist in `pb_data`:
```javascript
  const targets = [
    'data.db',
    'data.db-wal',
    'data.db-shm',
    'auxiliary.db',
    'auxiliary.db-wal',
    'auxiliary.db-shm',
    'storage'
  ];
```
Because `fs.existsSync(sourcePath)` already guards each target, if `-wal` or `-shm` are not present (e.g. after a clean checkpoint), they are safely skipped without error.

### Step 2: Add test coverage in `test/backup-db.test.mjs`

Add an automated test verifying that when dummy `data.db-wal` and `data.db-shm` files exist in a temporary test directory, the backup routine copies them into the snapshot folder.

### Step 3: Run verification

Execute:
```bash
npm test
```
Confirm all tests pass with code 0.

## STOP conditions

- If `PB_DATA_DIR` contains files locked by another process that prevent copying, stop and check process status.
- If existing backup manifest format changes, stop and verify `backup-crypto.mjs` compatibility.
