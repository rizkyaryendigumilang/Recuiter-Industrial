import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Enterprise Audit Trail & Financial Tamper-Proof Ledger Test Suite', () => {
  it('Migration 1710000005 defines append-only audit_logs collection', () => {
    const migrationPath = path.resolve('backend/pb_migrations/1710000005_create_audit_logs.js');
    assert.ok(fs.existsSync(migrationPath), 'Migration 1710000005 must exist');

    const content = fs.readFileSync(migrationPath, 'utf-8');
    assert.ok(content.includes('audit_logs'), 'Must define audit_logs collection');
    assert.ok(content.includes('actor_id'), 'Must record actor_id');
    assert.ok(content.includes('action_type'), 'Must record action_type');
    assert.ok(content.includes('target_collection'), 'Must record target_collection');
    assert.ok(content.includes('target_id'), 'Must record target_id');
    assert.ok(content.includes('previous_state'), 'Must record previous_state');
    assert.ok(content.includes('new_state'), 'Must record new_state');
    assert.ok(content.includes('ip_address'), 'Must record ip_address');

    // Immutable / Append-only guarantees
    assert.ok(content.includes('updateRule: null') || content.includes('updateRule: "" === false') || content.includes('updateRule = null') || content.includes('updateRule: null'), 'Update rule must be null (forbidden)');
    assert.ok(content.includes('deleteRule: null') || content.includes('deleteRule: "" === false') || content.includes('deleteRule = null') || content.includes('deleteRule: null'), 'Delete rule must be null (forbidden)');
  });

  it('Migration 1710000005 creates high-performance lookup indexes for audit queries', () => {
    const migrationPath = path.resolve('backend/pb_migrations/1710000005_create_audit_logs.js');
    const content = fs.readFileSync(migrationPath, 'utf-8');
    assert.ok(content.includes('idx_audit_actor'), 'Must index actor_id');
    assert.ok(content.includes('idx_audit_target'), 'Must index target_id');
    assert.ok(content.includes('idx_audit_action'), 'Must index action_type');
  });
});
