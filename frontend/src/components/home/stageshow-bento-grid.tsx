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
    { col: 1, val: 38, label: 'K-1', pace: 'Pemanasan' },
    { col: 2, val: 44, label: 'K-2', pace: 'Akselerasi' },
    { col: 3, val: 48, label: 'K-3', pace: 'Konstan' },
    { col: 4, val: 53, label: 'K-4', pace: 'Puncak Prima' },
    { col: 5, val: 56, label: 'K-5', pace: 'Stamina Tinggi' },
    { col: 6, val: 54, label: 'K-6', pace: 'Stabil' },
    { col: 7, val: 55, label: 'K-7', pace: 'Stamina Terjaga' },
    { col: 8, val: 52, label: 'K-8', pace: 'Finis Prima' },
  ];

  return (
    <section className="py-24 bg-[#0A0D12] text-white relative overflow-hidden border-b border-[#1E293B]">
      {/* Ambient Radial Glow Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
        {/* Section Header with High Visual Contrast */}
        <div className="max-w-2xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-mono font-medium text-amber-400 mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{isEn ? 'PRECISION INDUSTRIAL ATS ARCHITECTURE' : 'ARSITEKTUR PRESISE SELEKSI MANUFAKTUR'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-[1.18]">
            {isEn
              ? 'Calibrated for High-Volume Plant Recruitment & K3 Standards.'
              : 'Standar Terpadu Seleksi Tenaga Teknis, Kalibrasi Psikometri & Mutu K3.'}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 mt-3 leading-relaxed">
            {isEn
              ? 'A 4-pillar technological framework engineered to eliminate skill mismatch, fatigue incidents, and turnover in modern factory floors.'
              : 'Empat pilar teknologi industri terpadu untuk memangkas resiko turnover, kecelakaan kerja 3-shift, dan ketidaksesuaian kompetensi operator mesin.'}
          </p>
        </div>

        {/* Bento Grid (8+4 / 4+8 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Tile 1: Large Feature Card (8 Cols) - Psychometric Test Engine */}
          <div className="md:col-span-8 bg-[#121824] border border-[#232F42] hover:border-emerald-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200 shadow-xl group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Activity className="w-3.5 h-3.5" />
                  Pilar C &bull; Norma HIMPSI 2026
                </span>
                <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Scoring Realtime
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono mb-2 group-hover:text-emerald-400 transition-colors">
                Simulasi Kraepelin &amp; Pauli Kalibrasi Industri
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mb-6">
                Uji psikofisik terukur: laju kerja (<strong className="text-white">Panker</strong>), akurasi toleransi nol kesalahan (<strong className="text-white">Tianker</strong>), kurva ketahanan (<strong className="text-white">Hanker</strong>), dan stabilitas emosi (<strong className="text-white">Janker</strong>).
              </p>

              {/* Interactive Visual Kraepelin Columns */}
              <div className="bg-[#182130] border border-[#2D3A50] rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between border-b border-[#2D3A50] pb-2.5 mb-3 text-xs font-mono">
                  <span className="text-neutral-300 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Kurva Output Per Menit (Hover Tiap Kolom)
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/40">
                    Akurasi 98.4% (Grade A QC)
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
                        <span className={`text-[10px] font-mono font-bold transition-all ${isHovered ? 'text-amber-400 -translate-y-0.5' : 'text-neutral-400'}`}>
                          {col.val}
                        </span>
                        <div className="w-full bg-[#243044] rounded-t-md h-20 flex items-end p-0.5">
                          <div
                            className={`w-full rounded-t-sm transition-all duration-300 ${
                              isHovered
                                ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono ${isHovered ? 'text-white font-bold' : 'text-neutral-500'}`}>
                          {col.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Column Detail Callout */}
                {hoveredColumn !== null && (
                  <div className="mt-3 pt-2.5 border-t border-[#2D3A50] flex items-center justify-between text-xs font-mono text-neutral-400">
                    <span>Status Fase: <strong className="text-amber-400">{KRAEPELIN_COLUMNS[hoveredColumn].pace}</strong></span>
                    <span>Tingkat Ketahanan: <strong className="text-emerald-400">Tinggi (Sesuai SOP 8 Jam Kerja)</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232F42] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-neutral-400">
                Toleransi Kesalahan: <strong className="text-white">&lt; 3% (Standar QC &amp; Teknisi CNC)</strong>
              </span>
              <Link href="/candidate/practice">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold gap-1.5 shadow-md">
                  Mulai Simulasi Kraepelin
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tile 2: Compact Feature Card (4 Cols) - Smart Resume OCR Scanner */}
          <div className="md:col-span-4 bg-[#121824] border border-[#232F42] hover:border-amber-500/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-200 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950/90 border border-amber-500/40 text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Cpu className="w-3.5 h-3.5" />
                  Pilar B &bull; K3 &amp; Lisensi
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>

              <h3 className="text-xl font-bold text-white font-mono mb-2 group-hover:text-amber-400 transition-colors">
                Smart CV OCR Scanner
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Ekstraksi otomatis 11 kamus kompetensi manufaktur langsung saat pelamar mengunggah berkas CV.
              </p>

              {/* Faux Scanner Document Preview with Laser Scanline */}
              <div className="bg-[#182130] border border-[#2D3A50] rounded-xl p-3.5 relative overflow-hidden">
                {/* Laser scan animation line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />

                <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-neutral-400">
                  <span>BERKAS: CV_BUDI_SANTOSO.PDF</span>
                  <span className="text-emerald-400 font-bold">100% PARSED</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#222D3E] border border-[#34445C]">
                    <span className="text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      PLC Siemens &amp; SCADA
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded">
                      Advanced
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#222D3E] border border-[#34445C]">
                    <span className="text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Ahli K3 Umum Kemnaker
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#222D3E] border border-[#34445C]">
                    <span className="text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      SIO Forklift Kemnaker
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded">
                      Kelas 1
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#232F42] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Validasi Barcode Kemnaker:</span>
              <span className="text-emerald-400 font-bold">Aktif &bull; Resmi</span>
            </div>
          </div>

          {/* Tile 3: Compact Feature Card (4 Cols) - 3-Shift Plant Mitigation */}
          <div className="md:col-span-4 bg-[#121824] border border-[#232F42] hover:border-blue-500/50 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-200 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-950/90 border border-blue-500/40 text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-3.5 h-3.5" />
                  Pilar A &bull; B2B Plant Retainer
                </span>
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>

              <h3 className="text-xl font-bold text-white font-mono mb-2 group-hover:text-blue-400 transition-colors">
                Mitigasi Kelelahan 3-Shift
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-4">
                Audit beban kerja psikofisik shift malam untuk menekan insiden kecelakaan kerja di lantai manufaktur.
              </p>

              {/* Shift Schedule indicators */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2.5 border border-[#2D3A50] rounded-lg bg-[#182130]">
                  <span className="text-neutral-300">Shift 1 (07:00 - 15:00)</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-[10px]">
                    Alertness 98%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 border border-[#2D3A50] rounded-lg bg-[#182130]">
                  <span className="text-neutral-300">Shift 2 (15:00 - 23:00)</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded text-[10px]">
                    Alertness 94%
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 border border-amber-500/40 rounded-lg bg-[#221B14]">
                  <span className="text-amber-200">Shift 3 (23:00 - 07:00)</span>
                  <span className="text-amber-400 font-bold bg-amber-950 px-2 py-0.5 rounded text-[10px]">
                    Monitoring K3
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#232F42] flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Standar Kepatuhan:</span>
              <span className="text-blue-400 font-bold">SMK3 PP 50/2012</span>
            </div>
          </div>

          {/* Tile 4: Large Feature Card (8 Cols) - National Industrial Corridor Network */}
          <div className="md:col-span-8 bg-[#121824] border border-[#232F42] hover:border-amber-500/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-200 shadow-xl group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 font-semibold uppercase flex items-center gap-1.5 shadow-sm">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  Kawasan Industri Terintegrasi
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  14 KAWASAN AKTIF
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white font-mono mb-2 group-hover:text-amber-400 transition-colors">
                Klaster Pabrik Cikarang, Karawang &amp; Jawa Timur
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl mb-6">
                Akses langsung ke ratusan pabrik otomotif, semikonduktor, dan fabrikasi logam dengan penempatan cepat terkalibrasi.
              </p>

              {/* Interactive Corridor Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-xs">
                <div
                  onClick={() => setActiveCorridor('cikarang')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeCorridor === 'cikarang'
                      ? 'bg-[#1C2535] border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-[#182130] border-[#2D3A50] hover:border-neutral-500'
                  }`}
                >
                  <p className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                    Cikarang Hub
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-2">MM2100 &bull; GIIC &bull; Jababeka</p>
                  <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    120+ Lowongan Aktif
                  </span>
                </div>

                <div
                  onClick={() => setActiveCorridor('karawang')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeCorridor === 'karawang'
                      ? 'bg-[#1C2535] border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-[#182130] border-[#2D3A50] hover:border-neutral-500'
                  }`}
                >
                  <p className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                    Karawang Hub
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-2">KIIC &bull; Surya Cipta &bull; KIM</p>
                  <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    85+ Lowongan Aktif
                  </span>
                </div>

                <div
                  onClick={() => setActiveCorridor('jatim')}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    activeCorridor === 'jatim'
                      ? 'bg-[#1C2535] border-amber-500 shadow-md scale-[1.02]'
                      : 'bg-[#182130] border-[#2D3A50] hover:border-neutral-500'
                  }`}
                >
                  <p className="font-bold text-white text-sm mb-1 flex items-center justify-between">
                    Jawa Timur Hub
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  </p>
                  <p className="text-[11px] text-neutral-400 mb-2">Rungkut &bull; PIER &bull; JIIPE</p>
                  <span className="inline-block text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    64+ Lowongan Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#232F42] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-neutral-400">
                Rata-rata Waktu Penempatan: <strong className="text-amber-400">48 Jam Pasca Uji Asesmen</strong>
              </span>
              <Link href="#jobs">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-black font-mono text-xs font-bold gap-1 shadow-md">
                  Jelajahi Lowongan Pabrik
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
