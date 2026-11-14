export interface FunnelApplication {
  id?: string;
  status?: string;
  test_score?: number;
  match_score?: number;
  [key: string]: any;
}

export interface FunnelMetrics {
  totalApplicants: number;
  passedKraepelin: number;
  interviewStage: number;
  averageMatchScore: number;
}

/**
 * Menghitung metrik hiring funnel dan efisiensi asesmen kandidat.
 * - Total Pelamar: jumlah berkas lamaran
 * - Lolos Kraepelin: nilai evaluasi HIMPSI >= 65
 * - Tahap Wawancara: status kandidat 'interview'
 * - Rata-rata Kecocokan: persentase kesesuaian profil OCR terhadap persyaratan posisi
 */
export function calculateFunnelMetrics(applications: FunnelApplication[]): FunnelMetrics {
  const totalApplicants = applications.length;
  if (totalApplicants === 0) {
    return {
      totalApplicants: 0,
      passedKraepelin: 0,
      interviewStage: 0,
      averageMatchScore: 0,
    };
  }

  const passedKraepelin = applications.filter((a) => (a.test_score ?? 0) >= 65).length;
  const interviewStage = applications.filter((a) => a.status === 'interview').length;
  const totalScore = applications.reduce((acc, a) => acc + (a.match_score ?? 80), 0);
  const averageMatchScore = Math.round(totalScore / totalApplicants);

  return {
    totalApplicants,
    passedKraepelin,
    interviewStage,
    averageMatchScore,
  };
}
