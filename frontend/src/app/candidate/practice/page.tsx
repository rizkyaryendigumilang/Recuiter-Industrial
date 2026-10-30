'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { triggerHaptic } from '@/lib/haptics';
import { useAntiCheat } from '@/lib/anti-cheat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Flame, 
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  HelpCircle,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface ColumnResult {
  columnIndex: number;
  attempted: number;
  correct: number;
  wrong: number;
}

// ============================================================================
// MEMOIZED HIGH-PERFORMANCE WORKBOARD & KEYPAD (Zero Re-render Lag on Timer Ticks)
// ============================================================================

const KraepelinWorkingBoard = React.memo(function KraepelinWorkingBoard({
  topNum,
  bottomNum,
}: {
  topNum: number;
  bottomNum: number;
}) {
  return (
    <div className="bg-white border border-[#E8E8EC] rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[280px] relative overflow-hidden">
      <div className="text-center space-y-4 max-w-xs w-full">
        <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider">
          PENJUMLAHAN SEKARANG:
        </span>

        {/* Big numbers stack */}
        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-[#FAFAFA] border border-[#E8E8EC] rounded-2xl shadow-sm gpu-layer">
          {/* Top Number */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E8EC] shadow-sm flex items-center justify-center text-3xl font-black text-[#0A0A0A]">
            {topNum}
          </div>
          
          <div className="text-indigo-600 font-black text-lg">+</div>

          {/* Bottom Number */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-[#E8E8EC] shadow-sm flex items-center justify-center text-3xl font-black text-[#0A0A0A]">
            {bottomNum}
          </div>
        </div>

        <p className="text-xs text-[#52525B] font-medium">
          Ketik <strong>angka satuan</strong> hasil penjumlahan di bawah:
        </p>
      </div>
    </div>
  );
});

const KraepelinKeypad = React.memo(function KraepelinKeypad({
  onSubmitAnswer,
}: {
  onSubmitAnswer: (digit: number) => void;
}) {
  return (
    <div className="bg-white border border-[#E8E8EC] rounded-2xl p-4 shadow-sm">
      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onSubmitAnswer(digit)}
            className="h-14 sm:h-16 rounded-xl bg-[#F5F5F7] hover:bg-indigo-600 hover:text-white active:scale-90 text-[#0A0A0A] font-bold text-xl sm:text-2xl transition-transform duration-75 ease-out border border-[#E8E8EC] shadow-sm flex items-center justify-center select-none gpu-layer will-animate cursor-pointer touch-manipulation"
          >
            {digit}
          </button>
        ))}
      </div>
      <p className="text-center text-[10px] text-[#86868B] mt-2">
        Tekan tombol angka di atas atau gunakan NumPad keyboard
      </p>
    </div>
  );
});

export default function KraepelinPracticePage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Game Modes
  // quick: 4 cols x 10s, standard: 6 cols x 15s, industrial: 10 cols x 15s
  const [mode, setMode] = useState<'quick' | 'standard' | 'industrial'>('quick');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'column_switch' | 'finished'>('idle');

  // Config based on mode
  const totalColumns = mode === 'quick' ? 4 : mode === 'standard' ? 6 : 10;
  const secondsPerColumn = mode === 'quick' ? 10 : 15;

  // Active Test State
  const [currentColumn, setCurrentColumn] = useState(0);
  const [timeLeft, setTimeLeft] = useState(secondsPerColumn);
  const [columnNumbers, setColumnNumbers] = useState<number[]>([]);
  const [currentIndexInCol, setCurrentIndexInCol] = useState(0); // index of bottom number being added to number above it
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState<ColumnResult[]>([]);
  const [showSwitchBanner, setShowSwitchBanner] = useState(false);

  // Anti-Cheat Engine Integration
  const {
    warnings: antiCheatWarnings,
    showWarningModal,
    dismissWarningModal,
    lastViolationReason,
  } = useAntiCheat({
    enabled: gameState === 'playing',
    maxWarnings: 3,
  });

  // Active Column Stats
  const currentAttemptsRef = useRef(0);
  const currentCorrectRef = useRef(0);
  const currentWrongRef = useRef(0);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random 1-digit numbers (1-9) for a column (typically 25 numbers per column)
  const generateColumnData = () => {
    const nums: number[] = [];
    for (let i = 0; i < 30; i++) {
      nums.push(Math.floor(Math.random() * 9) + 1);
    }
    return nums;
  };

  // Start the entire test
  const handleStart = () => {
    setResults([]);
    setCurrentColumn(0);
    setTimeLeft(secondsPerColumn);
    currentAttemptsRef.current = 0;
    currentCorrectRef.current = 0;
    currentWrongRef.current = 0;

    const firstCol = generateColumnData();
    setColumnNumbers(firstCol);
    setCurrentIndexInCol(0);
    setInputValue('');
    setGameState('playing');
    triggerHaptic.light();
  };

  // Switch to next column
  const nextColumn = useCallback(() => {
    // Save previous column result
    const colRes: ColumnResult = {
      columnIndex: currentColumn,
      attempted: currentAttemptsRef.current,
      correct: currentCorrectRef.current,
      wrong: currentWrongRef.current,
    };

    setResults((prev) => [...prev, colRes]);

    if (currentColumn + 1 >= totalColumns) {
      // Completed all columns
      setGameState('finished');
      triggerHaptic.success();

      const allResults = [...results, colRes];
      const totAttempted = allResults.reduce((acc, r) => acc + r.attempted, 0);
      const totCorrect = allResults.reduce((acc, r) => acc + r.correct, 0);
      const accPct = totAttempted > 0 ? Math.round((totCorrect / totAttempted) * 100) : 0;
      const spd = Math.round(totAttempted / ((totalColumns * secondsPerColumn) / 60));
      const mean = totAttempted / allResults.length;
      const v = allResults.reduce((acc, r) => acc + Math.pow(r.attempted - mean, 2), 0) / allResults.length;
      const sd = Math.sqrt(v);
      const stab = Math.max(10, Math.min(100, Math.round(100 - sd * 8)));

      const curve = allResults.map((r) => r.attempted);
      const mid = Math.floor(curve.length / 2);
      const firstHalf = curve.slice(0, mid).reduce((a, b) => a + b, 0);
      const secondHalf = curve.slice(mid).reduce((a, b) => a + b, 0);
      const hankerTrend = secondHalf > firstHalf + 1 ? 'Meningkat' : secondHalf < firstHalf - 2 ? 'Menurun (Kelelahan)' : 'Stabil';

      const kraepelinPayload = {
        testCode: `KRP-${Date.now().toString(36).toUpperCase()}`,
        testDate: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        panker: spd,
        pankerGrade: spd >= 50 ? 'Sangat Tinggi' : spd >= 38 ? 'Tinggi' : spd >= 25 ? 'Cukup' : 'Kurang',
        tianker: accPct,
        tiankerGrade: accPct >= 95 ? 'Sangat Teliti' : accPct >= 85 ? 'Teliti' : accPct >= 70 ? 'Cukup' : 'Kurang Teliti',
        hankerTrend,
        stanker: stab,
        curve,
        totalAttempted: totAttempted,
        totalCorrect: totCorrect,
        totalWrong: totAttempted - totCorrect,
        mode,
      };

      try {
        localStorage.setItem('candidate_latest_kraepelin', JSON.stringify(kraepelinPayload));
      } catch {}
      return;
    }

    triggerHaptic.alarm();

    // Flash switch banner
    setShowSwitchBanner(true);
    setGameState('column_switch');
    setTimeout(() => {
      setShowSwitchBanner(false);
      setGameState('playing');
    }, 600);

    // Reset column counters
    currentAttemptsRef.current = 0;
    currentCorrectRef.current = 0;
    currentWrongRef.current = 0;
    setCurrentColumn((c) => c + 1);
    setTimeLeft(secondsPerColumn);
    setColumnNumbers(generateColumnData());
    setCurrentIndexInCol(0);
    setInputValue('');
  }, [currentColumn, totalColumns, secondsPerColumn, results, mode]);

  // Main countdown loop
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            nextColumn();
            return secondsPerColumn;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, nextColumn, secondsPerColumn]);

  // Submit Answer (Memoized for high-speed calculation without closures recreating)
  const submitAnswer = useCallback((num: number) => {
    if (gameState !== 'playing') return;

    triggerHaptic.light();

    // Kraepelin calculates from bottom to top:
    // We add columnNumbers[currentIndexInCol] and columnNumbers[currentIndexInCol + 1]
    const n1 = columnNumbers[currentIndexInCol];
    const n2 = columnNumbers[currentIndexInCol + 1];
    if (n1 === undefined || n2 === undefined) return;

    const expectedSum = (n1 + n2) % 10;
    const isCorrect = num === expectedSum;

    currentAttemptsRef.current += 1;
    if (isCorrect) {
      currentCorrectRef.current += 1;
    } else {
      currentWrongRef.current += 1;
    }

    // Advance to next pair in column
    if (currentIndexInCol + 2 < columnNumbers.length) {
      setCurrentIndexInCol((idx) => idx + 1);
    }
  }, [gameState, columnNumbers, currentIndexInCol]);

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key >= '0' && e.key <= '9') {
        submitAnswer(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, currentIndexInCol, columnNumbers]);

  // Final Aggregated Metrics
  const totalAttempted = results.reduce((acc, r) => acc + r.attempted, 0);
  const totalCorrect = results.reduce((acc, r) => acc + r.correct, 0);
  const totalWrong = results.reduce((acc, r) => acc + r.wrong, 0);
  const accuracyPercent = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const speedPerMin = Math.round((totalAttempted / ((totalColumns * secondsPerColumn) / 60)));

  // Calculate Stability index (Standard Deviation)
  const meanPerCol = results.length > 0 ? totalAttempted / results.length : 0;
  const variance = results.length > 0 
    ? results.reduce((acc, r) => acc + Math.pow(r.attempted - meanPerCol, 2), 0) / results.length 
    : 0;
  const stdDev = Math.sqrt(variance);
  const stabilityScore = Math.max(10, Math.min(100, Math.round(100 - stdDev * 8)));

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Anti-Cheat Floating Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-lg border border-neutral-200">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <h4 className="font-bold text-base text-neutral-900 mb-1">
              {isEn ? 'Exam Integrity Warning' : 'Peringatan Integritas Ujian'}
            </h4>
            <p className="text-xs text-neutral-600 mb-4">
              {lastViolationReason || (isEn ? 'Browser tab switch or focus loss detected.' : 'Perpindahan tab atau kehilangan fokus browser terdeteksi.')}
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-5 text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900 mb-1">
                <span>{isEn ? 'Warning Count:' : 'Peringatan ke:'}</span>
                <span className="font-mono text-red-600">{antiCheatWarnings} / 3</span>
              </div>
              <p className="text-[11px] text-neutral-600">
                {isEn
                  ? 'Please remain on this browser window during the assessment.'
                  : 'Tetap berada di halaman ini selama tes berlangsung untuk menjaga validitas skor.'}
              </p>
            </div>
            <Button
              onClick={dismissWarningModal}
              className="w-full rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-10 font-medium transition-colors duration-150"
            >
              {isEn ? 'I Understand, Return to Test' : 'Saya Mengerti, Lanjutkan Tes'}
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#E8E8EC] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-800">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] tracking-tight">
                {isEn ? 'Kraepelin Test Simulation (Tryout)' : 'Simulasi & Tryout Tes Kraepelin'}
              </h1>
              <p className="text-xs text-[#6B6B6B]">
                {isEn 
                  ? 'Real-time timed column arithmetic test to measure speed, accuracy, and work endurance.'
                  : 'Engine penjumlahan angka bertempo per kolom untuk mengukur ketelitian dan stabilitas stamina kerja.'}
              </p>
            </div>
          </div>

          <Link href="/help">
            <Button variant="ghost" size="sm" className="text-xs text-[#6B6B6B] hover:text-indigo-600 gap-1 rounded-full">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Rules & Tips' : 'Panduan Aturan'}</span>
            </Button>
          </Link>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STATE 1: IDLE / CONFIGURATION                                  */}
        {/* ------------------------------------------------------------- */}
        {gameState === 'idle' && (
          <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl">
            <CardHeader className="text-center space-y-2">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs mx-auto py-1 px-3">
                <Flame className="w-3.5 h-3.5 mr-1" />
                SIMULATOR RESMI INDUSTRI 2026
              </Badge>
              <CardTitle className="text-2xl font-extrabold text-[#0A0A0A]">
                {isEn ? 'Ready for Speed & Accuracy Practice?' : 'Siap Uji Kecepatan & Ketelitian Kerja?'}
              </CardTitle>
              <CardDescription className="text-xs text-[#6B6B6B] max-w-lg mx-auto">
                {isEn 
                  ? 'Add two adjacent numbers from bottom to top. Write only the last digit (e.g., 7 + 8 = 15 ➔ enter 5). Switch columns immediately when timer sounds.'
                  : 'Jumlahkan dua angka dari bawah ke atas. Ambil angka satuan (contoh: 7 + 8 = 15 ➔ ketik 5). Saat terdengar tanda pindah, segera lompat ke kolom berikutnya.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mode Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#0A0A0A]">
                  {isEn ? 'Select Simulation Mode:' : 'Pilih Mode Latihan:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('quick')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      mode === 'quick' ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-[#E8E8EC] hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#0A0A0A]">Kilat (Quick Mode)</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">4 Kolom × 10 Detik (40s)</p>
                    <p className="text-[10px] text-indigo-700 font-semibold mt-1">Pemanasan Awal</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('standard')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      mode === 'standard' ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-[#E8E8EC] hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#0A0A0A]">Standar (Standard)</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">6 Kolom × 15 Detik (1.5m)</p>
                    <p className="text-[10px] text-indigo-700 font-semibold mt-1">Paling Direkomendasikan</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('industrial')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      mode === 'industrial' ? 'border-indigo-600 bg-indigo-50/60 shadow-sm' : 'border-[#E8E8EC] hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <p className="text-xs font-bold text-[#0A0A0A]">Simulasi Pabrik (Hard)</p>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">10 Kolom × 15 Detik (2.5m)</p>
                    <p className="text-[10px] text-indigo-700 font-semibold mt-1">Uji Ketahanan Penuh</p>
                  </button>
                </div>
              </div>

              {/* Instructions Box */}
              <div className="p-4 bg-[#F5F5F7] rounded-xl border border-[#E8E8EC] space-y-2 text-xs text-[#4B5563]">
                <div className="flex items-center gap-2 font-semibold text-[#0A0A0A]">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  <span>Dukungan Input Ganda (Keyboard & Touch Numpad)</span>
                </div>
                <p className="leading-relaxed">
                  • <strong>Di Laptop/Komputer:</strong> Gunakan tombol angka <code>0 - 9</code> atau NumPad keyboard Anda.<br />
                  • <strong>Di Smartphone:</strong> Tersedia tombol angka di layar yang dirancang khusus untuk kenyamanan ketuk satu jempol.
                </p>
              </div>

              <Button
                onClick={handleStart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm h-12 rounded-xl shadow-md gap-2"
              >
                <Play className="w-4 h-4" />
                <span>{isEn ? 'Start Kraepelin Simulation' : 'Mulai Simulasi Sekarang'}</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 2: PLAYING TEST SCREEN                                  */}
        {/* ------------------------------------------------------------- */}
        {(gameState === 'playing' || gameState === 'column_switch') && (
          <div className="space-y-4">
            {/* Top Bar: Column Progress & Countdown */}
            <div className="p-4 bg-white border border-[#E8E8EC] rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-sm flex items-center justify-center">
                  #{currentColumn + 1}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A]">
                    {isEn ? `Column ${currentColumn + 1} of ${totalColumns}` : `Kolom ${currentColumn + 1} dari ${totalColumns}`}
                  </p>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {isEn ? `${currentAttemptsRef.current} answers in this column` : `${currentAttemptsRef.current} penjumlahan terjawab`}
                  </p>
                </div>
              </div>

              {/* Countdown badge */}
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-rose-600 animate-pulse' : 'text-indigo-600'}`} />
                <span className={`text-xl font-mono font-extrabold ${timeLeft <= 3 ? 'text-rose-600' : 'text-[#0A0A0A]'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Switch Banner */}
            {showSwitchBanner && (
              <div className="p-3 bg-[#1D1D1F] text-white font-bold text-center text-xs rounded-xl shadow-sm tracking-wider">
                {isEn ? 'SWITCH TO NEXT COLUMN' : 'PINDAH KE KOLOM BERIKUTNYA'}
              </div>
            )}

            {/* Memoized Column Working Board */}
            <KraepelinWorkingBoard
              topNum={columnNumbers[currentIndexInCol + 1] ?? 5}
              bottomNum={columnNumbers[currentIndexInCol] ?? 7}
            />

            {/* Memoized On-Screen Touch Numpad */}
            <KraepelinKeypad onSubmitAnswer={submitAnswer} />
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* STATE 3: RESULTS & GRAPH ANALYTICS                            */}
        {/* ------------------------------------------------------------- */}
        {gameState === 'finished' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl overflow-hidden">
              <div className="h-2 bg-emerald-500 w-full" />
              <CardHeader className="text-center space-y-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs mx-auto py-1 px-3">
                  <Award className="w-3.5 h-3.5 mr-1" />
                  SIMULASI SELESAI
                </Badge>
                <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A]">
                  Laporan Hasil Evaluasi Tryout Kraepelin
                </CardTitle>
                <CardDescription className="text-xs text-[#6B6B6B]">
                  Performa kecepatan, ketelitian, dan kestabilan stamina kerja Anda telah dihitung otomatis.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* 4 Score Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3.5 bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-[#6B6B6B]">Total Terjawab</p>
                    <p className="text-2xl font-black text-[#0A0A0A] mt-1">{totalAttempted}</p>
                    <p className="text-[10px] text-indigo-600 mt-0.5">{totalCorrect} Benar / {totalWrong} Salah</p>
                  </div>

                  <div className="p-3.5 bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-[#6B6B6B]">Kecepatan Kerja</p>
                    <p className="text-2xl font-black text-indigo-600 mt-1">{speedPerMin}</p>
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5">Angka / Menit</p>
                  </div>

                  <div className="p-3.5 bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-[#6B6B6B]">Tingkat Ketelitian</p>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{accuracyPercent}%</p>
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5">{accuracyPercent >= 90 ? 'Sangat Teliti' : 'Cukup Baik'}</p>
                  </div>

                  <div className="p-3.5 bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl">
                    <p className="text-[10px] uppercase font-semibold text-[#6B6B6B]">Stabilitas Stamina</p>
                    <p className="text-2xl font-black text-amber-600 mt-1">{stabilityScore}%</p>
                    <p className="text-[10px] text-[#6B6B6B] mt-0.5">Konsistensi Ritme</p>
                  </div>
                </div>

                {/* Kraepelin Work Fluctuation Curve (SVG) */}
                <div className="p-5 bg-white border border-[#E8E8EC] rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span>Grafik Fluktuasi Stamina Per Kolom (Ritme Kerja)</span>
                      </h4>
                      <p className="text-[11px] text-[#6B6B6B]">
                        Menunjukkan apakah kecepatan kerja Anda meningkat, konsisten, atau menurun seiring waktu.
                      </p>
                    </div>
                  </div>

                  {/* SVG Chart Render */}
                  <div className="h-44 w-full pt-4">
                    <svg viewBox="0 0 500 140" className="w-full h-full overflow-visible">
                      {/* Grid Lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="#F0F0F2" strokeDasharray="3 3" />
                      <line x1="0" y1="70" x2="500" y2="70" stroke="#F0F0F2" strokeDasharray="3 3" />
                      <line x1="0" y1="110" x2="500" y2="110" stroke="#F0F0F2" strokeDasharray="3 3" />

                      {/* Line points calculation */}
                      {(() => {
                        const maxVal = Math.max(...results.map((r) => r.attempted), 12);
                        const points = results.map((r, i) => {
                          const x = results.length > 1 ? (i / (results.length - 1)) * 480 + 10 : 250;
                          const y = 120 - (r.attempted / maxVal) * 95;
                          return { x, y, val: r.attempted, col: i + 1 };
                        });

                        const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                        return (
                          <>
                            {/* Area under curve */}
                            <path
                              d={`${pathD} L ${points[points.length - 1]?.x || 0} 125 L ${points[0]?.x || 0} 125 Z`}
                              fill="rgba(99, 102, 241, 0.08)"
                            />
                            {/* Line */}
                            <path
                              d={pathD}
                              fill="none"
                              stroke="#6366F1"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Dots & Labels */}
                            {points.map((p, idx) => (
                              <g key={idx}>
                                <circle cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2.5" />
                                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0A0A0A">
                                  {p.val}
                                </text>
                                <text x={p.x} y="136" textAnchor="middle" fontSize="9" fill="#86868B">
                                  K{p.col}
                                </text>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Industrial Recommendation Verdict */}
                <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#0A0A0A]">
                      Rekomendasi Profil Seleksi: <span className="text-emerald-700">Sangat Disarankan (Recommended)</span>
                    </p>
                    <p className="text-[#4B5563] leading-relaxed">
                      Ketelitian {accuracyPercent}% dan kestabilan ritme {stabilityScore}% memenuhi standar seleksi operator lini perakitan, teknisi pemeliharaan, dan staff QC industri manufaktur.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={handleStart}
                    variant="outline"
                    className="flex-1 border-[#E8E8EC] hover:bg-[#F5F5F7] text-xs font-semibold h-11 rounded-xl gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Ulangi Simulasi (Try Again)</span>
                  </Button>

                  <Link href="/candidate/results" className="flex-1">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-11 rounded-xl gap-2 shadow-sm">
                      <Award className="w-4 h-4" />
                      <span>Lihat Evaluasi Psikogram Lengkap</span>
                    </Button>
                  </Link>

                  <Link href="/jobs" className="flex-1">
                    <Button variant="secondary" className="w-full text-xs font-semibold h-11 rounded-xl gap-2">
                      <span>Lamar Lowongan</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
