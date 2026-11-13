import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Real PDF Document CV Parser & Industrial Skills Test Suite', () => {
  it('extractTextFromPdfBuffer extracts text from PDF stream tokens', async () => {
    const { extractTextFromPdfBuffer } = await import('../frontend/src/lib/pdf-parser.js').catch(async () => {
      return await import('../frontend/src/lib/pdf-parser.ts');
    });

    // Minimal syntactically valid PDF with text objects
    const mockPdfRaw = `%PDF-1.4
1 0 obj
<< /Length 120 >>
stream
BT
/F1 12 Tf
72 712 Td
(Rizky Gumilang - Senior Automation Engineer) Tj
0 -15 Td
(Keahlian: Pemrograman PLC Siemens S7-1200 TIA Portal dan SCADA WinCC) Tj
0 -15 Td
(Sertifikasi: Ahli K3 Umum Kemnaker RI dan SIO Forklift Kelas II) Tj
0 -15 Td
(Quality: Penerapan ISO 9001:2015, Kaizen 5S, dan CNC Milling 3-Axis) Tj
ET
endstream
endobj
xref
0 2
trailer
<< /Root 1 0 R >>
%%EOF`;

    const pdfBuffer = Buffer.from(mockPdfRaw, 'utf-8');
    const extractedText = extractTextFromPdfBuffer(pdfBuffer);

    assert.ok(extractedText.length > 0, 'Extracted text should not be empty');
    assert.ok(extractedText.includes('PLC Siemens'), 'Should contain PLC Siemens');
    assert.ok(extractedText.includes('Ahli K3 Umum Kemnaker'), 'Should contain K3 Umum');
    assert.ok(extractedText.includes('SIO Forklift'), 'Should contain SIO Forklift');
    assert.ok(extractedText.includes('ISO 9001'), 'Should contain ISO 9001');
  });

  it('detectIndustrialCompetencies matches technical factory competencies from extracted text', async () => {
    const { detectIndustrialCompetencies } = await import('../frontend/src/lib/pdf-parser.js').catch(async () => {
      return await import('../frontend/src/lib/pdf-parser.ts');
    });

    const resumeContent = `
      PENGALAMAN KERJA:
      - Maintenance Electrician di PT Pabrik Baja Indonesia
      - Mengoperasikan Mesin CNC Lathe dan CNC Milling Fanuc
      - Melakukan preventive maintenance panel listrik 3-phase dan motor inverter
      - Memiliki Surat Izin Operator (SIO) Forklift aktif dari Kemnaker
      - Sertifikasi Ahli K3 Umum dan implementasi SMK3
      - Pengukuran toleransi menggunakan Caliper / Micrometer ketelitian 0.01mm
    `;

    const detected = detectIndustrialCompetencies(resumeContent);

    assert.ok(Array.isArray(detected));
    assert.ok(detected.includes('CNC Milling & Bubut'), 'Should detect CNC Milling');
    assert.ok(detected.includes('SIO Forklift Kemnaker'), 'Should detect SIO Forklift');
    assert.ok(detected.includes('Sertifikasi Ahli K3 Umum Kemnaker'), 'Should detect K3');
    assert.ok(detected.includes('Panel Listrik & Wiring 3-Phase'), 'Should detect Panel Listrik');
    assert.ok(detected.includes('Caliper & Alat Ukur Presisi'), 'Should detect Caliper');
  });

  it('detectIndustrialCompetencies falls back to foundational manufacturing skills for empty input', async () => {
    const { detectIndustrialCompetencies } = await import('../frontend/src/lib/pdf-parser.js').catch(async () => {
      return await import('../frontend/src/lib/pdf-parser.ts');
    });

    const fallbackSkills = detectIndustrialCompetencies('');
    assert.ok(fallbackSkills.length >= 3, 'Should provide standard fallback skills');
    assert.ok(fallbackSkills.includes('ISO 9001:2015 & 7 QC Tools'));
    assert.ok(fallbackSkills.includes('5S / 5R & Kaizen Culture'));
  });
});
