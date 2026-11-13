import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Sliding Window Rate Limiter & Anti-Abuse Test Suite', () => {
  it('rateLimiter grants requests within configured limit', async () => {
    const { checkRateLimit } = await import('../frontend/src/lib/rate-limiter.js').catch(async () => {
      return await import('../frontend/src/lib/rate-limiter.ts');
    });

    const key = `test_ip_${Date.now()}`;
    const limit = 5;
    const windowMs = 1000;

    for (let i = 1; i <= limit; i++) {
      const result = checkRateLimit(key, limit, windowMs);
      assert.equal(result.allowed, true, `Request ${i} should be allowed`);
      assert.equal(result.remaining, limit - i, `Remaining should decrement`);
    }
  });

  it('rateLimiter blocks requests exceeding configured limit with retryAfterSeconds', async () => {
    const { checkRateLimit } = await import('../frontend/src/lib/rate-limiter.js').catch(async () => {
      return await import('../frontend/src/lib/rate-limiter.ts');
    });

    const key = `blocked_ip_${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    // Use up quota
    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, windowMs);
    }

    // Exceeding request
    const blocked = checkRateLimit(key, limit, windowMs);
    assert.equal(blocked.allowed, false, 'Exceeding request must be blocked');
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfterSeconds > 0, 'Must provide retryAfterSeconds');
  });

  it('rateLimiter isolates different client keys', async () => {
    const { checkRateLimit } = await import('../frontend/src/lib/rate-limiter.js').catch(async () => {
      return await import('../frontend/src/lib/rate-limiter.ts');
    });

    const keyA = `client_A_${Date.now()}`;
    const keyB = `client_B_${Date.now()}`;
    const limit = 2;
    const windowMs = 5000;

    checkRateLimit(keyA, limit, windowMs);
    checkRateLimit(keyA, limit, windowMs);
    const blockedA = checkRateLimit(keyA, limit, windowMs);
    assert.equal(blockedA.allowed, false);

    // Client B should still be allowed
    const allowedB = checkRateLimit(keyB, limit, windowMs);
    assert.equal(allowedB.allowed, true);
    assert.equal(allowedB.remaining, 1);
  });
});
