import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Personal Data (Lapisan 1) CSV & Auto-Sync Backup Test Suite', () => {
  test('generatePersonalDataCsv generates RFC 4180 compliant CSV with UTF-8 BOM for Excel', async () => {
    const { generatePersonalDataCsv } = await import('../frontend/src/lib/backup-sync.js').catch(async () => {
      return await import('../frontend/src/lib/backup-sync.ts');
    });

    const mockUserData = {
      id: 'usr_candidate_99',
      name: 'Rizky Aryendi Gumilang',
      username: 'rizky_aryendi',
      email: 'rizky.kandidat@industrial.id',
      phone: '081234567890',
      role: 'candidate',
      careerHeadline: 'Operator Mesin CNC & Staff QC Presisi',
      domicile: 'Cikarang, Jawa Barat',
      expectedSalary: '7.500.000',
      portfolioUrl: 'https://linkedin.com/in/rizky-candidate',
      detectedSkills: [
        'PLC Siemens (S7-1200/1500)',
        'CNC Milling / Machining Center',
        'Sertifikasi Ahli K3 Umum Kemnaker',
        'ISO 9001:2015 & 7 QC Tools',
      ],
      kraepelinScores: {
        testCode: 'PSI-KRAEPELIN-2026-001',
        panker: 54,
        tianker: 97,
        hanker: 'Stabil',
        janker: 92,
        grade: 'Sangat Teliti',
        recommendation: 'Direkomendasikan',
        testDate: '14 Nov 2026',
      },
      preferences: {
        language: 'id',
        timezone: 'Asia/Jakarta',
        dateFormat: 'DD/MM/YYYY',
        defaultLanding: '/candidate',
      },
      notifications: {
        jobAlertsWA: true,
        emailAlerts: true,
        pushAlerts: true,
        reminderFreq: 'daily_digest',
      },
    };

    const csvOutput = generatePersonalDataCsv(mockUserData);

    // 1. Must start with UTF-8 BOM (\uFEFF) for immediate Excel encoding recognition
    assert.ok(csvOutput.startsWith('\uFEFF'), 'CSV must contain UTF-8 BOM at index 0');

    // 2. Must contain valid RFC 4180 header
    assert.ok(csvOutput.includes('"Kategori","Parameter","Nilai","Status / Keterangan","Waktu Pembaruan"'));

    // 3. Must contain candidate identity rows
    assert.ok(csvOutput.includes('"Rizky Aryendi Gumilang"'));
    assert.ok(csvOutput.includes('"rizky.kandidat@industrial.id"'));
    assert.ok(csvOutput.includes('"081234567890"'));

    // 4. Must contain OCR verified technical competencies
    assert.ok(csvOutput.includes('"PLC Siemens (S7-1200/1500)"'));
    assert.ok(csvOutput.includes('"Sertifikasi Ahli K3 Umum Kemnaker"'));

    // 5. Must contain Kraepelin HIMPSI scores
    assert.ok(csvOutput.includes('"PSI-KRAEPELIN-2026-001"'));
    assert.ok(csvOutput.includes('"54 angka/menit"'));
    assert.ok(csvOutput.includes('"97%"'));
    assert.ok(csvOutput.includes('"Direkomendasikan"'));
  });

  test('generateLatestJsonBackup produces complete schema with export metadata & checksum', async () => {
    const { generateLatestJsonBackup } = await import('../frontend/src/lib/backup-sync.js').catch(async () => {
      return await import('../frontend/src/lib/backup-sync.ts');
    });

    const mockUserData = {
      id: 'usr_emp_44',
      name: 'PT Industri Manufaktur Presisi',
      email: 'hr@industrimaju.co.id',
      phone: '021-89887766',
      role: 'employer',
      company: {
        name: 'PT Industri Manufaktur Presisi',
        industry: 'Manufaktur Otomotif',
        size: '250 - 500 Karyawan',
        minKraepelin: 65,
        minMatchScore: 70,
      },
    };

    const { payload, checksum } = generateLatestJsonBackup(mockUserData);

    assert.equal(payload.schema_version, '1.2.0');
    assert.ok(payload.export_metadata.export_id.startsWith('exp_'));
    assert.ok(checksum.startsWith('sha256_'));
    assert.equal(payload.export_metadata.sha256_checksum, checksum);
    assert.equal(payload.account_profile.name, 'PT Industri Manufaktur Presisi');
    assert.equal(payload.organization.minKraepelin, 65);
  });
});
