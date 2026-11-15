import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Catalog Resilience & Dynamic Routing Test Suite', () => {
  it('FALLBACK_SERVICES_CATALOG accurately resolves all catalog, landing, and booking IDs', async () => {
    const { getFallbackServiceById, FALLBACK_SERVICES_CATALOG } = await import('../frontend/src/lib/mock-data.ts');

    assert.ok(FALLBACK_SERVICES_CATALOG, 'Catalog must be defined');

    const testIds = [
      'srv-01', 'srv-02', 'srv-03', 'srv-04',
      'fb-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5', 'fb-6',
      'b2b-retainer', 'career-clinic', 'counseling'
    ];

    for (const id of testIds) {
      const item = getFallbackServiceById(id);
      assert.ok(item, `Service with ID "${id}" must resolve from fallback catalog`);
      assert.equal(item.id, id, `Resolved service id must match "${id}"`);
      assert.ok(typeof item.title === 'string' && item.title.length > 0, `Title must be present for "${id}"`);
      assert.ok(typeof item.price === 'number' && item.price > 0, `Price must be valid number for "${id}"`);
    }

    assert.equal(getFallbackServiceById('non-existent-id'), null);
    assert.equal(getFallbackServiceById(''), null);
  });

  it('FALLBACK_INDUSTRIAL_JOBS accurately resolves all job IDs for detail and application routes', async () => {
    const { getFallbackJobById, FALLBACK_INDUSTRIAL_JOBS } = await import('../frontend/src/lib/mock-data.ts');

    assert.ok(Array.isArray(FALLBACK_INDUSTRIAL_JOBS) && FALLBACK_INDUSTRIAL_JOBS.length >= 5);

    const testJobIds = ['job-ind-01', 'job-ind-02', 'job-ind-03', 'job-ind-04', 'job-ind-05'];

    for (const jobId of testJobIds) {
      const job = getFallbackJobById(jobId);
      assert.ok(job, `Job with ID "${jobId}" must resolve from fallback list`);
      assert.equal(job.id, jobId);
      assert.ok(job.title && job.title.length > 0);
      assert.ok(job.company_name && job.company_name.length > 0);
      assert.ok(job.location && job.location.length > 0);
    }

    assert.equal(getFallbackJobById('non-existent-job'), null);
    assert.equal(getFallbackJobById(''), null);
  });

  it('Storage adapter produces clean root-relative upload URLs when NEXT_PUBLIC_BASE_PATH is empty or undefined', async () => {
    const { saveUploadedFile } = await import('../frontend/src/lib/storage-adapter.ts');

    const testBuffer = Buffer.from('test clean url resolution');
    const filename = `test_url_${Date.now()}.png`;

    const result = await saveUploadedFile(testBuffer, filename, 'image/png', 'resilience_test');

    assert.equal(result.success, true);
    assert.ok(result.url.startsWith('/uploads/'), `URL should start with /uploads/ without unwanted prefixes: got ${result.url}`);
    assert.ok(!result.url.includes('//'), `URL must not contain duplicate slashes: got ${result.url}`);
  });
});
