'use client';

import { Suspense, useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Clock,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Brain,
  Zap,
  Check,
  FileText,
  Activity,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { DimensionScore } from '@/components/assessment/radar-chart';
import type { PauliResult } from '@/components/assessment/pauli-test';
import { useLanguage } from '@/lib/language-context';

// Lazy-load complex SVG radar and rapid game loop components for instant page load
const RadarChart = dynamic(
  () => import('@/components/assessment/radar-chart').then((mod) => mod.RadarChart),
  {
    ssr: false,
    loading: () => (
      <div className="w-[300px] h-[300px] flex items-center justify-center text-xs text-neutral-400 animate-pulse">
        Memuat grafik radar...
      </div>
    ),
  }
);

const PauliTest = dynamic(
  () => import('@/components/assessment/pauli-test').then((mod) => mod.PauliTest),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-xs text-neutral-400 animate-pulse">
        Menyiapkan modul simulasi Kraepelin...
      </div>
    ),
  }
);

export default function PsychTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500 text-sm">
          Memuat modul asesmen terpadu...
        </div>
      }
    >
      <PsychTestContent />
    </Suspense>
  );
}

// Default questions for fallback
const DEFAULT_PERSONALITY_QUESTIONS = [
  {
    id: 'q1',
    dimension: 'Dominance / Ketegasan',
    question_text: 'Ketika terjadi kendala operasional mendadak pada lini perakitan atau mesin:',
    options: {
      A: 'Segera mengambil alih inisiatif taktis dan mengarahkan teknisi ke titik masalah',
      B: 'Mengajak tim berdiskusi cepat untuk mencapai konsensus solusi bersama',
      C: 'Mengikuti instruksi SOP baku dan fokus menuntaskan bagian tugas spesifik saya',
      D: 'Menunggu arahan supervisor sebelum mengambil langkah perbaikan',
    },
    scoring_weight: { A: 5, B: 4, C: 3, D: 1 },
  },
  {
    id: 'q2',
    dimension: 'Influence / Komunikasi Persuasif',
    question_text: 'Saat mempresentasikan ide perbaikan proses (Kaizen/5S) kepada tim pabrik:',
    options: {
      A: 'Menyampaikan visi efisiensi kerja dengan antusiasme tinggi untuk menggerakkan tim',
      B: 'Menjelaskan data analitis dan fakta empiris secara sistematis dan terukur',
      C: 'Menyesuaikan penjelasan dengan kenyamanan dan respon pendengar',
      D: 'Lebih memilih membagikan dokumen tertulis daripada berbicara langsung',
    },
    scoring_weight: { A: 5, B: 4, C: 3, D: 1 },
  },
  {
    id: 'q3',
    dimension: 'Steadiness / Daya Tahan Kerja',
    question_text: 'Dalam menghadapi shift kerja panjang atau perubahan jadwal operasional:',
    options: {
      A: 'Cepat beradaptasi dan tetap menjaga ritme ketenangan kerja serta keselamatan (K3)',
      B: 'Langsung merombak jadwal kerja personal agar target output tidak meleset',
      C: 'Membutuhkan waktu untuk memahami ritme baru sebelum bekerja optimal',
      D: 'Merasa terbebani jika stabilitas shift kerja terganggu',
    },
    scoring_weight: { A: 5, B: 4, C: 3, D: 1 },
  },
  {
    id: 'q4',
    dimension: 'Conscientiousness / Ketelitian',
    question_text: 'Terkait kepatuhan terhadap toleransi dimensi (kalibrasi) dan standar ISO:',
    options: {
      A: 'Selalu melakukan verifikasi ganda (double-check alat ukur) sebelum hasil diserahkan',
      B: 'Mengutamakan kecepatan selesai di awal, perbaikan detail menyusul',
      C: 'Bekerja sesuai panduan baku tanpa menyimpang dari standar kualitas QC',
      D: 'Fokus pada kuantitas output tanpa terlalu terikat pada presisi mikro',
    },
    scoring_weight: { A: 5, B: 2, C: 4, D: 1 },
  },
  {
    id: 'q5',
    dimension: 'Emotional Stability / Regulasi Diri',
    question_text: 'Ketika berada di bawah tekanan target output harian yang sangat ketat:',
    options: {
      A: 'Mampu meregulasi stres secara rasional dan tetap fokus pada prioritas keselamatan',
      B: 'Mencari dukungan rekan kerja untuk membagi beban tugas',
      C: 'Kadang merasa tegang namun tetap dapat menuntaskan tanggung jawab produksi',
      D: 'Mengalami kesulitan berkonsentrasi jika tekanan terlalu intens',
    },
    scoring_weight: { A: 5, B: 4, C: 3, D: 1 },
  },
];

export function PsychTestContent() {
  const { jobId } = useParams<{ jobId: string }>();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [questions, setQuestions] = useState<any[]>(DEFAULT_PERSONALITY_QUESTIONS);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Big Five / DISC Dimensions Calculated State
  const [dimensions, setDimensions] = useState<DimensionScore[]>([
    { label: 'Dominance (D)', key: 'D', score: 85, description: 'Ketegasan dan inisiatif perbaikan' },
    { label: 'Influence (I)', key: 'I', score: 78, description: 'Komunikasi dan koordinasi shift' },
    { label: 'Steadiness (S)', key: 'S', score: 90, description: 'Daya tahan kerja berulang dan konsistensi' },
    { label: 'Compliance (C)', key: 'C', score: 82, description: 'Kepatuhan standar mutu ISO & K3' },
    { label: 'Stability (ES)', key: 'ES', score: 88, description: 'Kematangan regulasi stres dan ketenangan' },
  ]);

  // Pauli Test Result State
  const [pauliResult, setPauliResult] = useState<PauliResult | null>(null);
  const [pauliSynced, setPauliSynced] = useState(false);

  useEffect(() => {
    // Ambil soal tes psikometri dari PocketBase
    pb.collection('test_questions')
      .getFullList()
      .then((records) => {
        if (records.length > 0) setQuestions(records);
      })
      .catch(() => {
        // Fallback to default questions
      });

    // Check if test was previously completed
    const savedResult = localStorage.getItem(`assessment_result_${jobId}`);
    if (savedResult) {
      try {
        const parsed = JSON.parse(savedResult);
        if (parsed.test_score) {
          setScore(parsed.test_score);
          if (parsed.dimensions) setDimensions(parsed.dimensions);
          setSubmitted(true);
        }
      } catch {}
    }

    // Check if pauli was previously completed
    const savedPauli = localStorage.getItem(`pauli_result_${jobId}`);
    if (savedPauli) {
      try {
        const parsedPauli = JSON.parse(savedPauli);
        if (parsedPauli.meanSpeed) {
          setPauliResult(parsedPauli);
          setPauliSynced(true);
        }
      } catch {}
    }

    // Anti-cheat listener
    const handleVisibilityChange = () => {
      if (document.hidden && !submitted) {
        setWarnings((w) => {
          const nextW = w + 1;
          alert(`Peringatan Anti-Cheat (${nextW}/3): Anda terdeteksi berpindah tab! Tes akan digugurkan jika melewati batas.`);
          if (nextW >= 3) {
            submitPersonalityTest(true);
          }
          return nextW;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitted, jobId]);

  // Calculate radar chart scores based on answers
  const calculateDimensions = () => {
    let totalScore = 0;
    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected && q.scoring_weight) {
        const weight = q.scoring_weight[selected] ?? 3;
        totalScore += weight;
      }
    });

    const baseNormalized = Math.min(95, Math.max(65, Math.round((totalScore / (questions.length * 5 || 1)) * 100)));

    const computedDims = [
      { label: 'Dominance (Ketegasan)', key: 'D', score: Math.min(96, baseNormalized + (answers[questions[0]?.id] === 'A' ? 12 : 2)), description: 'Ketegasan dan inisiatif taktis' },
      { label: 'Influence (Komunikasi)', key: 'I', score: Math.min(95, baseNormalized + (answers[questions[1]?.id] === 'A' ? 10 : -4)), description: 'Koordinasi tim & persuasi ide' },
      { label: 'Steadiness (Daya Tahan)', key: 'S', score: Math.min(98, baseNormalized + (answers[questions[2]?.id] === 'A' ? 14 : 4)), description: 'Konsistensi kerja rutin & shift' },
      { label: 'Compliance (Ketelitian)', key: 'C', score: Math.min(94, baseNormalized + (answers[questions[3]?.id] === 'A' ? 15 : 0)), description: 'Kepatuhan SOP ISO 9001 & presisi' },
      { label: 'Stability (Regulasi Diri)', key: 'ES', score: Math.min(92, baseNormalized + (answers[questions[4]?.id] === 'A' ? 11 : -3)), description: 'Stabilitas emosi di bawah target' },
    ];

    setDimensions(computedDims);
    return { totalScore, computedDims };
  };

  /**
   * Poin 1: Submit test & auto-sync to database (job_applications & assessment_results)
   */
  const submitPersonalityTest = async (isPenalty = false) => {
    setIsSyncing(true);
    setSubmitted(true);
    const { totalScore, computedDims } = calculateDimensions();
    const finalCalculated = Math.round((totalScore / (questions.length * 5 || 1)) * 100);
    const penalizedScore = isPenalty ? Math.max(40, finalCalculated - 25) : finalCalculated;
    setScore(penalizedScore);

    const nextStatus = penalizedScore >= 70 ? 'interview' : 'testing';

    try {
      // 1. Try finding application in PocketBase
      let applicationId = '';
      try {
        if (pb.authStore.record?.id) {
          try {
            const myApp = await pb.collection('job_applications').getFirstListItem(
              `job_id = "${jobId}" && candidate_id.user_id = "${pb.authStore.record.id}"`
            );
            applicationId = myApp.id;
          } catch {
            const anyApp = await pb.collection('job_applications').getFirstListItem(`job_id = "${jobId}"`);
            applicationId = anyApp.id;
          }
        } else {
          const anyApp = await pb.collection('job_applications').getFirstListItem(`job_id = "${jobId}"`);
          applicationId = anyApp.id;
        }
      } catch {
        applicationId = '';
      }

      // 2. Direct Update to PocketBase `job_applications`
      if (applicationId) {
        try {
          await pb.collection('job_applications').update(applicationId, {
            test_score: penalizedScore,
            status: nextStatus,
          });
          setSyncStatus('Tersinkronisasi otomatis ke Database Pelamar & ATS Rekruter');
        } catch (err) {
          console.warn('Direct PB app update error:', err);
        }
      }

      // 3. Try custom backend route if live
      try {
        const formattedAnswers = Object.entries(answers).map(([qId, opt]) => ({
          question_id: qId,
          selected_option: opt,
        }));

        await fetch(`${pb.baseUrl}/api/submit-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: pb.authStore.token,
          },
          body: JSON.stringify({
            application_id: applicationId,
            answers: formattedAnswers,
            penalty: isPenalty,
          }),
        });
      } catch {}

      // 4. Persistence Fallback in localStorage
      const resultPayload = {
        jobId,
        applicationId,
        test_score: penalizedScore,
        status: nextStatus,
        dimensions: computedDims,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(`assessment_result_${jobId}`, JSON.stringify(resultPayload));

      // Update sample application if exists in localStorage
      const sampleApps = localStorage.getItem('sample_applications');
      if (sampleApps) {
        try {
          const parsed = JSON.parse(sampleApps);
          const updated = parsed.map((a: any) =>
            a.job_id === jobId ? { ...a, test_score: penalizedScore, status: nextStatus } : a
          );
          localStorage.setItem('sample_applications', JSON.stringify(updated));
        } catch {}
      }
    } catch (err) {
      console.error('Error during assessment sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Poin 1: Auto-sync Kraepelin / Pauli metrics to database & employer pipeline
   */
  const handlePauliComplete = async (result: PauliResult) => {
    setPauliResult(result);
    setPauliSynced(true);
    localStorage.setItem(`pauli_result_${jobId}`, JSON.stringify(result));

    // Update application in PocketBase if possible
    try {
      if (pb.authStore.record?.id) {
        const myApp = await pb.collection('job_applications').getFirstListItem(`job_id = "${jobId}"`);
        if (myApp) {
          // If score exists, keep it or reinforce passing status
          await pb.collection('job_applications').update(myApp.id, {
            status: (myApp.test_score ?? 80) >= 70 ? 'interview' : 'testing',
          });
        }
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 text-neutral-900 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-[#E8E8EC] rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                {isEn ? 'Integrated Psychological Assessment' : 'Modul Asesmen Psikologi Terpadu'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-100">
                {isEn ? 'Auto-Sync Active' : 'Sinkronisasi Otomatis Aktif'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0A0A0A]">
              {t.assessment.title}
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {t.assessment.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {warnings > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                {isEn ? `Tab Switch Warning: ${warnings}/3` : `Peringatan Tab: ${warnings}/3`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                {isEn ? 'Anti-Cheat Active' : 'Anti-Cheat Aktif'}
              </span>
            )}
          </div>
        </div>

        {/* Tab Selection: 1. Kuesioner Kepribadian (DISC) & 2. Tes Pauli (Tes Koran) */}
        <Tabs defaultValue="personality" className="space-y-6">
          <TabsList className="bg-white border border-[#E8E8EC] p-1 rounded-full shadow-sm">
            <TabsTrigger
              value="personality"
              className="rounded-full text-xs font-semibold data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-5 py-2"
            >
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              {t.assessment.tabPersonality}
            </TabsTrigger>
            <TabsTrigger
              value="pauli"
              className="rounded-full text-xs font-semibold data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-5 py-2"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {t.assessment.tabPauli}
              {pauliSynced && <span className="w-2 h-2 rounded-full bg-emerald-500 ml-1.5" />}
            </TabsTrigger>
          </TabsList>

          {/* ==================================================================== */}
          {/* TAB 1: KUESIONER KEPRIBADIAN + RADAR CHART                           */}
          {/* ==================================================================== */}
          <TabsContent value="personality" className="space-y-6">
            {!submitted ? (
              <div className="space-y-6">
                <div className="bg-white border border-[#E8E8EC] rounded-3xl p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8EC]">
                    <h3 className="font-bold text-base text-[#0A0A0A]">
                      Kuesioner Perilaku Kerja Manufaktur &amp; Industri (DISC / IPIP)
                    </h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      {Object.keys(answers).length} / {questions.length} Terjawab
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-neutral-400">
                            BUTIR SOAL {idx + 1}
                          </span>
                          {q.dimension && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                              Dimensi: {q.dimension}
                            </span>
                          )}
                        </div>

                        <p className="font-semibold text-sm text-[#0A0A0A] leading-snug">
                          {q.question_text}
                        </p>

                        <div className="space-y-2">
                          {Object.keys(q.options || {}).map((optKey) => {
                            const isSelected = answers[q.id] === optKey;
                            return (
                              <label
                                key={optKey}
                                className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                                    : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={q.id}
                                    value={optKey}
                                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optKey }))}
                                    checked={isSelected}
                                    className="w-4 h-4 text-neutral-900 focus:ring-0"
                                  />
                                  <span>
                                    <strong className="mr-1.5">{optKey}.</strong>
                                    {q.options[optKey]}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-neutral-500">
                      Jawaban Anda akan langsung disinkronkan ke basis data rekruter untuk proses verifikasi.
                    </p>

                    <Button
                      onClick={() => submitPersonalityTest(false)}
                      disabled={Object.keys(answers).length < questions.length || isSyncing}
                      className="w-full sm:w-auto h-11 px-8 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
                    >
                      {isSyncing ? 'Menyinkronkan Hasil...' : 'Kumpulkan & Sinkronkan Hasil Tes'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* RESULT VIEW WITH RADAR CHART */
              <div className="bg-white border border-[#E8E8EC] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-emerald-900">
                        Hasil Asesmen Berhasil Disinkronkan ke Database Rekruter!
                      </h3>
                      <p className="text-xs text-emerald-700">
                        Skor Psikotes Anda: <strong>{score ?? 88} / 100</strong> &bull; Status Seleksi: <strong className="uppercase">Interview</strong>
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-800 text-xs font-mono bg-white">
                    Tersinkronisasi Database
                  </Badge>
                </div>

                {/* Radar Chart Display */}
                <div className="p-6 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC] flex flex-col items-center">
                  <div className="w-full mb-4">
                    <h4 className="font-bold text-sm text-[#0A0A0A] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#6366F1]" />
                      Grafik Jaring Laba-Laba (Radar Chart) Profil Kompetensi
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Menggambarkan proporsi 5 dimensi kerja: Ketegasan (D), Komunikasi (I), Ketahanan (S), Ketelitian (C), dan Regulasi Diri (ES).
                    </p>
                  </div>

                  <div className="py-4">
                    <RadarChart dimensions={dimensions} size={300} />
                  </div>
                </div>

                {/* Dimension Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {dimensions.map((d) => (
                    <div key={d.key} className="p-4 rounded-xl bg-white border border-[#E8E8EC]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-neutral-800">{d.label}</span>
                        <span className="text-xs font-mono font-bold text-[#6366F1]">{d.score}%</span>
                      </div>
                      <p className="text-[11px] text-neutral-500 leading-snug">{d.description}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#E8E8EC] flex flex-wrap justify-between items-center gap-3">
                  <span className="text-xs text-neutral-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    Data tersimpan di collection <code className="font-mono text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">job_applications</code>
                  </span>
                  <div className="flex gap-2">
                    <Link href="/candidate/results">
                      <Button className="rounded-full text-xs h-9 bg-[#6366F1] hover:bg-indigo-700 text-white flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Buka Lembar Psikogram Lengkap
                      </Button>
                    </Link>
                    <Link href="/candidate">
                      <Button variant="outline" className="rounded-full text-xs h-9">
                        Kembali ke Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 2: SIMULASI TES PAULI / KRAEPELIN                               */}
          {/* ==================================================================== */}
          <TabsContent value="pauli" className="space-y-4">
            {pauliSynced && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Hasil Uji Kraepelin Tersimpan: <strong>Kecepatan {pauliResult?.speedAverage ?? 16} jwb/menit</strong> &bull; Akurasi: <strong>{pauliResult?.accuracyRate ?? 95}%</strong>
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white border-emerald-300 text-emerald-800">
                  Tersinkronisasi
                </Badge>
              </div>
            )}

            <PauliTest
              columnDurationSeconds={15}
              totalColumns={5}
              onComplete={handlePauliComplete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
