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
  ArrowUpRight,
  Maximize2,
  Sliders,
  Cpu,
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
  const [completedColumns, setCompletedColumns] = useState(16);
  const [pankerSpeed, setPankerSpeed] = useState(51.2);
  const [tiankerAccuracy, setTiankerAccuracy] = useState(98.4);
  const [curveHistory, setCurveHistory] = useState<number[]>([36, 42, 47, 51, 53, 52, 54, 51]);

  const handleDigitInput = (digit: number) => {
    triggerHaptic.light();
    const expected = (numA + numB) % 10;

    if (digit === expected) {
      setFeedback('correct');
      triggerHaptic.success();
      setCompletedColumns((prev) => prev + 1);
      const newPanker = Math.min(65, +(pankerSpeed + 0.4).toFixed(1));
      setPankerSpeed(newPanker);
      setCurveHistory((prev) => [...prev.slice(1), Math.round(newPanker)]);

      setTimeout(() => {
        setNumA(Math.floor(Math.random() * 9) + 1);
        setNumB(Math.floor(Math.random() * 9) + 1);
        setFeedback('idle');
      }, 280);
    } else {
      setFeedback('wrong');
      triggerHaptic.warning();
      setTiankerAccuracy((prev) => Math.max(88, +(prev - 0.8).toFixed(1)));
      setTimeout(() => setFeedback('idle'), 450);
    }
  };

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* 1. Main Stageshow Window */}
      <div className="ss-hero-window border border-[#D0D7DE] bg-white rounded-xl shadow-lg relative z-10 transition-all">
        {/* Stageshow Chrome / Title Bar */}
        <div className="h-10 bg-[#F6F8FA] border-b border-[#D0D7DE] px-3.5 flex items-center justify-between select-none">
          {/* Window dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1E4E8] border border-[#D0D7DE]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1E4E8] border border-[#D0D7DE]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1E4E8] border border-[#D0D7DE]" />
            <span className="ml-2 text-[11px] font-mono text-[#57606A] tracking-tight hidden sm:inline">
              ats.industrial.id/console/kraepelin-live
            </span>
          </div>

          {/* Live System Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-medium text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>HIMPSI NOMINAL</span>
          </div>
        </div>

        {/* Tab Controls (Quiet Restrained Segments) */}
        <div className="flex items-center border-b border-[#E1E4E8] bg-white px-3 pt-2 gap-1 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('kraepelin')}
            className={`px-3 py-1.5 font-mono text-xs font-medium rounded-t-md border-b-2 transition-all cursor-pointer ${
              activeTab === 'kraepelin'
                ? 'border-[#0D1117] text-[#0D1117] bg-[#F6F8FA]'
                : 'border-transparent text-[#57606A] hover:text-[#0D1117]'
            }`}
          >
            Kraepelin Realtime
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 font-mono text-xs font-medium rounded-t-md border-b-2 transition-all cursor-pointer ${
              activeTab === 'radar'
                ? 'border-[#0D1117] text-[#0D1117] bg-[#F6F8FA]'
                : 'border-transparent text-[#57606A] hover:text-[#0D1117]'
            }`}
          >
            DISC &amp; 7 QC Tools
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('k3')}
            className={`px-3 py-1.5 font-mono text-xs font-medium rounded-t-md border-b-2 transition-all cursor-pointer ${
              activeTab === 'k3'
                ? 'border-[#0D1117] text-[#0D1117] bg-[#F6F8FA]'
                : 'border-transparent text-[#57606A] hover:text-[#0D1117]'
            }`}
          >
            K3 Kemnaker Lisensi
          </button>
        </div>

        {/* Console Body */}
        <div className="p-4 sm:p-5 bg-white">
          {activeTab === 'kraepelin' && (
            <div>
              {/* Digit Calculation Stage */}
              <div className="bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg p-3.5 mb-3.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#57606A] mb-2.5">
                  <span className="font-semibold uppercase tracking-wider text-[#0D1117]">
                    {isEn ? 'TACTILE ADDITION BEAT' : 'UJI PENJUMLAHAN CEPAT'}
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Kolom #{completedColumns}
                  </span>
                </div>

                {/* Math Expression */}
                <div className="flex items-center justify-center gap-3 py-1.5">
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#D0D7DE] shadow-xs flex items-center justify-center text-2xl font-mono font-bold text-[#0D1117]">
                    {numA}
                  </div>
                  <span className="text-xl font-bold text-amber-600">+</span>
                  <div className="w-12 h-12 rounded-lg bg-white border border-[#D0D7DE] shadow-xs flex items-center justify-center text-2xl font-mono font-bold text-[#0D1117]">
                    {numB}
                  </div>
                  <span className="text-xl font-bold text-[#57606A]">=</span>
                  <div
                    className={`w-12 h-12 rounded-lg border flex items-center justify-center text-xl font-mono font-bold transition-all duration-150 ${
                      feedback === 'correct'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 scale-105'
                        : feedback === 'wrong'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-dashed border-[#8C959F] text-[#57606A]'
                    }`}
                  >
                    {feedback === 'correct' ? (numA + numB) % 10 : '?'}
                  </div>
                </div>

                <p className="text-center text-[10.5px] font-mono text-[#57606A] mt-2">
                  {feedback === 'correct' ? (
                    <span className="text-emerald-600 font-semibold">✓ Akurat! Kecepatan meningkat</span>
                  ) : feedback === 'wrong' ? (
                    <span className="text-red-600 font-semibold">✗ Coba lagi, ambil angka satuan</span>
                  ) : (
                    <span>{isEn ? 'Tap unit digit below (e.g. 7+8=15 -> tap 5)' : 'Pilih angka satuan di bawah (cth: 7+8=15 -> pilih 5)'}</span>
                  )}
                </p>
              </div>

              {/* Tactile Keypad */}
              <div className="grid grid-cols-5 gap-1.5 mb-3.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleDigitInput(num)}
                    className="h-9 rounded-md bg-[#FAFAFA] border border-[#D0D7DE] hover:border-amber-500 active:bg-[#0D1117] active:text-white font-mono font-bold text-base text-[#0D1117] shadow-xs transition-all cursor-pointer touch-manipulation flex items-center justify-center"
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Work Curve Sparkline & Live Telemetry */}
              <div className="bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg p-2.5 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-[#57606A] block">KURVA DAYA TAHAN (HANKER)</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">Meningkat Stabil (+8.4%)</span>
                </div>
                {/* Mini SVG Sparkline */}
                <div className="w-24 h-7">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30">
                    <polyline
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={curveHistory
                        .map((val, idx) => {
                          const x = (idx / (curveHistory.length - 1)) * 100;
                          const y = 30 - ((val - 30) / 35) * 30;
                          return `${x},${Math.max(2, Math.min(28, y))}`;
                        })
                        .join(' ')}
                    />
                  </svg>
                </div>
              </div>

              {/* Readout Gauges */}
              <div className="grid grid-cols-2 gap-2 text-left">
                <div className="p-2 rounded bg-white border border-[#D0D7DE]">
                  <span className="text-[10px] font-mono text-[#57606A] block">LAJU KERJA (PANKER)</span>
                  <span className="text-sm font-mono font-bold text-[#0D1117]">{pankerSpeed} angka/mnt</span>
                </div>
                <div className="p-2 rounded bg-white border border-[#D0D7DE]">
                  <span className="text-[10px] font-mono text-[#57606A] block">KETELITIAN (TIANKER)</span>
                  <span className="text-sm font-mono font-bold text-emerald-700">{tiankerAccuracy}% (Norma HIMPSI)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'radar' && (
            <div className="py-2 space-y-3">
              <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-semibold text-[#0D1117]">PROFIL DISC OPERATOR TEKNIS</span>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                    FIT: QC INSPECTOR
                  </span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-600">Compliance (Presisi &amp; Aturan)</span>
                    <span className="font-bold text-[#0D1117]">94%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#0D1117] h-full rounded-full" style={{ width: '94%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-neutral-600">Steadiness (Daya Tahan Monoton)</span>
                    <span className="font-bold text-[#0D1117]">88%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '88%' }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 border border-[#D0D7DE] rounded bg-white">
                  <span className="text-[10px] text-neutral-500 block">7 QC Tools</span>
                  <span className="font-bold text-[#0D1117]">Ishikawa &amp; Pareto</span>
                </div>
                <div className="p-2 border border-[#D0D7DE] rounded bg-white">
                  <span className="text-[10px] text-neutral-500 block">Metrologi Presisi</span>
                  <span className="font-bold text-[#0D1117]">Caliper 0.01mm</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'k3' && (
            <div className="py-2 space-y-2.5">
              <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg">
                <span className="text-[10px] font-mono uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-semibold inline-block mb-1.5">
                  Verifikasi Lisensi Kemnaker
                </span>
                <p className="text-xs font-mono font-bold text-[#0D1117] mb-1">
                  K3 PP 50/2012 &amp; SIO Forklift Kemnaker
                </p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Semua berkas lisensi teknisi diverifikasi langsung dengan validasi nomor registrasi sertifikasi dan barcode Kemnaker RI.
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 border border-[#D0D7DE] rounded bg-white text-xs font-mono">
                <span className="text-neutral-700">Audit Kecelakaan Kerja</span>
                <span className="text-emerald-700 font-bold">Zero Accident Verified</span>
              </div>
            </div>
          )}

          {/* Quick link button */}
          <div className="mt-3.5 pt-3 border-t border-[#E1E4E8]">
            <Link href="/candidate/practice" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 rounded-lg border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] text-[#0D1117] text-xs font-mono font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                {isEn ? 'Launch Fullscreen Kraepelin Simulator' : 'Buka Simulator Kraepelin Layar Penuh'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Stageshow Satellite Card (Straddling bottom edge with subtle depth) */}
      <div className="ss-satellite-card absolute -bottom-5 sm:-bottom-7 -left-3 sm:-left-6 z-20 w-[85%] sm:w-[280px] p-3.5 bg-white border border-[#D0D7DE] rounded-xl shadow-md pointer-events-none sm:pointer-events-auto">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#0D1117] text-white font-mono text-[11px] font-bold flex items-center justify-center shadow-xs">
              QC
            </div>
            <div>
              <p className="text-xs font-bold text-[#0D1117] leading-tight font-mono">
                Ahmad Fauzi
              </p>
              <p className="text-[10px] text-[#57606A] font-mono">
                Inspector QC Presisi
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
            96.8%
          </span>
        </div>

        <div className="pt-2 border-t border-[#E1E4E8] flex items-center justify-between text-[10px] font-mono text-[#57606A]">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Lolos HIMPSI Grade A
          </span>
          <span className="text-neutral-500">PT Astra Otoparts</span>
        </div>
      </div>
    </div>
  );
}
