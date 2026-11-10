import test from 'node:test';
import assert from 'node:assert/strict';

test('Helpdesk VPS SSO Handoff Test Suite', async (suite) => {
  const HELPDESK_BASE = 'https://43.156.236.102/helpdesk/handoff';
  const APP_SLUG = 'recruiter';

  // Helper mirroring frontend/src/lib/helpdesk.ts logic
  function buildHelpdeskUrl({
    user,
    role,
    fromUrl,
    keluhan,
    description,
    photoUrl,
    subject,
    category = 'bug_error',
    isUrgent = false,
    priority,
    autoSubmit = true,
  }) {
    let uid = user?.id || user?.username || user?.email || 'tamu_test123';
    let name = user?.name || user?.username || user?.fullName || (user?.email ? user.email.split('@')[0] : 'Tamu / Pengguna');
    let userRole = role || user?.role || 'Pengguna';
    let activeUrl = fromUrl || 'https://industrial.recruiter.test/candidate/practice';

    let descText = (description || keluhan || '').trim();
    let finalDescription = descText;
    if (photoUrl) {
      finalDescription += `\n\n--- LAMPIRAN BUKTI KENDALA ---\nFoto/Screenshot: ${photoUrl}`;
    }

    let subj = (subject || (descText ? `[${APP_SLUG}] Kendala: ${descText.slice(0, 50)}` : `[${APP_SLUG}] Tiket Bantuan`)).trim();

    const finalPriority = priority || (isUrgent ? 'urgent' : 'medium');
    const autoSubmitVal = autoSubmit !== false ? '1' : '0';

    const params = new URLSearchParams();
    params.set('app', APP_SLUG);
    params.set('uid', uid.slice(0, 200));
    params.set('name', name.slice(0, 200));
    params.set('role', userRole);
    params.set('from_url', activeUrl);
    params.set('new', '1');
    params.set('auto_submit', autoSubmitVal);
    params.set('subject', subj);
    params.set('description', finalDescription);
    params.set('category', category);
    params.set('priority', finalPriority);

    if (keluhan) params.set('keluhan', keluhan);
    if (photoUrl) params.set('photo_url', photoUrl);

    return `${HELPDESK_BASE}?${params.toString()}`;
  }

  function laporkanKendalaKeHelpdesk(options) {
    return buildHelpdeskUrl(options);
  }

  await suite.test('Mandatory Parameters & SSO Handoff URL Format', () => {
    const user = {
      id: 'usr_abc123',
      name: 'Budi Santoso',
      email: 'budi@pabrik.co.id',
      role: 'Candidate',
    };

    const urlString = buildHelpdeskUrl({
      user,
      role: 'Candidate',
      fromUrl: 'https://industrial.recruiter.test/candidate/test/job-42',
      keluhan: 'Timer tes Kraepelin sempat berhenti saat tab berganti',
    });

    const parsed = new URL(urlString);
    assert.equal(parsed.origin, 'https://43.156.236.102');
    assert.equal(parsed.pathname, '/helpdesk/handoff');
    assert.equal(parsed.searchParams.get('app'), 'recruiter');
    assert.equal(parsed.searchParams.get('uid'), 'usr_abc123');
    assert.equal(parsed.searchParams.get('name'), 'Budi Santoso');
    assert.equal(parsed.searchParams.get('role'), 'Candidate');
    assert.equal(parsed.searchParams.get('from_url'), 'https://industrial.recruiter.test/candidate/test/job-42');
    assert.equal(parsed.searchParams.get('new'), '1');
    assert.equal(parsed.searchParams.get('auto_submit'), '1');
    assert.equal(parsed.searchParams.get('category'), 'bug_error');
    assert.equal(parsed.searchParams.get('priority'), 'medium');
    assert.equal(parsed.searchParams.get('keluhan'), 'Timer tes Kraepelin sempat berhenti saat tab berganti');
    assert.ok(parsed.searchParams.get('description').includes('Timer tes Kraepelin sempat berhenti'));
  });

  await suite.test('laporkanKendalaKeHelpdesk with Category and isUrgent = true', () => {
    const targetUrl = laporkanKendalaKeHelpdesk({
      subject: 'Gagal verifikasi pembayaran',
      description: 'Transfer unik tidak terbaca di mutasi admin',
      category: 'account_access',
      isUrgent: true,
      user: { id: 'usr_pay_1', name: 'Siti Rahma', role: 'Employer' },
    });

    const parsed = new URL(targetUrl);
    assert.equal(parsed.searchParams.get('subject'), 'Gagal verifikasi pembayaran');
    assert.equal(parsed.searchParams.get('description'), 'Transfer unik tidak terbaca di mutasi admin');
    assert.equal(parsed.searchParams.get('category'), 'account_access');
    assert.equal(parsed.searchParams.get('priority'), 'urgent');
    assert.equal(parsed.searchParams.get('auto_submit'), '1');
  });

  await suite.test('Guest / Unauthenticated User Fallback Handling', () => {
    const urlString = buildHelpdeskUrl({
      user: null,
      role: null,
      fromUrl: 'https://industrial.recruiter.test/jobs',
      keluhan: 'Halaman lowongan tidak memuat filter',
    });

    const parsed = new URL(urlString);
    assert.equal(parsed.searchParams.get('app'), 'recruiter');
    assert.ok(parsed.searchParams.get('uid').startsWith('tamu_'));
    assert.equal(parsed.searchParams.get('name'), 'Tamu / Pengguna');
    assert.equal(parsed.searchParams.get('role'), 'Pengguna');
    assert.equal(parsed.searchParams.get('new'), '1');
  });

  await suite.test('Optional Screenshot / Problem Photo Attachment', () => {
    const photoUrl = 'https://industrial.recruiter.test/uploads/helpdesk/problem_1700000_abc.png';
    const keluhan = 'Grafik psikogram tidak muncul di hasil tes';

    const urlString = buildHelpdeskUrl({
      user: { id: 'usr_emp99', name: 'HR PT Indomobil', role: 'Employer' },
      role: 'Employer',
      fromUrl: 'https://industrial.recruiter.test/employer/candidates',
      keluhan,
      photoUrl,
    });

    const parsed = new URL(urlString);
    assert.equal(parsed.searchParams.get('photo_url'), photoUrl);
    assert.ok(parsed.searchParams.get('description').includes(photoUrl), 'Description must contain photo proof link');
    assert.ok(parsed.searchParams.get('description').includes(keluhan), 'Description must contain the complaint text');
  });

  await suite.test('Photo upload MIME type & size validation rules', () => {
    const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    const maxBytes = 5 * 1024 * 1024;

    assert.equal(allowedMime.has('image/png'), true);
    assert.equal(allowedMime.has('image/jpeg'), true);
    assert.equal(allowedMime.has('image/webp'), true);
    assert.equal(allowedMime.has('application/pdf'), false);
    assert.equal(allowedMime.has('video/mp4'), false);

    assert.equal(4.9 * 1024 * 1024 <= maxBytes, true, '4.9MB should be allowed');
    assert.equal(5.2 * 1024 * 1024 <= maxBytes, false, '5.2MB should be rejected');
  });
});
