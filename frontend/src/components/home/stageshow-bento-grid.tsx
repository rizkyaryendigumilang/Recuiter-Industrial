'use client';

import React from 'react';
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
  Layers,
  Clock,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StageshowBentoGridProps {
  isEn?: boolean;
}

export function StageshowBentoGrid({ isEn = false }: StageshowBentoGridProps) {
  return (
    <section className="py-20 bg-[#F6F8FA] border-b border-[#D0D7DE]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Section Header with Stageshow Restraint */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white border border-[#D0D7DE] text-xs font-mono font-medium text-neutral-700 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{isEn ? 'BENJI TAYLOR BENTO ARCHITECTURE' : 'ARSITEKTUR BENTO PRESISE INDUSTRI'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D1117] leading-tight">
            {isEn
              ? 'Engineered for Plant Precision, Psychometrics & K3 Compliance.'
              : 'Standar Terpadu Seleksi Tenaga Teknis, Kalibrasi Psikometri & Mutu K3.'}
          </h2>
          <p className="text-xs sm:text-sm text-[#57606A] mt-2 leading-relaxed">
            {isEn
              ? 'Four foundational pillars designed to eliminate recruitment mismatches in high-output manufacturing plants.'
              : 'Empat pilar terpadu untuk memangkas resiko turnover dan ketidaksesuaian kompetensi operator pada jalur manufaktur presisi.'}
          </p>
        </div>

        {/* Bento Grid (8 + 4 / 4 + 8 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Tile 1: Large Feature Card (8 Cols) - Psychometric Test Engine */}
          <div className="md:col-span-8 ss-bento-card p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden bg-white">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#D0D7DE] text-emerald-800 font-semibold uppercase">
                  Pilar C &bull; Standar HIMPSI
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  AUTO-SCORING ENGINE
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#0D1117] font-mono mb-2">
                Simulasi Kraepelin &amp; Pauli Kalibrasi Industri
              </h3>
              <p className="text-xs text-[#57606A] leading-relaxed max-w-xl mb-6">
                Mengukur 4 indikator psikofisik kritis: laju kerja (Panker), akurasi toleransi nol kesalahan (Tianker), kurva ketahanan kerja shift (Hanker), dan stabilitas emosi (Janker).
              </p>

              {/* Faux Miniature Kraepelin Dashboard */}
              <div className="bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg p-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-[#E1E4E8] pb-2 mb-3">
                  <span className="text-[11px] text-neutral-600 font-medium">Beban Kerja Monoton</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                    Lolos Benchmark HIMPSI
                  </span>
                </div>

                {/* Miniature columns graph */}
                <div className="grid grid-cols-8 gap-1.5 items-end h-16 pt-2 pb-1">
                  {[38, 44, 48, 52, 55, 54, 53, 52].map((val, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-[#0D1117] rounded-xs transition-all hover:bg-emerald-600 cursor-pointer"
                        style={{ height: `${(val / 60) * 100}%` }}
                        title={`Kolom ${idx + 1}: ${val} angka`}
                      />
                      <span className="text-[9px] text-neutral-400">k{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E1E4E8] flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-600">
                Toleransi Kesalahan: <strong className="text-[#0D1117]">&lt; 3% (Norma QC)</strong>
              </span>
              <Link href="/candidate/practice">
                <Button size="sm" variant="outline" className="text-xs font-mono border-[#D0D7DE] hover:bg-[#F6F8FA]">
                  Coba Tes Kraepelin
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tile 2: Compact Feature Card (4 Cols) - Smart Resume OCR */}
          <div className="md:col-span-4 ss-bento-card p-6 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#D0D7DE] text-amber-800 font-semibold uppercase">
                  Pilar B &bull; K3 &amp; Lisensi
                </span>
                <Cpu className="w-4 h-4 text-amber-600" />
              </div>

              <h3 className="text-lg font-bold text-[#0D1117] font-mono mb-2">
                Smart CV Parser Pabrik
              </h3>
              <p className="text-xs text-[#57606A] leading-relaxed mb-4">
                Ekstraksi otomatis 11 kamus kompetensi manufaktur dari resume kandidat.
              </p>

              {/* Tag Detection Badges */}
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-[#F6F8FA] border border-[#E1E4E8]">
                  <span className="text-neutral-700">PLC Siemens &amp; SCADA</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F6F8FA] border border-[#E1E4E8]">
                  <span className="text-neutral-700">Ahli K3 Umum Kemnaker</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#F6F8FA] border border-[#E1E4E8]">
                  <span className="text-neutral-700">SIO Forklift Kemnaker</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E1E4E8] text-[11px] font-mono text-neutral-500">
              Validasi barcode &amp; nomor lisensi resmi.
            </div>
          </div>

          {/* Tile 3: Compact Feature Card (4 Cols) - 3-Shift Plant Mitigation */}
          <div className="md:col-span-4 ss-bento-card p-6 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#D0D7DE] text-neutral-700 font-semibold uppercase">
                  Pilar A &bull; B2B Retainer
                </span>
                <Clock className="w-4 h-4 text-neutral-700" />
              </div>

              <h3 className="text-lg font-bold text-[#0D1117] font-mono mb-2">
                Mitigasi 3-Shift &amp; Kelelahan
              </h3>
              <p className="text-xs text-[#57606A] leading-relaxed mb-4">
                Audit beban kerja psikofisik shift malam untuk menekan insiden kecelakaan kerja.
              </p>

              {/* Shift Schedule indicators */}
              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 border border-[#E1E4E8] rounded bg-[#F6F8FA]">
                  <span>Shift 1 (07:00 - 15:00)</span>
                  <span className="text-emerald-700 font-bold text-[10px]">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-2 border border-[#E1E4E8] rounded bg-[#F6F8FA]">
                  <span>Shift 2 (15:00 - 23:00)</span>
                  <span className="text-emerald-700 font-bold text-[10px]">Optimal</span>
                </div>
                <div className="flex items-center justify-between p-2 border border-[#E1E4E8] rounded bg-[#F6F8FA]">
                  <span>Shift 3 (23:00 - 07:00)</span>
                  <span className="text-amber-700 font-bold text-[10px]">Monitoring K3</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E1E4E8] text-[11px] font-mono text-neutral-500">
              Sesuai standar SMK3 PP 50/2012.
            </div>
          </div>

          {/* Tile 4: Large Feature Card (8 Cols) - Industrial Corridors */}
          <div className="md:col-span-8 ss-bento-card p-6 sm:p-7 flex flex-col justify-between bg-white">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#D0D7DE] text-neutral-700 font-semibold uppercase">
                  Kawasan Manufaktur Terintegrasi
                </span>
                <Building2 className="w-4 h-4 text-neutral-700" />
              </div>

              <h3 className="text-xl font-bold text-[#0D1117] font-mono mb-2">
                Klaster Pabrik Cikarang, Karawang &amp; Jawa Timur
              </h3>
              <p className="text-xs text-[#57606A] leading-relaxed max-w-xl mb-5">
                Konektivitas langsung dengan ribuan pabrik otomotif, semikonduktor, dan fabrikasi logam di koridor industri nasional.
              </p>

              {/* Corridor Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg">
                  <p className="font-bold text-[#0D1117] text-sm mb-1">Cikarang Hub</p>
                  <p className="text-[11px] text-neutral-500">MM2100 &bull; GIIC &bull; Jababeka</p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-700 font-semibold">
                    120+ Lowongan Aktif
                  </span>
                </div>

                <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg">
                  <p className="font-bold text-[#0D1117] text-sm mb-1">Karawang Hub</p>
                  <p className="text-[11px] text-neutral-500">KIIC &bull; Surya Cipta &bull; KIM</p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-700 font-semibold">
                    85+ Lowongan Aktif
                  </span>
                </div>

                <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg">
                  <p className="font-bold text-[#0D1117] text-sm mb-1">Jawa Timur Hub</p>
                  <p className="text-[11px] text-neutral-500">Rungkut &bull; PIER &bull; JIIPE</p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-700 font-semibold">
                    64+ Lowongan Aktif
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E1E4E8] flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-600">
                Rata-rata Waktu Penempatan: <strong className="text-[#0D1117]">48 Jam</strong>
              </span>
              <Link href="#jobs">
                <Button size="sm" className="bg-[#0D1117] hover:bg-neutral-800 text-white font-mono text-xs">
                  Lihat Semua Lowongan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
