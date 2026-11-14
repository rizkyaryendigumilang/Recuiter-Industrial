import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('P0 - P2 Security & Modern Industrial Enhancements Test Suite', () => {
  // =========================================================================
  // 1. P0: Binary File Magic Bytes Guard (PDF Stream Validation)
  // =========================================================================
  describe('P0: Binary Magic Bytes PDF Guard', () => {
    test('Rejects non-PDF headers and accepts genuine %PDF- signatures', () => {
      const validPdfBuffer = Buffer.from('%PDF-1.7\n%âãÏÓ\n1 0 obj\n<<...>>\nendobj');
      const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xff\xff');
      const elfBuffer = Buffer.from('\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00');
      const htmlBuffer = Buffer.from('<!DOCTYPE html><html><body>Fake CV</body></html>');

      const isGenuinePdf = (buf) => buf.slice(0, 5).toString('ascii').startsWith('%PDF-');

      assert.equal(isGenuinePdf(validPdfBuffer), true, 'Genuine PDF must pass magic bytes check');
      assert.equal(isGenuinePdf(exeBuffer), false, 'Windows PE / EXE header must be blocked');
      assert.equal(isGenuinePdf(elfBuffer), false, 'Linux ELF binary header must be blocked');
      assert.equal(isGenuinePdf(htmlBuffer), false, 'HTML/Script disguised as PDF must be blocked');
    });

    test('Route parse-resume strictly enforces %PDF- magic bytes check', () => {
      const routePath = path.resolve('frontend/src/app/api/candidate/parse-resume/route.ts');
      assert.ok(fs.existsSync(routePath), 'Resume parse route must exist');
      const content = fs.readFileSync(routePath, 'utf8');

      assert.ok(
        content.includes("buffer.slice(0, 5).toString('ascii')"),
        'Route must inspect binary header buffer slice'
      );
      assert.ok(
        content.includes("startsWith('%PDF-')"),
        'Route must assert startsWith %PDF-'
      );
    });
  });

  // =========================================================================
  // 2. P0/P1: Anti-Cheat Anomaly Detection & Input Latency Guard
  // =========================================================================
  describe('P0/P1: Anti-Cheat Macro & Rapid Clicker Detection', async () => {
    const { isMacroAnomaly } = await import('../frontend/src/lib/anti-cheat-core.ts');

    test('Normal human typing cadence is permitted without anomaly warnings', () => {
      // Human intervals: 320ms, 450ms, 210ms
      let state = isMacroAnomaly(320, 0);
      assert.equal(state.isAnomaly, false);
      assert.equal(state.newCount, 0);

      state = isMacroAnomaly(450, 0);
      assert.equal(state.isAnomaly, false);
      assert.equal(state.newCount, 0);

      state = isMacroAnomaly(210, 0);
      assert.equal(state.isAnomaly, false);
      assert.equal(state.newCount, 0);
    });

    test('Isolated rapid input does not immediately trigger false positive', () => {
      // 1 single rapid click (e.g. 90ms double-tap)
      const step1 = isMacroAnomaly(90, 0);
      assert.equal(step1.isAnomaly, false);
      assert.equal(step1.newCount, 1);

      // Followed by normal human pause (300ms) resets the count
      const step2 = isMacroAnomaly(300, step1.newCount);
      assert.equal(step2.isAnomaly, false);
      assert.equal(step2.newCount, 0);
    });

    test('Repeated automated inputs (<130ms x 3) trigger macro anomaly violation', () => {
      // Bot sending inputs at 40ms interval
      const hit1 = isMacroAnomaly(40, 0);
      assert.equal(hit1.isAnomaly, false);
      assert.equal(hit1.newCount, 1);

      const hit2 = isMacroAnomaly(40, hit1.newCount);
      assert.equal(hit2.isAnomaly, false);
      assert.equal(hit2.newCount, 2);

      const hit3 = isMacroAnomaly(40, hit2.newCount);
      assert.equal(hit3.isAnomaly, true, 'Third consecutive <130ms input must trigger anomaly');
      assert.equal(hit3.newCount, 0, 'Counter must reset after violation dispatch');
    });

    test('Pauli/Kraepelin test component integrates checkInputLatency', () => {
      const pauliComponentPath = path.resolve('frontend/src/components/assessment/pauli-test.tsx');
      assert.ok(fs.existsSync(pauliComponentPath), 'Pauli test component must exist');
      const content = fs.readFileSync(pauliComponentPath, 'utf8');

      assert.ok(
        content.includes('checkInputLatency'),
        'Pauli test must invoke checkInputLatency on digit input'
      );
    });
  });

  // =========================================================================
  // 3. P1: Hiring Funnel Metrics & Analytics Engine
  // =========================================================================
  describe('P1: Bento Grid Hiring Funnel Metrics Computation', async () => {
    const { calculateFunnelMetrics } = await import('../frontend/src/lib/funnel-analytics.ts');

    test('calculateFunnelMetrics handles empty applications gracefully', () => {
      const metrics = calculateFunnelMetrics([]);
      assert.deepEqual(metrics, {
        totalApplicants: 0,
        passedKraepelin: 0,
        interviewStage: 0,
        averageMatchScore: 0,
      });
    });

    test('calculateFunnelMetrics accurately aggregates candidate status and test scores', () => {
      const sampleApplications = [
        { id: '1', status: 'applied', test_score: 50, match_score: 75 },
        { id: '2', status: 'interview', test_score: 85, match_score: 90 }, // Lolos & Interview
        { id: '3', status: 'interview', test_score: 70, match_score: 85 }, // Lolos & Interview
        { id: '4', status: 'hired', test_score: 95, match_score: 95 },     // Lolos
        { id: '5', status: 'rejected', test_score: 40, match_score: 60 },  // Tidak lolos
      ];

      const metrics = calculateFunnelMetrics(sampleApplications);

      assert.equal(metrics.totalApplicants, 5);
      assert.equal(metrics.passedKraepelin, 3, 'Candidates with test_score >= 65 (85, 70, 95)');
      assert.equal(metrics.interviewStage, 2, "Candidates with status 'interview'");
      // Average match score: (75 + 90 + 85 + 95 + 60) / 5 = 405 / 5 = 81
      assert.equal(metrics.averageMatchScore, 81);
    });
  });

  // =========================================================================
  // 4. P1: Real-Time PocketBase Subscriptions & Explainable AI Modal
  // =========================================================================
  describe('P1: Real-Time Sync & Explainable AI Architecture', () => {
    test('Employer and Admin pages register and clean up PocketBase subscriptions', () => {
      const employerPagePath = path.resolve('frontend/src/app/employer/page.tsx');
      const adminPagePath = path.resolve('frontend/src/app/admin/page.tsx');

      const employerContent = fs.readFileSync(employerPagePath, 'utf8');
      const adminContent = fs.readFileSync(adminPagePath, 'utf8');

      const subRegex = /pb\.collection\(['"]job_applications['"]\)[\s\S]*?\.subscribe\(['"]\*['"]/;
      const unsubRegex = /pb\.collection\(['"]job_applications['"]\)[\s\S]*?\.unsubscribe\(['"]\*['"]/;

      // Assert employer dashboard subscription and cleanup
      assert.ok(
        subRegex.test(employerContent),
        'Employer dashboard must subscribe to live job_applications'
      );
      assert.ok(
        unsubRegex.test(employerContent),
        'Employer dashboard must unsubscribe on component unmount'
      );
      assert.ok(
        employerContent.includes('Live Sync Terhubung'),
        'Employer dashboard must display live sync status badge'
      );

      // Assert admin panel subscription and cleanup
      assert.ok(
        subRegex.test(adminContent),
        'Admin dashboard must subscribe to live job_applications'
      );
      assert.ok(
        unsubRegex.test(adminContent),
        'Admin dashboard must unsubscribe on unmount'
      );
    });

    test('Employer dashboard contains Explainable AI Reasoning Modal', () => {
      const employerPagePath = path.resolve('frontend/src/app/employer/page.tsx');
      const content = fs.readFileSync(employerPagePath, 'utf8');

      assert.ok(
        content.includes('Explainable AI'),
        'Explainable AI modal header must be present'
      );
      assert.ok(
        content.includes('Kekuatan Kompetensi Terverifikasi OCR'),
        'Explainable AI must display OCR Stream competency breakdown'
      );
      assert.ok(
        content.includes('Profil Ketahanan & Ketelitian Kraepelin'),
        'Explainable AI must detail Kraepelin endurance evaluation'
      );
      assert.ok(
        content.includes('Rekomendasi Penempatan Divisi Pabrik'),
        'Explainable AI must provide plant division recommendation'
      );
    });
  });

  // =========================================================================
  // 5. P2: Candidate Notification WhatsApp Gateway Action
  // =========================================================================
  describe('P2: Candidate Notification Modal & WhatsApp Gateway', () => {
    test('Notification modal provides automated WhatsApp dispatch with encoded message', () => {
      const modalPath = path.resolve('frontend/src/components/employer/candidate-notification-modal.tsx');
      assert.ok(fs.existsSync(modalPath), 'Candidate notification modal must exist');
      const content = fs.readFileSync(modalPath, 'utf8');

      assert.ok(
        content.includes('https://wa.me/'),
        'Modal must support direct WhatsApp gateway URI dispatch'
      );
      assert.ok(
        content.includes('encodeURIComponent'),
        'Modal must URL-encode personalized invitation message'
      );
      assert.ok(
        content.includes('/api/webhooks/status-notification'),
        'Modal must trigger automated status-notification webhook'
      );
      assert.ok(
        content.includes('Kirim via API Gateway'),
        'Modal must have explicit API Gateway dispatch action'
      );
    });
  });
});
