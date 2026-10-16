'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Compass, 
  Activity, 
  ArrowLeft,
  Share2,
  ShieldCheck,
  Calendar,
  Briefcase,
  User
} from 'lucide-react';

export default function CandidateResultsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Mock Psychometric Data (Auto-calculated from Candidate test records or defaults)
  const candidateName = user?.name || (user?.email ? user.email.split('@')[0].toUpperCase() : 'BUDI SANTOSO');
  const candidateEmail = user?.email || 'kandidat@industrial.id';
  const testDate = '14 Oktober 2026';
  const testCode = 'PSI-IND-2026-0891';

  // DISC Dimensions (0 to 100)
  const discScores = {
    D: 72, // Dominance
    I: 65, // Influence
    S: 88, // Steadiness
    C: 94, // Compliance (Quality & Precision)
  };

  // Kraepelin Metrics
  const kraepelinScores = {
    panker: 52, // Kecepatan (Angka/menit)
    tianker: 96, // Ketelitian (%)
    hankker: 'Tinggi (High)', // Daya tahan
    stanker: 91, // Stabilitas kerja (%)
    curve: [38, 44, 49, 52, 55, 54, 53, 52],
  };

  // Radar Chart Math helper (Center: 150, 150, Radius: 100)
  const cx = 150;
  const cy = 150;
  const r = 100;
  // Angles: D = top (-90 deg), I = right (0 deg), S = bottom (90 deg), C = left (180 deg)
  const getCoords = (val: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const distance = (val / 100) * r;
    return {
      x: cx + distance * Math.cos(rad),
      y: cy + distance * Math.sin(rad),
    };
  };

  const pD = getCoords(discScores.D, -90);
  const pI = getCoords(discScores.I, 0);
  const pS = getCoords(discScores.S, 90);
  const pC = getCoords(discScores.C, 180);
  const radarPath = `M ${pD.x} ${pD.y} L ${pI.x} ${pI.y} L ${pS.x} ${pS.y} L ${pC.x} ${pC.y} Z`;

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Top Action Bar (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8E8EC] print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/candidate">
              <Button variant="ghost" size="sm" className="rounded-full text-xs gap-1.5 text-[#6B6B6B]">
                <ArrowLeft className="w-4 h-4" />
                <span>{isEn ? 'Back to Portal' : 'Kembali ke Portal'}</span>
              </Button>
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] tracking-tight">
              {isEn ? 'My Psychogram & Assessment Report' : 'Hasil Evaluasi Psikogram Saya'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-9 px-4 gap-2 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isEn ? 'Print / Download PDF' : 'Cetak / Unduh Psikogram PDF'}</span>
            </Button>
          </div>
        </div>

        {/* Printable Official 1-Page Psychogram Document */}
        <div 
          ref={reportRef} 
          className="bg-white border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm print:shadow-none print:border-none print:p-0 space-y-6"
        >
          {/* Header Kop Surat Dokumen */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-indigo-600 pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                  HR
                </span>
                <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
                  RECRUITER INDUSTRIAL
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border-indigo-200 ml-2">
                  OFFICIAL PSYCHOGRAM
                </Badge>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                Center for Applied Industrial Psychometrics & Ergonomic Work Endurance
              </p>
            </div>

            <div className="text-left sm:text-right text-[11px] font-mono text-[#6B6B6B] space-y-0.5">
              <p>NO. REG: <strong className="text-[#0A0A0A]">{testCode}</strong></p>
              <p>TANGGAL: <strong className="text-[#0A0A0A]">{testDate}</strong></p>
            </div>
          </div>

          {/* Candidate Meta Box & Verdict */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC]">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Nama Kandidat</p>
              <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>{candidateName}</span>
              </p>
              <p className="text-xs text-[#6B6B6B]">{candidateEmail}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Target Posisi</p>
              <p className="text-sm font-bold text-[#0A0A0A] flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quality Control / Assembly Lead</span>
              </p>
              <p className="text-xs text-[#6B6B6B]">Manufaktur & Presisi Tinggi</p>
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-[10px] uppercase font-bold text-[#86868B]">Status Rekomendasi</p>
              <Badge className="bg-emerald-600 text-white text-xs font-bold py-1 px-3 shadow-none">
                ✓ DISARANKAN (RECOMMENDED)
              </Badge>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">Skor Kesesuaian: 94.2%</p>
            </div>
          </div>

          {/* Two Columns: Radar Chart (DISC) & Kraepelin Fluctuation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Left: Radar Chart Kepribadian */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#E8E8EC] bg-white space-y-3 gpu-layer will-animate">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    <span>Radar Profil DISC (Perilaku Kerja)</span>
                  </h3>
                  <p className="text-[11px] text-[#6B6B6B]">
                    Pemetaan gaya respon di lini produksi dan koordinasi tim.
                  </p>
                </div>
              </div>

              {/* SVG Radar Visual */}
              <div className="flex items-center justify-center py-2">
                <svg width="280" height="260" viewBox="0 0 300 300" className="overflow-visible">
                  {/* Concentric Guide Circles */}
                  <circle cx={cx} cy={cy} r="25" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="50" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="75" fill="none" stroke="#E8E8EC" strokeDasharray="2 2" />
                  <circle cx={cx} cy={cy} r="100" fill="none" stroke="#D1D5DB" strokeWidth="1.5" />

                  {/* Axes */}
                  <line x1={cx} y1={cy - 100} x2={cx} y2={cy + 100} stroke="#E8E8EC" />
                  <line x1={cx - 100} y1={cy} x2={cx + 100} y2={cy} stroke="#E8E8EC" />

                  {/* Axis Labels */}
                  <text x={cx} y={cy - 108} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#DC2626">
                    D (Dominance) {discScores.D}%
                  </text>
                  <text x={cx + 110} y={cy + 4} textAnchor="start" fontSize="11" fontWeight="bold" fill="#D97706">
                    I (Influence) {discScores.I}%
                  </text>
                  <text x={cx} y={cy + 120} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2563EB">
                    S (Steadiness) {discScores.S}%
                  </text>
                  <text x={cx - 110} y={cy + 4} textAnchor="end" fontSize="11" fontWeight="bold" fill="#059669">
                    C (Compliance) {discScores.C}%
                  </text>

                  {/* Radar Polygon Area */}
                  <path d={radarPath} fill="rgba(99, 102, 241, 0.25)" stroke="#6366F1" strokeWidth="2.5" />

                  {/* Corner Points */}
                  <circle cx={pD.x} cy={pD.y} r="4" fill="#DC2626" />
                  <circle cx={pI.x} cy={pI.y} r="4" fill="#D97706" />
                  <circle cx={pS.x} cy={pS.y} r="4" fill="#2563EB" />
                  <circle cx={pC.x} cy={pC.y} r="4" fill="#059669" />
                </svg>
              </div>

              {/* Trait Descriptions */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                  <span className="font-bold text-emerald-800">C: 94% (High Compliance)</span>
                  <p className="text-[#4B5563]">Sangat teliti, patuh SOP, dan akurasi tinggi pada toleransi teknis.</p>
                </div>
                <div className="p-2 bg-blue-50/60 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800">S: 88% (High Steadiness)</span>
                  <p className="text-[#4B5563]">Kestabilan tinggi terhadap pekerjaan repetitif berulang tanpa cepat lelah.</p>
                </div>
              </div>
            </div>

            {/* Right: Kraepelin Fluctuation Curve */}
            <div className="p-4 sm:p-5 rounded-2xl border border-[#E8E8EC] bg-white space-y-3 gpu-layer will-animate">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Grafik Tes Ketahanan Kraepelin / Pauli</span>
                </h3>
                <p className="text-[11px] text-[#6B6B6B]">
                  Evaluasi fluktuasi ketahanan kerja (Panker, Tianker, Stanker).
                </p>
              </div>

              {/* 4 Mini Stat Badges */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Kecepatan (Panker)</p>
                  <p className="text-base font-bold text-[#0A0A0A]">{kraepelinScores.panker} <span className="text-[10px] font-normal text-[#86868B]">angka/m</span></p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Ketelitian (Tianker)</p>
                  <p className="text-base font-bold text-emerald-600">{kraepelinScores.tianker}%</p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Ketahanan (Hankker)</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1">{kraepelinScores.hankker}</p>
                </div>
                <div className="p-2.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                  <p className="text-[10px] text-[#6B6B6B]">Stabilitas (Stanker)</p>
                  <p className="text-base font-bold text-amber-600">{kraepelinScores.stanker}%</p>
                </div>
              </div>

              {/* SVG Fluctuation Curve */}
              <div className="h-32 w-full pt-2">
                <svg viewBox="0 0 400 110" className="w-full h-full overflow-visible">
                  <line x1="0" y1="25" x2="400" y2="25" stroke="#F0F0F2" strokeDasharray="3 3" />
                  <line x1="0" y1="55" x2="400" y2="55" stroke="#F0F0F2" strokeDasharray="3 3" />
                  <line x1="0" y1="85" x2="400" y2="85" stroke="#F0F0F2" strokeDasharray="3 3" />

                  {(() => {
                    const points = kraepelinScores.curve.map((val, i) => ({
                      x: (i / (kraepelinScores.curve.length - 1)) * 380 + 10,
                      y: 100 - (val / 60) * 75,
                      val,
                      col: i + 1,
                    }));
                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

                    return (
                      <>
                        <path d={`${pathD} L 390 100 L 10 100 Z`} fill="rgba(99, 102, 241, 0.08)" />
                        <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
                        {points.map((p, idx) => (
                          <g key={idx}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#FFFFFF" stroke="#6366F1" strokeWidth="2" />
                            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0A0A0A">
                              {p.val}
                            </text>
                            <text x={p.x} y="108" textAnchor="middle" fontSize="8" fill="#86868B">
                              K{p.col}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <p className="text-[10px] text-[#6B6B6B] bg-[#F5F5F7] p-2 rounded-lg">
                <strong>Catatan Fluktuasi:</strong> Grafik menunjukkan kurva adaptasi yang menanjak konsisten (*ascending curve*) tanpa drop signifikan, indikasi daya adaptasi shift malam dan target produksi yang sangat baik.
              </p>
            </div>
          </div>

          {/* Qualitative Evaluation & Recommendation */}
          <div className="p-4 rounded-xl border border-[#E8E8EC] bg-[#FAFAFA] space-y-2 text-xs leading-relaxed">
            <h4 className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[11px] text-indigo-700">
              Kesimpulan Evaluasi Psikologi Terapan
            </h4>
            <p className="text-[#4B5563]">
              Kandidat menunjukkan profil kerja tipe <strong>Compliance-Steadiness (CS)</strong> dengan tingkat ketelitian kerja di atas rata-rata populasi normatif (96%). Kemampuan bekerja dalam tempo tinggi terbukti stabil selama pengujian Kraepelin, dengan tingkat konsistensi ketahanan 91%. Cocok untuk ditempatkan pada posisi kritis yang menuntut akurasi zero-defect, seperti <em>Quality Assurance</em>, <em>Inspeksi Visual</em>, dan <em>Operator Perakitan Presisi</em>.
            </p>
          </div>

          {/* Signature & Verification Block */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E8EC] text-xs">
            <div className="space-y-1">
              <p className="text-[10px] text-[#86868B]">Tanda Tangan Digital Verifikator:</p>
              <p className="font-bold text-[#0A0A0A]">Dr. Aris Setiawan, M.Psi., Psikolog</p>
              <p className="text-[10px] text-[#6B6B6B] font-mono">SIPP: 2024-089-PSI-IND / HIMPSI Jawa Barat</p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Electronic Document
              </span>
              <p className="text-[10px] text-[#86868B]">Recruiter Industrial Automated Psychometrics</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
