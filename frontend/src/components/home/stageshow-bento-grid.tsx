'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  FileCheck2,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Award,
  Clock,
  Cpu,
  Flame,
  Zap,
  Check,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageshowBentoGridProps {
  isEn?: boolean;
}

export function StageshowBentoGrid({ isEn = false }: StageshowBentoGridProps) {
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(4);
  const [activeCorridor, setActiveCorridor] = useState<string>('cikarang');

  const KRAEPELIN_COLUMNS = [
    { col: 1, val: 38, label: 'K-1', pace: isEn ? 'Warmup' : 'Pemanasan' },
    { col: 2, val: 44, label: 'K-2', pace: isEn ? 'Acceleration' : 'Meningkat' },
    { col: 3, val: 48, label: 'K-3', pace: isEn ? 'Constant' : 'Stabil' },
    { col: 4, val: 53, label: 'K-4', pace: isEn ? 'Peak Speed' : 'Kecepatan Puncak' },
    { col: 5, val: 56, label: 'K-5', pace: isEn ? 'High Stamina' : 'Stamina Tinggi' },
    { col: 6, val: 54, label: 'K-6', pace: isEn ? 'Steady' : 'Konsisten' },
    { col: 7, val: 55, label: 'K-7', pace: isEn ? 'Maintained' : 'Terjaga' },
    { col: 8, val: 52, label: 'K-8', pace: isEn ? 'Solid Finish' : 'Selesai Prima' },
  ];

  return (
    <section className="py-20 bg-slate-50/70 text-slate-900 relative overflow-hidden border-y border-slate-200/80">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-amber-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-emerald-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono font-semibold text-slate-800 mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{isEn ? 'FACTORY SELECTION STANDARDS' : 'STANDAR SELEKSI KERJA PABRIK'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 leading-[1.2]">
            {isEn
              ? 'Integrated Psychometrics, Technical Skills & K3 Safety Standards.'
              : 'Seleksi Tenaga Kerja Pabrik dengan Tes Kraepelin & Sertifikasi K3 Resmi.'}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            {isEn
              ? 'A practical system to help manufacturing plants find accurate, dependable, and shift-ready operators and technicians.'
              : 'Sistem praktis untuk membantu pabrik menemukan calon pekerja dan teknisi yang teliti, terampil, serta siap bekerja dalam sistem shift.'}
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Large Card (8 Cols) - Kraepelin Test Engine */}
          <div className="md:col-span-8 bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  {isEn ? 'Pillar C • HIMPSI Norms' : 'Tes Kraepelin & Pauli • Penilaian Otomatis'}
                </span>
                <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {isEn ? 'Instant Scoring' : 'Hasil Keluar Otomatis'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">
                {isEn ? 'Automated Kraepelin & Pauli Test' : 'Tes Kraepelin & Pauli untuk Seleksi Kerja Pabrik'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                {isEn
                  ? 'Measures addition speed (Panker), zero-mistake accuracy (Tianker), endurance stamina (Hanker), and emotional stability (Janker) objectively.'
                  : 'Mengukur kecepatan berhitung (Panker), ketelitian kerja (Tianker), daya tahan fisik (Hanker), dan kestabilan ritme kerja (Janker) tanpa perlu memeriksa kertas manual.'}
              </p>

              {/* Interactive Visual Columns */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 mb-3 text-xs font-mono">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    {isEn ? 'Output Curve Per Minute (Hover Columns)' : 'Kurva Jumlah Jawaban Per Menit (Arahkan Kursor)'}
                  </span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {isEn ? 'Accuracy: 98.4% (Grade A)' : 'Ketelitian: 98.4% (Sangat Baik)'}
                  </span>
                </div>

                {/* Animated Interactive Bar Columns */}
                <div className="grid grid-cols-8 gap-2 items-end h-28 pt-2">
                  {KRAEPELIN_COLUMNS.map((col, idx) => {
                    const isHovered = hoveredColumn === idx;
                    const heightPct = (col.val / 60) * 100;
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredColumn(idx)}
                        className="flex flex-col items-center gap-1.5 group/col cursor-pointer"
                      >
                        <span className={`text-[10px] font-mono font-bold transition-all ${isHovered ? 'text-amber-600 -translate-y-0.5' : 'text-slate-500'}`}>
                          {col.val}
                        </span>
                        <div className="w-full bg-slate-200/80 rounded-t-md h-20 flex items-end p-0.5">
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              isHovered
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-sm'
                                : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono ${isHovered ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {col.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Column Detail Callout */}
                {hoveredColumn !== null && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-slate-600">
                    <span>Fase Kerja: <strong className="text-amber-700">{KRAEPELIN_COLUMNS[hoveredColumn].pace}</strong></span>
                    <span>Daya Tahan: <strong className="text-emerald-700">Tinggi (Siap Kerja 8 Jam)</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-500">
                Standar Kelulusan: <strong className="text-slate-900">Ketelitian &ge; 90% (Posisi Operator &amp; QC)</strong>
              </span>
              <Link href="/candidate/practice">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold gap-1.5 shadow-sm rounded-xl">
                  {isEn ? 'Try Kraepelin Test' : 'Mulai Latihan Kraepelin'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tile 2: Compact Card (4 Cols) - CV Skill Scanner */}
          <div className="md:col-span-4 bg-white border border-slate-200/90 hover:border-amber-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  {isEn ? 'Skill Verification' : 'Pemeriksaan Keahlian Otomatis'}
                </span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                {isEn ? 'Automatic CV Scanner' : 'Pemeriksaan CV & Keahlian Pabrik'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {isEn
                  ? 'Automatically reads technical manufacturing competencies directly from uploaded resumes.'
                  : 'Mengenali keahlian teknis pabrik (PLC, mesin CNC, bubut, sertifikat K3) secara otomatis langsung dari berkas lamaran.'}
              </p>

              {/* Faux Scanner Document Preview */}
              <div className="bg-slate-50/90 border border-slate-200/90 rounded-2xl p-3.5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent animate-pulse shadow-sm" />

                <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-slate-500">
                  <span>BERKAS: CV_PELAMAR.PDF</span>
                  <span className="text-emerald-700 font-bold">100% TERBACA</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-900 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      PLC Siemens &amp; Otomasi
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      Tingkat Mahir
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-900 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Ahli K3 Umum Kemnaker
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-900 font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      SIO Forklift Kemnaker
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      Kelas 1 Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Validasi Lisensi Kemnaker:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Resmi &bull; Terdaftar
              </span>
            </div>
          </div>

          {/* Tile 3: Compact Card (4 Cols) - Shift Work Assessment */}
          <div className="md:col-span-4 bg-white border border-slate-200/90 hover:border-blue-500/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {isEn ? 'Shift Readiness' : 'Kesiapan Kerja 3-Shift'}
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>

              <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                {isEn ? 'Shift Fatigue Assessment' : 'Pemeriksaan Kesiapan Shift Kerja'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {isEn
                  ? 'Evaluates worker stamina for night and rotating shifts to prevent workplace fatigue and incidents.'
                  : 'Mengevaluasi kesiapan stamina dan ketahanan fisik untuk jadwal kerja bergilir (3 shift) agar mencegah risiko kecelakaan kerja.'}
              </p>

              {/* Shift Schedule indicators */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-slate-700">Shift 1 (Pagi: 07.00 - 15.00)</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                    Kesiapan 98%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                  <span className="text-slate-700">Shift 2 (Sore: 15.00 - 23.00)</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                    Kesiapan 94%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 border border-amber-300 rounded-xl bg-amber-50/50">
                  <span className="text-amber-900 font-medium">Shift 3 (Malam: 23.00 - 07.00)</span>
                  <span className="text-amber-800 font-bold bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[10px]">
                    Pengawasan K3
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Standar Keselamatan:</span>
              <span className="text-blue-700 font-bold">SMK3 PP 50/2012</span>
            </div>
          </div>

          {/* Tile 4: Large Card (8 Cols) - Industrial Corridor Network */}
          <div className="md:col-span-8 bg-white border border-slate-200/90 hover:border-amber-500/60 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-semibold uppercase flex items-center gap-1.5 shadow-2xs">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  {isEn ? 'Industrial Hub Network' : 'Pusat Kawasan Industri'}
                </span>
                <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isEn ? '14 ACTIVE ZONES' : '14 KAWASAN AKTIF'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2 group-hover:text-amber-700 transition-colors">
                {isEn ? 'Manufacturing Hubs in Cikarang, Karawang & East Java' : 'Lowongan di Kawasan Industri Cikarang, Karawang & Sekitarnya'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mb-6">
                {isEn
                  ? 'Direct access to verified positions across automotive, electronics, and precision metal fabrication plants.'
                  : 'Peluang kerja di pabrik otomotif, elektronik, dan manufaktur logam dengan proses seleksi yang cepat dan terpercaya.'}
              </p>

              {/* Interactive Corridor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-xs">
                <div
                  onClick={() => setActiveCorridor('cikarang')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeCorridor === 'cikarang'
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                    Cikarang
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">MM2100 &bull; GIIC &bull; Jababeka</p>
                  <span className="inline-block text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    120+ Lowongan Aktif
                  </span>
                </div>

                <div
                  onClick={() => setActiveCorridor('karawang')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeCorridor === 'karawang'
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                    Karawang
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">KIIC &bull; Surya Cipta &bull; KIM</p>
                  <span className="inline-block text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    85+ Lowongan Aktif
                  </span>
                </div>

                <div
                  onClick={() => setActiveCorridor('jatim')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    activeCorridor === 'jatim'
                      ? 'bg-amber-50/60 border-amber-400 shadow-sm scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-900 text-sm mb-1 flex items-center justify-between">
                    Jawa Timur
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 mb-2">Surabaya &bull; PIER &bull; JIIPE</p>
                  <span className="inline-block text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    64+ Lowongan Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-slate-500">
                {isEn ? 'Average Hiring Cycle: ' : 'Waktu Proses: '}
                <strong className="text-amber-700">{isEn ? '48 Hours post-assessment' : 'Rata-rata 2 hari kerja setelah tes'}</strong>
              </span>
              <Link href="/jobs">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold gap-1 shadow-sm rounded-xl">
                  {isEn ? 'Browse Factory Openings' : 'Lihat Lowongan Pabrik'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
