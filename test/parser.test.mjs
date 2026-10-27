import test from 'node:test';
import assert from 'node:assert/strict';
import { INDUSTRIAL_DICTIONARY } from '../frontend/src/lib/industrial-parser.ts';

test('Industrial Resume Parser Competency Dictionaries', async (t) => {
  await t.test('Manufacturing dictionary detects PLC Siemens, CNC, and CAD tools', () => {
    const text = 'Pengalaman 3 tahun pemrograman PLC Siemens S7-1200 dengan TIA Portal dan desain part di SolidWorks.';
    const detected = [];

    INDUSTRIAL_DICTIONARY.manufacturing.forEach(item => {
      if (item.pattern.test(text)) {
        detected.push(item.name);
      }
    });

    assert.ok(detected.includes('PLC Siemens (S7-1200/1500)'));
    assert.ok(detected.includes('AutoCAD 2D/3D & SolidWorks'));
  });

  await t.test('Safety dictionary detects K3 Umum Kemnaker and SIO Forklift', () => {
    const text = 'Memiliki sertifikat Ahli K3 Umum Kemenaker aktif serta SIO Forklift Kelas 2.';
    const detected = [];

    INDUSTRIAL_DICTIONARY.safety.forEach(item => {
      if (item.pattern.test(text)) {
        detected.push(item.name);
      }
    });

    assert.ok(detected.includes('Sertifikasi Ahli K3 Umum Kemnaker'));
    assert.ok(detected.includes('SIO Forklift Kemnaker (Kelas 1/2)'));
  });

  await t.test('Quality dictionary detects ISO 9001 and 5S/Kaizen', () => {
    const text = 'Memimpin implementasi budaya 5S / 5R, Kaizen, dan audit internal ISO 9001:2015 di assembly plant.';
    const detected = [];

    INDUSTRIAL_DICTIONARY.quality.forEach(item => {
      if (item.pattern.test(text)) {
        detected.push(item.name);
      }
    });

    assert.ok(detected.includes('5S / 5R & Kaizen Culture'));
    assert.ok(detected.includes('ISO 9001:2015 (Quality Management)'));
  });
});
