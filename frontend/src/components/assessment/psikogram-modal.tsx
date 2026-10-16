'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Printer, Download, X, CheckCircle2, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { RadarChart, DimensionScore } from '@/components/assessment/radar-chart';
import { useLanguage } from '@/lib/language-context';

export interface PsikogramData {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  companyName: string;
  date: string;
  assessmentId: string;
  matchScore: number;
  testScore: number;
  recommendation: 'DISARANKAN' | 'DIPERTIMBANGKAN' | 'TIDAK DISARANKAN';
  personalityScores: DimensionScore[];
  pauliScores: number[];
  pauliAccuracy: number;
  pauliStability: number;
  keyStrengths: string[];
  growthAreas: string[];
  evaluatorNotes: string;
}

interface PsikogramModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PsikogramData;
}

export function PsikogramModal({ isOpen, onClose, data }: PsikogramModalProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getRecLabel = (rec: 'DISARANKAN' | 'DIPERTIMBANGKAN' | 'TIDAK DISARANKAN') => {
    if (rec === 'DISARANKAN') return isEn ? t.psikogram.recRecommended : 'DISARANKAN';
    if (rec === 'DIPERTIMBANGKAN') return isEn ? t.psikogram.recConsidered : 'DIPERTIMBANGKAN';
    return isEn ? t.psikogram.recNotRecommended : 'TIDAK DISARANKAN';
  };

  const recommendationColor =
    data.recommendation === 'DISARANKAN'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
      : data.recommendation === 'DIPERTIMBANGKAN'
      ? 'bg-amber-50 text-amber-800 border-amber-300'
      : 'bg-red-50 text-red-800 border-red-300';

  // Render Mini Fluctuation Chart for print sheet
  const renderMiniFluctuation = (scores: number[]) => {
    if (!scores || scores.length === 0) return null;
    const maxScore = Math.max(...scores, 15);
    const height = 90;
    const width = 240;
    const padding = 18;
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
      <svg width={width} height={height} className="overflow-visible">
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#E5E7EB"
          strokeWidth="1.2"
        />
        <path
          d={pathData}
          fill="none"
          stroke="#6366F1"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={`p-mini-${i}`}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
            <text x={p.x} y={p.y - 7} textAnchor="middle" className="text-[9px] font-mono font-bold fill-neutral-700">
              {p.val}
            </text>
            <text x={p.x} y={height - padding + 12} textAnchor="middle" className="text-[8px] font-mono fill-neutral-400">
              {isEn ? `C${i + 1}` : `K${i + 1}`}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden print:shadow-none print:border-none print:max-w-none print:rounded-none animate-in zoom-in-95 duration-200 ease-out gpu-layer will-animate"
      >
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 border-b border-neutral-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              {t.psikogram.headerTitle}
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {isEn ? 'Standard A4 1-Page Layout' : 'Format Standar 1 Lembar A4'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              size="sm"
              className="rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white text-xs h-8 px-4 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              {t.psikogram.printBtn}
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-PAGE PRINTABLE PSIKOGRAM SHEET */}
        <div className="p-8 sm:p-10 print:p-6 print:m-0 space-y-6 text-[#1D1D1F] bg-white font-sans">
          {/* Header Report */}
          <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  HR
                </span>
                <span className="font-bold text-lg tracking-tight text-neutral-900">
                  Tech<span className="text-[#6366F1]">.</span> Assessment Center
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0A0A0A] mt-1">
                {t.psikogram.headerTitle}
              </h1>
              <p className="text-[11px] text-neutral-500">
                {t.psikogram.headerSub}
              </p>
            </div>

            <div className="text-right text-[11px] text-neutral-600 font-mono space-y-0.5">
              <p>{t.psikogram.docId}: <strong>{data.assessmentId}</strong></p>
              <p>{t.psikogram.date}: {data.date}</p>
              <p>{isEn ? 'Classification:' : 'Kerahasiaan:'} <strong>CONFIDENTIAL / HR ONLY</strong></p>
            </div>
          </div>

          {/* Candidate Profile Meta & Recommendation Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div className="md:col-span-2 space-y-1">
              <div className="grid grid-cols-2 gap-y-1 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">{t.psikogram.candidateName}</span>
                  <strong className="text-neutral-900 text-sm">{data.candidateName}</strong>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">{t.psikogram.jobTarget}</span>
                  <strong className="text-neutral-900 text-sm">{data.jobTitle}</strong>
                </div>
                <div className="mt-1">
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">{isEn ? 'Email & Contact' : 'Email & Kontak'}</span>
                  <span className="font-mono text-neutral-700">{data.candidateEmail} {data.candidatePhone ? `(${data.candidatePhone})` : ''}</span>
                </div>
                <div className="mt-1">
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">{t.psikogram.evaluatingCompany}</span>
                  <span className="text-neutral-700 font-medium">{data.companyName}</span>
                </div>
              </div>
            </div>

            {/* Recommendation Stamp */}
            <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center ${recommendationColor}`}>
              <span className="text-[10px] uppercase font-bold tracking-wider mb-1">
                {t.psikogram.officialRecommendation}
              </span>
              <span className="text-base font-black tracking-wide font-mono">
                {getRecLabel(data.recommendation)}
              </span>
              <span className="text-[10px] mt-1 font-medium">
                {isEn ? 'Qualifications & Assessment' : 'Kualifikasi & Asesmen'}
              </span>
            </div>
          </div>

          {/* Key Score Bars */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white border border-neutral-200 rounded-xl">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">{t.psikogram.ocrScoreLabel}</span>
              <span className="text-xl font-bold font-mono text-neutral-900">{data.matchScore}%</span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">{t.psikogram.testScoreLabel}</span>
              <span className="text-xl font-bold font-mono text-neutral-900">{data.testScore} / 100</span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">{t.psikogram.accuracyLabel}</span>
              <span className="text-xl font-bold font-mono text-emerald-600">{data.pauliAccuracy}%</span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl">
              <span className="text-[10px] font-semibold uppercase text-neutral-400 block">{t.psikogram.stabilityLabel}</span>
              <span className="text-xl font-bold font-mono text-[#6366F1]">{data.pauliStability}%</span>
            </div>
          </div>

          {/* Core Visual Section: Radar Chart + Pauli Fluctuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left Box: Radar Chart Kepribadian */}
            <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col items-center justify-between">
              <div className="w-full text-left mb-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                  {t.psikogram.personalitySection}
                </h4>
                <p className="text-[10px] text-neutral-500">
                  {isEn ? '5 core dimensional personality traits and behavioral tendencies.' : 'Pemetaan 5 pilar sifat kerja dan kecenderungan perilaku.'}
                </p>
              </div>

              <div className="my-1">
                <RadarChart dimensions={data.personalityScores} size={250} />
              </div>
            </div>

            {/* Right Box: Fluktuasi Kerja Pauli */}
            <div className="p-5 bg-white border border-neutral-200 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#6366F1]" />
                  {t.psikogram.pauliSection}
                </h4>
                <p className="text-[10px] text-neutral-500 mb-3">
                  {isEn ? 'Column addition counts reflect endurance and pace stability under repetitive task stress.' : 'Fluktuasi jumlah butir selesai per kolom menunjukkan ketahanan terhadap tekanan kerja berulang.'}
                </p>
                <div className="py-2 flex justify-center">
                  {renderMiniFluctuation(data.pauliScores)}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 text-[11px] text-neutral-600 space-y-1">
                <div className="flex justify-between">
                  <span>{t.psikogram.speedLabel}:</span>
                  <strong className="font-mono text-neutral-900">
                    {Math.round((data.pauliScores.reduce((a, b) => a + b, 0) / (data.pauliScores.length || 1)) * 10) / 10} {isEn ? 'items/col' : 'soal/kolom'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{isEn ? 'Accuracy Grade:' : 'Kategori Ketelitian:'}</span>
                  <strong className="text-emerald-700">
                    {data.pauliAccuracy >= 85 ? (isEn ? 'High (Very Precise)' : 'Tinggi (Sangat Teliti)') : (isEn ? 'Satisfactory' : 'Cukup')}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Competency Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl">
              <span className="font-bold text-emerald-900 block mb-1.5 uppercase text-[10px] tracking-wider">
                {t.psikogram.strengthsLabel}
              </span>
              <ul className="list-disc list-inside space-y-1 text-emerald-800 text-[11px]">
                {data.keyStrengths.map((str, idx) => (
                  <li key={`str-${idx}`}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
              <span className="font-bold text-neutral-800 block mb-1.5 uppercase text-[10px] tracking-wider">
                {t.psikogram.growthLabel}
              </span>
              <ul className="list-disc list-inside space-y-1 text-neutral-700 text-[11px]">
                {data.growthAreas.map((area, idx) => (
                  <li key={`growth-${idx}`}>{area}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Evaluator Notes & Verification Signature */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-end justify-between gap-4 text-xs">
            <div className="max-w-md">
              <span className="font-bold text-neutral-800 block mb-1 uppercase text-[10px]">
                {t.psikogram.notesLabel}:
              </span>
              <p className="text-neutral-600 text-[11px] leading-relaxed italic">
                &ldquo;{data.evaluatorNotes}&rdquo;
              </p>
            </div>

            <div className="text-center font-mono text-[10px] text-neutral-500 shrink-0">
              <div className="w-28 h-12 border-b border-dashed border-neutral-400 mx-auto flex items-end justify-center pb-1 text-emerald-700 font-bold text-[9px]">
                [VERIFIED DIGITAL]
              </div>
              <p className="mt-1 font-semibold text-neutral-800">{isEn ? 'HRTech Psychometric Team' : 'Tim Psikometri HRTech'}</p>
              <p>{isEn ? 'Applied Psychology Assessment ID' : 'Asosiasi Psikologi Terapan ID'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
