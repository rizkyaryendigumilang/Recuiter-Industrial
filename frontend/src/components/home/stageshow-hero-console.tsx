'use client';

import React, { useState, useEffect } from 'react';
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
  Maximize2,
  Cpu,
  BarChart3,
  TrendingUp,
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
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Decorative Glow Ambient Layer */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-neutral-800/20 blur-xl opacity-60 pointer-events-none" />

      {/* 1. Main High-Tech Industrial Instrument Chassis */}
      <div className="relative z-10 bg-[#0F141C] text-white border border-[#2D3748] rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
        {/* Top Instrument Bezel & Telemetry Status */}
        <div className="h-11 bg-[#161D2A] border-b border-[#2D3748] px-4 flex items-center justify-between select-none">
          {/* Hardware Status LEDs */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-xs" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
            <span className="ml-2 font-mono text-[11px] font-semibold text-neutral-400 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-500" />
              CONSOLE // HIMPSI-2026.CAL
            </span>
          </div>

          {/* Active Calibration Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              ONLINE CALIBRATED
            </span>
          </div>
        </div>

        {/* High-Tech Industrial Segment Tabs */}
        <div className="flex items-center border-b border-[#232D3F] bg-[#121822] px-3 pt-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('kraepelin')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'kraepelin'
                ? 'bg-[#1C2433] text-white border-t-2 border-amber-500 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-[#161D2A]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            Kraepelin Live Beat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'radar'
                ? 'bg-[#1C2433] text-white border-t-2 border-emerald-500 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-[#161D2A]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            DISC &amp; QC Match
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('k3')}
            className={`px-3.5 py-2 font-mono text-xs font-semibold rounded-t-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'k3'
                ? 'bg-[#1C2433] text-white border-t-2 border-blue-500 shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-[#161D2A]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            K3 Kemnaker Barcode
          </button>
        </div>

        {/* Console Body */}
        <div className="p-5 bg-gradient-to-b from-[#121822] to-[#0A0D12]">
          {activeTab === 'kraepelin' && (
            <div>
              {/* Digit Calculation Stage with Glow Screen */}
              <div className="bg-[#18202D] border border-[#2B3545] rounded-xl p-4 mb-4 relative shadow-inner overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-3">
                  <span className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
                    <Zap className="w-3.5 h-3.5" />
                    {isEn ? 'TACTILE ADDITION PULSE' : 'UJI PENJUMLAHAN BERUNTUN'}
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Kolom #{completedColumns} {streak > 2 && `🔥 ${streak}x`}
                  </span>
                </div>

                {/* Main Digits Expression */}
                <div className="flex items-center justify-center gap-3.5 py-2">
                  <div className="w-14 h-14 rounded-xl bg-[#232D3F] border border-[#3A475C] shadow-lg flex items-center justify-center text-3xl font-mono font-bold text-white transition-transform duration-100">
                    {numA}
                  </div>
                  <span className="text-2xl font-bold text-amber-500">+</span>
                  <div className="w-14 h-14 rounded-xl bg-[#232D3F] border border-[#3A475C] shadow-lg flex items-center justify-center text-3xl font-mono font-bold text-white transition-transform duration-100">
                    {numB}
                  </div>
                  <span className="text-2xl font-bold text-neutral-500">=</span>
                  <div
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl font-mono font-bold transition-all duration-150 ${
                      feedback === 'correct'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-110 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : feedback === 'wrong'
                        ? 'bg-red-500/20 border-red-500 text-red-300 scale-95 shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                        : 'bg-[#1C2433] border-dashed border-[#475569] text-neutral-400'
                    }`}
                  >
                    {feedback === 'correct' ? (numA + numB) % 10 : '?'}
                  </div>
                </div>

                <p className="text-center text-[11px] font-mono text-neutral-400 mt-2.5">
                  {feedback === 'correct' ? (
                    <span className="text-emerald-400 font-semibold tracking-wide">✓ Akurat! Kecepatan meningkat</span>
                  ) : feedback === 'wrong' ? (
                    <span className="text-red-400 font-semibold tracking-wide">✗ Coba lagi, ambil angka satuan</span>
                  ) : (
                    <span>{isEn ? 'Tap unit digit below (7+8=15 -> tap 5)' : 'Pilih angka satuan di bawah (7+8=15 -> pilih 5)'}</span>
                  )}
                </p>
              </div>

              {/* Tactile High-Tech Keypad */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleDigitInput(num)}
                    className="h-10 rounded-lg bg-[#1B2330] border border-[#2D3A4D] hover:bg-[#253042] hover:border-amber-500 active:bg-amber-500 active:text-black font-mono font-bold text-lg text-white shadow-md active:scale-95 transition-all cursor-pointer touch-manipulation flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Real-time Work Curve Telemetry & Sparkline */}
              <div className="bg-[#161D29] border border-[#263143] rounded-xl p-3 mb-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block tracking-wider uppercase">
                    KURVA STAMINA (HANKER)
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Tren Meningkat (+8.4% Stabil)
                  </span>
                </div>
                {/* Glowing SVG Sparkline */}
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
              <div className="grid grid-cols-2 gap-2.5 text-left">
                <div className="p-2.5 rounded-lg bg-[#18202D] border border-[#2D3A4D]">
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">LAJU KERJA (PANKER)</span>
                  <span className="text-base font-mono font-bold text-amber-400">{pankerSpeed} <span className="text-xs text-neutral-400 font-normal">angka/mnt</span></span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#18202D] border border-[#2D3A4D]">
                  <span className="text-[10px] font-mono text-neutral-400 block uppercase">AKURASI (TIANKER)</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{tiankerAccuracy}% <span className="text-xs text-emerald-500/80 font-normal">(Grade A)</span></span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="py-2 space-y-3">
              <div className="p-3.5 bg-[#18202D] border border-[#2D3A4D] rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-white">PROFIL PRESISE QC INSPECTOR</span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                    FIT: 96.4%
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-neutral-400">Compliance (Disiplin SOP)</span>
                      <span className="font-bold text-amber-400">95%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full" style={{ width: '95%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-neutral-400">Steadiness (Daya Tahan Monoton)</span>
                      <span className="font-bold text-emerald-400">92%</span>
                    </div>
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 border border-[#2D3A4D] rounded-lg bg-[#18202D]">
                  <span className="text-[10px] text-neutral-400 block">7 QC Tools</span>
                  <span className="font-bold text-white">Ishikawa &amp; Pareto</span>
                </div>
                <div className="p-2.5 border border-[#2D3A4D] rounded-lg bg-[#18202D]">
                  <span className="text-[10px] text-neutral-400 block">Metrologi Presisi</span>
                  <span className="font-bold text-white">Caliper 0.01mm</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'k3' && (
            <div className="py-2 space-y-3">
              <div className="p-3.5 bg-[#18202D] border border-[#2D3A4D] rounded-xl">
                <span className="text-[10px] font-mono uppercase text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded font-bold inline-block mb-2">
                  Kemnaker RI Verified
                </span>
                <p className="text-sm font-mono font-bold text-white mb-1">
                  Ahli K3 Umum &amp; SIO Forklift Kelas 1
                </p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Verifikasi otomatis ke database sertifikasi Kemnaker RI dengan pelacakan nomor registrasi lisensi resmi.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 border border-[#2D3A4D] rounded-lg bg-[#18202D] text-xs font-mono">
                <span className="text-neutral-300">Audit Zero Accident</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Sesuai SMK3 PP 50/2012
                </span>
              </div>
            </div>
          )}

          {/* Quick link button */}
          <div className="mt-4 pt-3.5 border-t border-[#232D3F]">
            <Link href="/candidate/practice" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 rounded-lg border-[#3A475C] bg-[#161E2B] hover:bg-[#1E293B] text-white text-xs font-mono font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                {isEn ? 'Launch Fullscreen Kraepelin Test Station' : 'Buka Simulator Kraepelin Layar Penuh'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Floating High-Contrast Verified Satellite Card */}
      <div className="absolute -bottom-6 -left-3 sm:-left-6 z-20 w-[90%] sm:w-[300px] p-4 bg-white/95 backdrop-blur-md border border-neutral-300 rounded-xl shadow-2xl transition-all duration-200">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#0D1117] text-white font-mono text-xs font-bold flex items-center justify-center shadow-md">
              QC
            </div>
            <div>
              <p className="text-xs font-bold text-[#0D1117] leading-tight font-mono">
                Ahmad Fauzi
              </p>
              <p className="text-[11px] text-[#57606A] font-mono">
                Operator QC Presisi &bull; Cikarang
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-bold shadow-xs">
            98.6%
          </span>
        </div>

        <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Lolos HIMPSI Grade A
          </span>
          <span className="text-neutral-500 font-medium">PT Astra Otoparts</span>
        </div>
      </div>
    </div>
  );
}
