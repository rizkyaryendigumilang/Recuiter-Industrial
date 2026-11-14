'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/haptics';
import {
  Activity,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  Cpu,
  BarChart3,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface StageshowHeroConsoleProps {
  isEn?: boolean;
}

export function StageshowHeroConsole({ isEn = false }: StageshowHeroConsoleProps) {
  const [activeTab, setActiveTab] = useState<'kraepelin' | 'radar' | 'k3'>('kraepelin');

  // Mini Kraepelin Console State
  const [numA, setNumA] = useState(7);
  const [numB, setNumB] = useState(8);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [completedColumns, setCompletedColumns] = useState(18);
  const [pankerSpeed, setPankerSpeed] = useState(52.8);
  const [tiankerAccuracy, setTiankerAccuracy] = useState(98.6);
  const [curveHistory, setCurveHistory] = useState<number[]>([38, 44, 49, 53, 55, 54, 56, 53]);
  const [streak, setStreak] = useState(4);

  const handleDigitInput = (digit: number) => {
    triggerHaptic.light();
    const expected = (numA + numB) % 10;

    if (digit === expected) {
      setFeedback('correct');
      triggerHaptic.success();
      setCompletedColumns((prev) => prev + 1);
      setStreak((prev) => prev + 1);
      const newPanker = Math.min(68, +(pankerSpeed + 0.5).toFixed(1));
      setPankerSpeed(newPanker);
      setCurveHistory((prev) => [...prev.slice(1), Math.round(newPanker)]);

      setTimeout(() => {
        setNumA(Math.floor(Math.random() * 9) + 1);
        setNumB(Math.floor(Math.random() * 9) + 1);
        setFeedback('idle');
      }, 260);
    } else {
      setFeedback('wrong');
      triggerHaptic.warning();
      setStreak(0);
      setTiankerAccuracy((prev) => Math.max(88, +(prev - 0.7).toFixed(1)));
      setTimeout(() => setFeedback('idle'), 400);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none contain-paint">
      {/* Decorative Glow Ambient Layer */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 blur-lg opacity-60 pointer-events-none hardware-accelerated" />

      {/* 1. Main High-Tech Industrial Instrument Chassis */}
      <div className="relative z-10 bg-slate-950 text-white border border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Top Instrument Bezel & Telemetry Status */}
        <div className="h-11 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between select-none">
          {/* Hardware Status LEDs */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
            <span className="ml-2 font-mono text-[11px] font-semibold text-slate-400 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              {isEn ? 'KRAEPELIN SIMULATOR' : 'SIMULATOR TES KRAEPELIN'}
            </span>
          </div>

          {/* Active Calibration Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {isEn ? 'STANDARDS VERIFIED' : 'STANDAR RESMI'}
            </span>
          </div>
        </div>

        {/* High-Tech Industrial Segment Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-900/50 px-3 pt-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('kraepelin')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kraepelin'
                ? 'bg-slate-950 text-white border-t-2 border-amber-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            {isEn ? '1. Kraepelin Test' : '1. Tes Kraepelin'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-slate-950 text-white border-t-2 border-emerald-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            {isEn ? '2. QC Match' : '2. Kecocokan Posisi QC'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('k3')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'k3'
                ? 'bg-slate-950 text-white border-t-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            {isEn ? '3. K3 License' : '3. Sertifikat K3'}
          </button>
        </div>

        {/* Console Body */}
        <div className="p-5 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          {activeTab === 'kraepelin' && (
            <div>
              {/* Digit Calculation Stage with Glow Screen */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-4 relative shadow-inner overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                  <span className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    {isEn ? 'QUICK ADDITION PRACTICE' : 'LATIHAN PENJUMLAHAN CEPAT'}
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Kolom {completedColumns} {streak > 2 && `(Benar ${streak}x)`}
                  </span>
                </div>

                {/* Main Digits Expression */}
                <div className="flex items-center justify-center gap-3.5 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg flex items-center justify-center text-3xl font-mono font-bold text-white transition-transform duration-100">
                    {numA}
                  </div>
                  <span className="text-2xl font-bold text-amber-500">+</span>
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 shadow-lg flex items-center justify-center text-3xl font-mono font-bold text-white transition-transform duration-100">
                    {numB}
                  </div>
                  <span className="text-2xl font-bold text-slate-500">=</span>
                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl font-mono font-bold transition-all duration-150 ${
                      feedback === 'correct'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : feedback === 'wrong'
                        ? 'bg-red-500/20 border-red-500 text-red-300 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                        : 'bg-slate-900 border-dashed border-slate-700 text-slate-400'
                    }`}
                  >
                    {feedback === 'correct' ? (numA + numB) % 10 : '?'}
                  </div>
                </div>

                <p className="text-center text-[11px] font-mono text-slate-400 mt-2.5">
                  {feedback === 'correct' ? (
                    <span className="text-emerald-400 font-semibold tracking-wide">✓ Benar! Jawaban tepat</span>
                  ) : feedback === 'wrong' ? (
                    <span className="text-red-400 font-semibold tracking-wide">✗ Kurang tepat, pilih angka satuannya</span>
                  ) : (
                    <span>{isEn ? 'Tap the unit digit below (7+8=15 -> tap 5)' : 'Pilih angka satuan hasil tambah (contoh: 7 + 8 = 15, pilih 5)'}</span>
                  )}
                </p>
              </div>

              {/* Tactile Keypad */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleDigitInput(num)}
                    className="h-10 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-amber-500 active:bg-amber-500 active:text-black font-mono font-bold text-lg text-white shadow-xs active:scale-95 transition-all cursor-pointer touch-manipulation flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Work Curve Readout */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 mb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">
                    {isEn ? 'STAMINA & ENDURANCE (HANKER)' : 'KETAHANAN KERJA (HANKER)'}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    {isEn ? 'Steady & Consistent Pace' : 'Ritme Kerja Stabil & Konsisten'}
                  </span>
                </div>
                {/* SVG Sparkline */}
                <div className="w-28 h-8 relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={curveHistory
                        .map((val, idx) => {
                          const x = (idx / (curveHistory.length - 1)) * 100;
                          const y = 30 - ((val - 30) / 38) * 30;
                          return `${x},${Math.max(3, Math.min(27, y))}`;
                        })
                        .join(' ')}
                    />
                  </svg>
                </div>
              </div>

              {/* Readout Gauges */}
              <div className="grid grid-cols-2 gap-2.5 text-left mb-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    {isEn ? 'SPEED (PANKER)' : 'KECEPATAN HITUNG'}
                  </span>
                  <span className="text-base font-mono font-bold text-amber-400">{pankerSpeed} <span className="text-xs text-slate-400 font-normal">angka/mnt</span></span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">
                    {isEn ? 'ACCURACY (TIANKER)' : 'TINGKAT KETELITIAN'}
                  </span>
                  <span className="text-base font-mono font-bold text-emerald-400">{tiankerAccuracy}% <span className="text-xs text-emerald-500/80 font-normal">(Sangat Baik)</span></span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Standar HIMPSI: Terpenuhi</span>
                <Link href="/candidate/practice" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors">
                  Buka Latihan Lengkap
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="py-2 space-y-3">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-white">ANALISIS KECOCOKAN POSISI QC</span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                    Cocok: 96.4%
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">Kepatuhan Standar SOP</span>
                      <span className="font-bold text-amber-400">95%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">Daya Tahan Kerja Rutin</span>
                      <span className="font-bold text-emerald-400">92%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 border border-slate-800 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Metode Mutu</span>
                  <span className="font-bold text-white">7 QC Tools</span>
                </div>
                <div className="p-2.5 border border-slate-800 rounded-xl bg-slate-900">
                  <span className="text-[10px] text-slate-400 block">Alat Ukur Presisi</span>
                  <span className="font-bold text-white">Jangka Sorong (Caliper)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Rekomendasi: QC Lini Perakitan</span>
                <Link href="/services" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors">
                  Lihat Paket Asesmen
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'k3' && (
            <div className="py-2 space-y-3">
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded font-bold inline-block mb-2">
                  Terverifikasi Kemnaker RI
                </span>
                <p className="text-sm font-mono font-bold text-white mb-1">
                  Surat Izin Operator (SIO) Forklift
                </p>
                <p className="text-xs font-mono text-slate-400 mb-2">
                  No. Registrasi: REG-K3-2026-09881
                </p>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300">Status Lisensi:</span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Asli &bull; Aktif 2028
                  </span>
                </div>
              </div>

              <div className="p-3 border border-slate-800 rounded-2xl bg-slate-900/60 text-xs font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Standar K3:</span>
                  <span className="text-white font-bold">PP No. 50 Tahun 2012</span>
                </div>
                <div className="flex justify-between">
                  <span>Kelengkapan APD:</span>
                  <span className="text-emerald-400 font-bold">Sepatu &amp; Helm Safety</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Pemeriksaan Dokumen Otomatis</span>
                <Link href="/candidate" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors">
                  Unggah Dokumen K3
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
