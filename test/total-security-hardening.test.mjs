import { describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

describe('Total Security Hardening & Vulnerability Remediation Test Suite', () => {
  test('1. Calendar ICS Feed Strictly Uses Server-Only Secret', async () => {
    const routePath = path.resolve('frontend/src/app/api/calendar/interviews.ics/route.ts');
    assert.ok(fs.existsSync(routePath));
    const content = fs.readFileSync(routePath, 'utf8');

    // Pastikan NEXT_PUBLIC_CALENDAR_TOKEN sudah dihilangkan sepenuhnya
    assert.equal(
      content.includes('NEXT_PUBLIC_CALENDAR_TOKEN'),
      false,
      'Must not reference NEXT_PUBLIC_CALENDAR_TOKEN in server calendar feed'
    );
    assert.ok(
      content.includes('CALENDAR_FEED_SECRET'),
      'Must rely strictly on CALENDAR_FEED_SECRET'
    );
  });

  test('2. Webhook Notification Rejects Missing Secret in Production & No Static Default', async () => {
    const routePath = path.resolve('frontend/src/app/api/webhooks/status-notification/route.ts');
    assert.ok(fs.existsSync(routePath));
    const content = fs.readFileSync(routePath, 'utf8');

    // Pastikan string default statis sudah dihapus
    assert.equal(
      content.includes('recruiter_industrial_webhook_default_secret'),
      false,
      'Must not contain hardcoded default webhook secret'
    );
  });

  test('3. Helpdesk Upload Validates Binary Image Magic Bytes', async () => {
    const routePath = path.resolve('frontend/src/app/api/helpdesk/upload/route.ts');
    assert.ok(fs.existsSync(routePath));
    const content = fs.readFileSync(routePath, 'utf8');

    assert.ok(
      content.includes('validateImageMagicBytes'),
      'Must validate binary magic bytes before accepting images'
    );
    assert.ok(
      content.includes('0xff') && content.includes('0xd8'),
      'Must verify JPEG magic bytes'
    );
    assert.ok(
      content.includes('0x89') && content.includes('0x4e'),
      'Must verify PNG magic bytes'
    );
  });

  test('4. PDF Parser Enforces Decompression Bomb Limit & Parse Resume Has Rate Limiting', async () => {
    const parserPath = path.resolve('frontend/src/lib/pdf-parser.ts');
    const parserContent = fs.readFileSync(parserPath, 'utf8');
    assert.ok(
      parserContent.includes('maxOutputLength'),
      'PDF parser must enforce maxOutputLength to prevent zlib decompression bombs'
    );

    const routePath = path.resolve('frontend/src/app/api/candidate/parse-resume/route.ts');
    const routeContent = fs.readFileSync(routePath, 'utf8');
    assert.ok(
      routeContent.includes('checkRateLimit'),
      'Resume parser route must enforce rate limiting'
    );
  });

  test('5. Telegram Hash Verification Uses Timing-Safe Equality', () => {
    const routePath = path.resolve('frontend/src/app/api/auth/telegram/route.ts');
    const content = fs.readFileSync(routePath, 'utf8');
    assert.ok(
      content.includes('crypto.timingSafeEqual'),
      'Telegram auth verification must use crypto.timingSafeEqual'
    );
    assert.equal(
      /return calculatedHash === hash;/.test(content),
      false,
      'Must not use non-constant-time string equality operator ==='
    );
  });

  test('6. Storage Adapter Hardens Against Path Traversal', async () => {
    const storageModule = await import('../frontend/src/lib/storage-adapter.ts');
    const testBuffer = Buffer.from('TEST_DATA');

    // Coba path traversal pada filename dan folder
    const result = await storageModule.saveUploadedFile(
      testBuffer,
      '../../etc/passwd',
      'text/plain',
      '../../secret'
    );

    assert.equal(result.success, true);
    // Filename harus dinetralkan tanpa '../'
    assert.ok(!result.path.includes('..'), 'Path traversal dots must be stripped from path');
    assert.ok(result.filename.includes('passwd'), 'Sanitized basename must be preserved');
  });

  test('7. Rate Limiter Prioritizes Cloudflare CF-Connecting-IP Header', async () => {
    const { getClientIp } = await import('../frontend/src/lib/rate-limiter.ts');

    const mockRequestWithCF = {
      headers: new Headers({
        'cf-connecting-ip': '203.0.113.195',
        'x-forwarded-for': '198.51.100.1, 192.0.2.1',
      }),
    };

    const ip = getClientIp(mockRequestWithCF);
    assert.equal(ip, '203.0.113.195', 'Must prioritize trusted cf-connecting-ip over spoofable x-forwarded-for');
  });

  test('8. CSV Export Neutralizes Formula Injection (CWE-1236)', async () => {
    const { generatePersonalDataCsv } = await import('../frontend/src/lib/backup-sync.ts');

    const maliciousUserData = {
      id: 'usr_exploit_1',
      name: '=cmd|\' /C calc\'!A0',
      email: '+6281234567890@test.com',
      phone: '@SUM(1+1)',
      role: 'candidate',
      careerHeadline: '-2+3+cmd|',
    };

    const csv = generatePersonalDataCsv(maliciousUserData);

    // Formulasi harus diawali petik tunggal (') di dalam kutipan CSV agar Excel tidak mengeksekusinya
    assert.ok(csv.includes("'=cmd|"), 'Formula starting with = must be prepended with single quote');
    assert.ok(csv.includes("'+6281234567890"), 'Formula starting with + must be prepended with single quote');
    assert.ok(csv.includes("'@SUM"), 'Formula starting with @ must be prepended with single quote');
    assert.ok(csv.includes("'-2+3+cmd|"), 'Formula starting with - must be prepended with single quote');
  });

  test('9. Secure Assessment Submission Endpoint Exists and Validates Server-Side', () => {
    const routePath = path.resolve('frontend/src/app/api/submit-test/route.ts');
    assert.ok(fs.existsSync(routePath), 'Secure assessment submission API route must exist');
    const content = fs.readFileSync(routePath, 'utf8');

    assert.ok(content.includes('checkRateLimit'), 'Must enforce rate limiting');
    assert.ok(content.includes('calculatedScore'), 'Must calculate score server-side');
    assert.ok(content.includes('determinedStatus'), 'Must determine interview/testing status server-side');
  });
});
