/**
 * Standarisasi Norma Psikometri Industri Manufaktur (HIMPSI & Factory Floor Benchmarks)
 * Menilai kesesuaian kandidat berdasarkan profil peran spesifik industri.
 */

export interface RoleBenchmark {
  id: string;
  title: string;
  department: string;
  description: string;
  minPanker: number;           // Target kecepatan (kalkulasi/menit)
  minTianker: number;          // Target ketelitian minimum (%)
  preferredHanker: string[];   // Pola ketahanan kerja yang diharapkan
  minJankerStability: number;  // Skor kestabilan emosi minimum
  keyTraits: string[];
  riskFactor: string;
}

export const INDUSTRIAL_ROLE_BENCHMARKS: Record<string, RoleBenchmark> = {
  operator_produksi: {
    id: 'operator_produksi',
    title: 'Operator Produksi / Assembly Line',
    department: 'Manufaktur & Produksi',
    description: 'Fokus pada ritme kerja monoton berkelanjutan, kepatuhan SOP 5S, dan ketahanan fisik shift panjang.',
    minPanker: 36,
    minTianker: 85,
    preferredHanker: ['Stabil', 'Meningkat'],
    minJankerStability: 75,
    keyTraits: ['Steadiness (S) Tinggi', 'Kepatuhan SOP', 'Konsistensi Output'],
    riskFactor: 'Penurunan ketahanan (Hanker menurun) berisiko menurunkan target output per jam di paruh kedua shift.',
  },
  qc_inspector: {
    id: 'qc_inspector',
    title: 'QC / QA Inspector (Quality Control)',
    department: 'Quality Assurance',
    description: 'Membutuhkan ketelitian mikro ekstrem untuk memitigasi risiko reject rate dan scrap material produk.',
    minPanker: 32,
    minTianker: 94,
    preferredHanker: ['Stabil'],
    minJankerStability: 85,
    keyTraits: ['Compliance (C) Tinggi', 'Presisi Visual Ekstrem', 'Zero-Defect Mindset'],
    riskFactor: 'Akurasi di bawah 90% berpotensi meloloskan produk cacat ke tangan klien atau downstream assembly.',
  },
  teknisi_maintenance: {
    id: 'teknisi_maintenance',
    title: 'Teknisi Maintenance & Otomasi PLC',
    department: 'Engineering & Maintenance',
    description: 'Membutuhkan kecepatan pemecahan masalah (troubleshooting), kestabilan saat mesin breakdown, dan kepatuhan K3.',
    minPanker: 44,
    minTianker: 88,
    preferredHanker: ['Meningkat', 'Stabil'],
    minJankerStability: 80,
    keyTraits: ['Analisis Cepat (Panker Tinggi)', 'Kestabilan Regulasi Emosi', 'Keahlian Sistem Mekatronika'],
    riskFactor: 'Ketidakstabilan emosi (Janker rendah) berisiko fatal saat menangani insiden panel tegangan tinggi 3-phase.',
  },
  foreman_supervisor: {
    id: 'foreman_supervisor',
    title: 'Foreman / Group Leader Produksi',
    department: 'Operasional Pabrik',
    description: 'Menuntut kepemimpinan lapangan, ketegasan membagi tugas shift, dan komunikasi antar departemen.',
    minPanker: 40,
    minTianker: 85,
    preferredHanker: ['Meningkat', 'Stabil'],
    minJankerStability: 85,
    keyTraits: ['Dominance & Influence Seimbang', 'Pengambilan Keputusan Cepat', 'Problem Solving 8D'],
    riskFactor: 'Gaya kepemimpinan pasif berpotensi menyebabkan bottleneck koordinasi transfer antar shift.',
  },
  operator_forklift_gudang: {
    id: 'operator_forklift_gudang',
    title: 'Operator Forklift & Logistik Gudang',
    department: 'Supply Chain & Warehouse',
    description: 'Menuntut kewaspadaan keselamatan kerja tinggi, kepatuhan SIO Kemnaker, dan ketelitian penataan inventory.',
    minPanker: 30,
    minTianker: 90,
    preferredHanker: ['Stabil'],
    minJankerStability: 80,
    keyTraits: ['Kepatuhan K3 Mutlak', 'Spasial Presisi', 'Kehati-hatian Manuver'],
    riskFactor: 'Kecerobohan gerak cepat tanpa ketelitian berpotensi menimbulkan kecelakaan kerja di area racking sempit.',
  },
};

export interface RoleEvaluationResult {
  roleId: string;
  roleTitle: string;
  fitPercentage: number;
  grade: 'Sangat Sesuai' | 'Sesuai dengan Catatan' | 'Kurang Sesuai';
  pankerStatus: string;
  tiankerStatus: string;
  hankerStatus: string;
  jankerStatus: string;
  positiveHighlights: string[];
  riskMitigationAdvice: string;
}

/**
 * Evaluasi performa tes Kraepelin dan DISC terhadap standar peran kerja industri
 */
export function evaluateCandidateAgainstRole(
  roleId: string,
  metrics: {
    panker: number;      // Kecepatan
    tianker: number;     // Ketelitian %
    hanker: string;      // Tren ketahanan
    janker: number;      // Kestabilan emosi
  },
  discDims?: Record<string, number>
): RoleEvaluationResult {
  const benchmark = INDUSTRIAL_ROLE_BENCHMARKS[roleId] || INDUSTRIAL_ROLE_BENCHMARKS.operator_produksi;

  let points = 0;
  const maxPoints = 100;
  const positiveHighlights: string[] = [];

  // 1. Evaluasi Kecepatan (Panker) - Bobot 25
  const pankerRatio = Math.min(1.2, metrics.panker / benchmark.minPanker);
  const pankerScore = Math.round(pankerRatio * 25);
  points += pankerScore;
  let pankerStatus = `Kecepatan ${metrics.panker}/menit (Target: ${benchmark.minPanker}/menit)`;
  if (metrics.panker >= benchmark.minPanker) {
    positiveHighlights.push(`Ritme kerja melampaui standar kecepatan peran ${benchmark.title}`);
  }

  // 2. Evaluasi Ketelitian (Tianker) - Bobot 35 (Sangat Kritis di Manufaktur)
  const tiankerRatio = Math.min(1.1, metrics.tianker / benchmark.minTianker);
  const tiankerScore = Math.round(tiankerRatio * 35);
  points += tiankerScore;
  let tiankerStatus = `Ketelitian ${metrics.tianker}% (Target: ${benchmark.minTianker}%)`;
  if (metrics.tianker >= benchmark.minTianker) {
    positiveHighlights.push(`Akurasi kerja (${metrics.tianker}%) memenuhi standar zero-defect untuk ${benchmark.department}`);
  }

  // 3. Evaluasi Ketahanan (Hanker) - Bobot 20
  let hankerScore = 14;
  if (benchmark.preferredHanker.includes(metrics.hanker)) {
    hankerScore = 20;
    positiveHighlights.push(`Kurva stamina kerja (${metrics.hanker}) ideal untuk durasi shift industri`);
  } else if (metrics.hanker === 'Menurun') {
    hankerScore = 8;
  }
  points += hankerScore;
  const hankerStatus = `Tren Stamina: ${metrics.hanker}`;

  // 4. Evaluasi Kestabilan Emosi (Janker) - Bobot 20
  const jankerRatio = Math.min(1.1, metrics.janker / benchmark.minJankerStability);
  const jankerScore = Math.round(jankerRatio * 20);
  points += jankerScore;
  const jankerStatus = `Stabilitas Emosi: ${metrics.janker} (Target: ${benchmark.minJankerStability})`;
  if (metrics.janker >= benchmark.minJankerStability) {
    positiveHighlights.push(`Pengendalian stres dan ritme kerja stabil saat berada di bawah beban target`);
  }

  // Critical prerequisite penalty for accuracy-sensitive industrial roles
  if (metrics.tianker < benchmark.minTianker) {
    const deficit = benchmark.minTianker - metrics.tianker;
    points -= Math.round(deficit * 1.8);
  }

  let finalPercentage = Math.min(98, Math.max(35, points));
  if (metrics.tianker < benchmark.minTianker) {
    // Cannot exceed 75% if mandatory accuracy is missed
    finalPercentage = Math.min(74, finalPercentage);
  }

  let grade: 'Sangat Sesuai' | 'Sesuai dengan Catatan' | 'Kurang Sesuai' = 'Kurang Sesuai';
  if (finalPercentage >= 80 && metrics.tianker >= benchmark.minTianker) {
    grade = 'Sangat Sesuai';
  } else if (finalPercentage >= 65) {
    grade = 'Sesuai dengan Catatan';
  }

  if (positiveHighlights.length === 0) {
    positiveHighlights.push('Memiliki kesiapan fisik dan mental dasar untuk orientasi plant industri.');
  }

  return {
    roleId: benchmark.id,
    roleTitle: benchmark.title,
    fitPercentage: finalPercentage,
    grade,
    pankerStatus,
    tiankerStatus,
    hankerStatus,
    jankerStatus,
    positiveHighlights,
    riskMitigationAdvice: benchmark.riskFactor,
  };
}
