import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  INDUSTRIAL_ROLE_BENCHMARKS, 
  evaluateCandidateAgainstRole 
} from '../frontend/src/lib/industrial-norms.ts';

test('Kraepelin Formula Calculations', async (t) => {
  await t.test('Panker speed rate calculates accurately per minute', () => {
    const totalAttempted = 25;
    const durationSeconds = 30;
    const panker = Math.round(totalAttempted / (durationSeconds / 60));
    assert.equal(panker, 50, '25 additions in 30 seconds should equal 50/minute');
  });

  await t.test('Tianker accuracy percentage handles 100% and partial mistakes', () => {
    const correct = 23;
    const attempted = 25;
    const tianker = Math.round((correct / attempted) * 100);
    assert.equal(tianker, 92, '23/25 should yield 92%');
  });

  await t.test('Hanker endurance slope detects increasing, stable, and decreasing curves', () => {
    const calcHanker = (curve) => {
      const mid = Math.floor(curve.length / 2);
      const firstHalf = curve.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondHalf = curve.slice(mid).reduce((a, b) => a + b, 0) / (curve.length - mid);
      if (secondHalf > firstHalf + 1) return 'Meningkat';
      if (secondHalf < firstHalf - 2) return 'Menurun';
      return 'Stabil';
    };

    assert.equal(calcHanker([10, 12, 14, 16]), 'Meningkat');
    assert.equal(calcHanker([15, 14, 15, 15]), 'Stabil');
    assert.equal(calcHanker([20, 19, 14, 10]), 'Menurun');
  });

  await t.test('Janker stability formula calculates low std dev for steady performance', () => {
    const curve = [12, 13, 12, 13, 12];
    const mean = curve.reduce((a, b) => a + b, 0) / curve.length;
    const variance = curve.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / curve.length;
    const stdDev = Math.sqrt(variance);
    const jankerStability = Math.round(Math.max(40, Math.min(99, 100 - stdDev * 12)));

    assert.ok(stdDev < 1.0, 'Std dev should be below 1.0 for consistent speeds');
    assert.ok(jankerStability >= 90, 'Stability score should be 90+ for consistent speed');
  });
});

test('Industrial Role Benchmark & HIMPSI Evaluation', async (t) => {
  await t.test('QC Inspector role demands high accuracy (Tianker >= 94%)', () => {
    // High speed but low accuracy candidate
    const sloppyCandidate = evaluateCandidateAgainstRole('qc_inspector', {
      panker: 50,
      tianker: 80, // Below QC target of 94%
      hanker: 'Stabil',
      janker: 75,
    });

    assert.equal(sloppyCandidate.roleId, 'qc_inspector');
    assert.ok(sloppyCandidate.fitPercentage < 80, 'Sloppy candidate should not receive Sangat Sesuai for QC role');
    assert.ok(sloppyCandidate.riskMitigationAdvice.includes('produk cacat'), 'Should warn about scrap rate risk');

    // Meticulous candidate
    const carefulCandidate = evaluateCandidateAgainstRole('qc_inspector', {
      panker: 36,
      tianker: 96,
      hanker: 'Stabil',
      janker: 90,
    });

    assert.equal(carefulCandidate.grade, 'Sangat Sesuai');
    assert.ok(carefulCandidate.positiveHighlights.some(h => h.includes('zero-defect')));
  });

  await t.test('Operator Produksi role values endurance and steady pace', () => {
    const operator = evaluateCandidateAgainstRole('operator_produksi', {
      panker: 40,
      tianker: 90,
      hanker: 'Meningkat',
      janker: 85,
    });

    assert.equal(operator.grade, 'Sangat Sesuai');
    assert.ok(operator.positiveHighlights.length >= 2);
  });
});
