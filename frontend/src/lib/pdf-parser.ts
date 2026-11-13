import zlib from 'node:zlib';

export interface IndustrialSkillRule {
  label: string;
  keys: string[];
}

export const INDUSTRIAL_SKILL_RULES: IndustrialSkillRule[] = [
  { label: 'PLC Siemens & Otomasi', keys: ['plc', 'siemens', 'tia portal', 'scada', 'omron', 'hmi', 'mitsubishi'] },
  { label: 'CNC Milling & Bubut', keys: ['cnc', 'milling', 'bubut', 'machining', 'lathe', 'g-code', 'cam'] },
  { label: 'AutoCAD & SolidWorks', keys: ['cad', 'solidworks', 'catia', 'inventor', 'drawing', 'autocad'] },
  { label: 'Sertifikasi Ahli K3 Umum Kemnaker', keys: ['k3', 'ahli k3', 'safety', 'hse', 'smk3', 'kemnaker', 'oHSAS'] },
  { label: 'SIO Forklift Kemnaker', keys: ['forklift', 'sio', 'reach truck', 'material handling'] },
  { label: 'ISO 9001:2015 & 7 QC Tools', keys: ['iso', '9001', 'qc', 'qa', 'quality', 'kaizen', '5s', 'fishbone', 'pareto'] },
  { label: 'Total Productive Maintenance (TPM)', keys: ['tpm', 'maintenance', 'perawatan', 'overhaul', 'preventive', 'oee'] },
  { label: 'Caliper & Alat Ukur Presisi', keys: ['caliper', 'micrometer', 'alat ukur', 'metrologi', 'jangka sorong', 'dial gauge'] },
  { label: 'Panel Listrik & Wiring 3-Phase', keys: ['wiring', 'panel', 'listrik', '3-phase', 'inverter', 'motor', 'mcb', 'plc'] },
  { label: 'Welding SMAW/GMAW/GTAW', keys: ['welding', 'pengelasan', 'welder', 'las', 'smaw', 'gmaw', 'gtaw', 'mig', 'tig'] },
  { label: 'PPIC & Supply Chain Industri', keys: ['ppic', 'warehouse', 'gudang', 'logistik', 'supply chain', 'mrp', 'bom'] },
];

export const FOUNDATIONAL_FALLBACK_SKILLS: string[] = [
  'Caliper & Alat Ukur Presisi',
  'ISO 9001:2015 & 7 QC Tools',
  '5S / 5R & Kaizen Culture',
  'Sertifikasi Ahli K3 Umum Kemnaker',
];

/**
 * Extract human-readable text from raw PDF buffer without native dependencies.
 * Handles both plain text streams and FlateDecode compressed streams.
 */
export function extractTextFromPdfBuffer(buffer: Buffer | Uint8Array): string {
  if (!buffer || buffer.length === 0) return '';

  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const textChunks: string[] = [];

  // 1. Scan for stream ... endstream blocks
  let offset = 0;
  while (offset < buf.length) {
    const streamStart = buf.indexOf('stream', offset);
    if (streamStart === -1) break;

    // Start of stream payload (skip newline / carriage return after "stream")
    let payloadStart = streamStart + 6;
    if (buf[payloadStart] === 0x0d && buf[payloadStart + 1] === 0x0a) {
      payloadStart += 2;
    } else if (buf[payloadStart] === 0x0a || buf[payloadStart] === 0x0d) {
      payloadStart += 1;
    }

    const streamEnd = buf.indexOf('endstream', payloadStart);
    if (streamEnd === -1) break;

    const streamSlice = buf.subarray(payloadStart, streamEnd);

    // Attempt decompression if zlib FlateDecode was used
    let decompressed: Buffer | null = null;
    try {
      decompressed = zlib.inflateSync(streamSlice);
    } catch {
      decompressed = streamSlice;
    }

    if (decompressed) {
      const streamText = decompressed.toString('latin1');
      parsePdfTextStream(streamText, textChunks);
    }

    offset = streamEnd + 9;
  }

  // 2. Fallback scan on the entire raw buffer for plain text literal strings
  if (textChunks.length === 0) {
    const rawString = buf.toString('latin1');
    parsePdfTextStream(rawString, textChunks);
  }

  return textChunks.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Parse PDF text instructions (BT ... ET, Tj, TJ) from a decoded stream.
 */
function parsePdfTextStream(streamText: string, outChunks: string[]): void {
  // Regex for literal text: (Some text) Tj or within TJ arrays
  const literalStringRegex = /\(([^()]*)\)\s*(?:Tj|'|")/g;
  let match: RegExpExecArray | null;

  while ((match = literalStringRegex.exec(streamText)) !== null) {
    const cleaned = sanitizePdfString(match[1]);
    if (cleaned.length > 0) {
      outChunks.push(cleaned);
    }
  }

  // Array text: [(Part 1) 12 (Part 2)] TJ
  const arrayStringRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = arrayStringRegex.exec(streamText)) !== null) {
    const arrayContent = match[1];
    const itemRegex = /\(([^()]*)\)/g;
    let itemMatch: RegExpExecArray | null;
    const arrayItems: string[] = [];
    while ((itemMatch = itemRegex.exec(arrayContent)) !== null) {
      const cleaned = sanitizePdfString(itemMatch[1]);
      if (cleaned.length > 0) {
        arrayItems.push(cleaned);
      }
    }
    if (arrayItems.length > 0) {
      outChunks.push(arrayItems.join(''));
    }
  }
}

function sanitizePdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .trim();
}

/**
 * Detect manufacturing & factory competencies from raw text against the
 * industrial dictionary.
 */
export function detectIndustrialCompetencies(text: string): string[] {
  if (!text || text.trim().length === 0) {
    return FOUNDATIONAL_FALLBACK_SKILLS;
  }

  const normalized = text.toLowerCase();
  const detected: string[] = [];

  for (const rule of INDUSTRIAL_SKILL_RULES) {
    if (rule.keys.some((k) => normalized.includes(k.toLowerCase()))) {
      detected.push(rule.label);
    }
  }

  if (detected.length === 0) {
    return FOUNDATIONAL_FALLBACK_SKILLS;
  }

  return detected;
}
