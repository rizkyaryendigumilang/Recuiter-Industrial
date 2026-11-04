'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { PauliTest, type PauliResult } from '@/components/assessment/pauli-test';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Award, 
  Briefcase,
  HelpCircle
} from 'lucide-react';

export default function CandidatePracticePage() {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [practiceResult, setPracticeResult] = useState<PauliResult | null>(null);

  return (
    <div className="min-h-screen bg-[#F6F8FA] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Console */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-[#D0D7DE] rounded-xl p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-[#0D1117] text-white border-[#30363D] text-[10px] font-mono uppercase tracking-wider py-0 px-2 h-5">
                {isEn ? 'PRACTICE ENGINE' : 'SIMULATOR MANDIRI'}
              </Badge>
              <span className="text-[11px] font-mono text-[#57606A]">v2.6 / 15s Per Col</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0D1117] tracking-tight">
              {isEn ? 'Kraepelin & Pauli Work Endurance Simulator' : 'Simulasi Tes Daya Tahan Kerja (Kraepelin / Pauli)'}
            </h1>
            <p className="text-xs text-[#57606A] mt-1">
              {isEn 
                ? 'Practice speed (Panker), precision (Tianker), and stamina before taking the official selection test.'
                : 'Latih kecepatan (Panker), ketelitian (Tianker), dan ritme kerja sebelum mengikuti asesmen seleksi resmi.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/help">
              <Button variant="outline" size="sm" className="border-[#D0D7DE] text-xs font-mono h-9 gap-1.5 cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>{isEn ? 'Guide' : 'Panduan'}</span>
              </Button>
            </Link>
            <Link href="/candidate/results">
              <Button size="sm" className="bg-[#0D1117] hover:bg-[#21262D] text-white text-xs font-mono h-9 gap-1.5 shadow-xs cursor-pointer">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? 'My Results' : 'Hasil Saya'}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Instructions Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#D0D7DE] rounded-lg p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded bg-[#F6F8FA] border border-[#E1E4E8] flex items-center justify-center shrink-0 font-mono font-bold text-xs text-[#0D1117]">
              1
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1117]">{isEn ? 'Add Adjacent Digits' : 'Jumlahkan 2 Angka'}</p>
              <p className="text-[11px] text-[#57606A] mt-0.5">{isEn ? 'Add top and bottom digits.' : 'Jumlahkan angka atas dan bawah.'}</p>
            </div>
          </div>

          <div className="bg-white border border-[#D0D7DE] rounded-lg p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded bg-[#F6F8FA] border border-[#E1E4E8] flex items-center justify-center shrink-0 font-mono font-bold text-xs text-[#0D1117]">
              2
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1117]">{isEn ? 'Type Unit Digit Only' : 'Ketik Angka Satuan'}</p>
              <p className="text-[11px] text-[#57606A] mt-0.5">{isEn ? 'E.g., 7 + 8 = 15 -> type 5.' : 'Contoh: 7 + 8 = 15 -> tekan 5.'}</p>
            </div>
          </div>

          <div className="bg-white border border-[#D0D7DE] rounded-lg p-3.5 flex items-start gap-3 shadow-2xs">
            <div className="w-7 h-7 rounded bg-[#F6F8FA] border border-[#E1E4E8] flex items-center justify-center shrink-0 font-mono font-bold text-xs text-[#0D1117]">
              3
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1117]">{isEn ? 'Move on Column Shift' : 'Pindah Saat Waktu Habis'}</p>
              <p className="text-[11px] text-[#57606A] mt-0.5">{isEn ? '15 seconds per column, 5 columns.' : '15 detik per kolom, total 5 kolom.'}</p>
            </div>
          </div>
        </div>

        {/* Pauli Engine Container */}
        <div className="bg-white border border-[#D0D7DE] rounded-xl p-4 sm:p-6 shadow-xs">
          <PauliTest
            columnDurationSeconds={15}
            totalColumns={5}
            enableAntiCheat={false}
            onComplete={(result) => setPracticeResult(result)}
          />
        </div>

        {/* Next Steps Footer */}
        {practiceResult && (
          <Card className="border-[#D0D7DE] bg-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono font-bold text-[#0D1117] uppercase">
                  {isEn ? 'PRACTICE COMPLETED' : 'SIMULASI SELESAI'}
                </CardTitle>
                <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-mono">
                  {practiceResult.tiankerGrade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg">
                  <span className="text-[10px] font-mono text-[#57606A] uppercase block">Panker (Kecepatan)</span>
                  <span className="text-lg font-mono font-bold text-[#0D1117]">{practiceResult.panker}/min</span>
                </div>
                <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg">
                  <span className="text-[10px] font-mono text-[#57606A] uppercase block">Tianker (Akurasi)</span>
                  <span className="text-lg font-mono font-bold text-emerald-700">{practiceResult.tianker}%</span>
                </div>
                <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg">
                  <span className="text-[10px] font-mono text-[#57606A] uppercase block">Hanker (Daya Tahan)</span>
                  <span className="text-sm font-mono font-bold text-[#0D1117] mt-1 block">{practiceResult.hankerTrend}</span>
                </div>
                <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg">
                  <span className="text-[10px] font-mono text-[#57606A] uppercase block">Janker (Stabilitas)</span>
                  <span className="text-sm font-mono font-bold text-[#0D1117] mt-1 block">{practiceResult.jankerGrade}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="flex-1 border-[#D0D7DE] text-xs font-mono h-10 gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Retake Practice' : 'Ulangi Simulasi'}</span>
                </Button>
                <Link href="/jobs" className="flex-1">
                  <Button className="w-full bg-[#0D1117] hover:bg-[#21262D] text-white text-xs font-mono h-10 gap-2 shadow-xs cursor-pointer">
                    <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? 'Explore Jobs' : 'Lamar Lowongan Terkait'}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
