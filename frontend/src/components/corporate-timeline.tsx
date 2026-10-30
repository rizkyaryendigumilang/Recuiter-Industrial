'use client';

import { useLanguage } from '@/lib/language-context';
import { FileText, Cpu, ShieldCheck, UserCheck, MessageSquareCheck } from 'lucide-react';

export function CorporateTimeline() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const milestones = [
    {
      step: '01',
      category: 'Ingestion',
      title: isEn ? 'CV Document Upload' : 'Unggah Dokumen CV',
      description: isEn
        ? 'Candidates upload PDF resumes and authorize recruitment profile data processing.'
        : 'Kandidat mengunggah resume format PDF dan menyetujui pemrosesan data profil rekrutmen.',
      metric: 'Instant Parser',
      icon: FileText,
      badge: isEn ? 'Pillar A: B2B' : 'Pilar A: B2B',
    },
    {
      step: '02',
      category: 'Analysis',
      title: isEn ? 'Smart OCR & Matching' : 'Smart OCR & Matching',
      description: isEn
        ? 'Automated parser extracts competencies and computes qualification match percentages.'
        : 'Parser mengekstrak keterampilan secara otomatis dan menghitung persentase skor kecocokan.',
      metric: 'Auto-Match %',
      icon: Cpu,
      badge: 'AI Engine',
    },
    {
      step: '03',
      category: 'Psychometry',
      title: isEn ? 'Anti-Cheat Assessment' : 'Tes Psikotes Anti-Cheat',
      description: isEn
        ? 'IPIP & Pauli assessments with tab-switching sensors and timed column enforcement.'
        : 'Asesmen psikometri IPIP & Pauli dengan sensor pergantian tab browser dan limit waktu per kolom.',
      metric: 'Realtime Monitor',
      icon: ShieldCheck,
      badge: 'Auto-Scoring',
    },
    {
      step: '04',
      category: 'Expertise',
      title: isEn ? 'Career Clinic & Counseling' : 'Klinik Karier & Konseling',
      description: isEn
        ? 'Employment contract reviews or applied counseling sessions with licensed practitioners.'
        : 'Bedah kontrak kerja atau sesi privat psikologi terapan bersama psikolog dan praktisi profesional.',
      metric: 'Expert-Driven',
      icon: UserCheck,
      badge: isEn ? 'Pillars B & C' : 'Pilar B & C',
    },
    {
      step: '05',
      category: 'Handover',
      title: isEn ? 'Calendar & WA Sync' : 'Sinkronisasi Kalender & WA',
      description: isEn
        ? 'Unique 3-digit verification activates WhatsApp direct action and .ICS calendar synchronization.'
        : 'Nominal unik 3 digit diverifikasi admin, membuka tombol WhatsApp dan sync jadwal via feed .ICS.',
      metric: 'ICS & WhatsApp',
      icon: MessageSquareCheck,
      badge: 'Handover',
    },
  ];

  return (
    <section id="timeline" className="py-20 bg-[#FAFAFA] border-y border-[#E8E8EC]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E8EC] text-[11px] font-medium tracking-wide text-[#86868B] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              {isEn ? 'Hybrid Process Architecture' : 'Arsitektur Proses Hibrida'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0A0A0A]">
              {isEn ? 'End-to-End Recruitment & Assessment Pipeline' : 'Alur Rekrutmen & Asesmen Terintegrasi'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1.5 leading-relaxed">
              {isEn
                ? 'Structured end-to-end flow connecting SME recruitment, career clinics, applied counseling, and calendar sync.'
                : 'Rangkaian end-to-end terstruktur yang menghubungkan rekrutmen UMKM, simulasi karier, konseling terapan, hingga sinkronisasi kalender iOS/Google.'}
            </p>
          </div>
          <div className="text-xs text-[#86868B] font-medium hidden md:block">
            {isEn ? '5 Integrated Stages' : '5 Tahapan Terintegrasi'}
          </div>
        </div>

        {/* Horizontal Timeline Track */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-10 left-8 right-8 h-px bg-[#E8E8EC] -z-0" />

          {/* Cards Track */}
          <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
            {milestones.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="min-w-[270px] lg:min-w-0 flex-1 snap-start relative bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Top: Milestone Node & Indicator */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FAFAFA] border border-[#E8E8EC] flex items-center justify-center text-[#1D1D1F] font-mono text-xs font-bold shadow-xs">
                        {item.step}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#86868B] font-medium border border-[#E8E8EC]">
                        {item.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-[#6366F1]" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#86868B]">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#0A0A0A] mb-1.5 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom: Metric Pill */}
                  <div className="pt-4 mt-4 border-t border-[#F5F5F7] flex items-center justify-between text-[11px]">
                    <span className="text-[#86868B] font-mono">Status</span>
                    <span className="font-mono font-medium text-[#1D1D1F] bg-[#F5F5F7] px-2 py-0.5 rounded-md">
                      {item.metric}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
