'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language-context';
import {
  Timer,
  Play,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';

export interface PauliResult {
  totalAttempted: number;
  totalCorrect: number;
  accuracyRate: number; // percentage (0 - 100)
  speedAverage: number; // items per column
  stabilityScore: number; // 0 - 100 based on standard deviation
  columnScores: number[]; // items solved per column
  columnAccuracies: number[]; // accuracy per column
}

interface PauliTestProps {
  columnDurationSeconds?: number;
  totalColumns?: number;
  onComplete?: (result: PauliResult) => void;
}

export function PauliTest({
  columnDurationSeconds = 15,
  totalColumns = 5,
  onComplete,
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
  };

  // Switch column or finish
  const moveToNextColumn = useCallback(
    (currentSolved: number, currentCorrect: number) => {
      const newResults = [...columnResults, { solved: currentSolved, correct: currentCorrect }];
      setColumnResults(newResults);

      if (currentColumn + 1 < totalColumns) {
        // Next column
        setCurrentColumn((prev) => prev + 1);
        setPairIndex(0);
        setTimeLeft(columnDurationSeconds);
        setCurrentAnswers([]);
      } else {
        // Finished all columns! Calculate overall metrics
        setGameState('finished');
        if (timerRef.current) clearInterval(timerRef.current);

        const totalAttempted = newResults.reduce((acc, c) => acc + c.solved, 0);
        const totalCorrect = newResults.reduce((acc, c) => acc + c.correct, 0);
        const accuracyRate = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        const speedAverage = Math.round((totalAttempted / totalColumns) * 10) / 10;
        const columnScores = newResults.map((c) => c.solved);
        const columnAccuracies = newResults.map((c) =>
          c.solved > 0 ? Math.round((c.correct / c.solved) * 100) : 0
        );

        // Stability score based on standard deviation of column counts
        const mean = totalAttempted / totalColumns;
        const variance =
          columnScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / totalColumns;
        const stdDev = Math.sqrt(variance);
        // Normalized stability score (lower stdDev = higher stability, 100 max)
        const stabilityScore = Math.max(0, Math.min(100, Math.round(100 - stdDev * 12)));

        const result: PauliResult = {
          totalAttempted,
          totalCorrect,
          accuracyRate,
          speedAverage,
          stabilityScore,
          columnScores,
          columnAccuracies,
        };

        setFinalResult(result);
        if (onComplete) onComplete(result);
      }
    },
    [columnResults, currentColumn, totalColumns, columnDurationSeconds, onComplete]
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

      const expected = (currentCols[pairIndex] + currentCols[pairIndex + 1]) % 10;
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
    <div className="bg-white border border-[#E8E8EC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
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
              : `Tes ini mengukur kecepatan, ketelitian, dan stabilitas daya tahan kerja Anda. Terdapat ${totalColumns} kolom, masing-masing berdurasi ${columnDurationSeconds} detik. Saat kolom berganti, lanjutkan penjumlahan di kolom berikutnya dengan ritme konsisten.`}
          </p>

          <div className="p-4 bg-[#F5F5F7] rounded-2xl text-xs text-left mb-6 space-y-1.5 border border-[#E8E8EC]">
            <p className="font-semibold text-[#1D1D1F]">{isEn ? 'Addition Examples:' : 'Contoh Penjumlahan:'}</p>
            <p className="text-[#6B6B6B]">&bull; 4 + 3 = 7 &rarr; {isEn ? 'Enter digit' : 'Masukkan angka'} <span className="font-bold text-[#1D1D1F]">7</span></p>
            <p className="text-[#6B6B6B]">&bull; 8 + 6 = 14 &rarr; {isEn ? 'Enter digit' : 'Masukkan angka'} <span className="font-bold text-[#1D1D1F]">4</span> ({isEn ? 'last unit only' : 'hanya satuan terakhir'})</p>
            <p className="text-[#6B6B6B]">&bull; {isEn ? 'You may use keyboard keys (0-9) or click the on-screen keypad.' : 'Dapat menggunakan keyboard angka (0-9) di laptop atau tombol di layar smartphone.'}</p>
          </div>

          <Button
            onClick={startTest}
            className="rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white px-8 h-11 text-xs font-semibold shadow-sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {t.assessment.startPauliBtn}
          </Button>
        </div>
      )}

      {/* STATE 2: RUNNING TEST ENGINE */}
      {gameState === 'running' && (
        <div className="max-w-md mx-auto py-4">
          {/* Column Progress Indicator */}
          <div className="flex gap-1.5 mb-6">
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
          <div className="bg-[#FAFAFA] border-2 border-neutral-300 rounded-3xl p-8 text-center mb-6 shadow-sm">
            <span className="text-[11px] font-mono text-neutral-400 block mb-2 font-medium">
              {isEn ? `ITEM #${pairIndex + 1} • COLUMN ${currentColumn + 1}` : `SOAL #${pairIndex + 1} • KOLOM ${currentColumn + 1}`}
            </span>
            <div className="flex items-center justify-center gap-6 my-3">
              <span className="text-5xl font-mono font-extrabold text-[#0A0A0A]">{numA}</span>
              <span className="text-3xl font-bold text-neutral-400">+</span>
              <span className="text-5xl font-mono font-extrabold text-[#0A0A0A]">{numB}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              {isEn ? 'Type the unit digit of the sum above:' : 'Ketik digit satuan dari hasil penjumlahan di atas:'}
            </p>
          </div>

          {/* On-Screen Keypad 0-9 (Mobile & Quick Click) */}
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => (
              <button
                key={`btn-digit-${d}`}
                type="button"
                onClick={() => handleDigitInput(d)}
                className="h-12 rounded-2xl bg-white border border-[#E8E8EC] hover:border-[#1D1D1F] hover:bg-neutral-100 text-[#0A0A0A] font-mono font-bold text-lg shadow-sm active:scale-90 transition-transform duration-75 ease-out gpu-layer will-animate cursor-pointer"
              >
                {d}
              </button>
            ))}
          </div>

          <p className="text-center text-[11px] text-neutral-400 mt-4">
            {isEn ? 'You can press 0 - 9 on your physical keyboard directly.' : 'Anda dapat menekan tombol 0 - 9 pada keyboard keyboard langsung.'}
          </p>
        </div>
      )}

      {/* STATE 3: FINISHED & VISUAL FLUCTUATION GRAPH */}
      {gameState === 'finished' && finalResult && (
        <div className="space-y-8 py-2">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-emerald-900">
                  {isEn ? 'Pauli Test Completed Successfully!' : 'Tes Pauli Telah Selesai Dikerjakan!'}
                </h4>
                <p className="text-xs text-emerald-700">
                  {isEn ? 'Your work fluctuation curve and accuracy metrics have been automatically saved.' : 'Data grafik fluktuasi kerja dan skor ketelitian Anda telah terekam secara otomatis.'}
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

          {/* 3 Metrics: Kecepatan, Ketelitian, Stabilitas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-1">
                {t.assessment.speedLabel}
              </span>
              <p className="text-2xl font-mono font-extrabold text-[#0A0A0A]">
                {finalResult.speedAverage}{' '}
                <span className="text-xs font-normal text-neutral-500">{isEn ? 'items/col' : 'soal/kolom'}</span>
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {isEn ? `Total completed: ${finalResult.totalAttempted} items` : `Total dikerjakan: ${finalResult.totalAttempted} butir`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-1">
                {t.assessment.accuracyLabel}
              </span>
              <p className="text-2xl font-mono font-extrabold text-emerald-600">
                {finalResult.accuracyRate}%
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {isEn ? `${finalResult.totalCorrect} correct of ${finalResult.totalAttempted}` : `${finalResult.totalCorrect} benar dari ${finalResult.totalAttempted}`}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E8E8EC]">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block mb-1">
                {t.assessment.stabilityLabel}
              </span>
              <p className="text-2xl font-mono font-extrabold text-[#6366F1]">
                {finalResult.stabilityScore}%
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                {finalResult.stabilityScore >= 75
                  ? (isEn ? 'Highly consistent work pace' : 'Ritme kerja sangat konsisten')
                  : (isEn ? 'Noticeable pace fluctuation' : 'Terdapat fluktuasi ritme kerja')}
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
                    : `Memetakan produktivitas dan kurva ketahanan kerja dari Kolom 1 sampai Kolom ${totalColumns}.`}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {isEn ? 'Auto Pauli Curve' : 'Grafik Pauli Otomatis'}
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
