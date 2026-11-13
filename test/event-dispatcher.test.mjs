import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('Asynchronous Event Dispatcher & Webhook Notification Engine Test Suite', () => {
  it('buildNotificationWebhookPayload generates HMAC-signed event payload', async () => {
    const { buildWebhookPayload, verifyWebhookSignature } = await import('../frontend/src/lib/webhook-dispatcher.js').catch(async () => {
      return await import('../frontend/src/lib/webhook-dispatcher.ts');
    });

    const secret = 'test_webhook_secret_key_123';
    const eventData = {
      event: 'job_application.status_changed',
      application_id: 'app_1234567890',
      job_title: 'Operator Mesin CNC Lathe',
      candidate_name: 'Budi Santoso',
      candidate_email: 'budi@pabrik.id',
      previous_status: 'testing',
      new_status: 'interview',
      timestamp: Math.floor(Date.now() / 1000),
    };

    const payload = buildWebhookPayload(eventData, secret);
    assert.ok(payload.signature, 'Payload must contain signature');
    assert.equal(payload.event, 'job_application.status_changed');

    const isValid = verifyWebhookSignature(payload.data, payload.signature, secret);
    assert.equal(isValid, true, 'Valid signature must verify successfully');

    const isTamperedValid = verifyWebhookSignature({ ...payload.data, new_status: 'hired' }, payload.signature, secret);
    assert.equal(isTamperedValid, false, 'Tampered data must fail verification');
  });

  it('rejects expired event payload timestamps (> 5 minutes)', async () => {
    const { verifyWebhookSignature } = await import('../frontend/src/lib/webhook-dispatcher.js').catch(async () => {
      return await import('../frontend/src/lib/webhook-dispatcher.ts');
    });

    const secret = 'test_webhook_secret_key_123';
    const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 400 seconds ago
    const eventData = {
      event: 'job_application.status_changed',
      application_id: 'app_old_123',
      new_status: 'interview',
      timestamp: oldTimestamp,
    };

    const rawString = JSON.stringify(eventData);
    const signature = crypto.createHmac('sha256', secret).update(rawString).digest('hex');

    const isExpiredValid = verifyWebhookSignature(eventData, signature, secret);
    assert.equal(isExpiredValid, false, 'Expired timestamp must be rejected');
  });
});
