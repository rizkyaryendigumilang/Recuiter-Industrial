'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { ShieldCheck, Activity, Award, LifeBuoy, ExternalLink, MapPin } from 'lucide-react';

export function SiteFooter() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [year, setYear] = useState<string>('2026');

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="border-t border-slate-200/90 bg-white/95 backdrop-blur-sm pt-12 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))] text-slate-600 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Vision Column */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm border border-slate-700/50">
                <span className="text-amber-400 font-black">R</span>
                <span className="text-white font-black">I</span>
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Recruiter <span className="text-amber-600 font-black">Industrial</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              {isEn
                ? 'Precision industrial talent acquisition and automated psychometric evaluation calibrated for manufacturing plants and high-reliability environments.'
                : 'Ekosistem rekrutmen terpadu manufaktur dengan auto-scoring psikometri Kraepelin HIMPSI, audit lisensi K3 Kemnaker, dan evaluasi shift kerja pabrik.'}
            </p>
            {/* Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium">
                <Award className="w-3 h-3 text-amber-600" />
                HIMPSI Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                K3 Kemnaker RI
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-700 font-medium">
                ISO 9001:2015
              </span>
            </div>
          </div>

          {/* Column 1: Pencari Kerja */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-950 tracking-wider">
              {isEn ? 'Candidates' : 'Pencari Kerja'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/jobs" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'Job Directory' : 'Bursa Lowongan Kerja'}
                </Link>
              </li>
              <li>
                <Link href="/candidate/practice" className="text-slate-600 hover:text-slate-950 transition-colors flex items-center gap-1">
                  <span>{isEn ? 'Kraepelin Practice' : 'Simulasi Kraepelin'}</span>
                  <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-mono">Gratis</span>
                </Link>
              </li>
              <li>
                <Link href="/candidate/results" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'View Psychogram' : 'Lihat Hasil & Psikogram'}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'Candidate FAQ' : 'Panduan Asesmen & FAQ'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solusi Perusahaan Pabrik */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-950 tracking-wider">
              {isEn ? 'Manufacturing Plants' : 'Pabrik & HR Plant'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/employer" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'ATS Dashboard' : 'Dashboard Employer ATS'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'Corporate Assessment' : 'Layanan Asesmen Massal'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'K3 Certification Clinic' : 'Klinik Lisensi K3 & SIO'}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-slate-600 hover:text-slate-950 transition-colors">
                  {isEn ? 'API & Webhooks' : 'Konfigurasi Webhook ATS'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Koridor Kawasan Industri */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono font-semibold uppercase text-slate-950 tracking-wider">
              {isEn ? 'Industrial Corridors' : 'Kawasan Industri'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Cikarang (MM2100, Jababeka)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Karawang (KIIC, Suryacipta)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Cilegon & Serang (Banten)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>Gresik, Pasuruan & Surabaya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>&copy; {year} Recruiter Industrial. All rights reserved.</span>
            <span>Standar Kepatuhan Kemnaker RI &amp; HIMPSI</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Operasional 99.98%</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
