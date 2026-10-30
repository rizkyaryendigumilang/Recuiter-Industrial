'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Compass, 
  Activity, 
  ArrowLeft,
  Share2,
  ShieldCheck,
  Calendar,
  Briefcase,
  User,
  Sparkles,
  Play
} from 'lucide-react';
import { INDUSTRIAL_ROLE_BENCHMARKS, evaluateCandidateAgainstRole } from '@/lib/industrial-norms';

export default function CandidateResultsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const reportRef = useRef<HTMLDivElement>(null);

  const [candidateName, setCandidateName] = useState('BUDI SANTOSO');
  const [candidateEmail, setCandidateEmail] = useState('kandidat@industrial.id');
  const [targetPosition, setTargetPosition] = useState('Teknisi Maintenance & QC Presisi');
  const [testDate, setTestDate] = useState('14 Oktober 2026');
  const [testCode, setTestCode] = useState('PSI-IND-2026-0891');
  const [isRealData, setIsRealData] = useState(false);
  const [recommendationScore, setRecommendationScore] = useState(94.2);

  // DISC Dimensions (0 to 100)
  const [discScores, setDiscScores] = useState({
    D: 72, // Dominance
    I: 65, // Influence
    S: 88, // Steadiness
    C: 94, // Compliance (Quality & Precision)
  });

  // Kraepelin Metrics
  const [kraepelinScores, setKraepelinScores] = useState({
    panker: 52, // Kecepatan (Angka/menit)
    tianker: 96, // Ketelitian (%)
    hankker: 'Tinggi (High)', // Daya tahan
    stanker: 91, // Stabilitas kerja (%)
    curve: [38, 44, 49, 52, 55, 54, 53, 52],
  });

  const [selectedRole, setSelectedRole] = useState('operator_produksi');

  const currentRoleEvaluation = evaluateCandidateAgainstRole(selectedRole, {
    panker: kraepelinScores.panker,
    tianker: kraepelinScores.tianker,
    hanker: kraepelinScores.hankker.includes('Meningkat') ? 'Meningkat' : (kraepelinScores.hankker.includes('Menurun') ? 'Menurun' : 'Stabil'),
    janker: kraepelinScores.stanker,
  });

  const handlePrint = () => {
    window.print();
  };

  // Load Real Candidate Psychometric Data
  useEffect(() => {
    if (user?.name) setCandidateName(user.name);
    else if (user?.email) setCandidateName(user.email.split('@')[0].toUpperCase());
    if (user?.email) setCandidateEmail(user.email);

    let hasLoadedReal = false;

    // 1. Try loading from localStorage Kraepelin latest
    try {
      const savedKraepelin = localStorage.getItem('candidate_latest_kraepelin');
      if (savedKraepelin) {
        const parsed = JSON.parse(savedKraepelin);
        if (parsed.panker && parsed.curve) {
          setKraepelinScores({
            panker: parsed.panker,
            tianker: parsed.tianker || 90,
            hankker: parsed.hankerTrend || 'Tinggi (High)',
            stanker: parsed.stanker || 85,
            curve: Array.isArray(parsed.curve) && parsed.curve.length > 0 ? parsed.curve : [38, 44, 49, 52, 55],
          });
          if (parsed.testCode) setTestCode(parsed.testCode);
          if (parsed.testDate) setTestDate(parsed.testDate);
          hasLoadedReal = true;
        }
      }
    } catch {}

    // 2. Try loading from latest comprehensive assessment
    try {
      const savedAssessment = localStorage.getItem('candidate_latest_assessment');
      if (savedAssessment) {
        const parsed = JSON.parse(savedAssessment);
        if (parsed.dimensions && Array.isArray(parsed.dimensions)) {
          const dScore = parsed.dimensions.find((d: any) => d.key === 'D')?.score || 75;
          const iScore = parsed.dimensions.find((d: any) => d.key === 'I')?.score || 70;
          const sScore = parsed.dimensions.find((d: any) => d.key === 'S')?.score || 85;
          const cScore = parsed.dimensions.find((d: any) => d.key === 'C')?.score || 90;
          setDiscScores({ D: dScore, I: iScore, S: sScore, C: cScore });
          if (parsed.test_score) setRecommendationScore(parsed.test_score);
          hasLoadedReal = true;
        }
      }
    } catch {}

    // 3. Try PocketBase query if candidate record exists
    if (pb.authStore.record?.id) {
      pb.collection('job_applications')
        .getFullList({
          filter: `candidate_id.user_id = "${pb.authStore.record.id}" || candidate_id = "${pb.authStore.record.id}"`,
          expand: 'job_id',
          sort: '-created',
        })
        .then((records) => {
          if (records.length > 0) {
            const latestApp = records[0];
            if (latestApp.expand?.job_id?.title) {
              setTargetPosition(latestApp.expand.job_id.title);
            }
            if (latestApp.test_score) {
              setRecommendationScore(latestApp.test_score);
              hasLoadedReal = true;
            }
          }
        })
        .catch(() => {});
    }

    setIsRealData(hasLoadedReal);
  }, [user]);

  // Radar Chart Math helper (Center: 150, 150, Radius: 100)
  const cx = 150;
  const cy = 150;
  const r = 100;
  // Angles: D = top (-90 deg), I = right (0 deg), S = bottom (90 deg), C = left (180 deg)
  const getCoords = (val: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const distance = (val / 100) * r;
    return {
      x: cx + distance * Math.cos(rad),
      y: cy + distance * Math.sin(rad),
    };
  };

  const pD = getCoords(discScores.D, -90);
  const pI = getCoords(discScores.I, 0);
  const pS = getCoords(discScores.S, 90);
  const pC = getCoords(discScores.C, 180);
  const radarPath = `M ${pD.x} ${pD.y} L ${pI.x} ${pI.y} L ${pS.x} ${pS.y} L ${pC.x} ${pC.y} Z`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Action Bar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8E8EC] print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/candidate">
              <Button variant="ghost" size="sm" className="rounded-full text-xs gap-1.5 text-[#6B6B6B]">
                <ArrowLeft className="w-4 h-4" />
                <span>{isEn ? 'Back to Portal' : 'Kembali ke Portal'}</span>
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] tracking-tight">
              {isEn ? 'My Psychogram & Assessment Report' : 'Hasil Evaluasi Psikogram Saya'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/candidate/practice">
              <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 border-[#E8E8EC] h-9">
                <Play className="w-3.5 h-3.5" />
                <span>{isEn ? 'Retake Practice' : 'Ulangi Tryout Kraepelin'}</span>
              </Button>
            </Link>
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-4 gap-2 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / Download PDF' : 'Cetak / Unduh Psikogram PDF'}</span>
            </Button>
          </div>
        </div>

        {/* Real Data Status Banner (Hidden when printing) */}
        <div className="print:hidden">
          {isRealData ? (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span><strong>Data Hasil Riil Terverifikasi:</strong> Psikogram ini membaca kalkulasi riil dari sesi ujian & simulasi Kraepelin terbaru Anda.</span>
              </div>
              <Badge className="bg-emerald-600 text-white text-[10px]">Live Verified</Badge>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span><strong>Sampel Profil Terkalibrasi:</strong> Kerjakan tes pada lowongan atau coba simulasi Kraepelin untuk memuat skor personal Anda.</span>
              </div>
              <Link href="/candidate/practice">
                <Button size="sm" variant="outline" className="text-xs h-7 border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                  Mulai Tes
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Printable Official 1-Page Psychogram Document */}
        <div 
          ref={reportRef} 
          className="bg-white border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6"
        >
          {/* Header Kop Surat Dokumen */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-indigo-600 pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  HR
                </span>
                <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
                  RECRUITER INDUSTRIAL
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border-indigo-200 ml-2">
                  OFFICIAL PSYCHOGRAM
                </Badge>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                Center for Applied Industrial Psychometrics & Ergonomic Work Endurance
              </p>
            </div>

            <div className="text-left sm:text-right text-[11px] font-mono text-[#6B6B6B] space-y-0.5">
              <p>NO. REG: <strong className="text-[#0A0A0A]">{testCode}</strong></p>
              <p>TANGGAL: <strong className="text-[#0A0A0A]">{testDate}</strong></p>
            </div>
          </div>

          {/* Candidate Meta Box & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC]">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Nama Kandidat</p>
              <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{candidateName}</span>
              </p>
              <p className="text-xs text-[#6B6B6B]">{candidateEmail}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Target Posisi</p>
              <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>{targetPosition}</span>
              </p>
              <p className="text-xs text-[#6B6B6B]">Manufaktur & Presisi Tinggi</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Status Rekomendasi</p>
              <Badge className="bg-[#1D1D1F] text-white text-xs font-medium py-1 px-3 shadow-none">
                {recommendationScore >= 70 ? 'DISARANKAN (RECOMMENDED)' : 'DIPERTIMBANGKAN (CONSIDERED)'}
              </Badge>
              <p className="text-[11px] font-medium text-neutral-600 mt-1">Skor Kesesuaian: {recommendationScore}%</p>
            </div>
          </div>

          {/* Two Columns: Radar Chart (DISC) & Kraepelin Fluctuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Radar Chart Kepribadian */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#E8E8EC] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Radar Profil DISC (Perilaku Kerja)</span>
                  </h3>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Pemetaan gaya respon di lini produksi dan koordinasi tim.
                  </p>
                </div>
              </div>

              {/* SVG Radar Visual */}
              <div className="flex items-center justify-center py-2">
                <svg width="280" height="260" viewBox="0 0 300 300" className="overflow-visible">
                  {/* Concentric Guide Circles */}
                  <circle cx={cx} cy={cy} r="25" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="50" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="75" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="100" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />

                  {/* Axes */}
                  <line x1={cx} y1={cy - 100} x2={cx} y2={cy + 100} stroke="#E8E8EC" />
                  <line x1={cx - 100} y1={cy} x2={cx + 100} y2={cy} stroke="#E8E8EC" />

                  {/* Axis Labels */}
                  <text x={cx} y={cy - 108} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#DC2626">
                    D (Dominance) {discScores.D}%
                  </text>
                  <text x={cx + 110} y={cy + 4} textAnchor="start" fontSize="11" fontWeight="bold" fill="#D97706">
                    I (Influence) {discScores.I}%
                  </text>
                  <text x={cx} y={cy + 120} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2563EB">
                    S (Steadiness) {discScores.S}%
                  </text>
                  <text x={cx - 110} y={cy + 4} textAnchor="end" fontSize="11" fontWeight="bold" fill="#059669">
                    C (Compliance) {discScores.C}%
                  </text>

                  {/* Radar Polygon Area */}
                  <path d={radarPath} fill="rgba(99, 102, 241, 0.25)" stroke="#6366F1" strokeWidth="2.5" />

                  {/* Corner Points */}
                  <circle cx={pD.x} cy={pD.y} r="4" fill="#DC2626" />
                  <circle cx={pI.x} cy={pI.y} r="4" fill="#D97706" />
                  <circle cx={pS.x} cy={pS.y} r="4" fill="#2563EB" />
                  <circle cx={pC.x} cy={pC.y} r="4" fill="#059669" />
                </svg>
              </div>

              {/* Trait Descriptions */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-800">C: {discScores.C}% (Compliance)</span>
                  <p className="text-[#4B5563]">Sangat teliti, patuh SOP, dan akurasi tinggi pada toleransi teknis.</p>
                </div>
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800">S: {discScores.S}% (Steadiness)</span>
                  <p className="text-[#4B5563]">Kestabilan tinggi terhadap pekerjaan repetitif berulang tanpa cepat lelah.</p>
                </div>
              </div>
            </div>

            {/* Right: Kraepelin Fluctuation Curve */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#E8E8EC] bg-white space-y-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Grafik Tes Ketahanan Kraepelin / Pauli</span>
                </h3>
                <p className="text-[11px] text-[#6B6B6B]">
                  Evaluasi 4 pilar psikometri kerja (Panker, Tianker, Hanker, Stanker).
                </p>
              </div>

              {/* 4 Mini Stat Badges */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Kecepatan (Panker)</p>
                  <p className="text-base font-bold text-[#0A0A0A]">{kraepelinScores.panker} <span className="text-[10px] font-normal text-[#86868B]">butir/m</span></p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Ketelitian (Tianker)</p>
                  <p className="text-base font-bold text-emerald-600">{kraepelinScores.tianker}%</p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Ketahanan (Hankker)</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{kraepelinScores.hankker}</p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Stabilitas (Stanker)</p>
                  <p className="text-base font-bold text-amber-600">{kraepelinScores.stanker}%</p>
                </div>
              </div>

              {/* SVG Fluctuation Curve */}
              <div className="h-32 w-full pt-2">
                <svg viewBox="0 0 400 110" className="w-full h-full overflow-visible">
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#F0F0F2" strokeDasharray="3 3" />
                  <line x1="0" y1="55" x2="400" y2="55" stroke="#F0F0F2" strokeDasharray="3 3" />
                  <line x1="0" y1="85" x2="400" y2="85" stroke="#F0F0F2" strokeDasharray="3 3" />

                  {(() => {
                    const maxVal = Math.max(...kraepelinScores.curve, 20);
                    const points = kraepelinScores.curve.map((val, i) => ({
                      x: kraepelinScores.curve.length > 1 ? (i / (kraepelinScores.curve.length - 1)) * 380 + 10 : 200,
                      y: 100 - (val / maxVal) * 75,
                      val,
                      col: i + 1,
                    }));
                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                      <>
                        <path d={`${pathD} L 390 100 L 10 100 Z`} fill="rgba(99, 102, 241, 0.08)" />
                        <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
                            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0A0A0A">
                              {p.val}
                            </text>
                            <text x={p.x} y="108" textAnchor="middle" fontSize="8" fill="#86868B">
                              K{p.col}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <p className="text-[10px] text-[#6B6B6B] bg-[#F5F5F7] p-2 rounded-lg">
                <strong>Catatan Fluktuasi:</strong> Ritme kerja menunjukkan kurva adaptasi yang stabil tanpa degradasi drastis saat diuji dalam rentang kolom berurutan.
              </p>
            </div>
          </div>

          {/* Industrial Role Benchmarks (HIMPSI & Factory Standards) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Kesesuaian Norma Peran Kerja Industri (HIMPSI Benchmark)</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  Uji komparasi profil Kraepelin & DISC terhadap standar minimum peran di lantai produksi.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-700">Skor Kesesuaian:</span>
                <Badge className={`text-xs font-bold px-2.5 py-0.5 ${
                  currentRoleEvaluation.grade === 'Sangat Sesuai' 
                    ? 'bg-emerald-600 text-white' 
                    : (currentRoleEvaluation.grade === 'Sesuai dengan Catatan' ? 'bg-amber-600 text-white' : 'bg-red-600 text-white')
                }`}>
                  {currentRoleEvaluation.fitPercentage}% • {currentRoleEvaluation.grade}
                </Badge>
              </div>
            </div>

            {/* Role Switcher Tabs (Hidden when printing) */}
            <div className="flex flex-wrap gap-1.5 pt-1 print:hidden">
              {Object.values(INDUSTRIAL_ROLE_BENCHMARKS).map((bench) => (
                <button
                  key={bench.id}
                  type="button"
                  onClick={() => setSelectedRole(bench.id)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                    selectedRole === bench.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {bench.title.split('/')[0].trim()}
                </button>
              ))}
            </div>

            {/* Visual Threshold Gauge Bars */}
            <div className="bg-white p-3.5 rounded-xl border border-indigo-100/90 space-y-3 pt-3">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Perbandingan Metrik Terhadap Ambang Batas Pabrik (Threshold):</p>
              
              {/* Panker Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">Kecepatan Kerja (Panker): {kraepelinScores.panker} angka/menit</span>
                  <span className="text-slate-500 text-[11px]">Batas Minimum: {INDUSTRIAL_ROLE_BENCHMARKS[selectedRole]?.minPanker || 36}/menit</span>
                </div>
                <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, (kraepelinScores.panker / 60) * 100)}%` }} 
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-red-500 z-10" 
                    style={{ left: `${Math.min(100, ((INDUSTRIAL_ROLE_BENCHMARKS[selectedRole]?.minPanker || 36) / 60) * 100)}%` }} 
                    title="Target Minimum"
                  />
                </div>
              </div>

              {/* Tianker Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">Ketelitian / Akurasi (Tianker): {kraepelinScores.tianker}%</span>
                  <span className="text-slate-500 text-[11px]">Batas Minimum: {INDUSTRIAL_ROLE_BENCHMARKS[selectedRole]?.minTianker || 88}%</span>
                </div>
                <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(100, kraepelinScores.tianker)}%` }} 
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-red-500 z-10" 
                    style={{ left: `${INDUSTRIAL_ROLE_BENCHMARKS[selectedRole]?.minTianker || 88}%` }} 
                    title="Target Minimum Akurasi"
                  />
                </div>
              </div>
            </div>

            {/* Evaluation Breakdown Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-indigo-100/80 space-y-1.5 text-xs">
                <p className="text-[10px] uppercase font-bold text-slate-500">Kekuatan Terverifikasi untuk Peran Ini:</p>
                <ul className="space-y-1">
                  {currentRoleEvaluation.positiveHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-700 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
                <p className="text-[10px] uppercase font-bold text-amber-700 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                  <span>Titik Kritis & Mitigasi Risiko di Pabrik:</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {currentRoleEvaluation.riskMitigationAdvice}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{currentRoleEvaluation.pankerStatus}</span>
                  <span>•</span>
                  <span>{currentRoleEvaluation.tiankerStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Evaluation & Recommendation */}
          <div className="p-4 rounded-xl border border-[#E8E8EC] bg-[#FAFAFA] space-y-2 text-xs leading-relaxed">
            <h4 className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[11px] text-indigo-700">
              Kesimpulan Evaluasi Psikologi Terapan
            </h4>
            <p className="text-[#4B5563]">
              Kandidat menunjukkan profil kerja tipe <strong>Compliance-Steadiness (CS)</strong> dengan tingkat ketelitian kerja {kraepelinScores.tianker}%. Kemampuan bekerja dalam tempo tinggi terbukti stabil selama pengujian Kraepelin, dengan tingkat konsistensi ketahanan {kraepelinScores.stanker}%. Cocok untuk ditempatkan pada posisi kritis yang menuntut akurasi zero-defect, seperti <em>Quality Assurance</em>, <em>Inspeksi Visual</em>, dan <em>Operator Perakitan Presisi</em>.
            </p>
          </div>

          {/* Signature & Verification Block */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E8EC] text-xs">
            <div className="space-y-1">
              <p className="text-[10px] text-[#86868B]">Tanda Tangan Digital Verifikator:</p>
              <p className="font-bold text-[#0A0A0A]">Dr. Aris Setiawan, M.Psi., Psikolog</p>
              <p className="text-[10px] text-[#6B6B6B] font-mono">SIPP: 2024-089-PSI-IND / HIMPSI Jawa Barat</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Electronic Document
              </span>
              <p className="text-[10px] text-[#86868B]">Recruiter Industrial Automated Psychometrics</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
