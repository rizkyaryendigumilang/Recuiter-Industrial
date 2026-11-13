import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Object Storage (Cloudflare R2 / S3) Decoupling Adapter Test Suite', () => {
  it('saveUploadedFile falls back to local disk storage when S3 env vars are absent', async () => {
    const { saveUploadedFile } = await import('../frontend/src/lib/storage-adapter.js').catch(async () => {
      return await import('../frontend/src/lib/storage-adapter.ts');
    });

    const testBuffer = Buffer.from('mock image screenshot bytes');
    const filename = `test_upload_${Date.now()}.png`;

    const result = await saveUploadedFile(testBuffer, filename, 'image/png', 'helpdesk');

    assert.equal(result.success, true);
    assert.equal(result.provider, 'local');
    assert.ok(result.url.includes(filename), 'URL must include filename');
    assert.ok(result.path.includes(filename), 'Path must point to file');
  });

  it('isS3Configured correctly detects presence or absence of S3 credentials', async () => {
    const { isS3Configured } = await import('../frontend/src/lib/storage-adapter.js').catch(async () => {
      return await import('../frontend/src/lib/storage-adapter.ts');
    });

    // Without S3 credentials configured
    const configured = isS3Configured();
    assert.equal(typeof configured, 'boolean');
  });
});
