import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('SQLite Concurrency & WAL Performance Optimization Test Suite', () => {
  it('Migration 1710000004 defines WAL mode and concurrency PRAGMA statements', () => {
    const migrationPath = path.resolve('backend/pb_migrations/1710000004_sqlite_concurrency_wal.js');
    assert.ok(fs.existsSync(migrationPath), 'Migration 1710000004 file must exist');

    const content = fs.readFileSync(migrationPath, 'utf-8');
    assert.ok(content.includes('journal_mode = WAL'), 'Must execute PRAGMA journal_mode = WAL');
    assert.ok(content.includes('busy_timeout = 5000'), 'Must execute PRAGMA busy_timeout = 5000');
    assert.ok(content.includes('synchronous = NORMAL'), 'Must execute PRAGMA synchronous = NORMAL');
    assert.ok(content.includes('cache_size = -64000'), 'Must configure 64MB cache size');
  });

  it('Migration 1710000004 provides reversible down/rollback logic', () => {
    const migrationPath = path.resolve('backend/pb_migrations/1710000004_sqlite_concurrency_wal.js');
    const content = fs.readFileSync(migrationPath, 'utf-8');
    assert.ok(content.includes('journal_mode = DELETE') || content.includes('journal_mode = TRUNCATE'), 'Rollback must support restoring journal_mode');
  });
});
