'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language-context';
import { triggerHaptic } from '@/lib/haptics';
import { useAntiCheat } from '@/lib/anti-cheat';
import {
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Zap,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Award,
} from 'lucide-react';

export interface PauliResult {
  totalAttempted: number;
  totalCorrect: number;
  accuracyRate: number; // percentage (0 - 100)
  speedAverage: number; // items per column
  stabilityScore: number; // 0 - 100 based on standard deviation
  columnScores: number[]; // items solved per column
  columnAccuracies: number[]; // accuracy per column
  // Industrial Psychometrics
  panker: number; // Kecepatan kerja (rerata / menit)
  pankerGrade: 'Sangat Tinggi' | 'Tinggi' | 'Cukup' | 'Kurang';
  tianker: number; // Ketelitian (%)
  tiankerGrade: 'Sangat Teliti' | 'Teliti' | 'Cukup' | 'Kurang Teliti';
  hankerTrend: 'Meningkat' | 'Stabil' | 'Menurun (Kelelahan)';
  jankerDeviation: number; // Fluktuasi / gejolak stabilitas emosi
  jankerGrade: 'Sangat Stabil' | 'Stabil' | 'Fluktuatif';
  antiCheatWarnings: number;
}

interface PauliTestProps {
  columnDurationSeconds?: number;
  totalColumns?: number;
  onComplete?: (result: PauliResult) => void;
  enableAntiCheat?: boolean;
}

export function PauliTest({
  columnDurationSeconds = 15,
  totalColumns = 5,
  onComplete,
  enableAntiCheat = true,
}: PauliTestProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [gameState, setGameState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [currentColumn, setCurrentColumn] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(columnDurationSeconds);

  // Number pairs for each column: each column has 25 pairs of single-digit numbers
  const [columnNumbers, setColumnNumbers] = useState<number[][]>([]);
  const [pairIndex, setPairIndex] = useState<number>(0);

  // Tracking answers
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([]);
  const [columnResults, setColumnResults] = useState<{
    solved: number;
    correct: number;
  }[]>([]);

  const [finalResult, setFinalResult] = useState<PauliResult | null>(null);
  const [columnShiftAlert, setColumnShiftAlert] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Anti-Cheat Engine Integration
  const {
    warnings,
    showWarningModal,
    dismissWarningModal,
    lastViolationReason,
    isExceeded,
  } = useAntiCheat({
    enabled: enableAntiCheat && gameState === 'running',
    maxWarnings: 3,
    onExceeded: () => {
      // Force end on 3 warnings with penalty
      if (gameState === 'running') {
        triggerHaptic.alarm();
      }
    },
  });

  // Generate random digits 1-9 for each column
  const generateColumns = useCallback(() => {
    const cols: number[][] = [];
    for (let c = 0; c < totalColumns; c++) {
      const numbers: number[] = [];
      for (let i = 0; i < 30; i++) {
        numbers.push(Math.floor(Math.random() * 9) + 1);
      }
      cols.push(numbers);
    }
    return cols;
  }, [totalColumns]);

  // Start test
  const startTest = () => {
    const cols = generateColumns();
    setColumnNumbers(cols);
    setCurrentColumn(0);
    setPairIndex(0);
    setTimeLeft(columnDurationSeconds);
    setCurrentAnswers([]);
    setColumnResults([]);
    setFinalResult(null);
    setGameState('running');
    setColumnShiftAlert(null);
    triggerHaptic.light();
  };

  // Switch column or finish
  const moveToNextColumn = useCallback(
    (currentSolved: number, currentCorrect: number) => {
      const newResults = [...columnResults, { solved: currentSolved, correct: currentCorrect }];
      setColumnResults(newResults);

      if (currentColumn + 1 < totalColumns) {
        // Next column
        const nextCol = currentColumn + 1;
        setCurrentColumn(nextCol);
        setPairIndex(0);
        setTimeLeft(columnDurationSeconds);
        setCurrentAnswers([]);
        triggerHaptic.alarm();
        setColumnShiftAlert(isEn ? `SHIFT! Column ${nextCol + 1}` : `PINDAH! Kolom ${nextCol + 1}`);
        setTimeout(() => setColumnShiftAlert(null), 1200);
      } else {
        // Finished all columns! Calculate overall metrics
        setGameState('finished');
        setColumnShiftAlert(null);
        if (timerRef.current) clearInterval(timerRef.current);
        triggerHaptic.success();

        const totalAttempted = newResults.reduce((acc, c) => acc + c.solved, 0);
        const totalCorrect = newResults.reduce((acc, c) => acc + c.correct, 0);
        const accuracyRate = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        const speedAverage = Math.round((totalAttempted / totalColumns) * 10) / 10;
        const columnScores = newResults.map((c) => c.solved);
        const columnAccuracies = newResults.map((c) =>
          c.solved > 0 ? Math.round((c.correct / c.solved) * 100) : 0
        );

        // Standard Deviation for Stability (Janker)
        const mean = totalAttempted / totalColumns;
        const variance =
          columnScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / totalColumns;
        const stdDev = Math.sqrt(variance);
        const stabilityScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 12)));

        // Industrial Panker (speed scaled to 60-second standard norm)
        const secondsTotal = totalColumns * columnDurationSeconds;
        const panker = Math.round((totalAttempted / (secondsTotal / 60)) * 10) / 10;
        const pankerGrade: PauliResult['pankerGrade'] =
          panker >= 48 ? 'Sangat Tinggi' : panker >= 36 ? 'Tinggi' : panker >= 24 ? 'Cukup' : 'Kurang';

        // Industrial Tianker (accuracy %)
        const tianker = accuracyRate;
        const tiankerGrade: PauliResult['tiankerGrade'] =
          tianker >= 95 ? 'Sangat Teliti' : tianker >= 85 ? 'Teliti' : tianker >= 70 ? 'Cukup' : 'Kurang Teliti';

        // Industrial Hanker (endurance curve slope: second half vs first half)
        const midPoint = Math.floor(columnScores.length / 2);
        const firstHalfSum = columnScores.slice(0, midPoint).reduce((a, b) => a + b, 0);
        const secondHalfSum = columnScores.slice(midPoint).reduce((a, b) => a + b, 0);
        const hankerTrend: PauliResult['hankerTrend'] =
          secondHalfSum > firstHalfSum + 1
            ? 'Meningkat'
            : secondHalfSum < firstHalfSum - 2
            ? 'Menurun (Kelelahan)'
            : 'Stabil';

        // Industrial Janker (emotional stability / fluctuation)
        const jankerDeviation = Math.round(stdDev * 10) / 10;
        const jankerGrade: PauliResult['jankerGrade'] =
          stdDev <= 1.5 ? 'Sangat Stabil' : stdDev <= 3.2 ? 'Stabil' : 'Fluktuatif';

        const result: PauliResult = {
          totalAttempted,
          totalCorrect,
          accuracyRate,
          speedAverage,
          stabilityScore,
          columnScores,
          columnAccuracies,
          panker,
          pankerGrade,
          tianker,
          tiankerGrade,
          hankerTrend,
          jankerDeviation,
          jankerGrade,
          antiCheatWarnings: warnings,
        };

        setFinalResult(result);
        if (onComplete) onComplete(result);
      }
    },
    [columnResults, currentColumn, totalColumns, columnDurationSeconds, warnings, onComplete]
  );

  // Timer effect
  useEffect(() => {
    if (gameState !== 'running') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this column!
          const solved = currentAnswers.length;
          const currentCols = columnNumbers[currentColumn] || [];
          let correct = 0;
          currentAnswers.forEach((ans, idx) => {
            const sum = currentCols[idx] + currentCols[idx + 1];
            if (sum % 10 === ans) correct++;
          });
          moveToNextColumn(solved, correct);
          return columnDurationSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentColumn, currentAnswers, columnNumbers, columnDurationSeconds, moveToNextColumn]);

  // Handle number input (0 - 9)
  const handleDigitInput = useCallback(
    (digit: number) => {
      if (gameState !== 'running') return;
      const currentCols = columnNumbers[currentColumn] || [];
      if (pairIndex >= currentCols.length - 1) return; // Column finished

      triggerHaptic.light();
      setCurrentAnswers((prev) => [...prev, digit]);
      setPairIndex((prev) => prev + 1);
    },
    [gameState, columnNumbers, currentColumn, pairIndex]
  );

  // Listen to physical keyboard keys (0 - 9)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'running') return;
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigitInput(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleDigitInput]);

  // Render SVG Fluctuation Graph
  const renderFluctuationChart = (scores: number[]) => {
    if (!scores || scores.length === 0) return null;
    const maxScore = Math.max(...scores, 10);
    const height = 180;
    const width = 480;
    const padding = 36;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    const stepX = scores.length > 1 ? usableWidth / (scores.length - 1) : usableWidth;

    const points = scores.map((val, i) => {
      const x = padding + i * stepX;
      const y = height - padding - (val / maxScore) * usableHeight;
      return { x, y, val };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <div className="w-full overflow-x-auto flex justify-center py-2">
        <svg width={width} height={height} className="overflow-visible max-w-full">
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - padding - ratio * usableHeight;
            const val = Math.round(ratio * maxScore);
            return (
              <g key={`grid-${idx}`}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-neutral-400"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
              height - padding
            } Z`}
            fill="url(#pauliGradient)"
            opacity="0.18"
          />

          <defs>
            <linearGradient id="pauliGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Line Path */}
          <path
            d={pathData}
            fill="none"
            stroke="#6366F1"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Point nodes */}
          {points.map((p, i) => (
            <g key={`point-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#FFFFFF"
                stroke="#6366F1"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[11px] font-mono font-bold fill-[#1D1D1F]"
              >
                {p.val}
              </text>
              <text
                x={p.x}
                y={height - padding + 16}
                textAnchor="middle"
                className="text-[10px] font-mono font-medium fill-neutral-500"
              >
                {isEn ? `Col ${i + 1}` : `Kol ${i + 1}`}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const currentCols = columnNumbers[currentColumn] || [];
  const numA = currentCols[pairIndex] ?? 7;
  const numB = currentCols[pairIndex + 1] ?? 8;

  return (
    <div className="bg-white border border-[#E8E8EC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
      {/* Anti-Cheat Floating Warning Modal */}
      {showWarningModal && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-amber-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 mb-1">
              {isEn ? 'Assessment Integrity Pause' : 'Sesi Dijeda untuk Menjaga Integritas'}
            </h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {lastViolationReason || (isEn ? 'Browser tab switch or focus loss detected.' : 'Perpindahan tab atau kehilangan fokus browser terdeteksi.')}
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 mb-5 text-left space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
                <span>{isEn ? 'Warning Count:' : 'Peringatan Integritas:'}</span>
                <span className="font-mono font-bold text-red-600">{warnings} / 3</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                {isEn
                  ? 'Please keep this test window active. Do not open other tabs or apps during the Kraepelin assessment.'
                  : 'Pastikan layar ujian ini tetap aktif di depan. Jangan beralih ke aplikasi lain agar ritme kerja Kraepelin Anda tidak terdistraksi.'}
              </p>
            </div>
            <Button
              onClick={dismissWarningModal}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs h-11 font-semibold active:scale-[0.98] transition-transform"
            >
              {isEn ? 'I Understand, Return to Test' : 'Saya Mengerti, Lanjutkan Tes'}
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8E8EC] mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
              {isEn ? 'Psychometric Instrument' : 'Instrumen Psikometri'}
            </span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-100">
              {isEn ? 'Work Speed & Precision' : 'Kecepatan & Ketelitian Kerja'}
            </span>
            {enableAntiCheat && (
              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                warnings > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {warnings > 0 ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                {warnings > 0 ? `Anti-Cheat: ${warnings} W` : 'Anti-Cheat: Aktif'}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#0A0A0A] mt-2">
            {t.assessment.pauliTitle}
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            {t.assessment.pauliDesc}
          </p>
        </div>

        {gameState === 'running' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold animate-pulse">
              <Timer className="w-4 h-4" />
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {t.assessment.columnLabel} {currentColumn + 1} / {totalColumns}
            </Badge>
          </div>
        )}
      </div>

      {/* STATE 1: IDLE / INSTRUCTION */}
      {gameState === 'idle' && (
        <div className="text-center py-8 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#6366F1] flex items-center justify-center mx-auto mb-4 border border-indigo-100">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] mb-2">
            {isEn ? 'Pauli Addition Test Instructions' : 'Petunjuk Pengerjaan Tes Pauli'}
          </h3>
          <p className="text-xs text-[#6B6B6B] leading-relaxed mb-6">
            {isEn
              ? `This test measures your speed, accuracy, and work endurance stability. There are ${totalColumns} columns, each lasting ${columnDurationSeconds} seconds. When the column shifts, proceed with the next column at a consistent pace.`
              : `Tes ini mengukur kecepatan (Panker), ketelitian (Tianker), ketahanan (Hanker), dan stabilitas (Janker). Terdapat ${totalColumns} kolom, masing-masing berdurasi ${columnDurationSeconds} detik. Saat kolom berganti, lanjutkan penjumlahan di kolom berikutnya dengan ritme konsisten.`}
          </p>

          <div className="p-4 bg-[#F5F5F7] rounded-2xl text-xs text-left mb-6 space-y-1.5 border border-[#E8E8EC]">
            <p className="font-semibold text-[#1D1D1F]">{isEn ? 'Addition Examples:' : 'Contoh Penjumlahan:'}</p>
            <p className="text-[#6B6B6B]">&bull; 4 + 3 = 7 &rarr; {isEn ? 'Enter digit' : 'Masukkan angka'} <span className="font-bold text-[#1D1D1F]">7</span></p>
            <p className="text-[#6B6B6B]">&bull; 8 + 6 = 14 &rarr; {isEn ? 'Enter digit' : 'Masukkan angka'} <span className="font-bold text-[#1D1D1F]">4</span> ({isEn ? 'last unit only' : 'hanya satuan terakhir'})</p>
            <p className="text-[#6B6B6B]">&bull; {isEn ? 'Anti-cheat is actively monitoring tab changes. Do not switch browser tabs.' : 'Sistem anti-cheat aktif memantau integritas tab. Jangan berpindah tab saat tes berlangsung.'}</p>
          </div>

          <Button
            onClick={startTest}
            className="rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white px-8 h-11 text-xs font-semibold shadow-sm active:scale-[0.98] transition-transform"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.assessment.startPauliBtn}
          </Button>
        </div>
      )}

      {/* STATE 2: RUNNING TEST ENGINE */}
      {gameState === 'running' && (
        <div className="max-w-md mx-auto py-2">
          {/* Column Shift Visual Cue */}
          {columnShiftAlert && (
            <div className="mb-4 p-3 rounded-2xl bg-indigo-600 text-white text-center font-bold text-sm tracking-wide animate-bounce shadow-lg flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{columnShiftAlert}</span>
            </div>
          )}

          {/* Column Progress Indicator */}
          <div className="flex gap-1.5 mb-5">
            {Array.from({ length: totalColumns }).map((_, idx) => (
              <div
                key={`progress-col-${idx}`}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx < currentColumn
                    ? 'bg-emerald-500'
                    : idx === currentColumn
                    ? 'bg-[#6366F1]'
                    : 'bg-neutral-200'
                }`}
              />
            ))}
          </div>

          {/* Active Addition Card */}
          <div className="bg-[#FAFAFA] border-2 border-neutral-300 rounded-3xl p-6 sm:p-8 text-center mb-5 shadow-sm">
            <span className="text-[11px] font-mono text-neutral-500 block mb-2 font-semibold">
              {isEn ? `ITEM #${pairIndex + 1} • COLUMN ${currentColumn + 1}` : `SOAL #${pairIndex + 1} • KOLOM ${currentColumn + 1}`}
            </span>
            <div className="flex items-center justify-center gap-6 my-2">
              <span className="text-5xl font-mono font-extrabold text-[#0A0A0A]">{numA}</span>
              <span className="text-3xl font-bold text-neutral-400">+</span>
              <span className="text-5xl font-mono font-extrabold text-[#0A0A0A]">{numB}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {isEn ? 'Type the unit digit of the sum above:' : 'Pilih digit satuan dari hasil penjumlahan di atas:'}
            </p>
          </div>

          {/* Ergonomic 3-Column Calculator Numpad (Optimized for Mobile Thumbs) */}
          <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={`btn-digit-${d}`}
                type="button"
                onClick={() => handleDigitInput(d)}
                className="h-14 sm:h-16 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#6366F1] hover:bg-indigo-50/40 text-slate-900 font-mono font-extrabold text-2xl sm:text-3xl shadow-sm active:scale-95 active:bg-indigo-100 transition-all duration-75 touch-manipulation select-none flex items-center justify-center cursor-pointer"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleDigitInput(0)}
              className="col-span-3 h-14 sm:h-16 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#6366F1] hover:bg-indigo-50/40 text-slate-900 font-mono font-extrabold text-2xl sm:text-3xl shadow-sm active:scale-95 active:bg-indigo-100 transition-all duration-75 touch-manipulation select-none flex items-center justify-center cursor-pointer"
            >
              0
            </button>
          </div>

          <p className="text-center text-[11px] text-neutral-400 mt-3">
            {isEn ? 'Physical keyboard 0 - 9 or numpad can also be used directly.' : 'Tombol 0 - 9 pada keyboard fisik juga dapat ditekan langsung.'}
          </p>
        </div>
      )}

      {/* STATE 3: FINISHED & INDUSTRIAL PSYCHOMETRIC REPORT */}
      {gameState === 'finished' && finalResult && (
        <div className="space-y-6 py-2">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-900">
                  {isEn ? 'Pauli Test Completed Successfully!' : 'Asesmen Pauli Industri Berhasil Diselesaikan!'}
                </h4>
                <p className="text-xs text-emerald-700">
                  {isEn ? 'Your 4 industrial psychometric pillars (Panker, Tianker, Hanker, Janker) are ready.' : '4 Pilar psikometri kerja (Panker, Tianker, Hanker, Janker) telah dihitung secara presisi.'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startTest}
              className="rounded-full border-emerald-300 text-emerald-800 text-xs h-8 hover:bg-emerald-100"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              {isEn ? 'Retry Test' : 'Coba Ulang'}
            </Button>
          </div>

          {/* 4 Industrial Psychometric Dimension Cards: Panker, Tianker, Hanker, Janker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Panker */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">PANKER (Kecepatan)</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-200">
                  {finalResult.pankerGrade}
                </Badge>
              </div>
              <p className="text-xl font-mono font-extrabold text-[#0A0A0A]">
                {finalResult.panker}{' '}
                <span className="text-[11px] font-normal text-neutral-500">butir/menit</span>
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Rerata: {finalResult.speedAverage} soal/kolom
              </p>
            </div>

            {/* 2. Tianker */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">TIANKER (Ketelitian)</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200">
                  {finalResult.tiankerGrade}
                </Badge>
              </div>
              <p className="text-xl font-mono font-extrabold text-emerald-600">
                {finalResult.tianker}%
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                {finalResult.totalCorrect} benar dari {finalResult.totalAttempted} butir
              </p>
            </div>

            {/* 3. Hanker */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">HANKER (Ketahanan)</span>
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${
                  finalResult.hankerTrend === 'Meningkat'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : finalResult.hankerTrend === 'Stabil'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {finalResult.hankerTrend}
                </Badge>
              </div>
              <p className="text-base font-semibold text-[#1D1D1F] mt-1">
                Tren Kurva Kerja
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Daya tahan terhadap kelelahan
              </p>
            </div>

            {/* 4. Janker */}
            <div className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase text-neutral-400">JANKER (Stabilitas)</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-200">
                  {finalResult.jankerGrade}
                </Badge>
              </div>
              <p className="text-xl font-mono font-extrabold text-[#6366F1]">
                {finalResult.stabilityScore}%
              </p>
              <p className="text-[10px] text-neutral-500 mt-1">
                Deviasi: ±{finalResult.jankerDeviation}
              </p>
            </div>
          </div>

          {/* Visual Fluctuation Graph Section */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E8E8EC] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-sm text-[#0A0A0A] flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#6366F1]" />
                  {t.assessment.fluctuationGraphTitle}
                </h4>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  {isEn
                    ? `Mapping productivity and endurance curve from Column 1 through Column ${totalColumns}.`
                    : `Memetakan dinamika ritme kerja dan ketahanan fokus dari Kolom 1 sampai Kolom ${totalColumns}.`}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {isEn ? 'Auto Pauli Curve' : 'Grafik Fluktuasi Pauli'}
              </Badge>
            </div>

            <div className="py-3 flex justify-center">
              {renderFluctuationChart(finalResult.columnScores)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
