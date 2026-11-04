'use client';

import Link from 'next/link';
import { cachedPbGetFullList } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { CorporateTimeline } from '@/components/corporate-timeline';
import { useLanguage } from '@/lib/language-context';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Search,
  Layers,
  ChevronRight,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';

// Fallback data industri manufaktur jika PocketBase belum di-seed
export const FALLBACK_SERVICES = [
  { id: 'fb-1', category: 'Pilar C: Asesmen Psikometri', title: 'Asesmen Massal Kraepelin & Ketahanan Kerja Operator', description: 'Uji psikotes Kraepelin/Pauli massal tersertifikasi HIMPSI untuk seleksi operator pabrik dan teknisi perakitan presisi.', price: 150000 },
  { id: 'fb-2', category: 'Pilar C: Evaluasi Ergonomi', title: 'Beban Mental Kerja & Stabilitas Regulasi Shift Malam', description: 'Evaluasi kesiapan psikologis dan daya tahan shift malam 3-gilir untuk memitigasi risiko insiden kecelakaan kerja.', price: 275000 },
  { id: 'fb-3', category: 'Pilar B: Sertifikasi K3 & Mutu', title: 'Klinik Sertifikasi Ahli K3 Umum & SIO Kemnaker', description: 'Verifikasi kelengkapan berkas lisensi K3, SIO Forklift, dan standar SMK3 PP 50/2012 sebelum penempatan kerja.', price: 250000 },
  { id: 'fb-4', category: 'Pilar B: Pemetaan Kompetensi', title: 'Uji Kalibrasi & Akurasi 7 QC Tools (ISO 9001:2015)', description: 'Simulasi pengukuran dimensi presisi menggunakan micrometer/caliper dan studi kasus diagram Ishikawa/Pareto.', price: 200000 },
  { id: 'fb-5', category: 'Pilar A: Layanan B2B Plant', title: 'Corporate Industrial Recruitment Retainer (Pabrik)', description: 'Layanan penyediaan tenaga teknis siap kerja: screening CV berbasis AI, tes psikometri, dan orientasi plant.', price: 2500000 },
  { id: 'fb-6', category: 'Pilar A: Layanan B2B Plant', title: 'Audit Ergonomi & Pemetaan Kinerja Line Produksi', description: 'Observasi kepatuhan SOP 5S, laju kelelahan kerja operator, dan rekomendasi rotasi workstation manufaktur.', price: 3200000 },
];

export const FALLBACK_JOBS = [
  {
    id: 'fb-j1',
    title: 'Teknisi Maintenance & Otomasi PLC (Siemens / Omron)',
    description: 'Pemeliharaan berkala PLC S7-1200, penanganan breakdown sensor mekatronika, wiring panel 3-phase, dan hidrolik mesin.',
    requirements_keywords: ['PLC Siemens S7', 'Wiring 3-Phase', 'Hidrolik & Pneumatik', 'Preventive Maint.'],
    is_featured: true,
    expand: { employer_id: { company_name: 'PT Cikarang Presisi Parts' } }
  },
  {
    id: 'fb-j2',
    title: 'Operator CNC Milling & Machining Center (3-Axis)',
    description: 'Setup tooling, running program G-Code mesin CNC, dan inspeksi dimensi toleransi mikro 0.01mm sesuai engineering drawing.',
    requirements_keywords: ['CNC Milling', 'Caliper & Micrometer', 'Mastercam', 'ISO 9001:2015'],
    is_featured: true,
    expand: { employer_id: { company_name: 'PT Karawang Precision Tools' } }
  },
  {
    id: 'fb-j3',
    title: 'Supervisor QA/QC & Ahli K3 Umum Kemnaker',
    description: 'Memastikan kepatuhan zero-accident di lantai fabrikasi serta verifikasi standar mutu inspeksi produk ekspor (FMEA/SPC).',
    requirements_keywords: ['Ahli K3 Umum', 'ISO 9001:2015', '7 QC Tools', 'Welding Inspection'],
    is_featured: true,
    expand: { employer_id: { company_name: 'PT Indo Steel Heavy Fabrikasi' } }
  },
  {
    id: 'fb-j4',
    title: 'Operator Forklift Gudang Raw Material (SIO Kemnaker)',
    description: 'Bongkar muat bahan baku industri di sistem racking gudang 6 meter, mematuhi SOP manuver keselamatan operasional forklift.',
    requirements_keywords: ['SIO Forklift', 'Gudang FIFO', 'K3 Gudang', 'PPIC Buffer Stock'],
    is_featured: false,
    expand: { employer_id: { company_name: 'PT Cikarang Multi Logistics' } }
  },
  {
    id: 'fb-j5',
    title: 'Staff PPIC (Production Planning & Inventory Control)',
    description: 'Menyusun jadwal produksi mingguan assembly plant, sinkronisasi stok bahan baku impor, dan pemantauan OEE mesin.',
    requirements_keywords: ['PPIC', 'SAP ERP', 'Kaizen / 5S', 'Bill of Materials'],
    is_featured: true,
    expand: { employer_id: { company_name: 'PT Astra Otoparts Component' } }
  },
  {
    id: 'fb-j6',
    title: 'Welder Fabrikasi Struktur Baja 3G / 6G (SMAW & GTAW)',
    description: 'Pengelasan pipa bertekanan tinggi dan konstruksi girder baja dengan lolos uji penetrant (NDT) standar mutu ASME.',
    requirements_keywords: ['Welding 3G/6G', 'SMAW & GTAW', 'Uji NDT', 'Keselamatan K3'],
    is_featured: false,
    expand: { employer_id: { company_name: 'PT Nusantara Boiler & Vessel' } }
  }
];

interface HomeViewProps {
  initialServices?: any[];
  initialJobs?: any[];
}

export function HomeView({ initialServices = FALLBACK_SERVICES, initialJobs = FALLBACK_JOBS }: HomeViewProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [services, setServices] = useState<any[]>(initialServices);
  const [jobs, setJobs] = useState<any[]>(initialJobs);
  const [loading, setLoading] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mini interactive Kraepelin simulator in Hero (21st.dev style tactile widget)
  const [heroNumA, setHeroNumA] = useState(7);
  const [heroNumB, setHeroNumB] = useState(8);
  const [heroFeedback, setHeroFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [heroScore, setHeroScore] = useState(14);
  const [heroPanker, setHeroPanker] = useState(48.5);

  const handleHeroSubmit = (digit: number) => {
    const expected = (heroNumA + heroNumB) % 10;
    if (digit === expected) {
      setHeroFeedback('correct');
      setHeroScore((prev) => prev + 1);
      setHeroPanker((prev) => Math.min(65, +(prev + 0.6).toFixed(1)));
      setTimeout(() => {
        setHeroNumA(Math.floor(Math.random() * 9) + 1);
        setHeroNumB(Math.floor(Math.random() * 9) + 1);
        setHeroFeedback('idle');
      }, 350);
    } else {
      setHeroFeedback('wrong');
      setTimeout(() => setHeroFeedback('idle'), 500);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const [s, j] = await Promise.all([
          cachedPbGetFullList('services_catalog', { filter: 'is_active = true', sort: 'price' }),
          cachedPbGetFullList('job_postings', { filter: 'status = "open"', expand: 'employer_id', sort: '-created' }),
        ]);
        if (s && s.length > 0) setServices(s);
        if (j && j.length > 0) setJobs(j);
      } catch {
        // Fallback jika PocketBase offline
      }
    }
    load();
  }, []);

  const filteredServices = services.filter((svc) => {
    const matchesCategory =
      selectedPillar === 'all'
        ? true
        : svc.category?.toLowerCase().includes(selectedPillar.toLowerCase());
    const matchesSearch =
      searchQuery === ''
        ? true
        : svc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          svc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1D1D1F] flex flex-col font-sans">
      {/* 1. HERO SECTION (Tactile Industrial Precision & Interactive Psychometric Console) */}
      <section className="relative pt-12 pb-16 md:pt-16 md:pb-24 bg-[#FFFFFF] border-b border-[#E1E4E8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Confident Technical Grounding */}
            <div className="lg:col-span-7 text-left">
              {/* Contextual Technical Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#F6F8FA] border border-[#E1E4E8] text-xs font-mono text-[#52525B] mb-5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{isEn ? 'Industrial Manufacturing • HIMPSI & K3 Standard' : 'Pabrik & Manufaktur Presisi • Standar HIMPSI & Kemnaker'}</span>
              </div>

              {/* Headline - Editorial, solid, without split-color words */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#0D1117] leading-[1.12] mb-5">
                {isEn 
                  ? 'Factory Operator Recruitment and Industrial Psychometric Calibration.'
                  : 'Standar Rekrutmen Operator Pabrik dan Kalibrasi Psikometri Industri.'}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#57606A] max-w-xl leading-relaxed mb-8">
                {isEn
                  ? 'Precision technical workforce screening: automated Kraepelin/Pauli test engine calibrated to HIMPSI norms, Kemnaker K3 license verification, and 3-shift mental load mitigation.'
                  : 'Ekosistem seleksi teknis pabrik: auto-scoring tes Kraepelin/Pauli terkalibrasi norma HIMPSI, verifikasi lisensi K3 Kemnaker, audit 7 QC Tools, dan mitigasi kelelahan kerja 3-shift.'}
              </p>

              {/* Direct CTAs without trailing arrow spam */}
              <div className="flex flex-wrap items-center gap-3 mb-10">
                <Link href="#jobs">
                  <Button
                    size="lg"
                    className="h-11 px-6 rounded-lg bg-[#0D1117] hover:bg-[#24292F] text-white text-xs font-medium shadow-xs transition-colors duration-150 touch-manipulation cursor-pointer"
                  >
                    {isEn ? 'Explore Factory Vacancies' : 'Jelajahi Lowongan Pabrik'}
                  </Button>
                </Link>
                <Link href="/candidate/practice">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 px-6 rounded-lg border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] text-[#0D1117] text-xs font-medium transition-colors duration-150 touch-manipulation cursor-pointer"
                  >
                    {isEn ? 'Practice Kraepelin Test' : 'Simulasi Uji Kraepelin'}
                  </Button>
                </Link>
                <Link href="#services">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-11 px-5 rounded-lg text-[#57606A] hover:text-[#0D1117] hover:bg-[#F6F8FA] text-xs font-medium transition-colors duration-150 touch-manipulation cursor-pointer"
                  >
                    {isEn ? 'B2B Plant Retainer' : 'Konsultasi Plant B2B'}
                  </Button>
                </Link>
              </div>

              {/* Industrial Corridors & Cluster Indicators */}
              <div className="pt-6 border-t border-[#E1E4E8]">
                <p className="text-[11px] font-mono text-[#57606A] uppercase tracking-wider mb-2">
                  {isEn ? 'Integrated Manufacturing Corridors' : 'Klaster Industri Terintegrasi'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-[#24292F]">
                  <span className="px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#E1E4E8]">Cikarang (MM2100 &amp; GIIC)</span>
                  <span className="px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#E1E4E8]">Karawang (KIIC &amp; Surya Cipta)</span>
                  <span className="px-2.5 py-1 rounded bg-[#F6F8FA] border border-[#E1E4E8]">K3 PP 50/2012 Certified</span>
                </div>
              </div>
            </div>

            {/* Right: Tactile Kraepelin Instrument Console (21st.dev inspired) */}
            <div className="lg:col-span-5">
              <div className="bg-[#FFFFFF] border border-[#D0D7DE] rounded-xl shadow-xs p-5 relative overflow-hidden">
                {/* Console Bar */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#E1E4E8] mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-mono font-semibold text-[#0D1117] uppercase tracking-wider">
                      {isEn ? 'Psychometric Console' : 'Konsol Psikometri HIMPSI'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    CALIBRATED 2026
                  </span>
                </div>

                {/* Tactile Addition Stage */}
                <div className="bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#57606A] mb-3">
                    <span>{isEn ? 'RAPID SUM CHECK' : 'PENJUMLAHAN CEPAT'}</span>
                    <span className="text-emerald-700 font-bold">Kolom #{heroScore}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-2">
                    {/* Top Digit */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-white border border-[#D0D7DE] shadow-xs flex items-center justify-center text-2xl font-mono font-bold text-[#0D1117]">
                      {heroNumA}
                    </div>

                    <span className="text-xl font-bold text-amber-600">+</span>

                    {/* Bottom Digit */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg bg-white border border-[#D0D7DE] shadow-xs flex items-center justify-center text-2xl font-mono font-bold text-[#0D1117]">
                      {heroNumB}
                    </div>

                    <span className="text-xl font-bold text-[#57606A]">=</span>

                    {/* Feedback Target */}
                    <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-lg border flex items-center justify-center text-xl font-mono font-bold transition-all duration-150 ${
                      heroFeedback === 'correct'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 scale-105'
                        : heroFeedback === 'wrong'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-dashed border-[#8C959F] text-[#57606A]'
                    }`}>
                      {heroFeedback === 'correct' ? (heroNumA + heroNumB) % 10 : '?'}
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-[#57606A] mt-2">
                    {heroFeedback === 'correct' ? (
                      <span className="text-emerald-600 font-mono font-semibold">✓ Akurat! Kecepatan meningkat</span>
                    ) : heroFeedback === 'wrong' ? (
                      <span className="text-red-600 font-mono font-semibold">✗ Angka satuan salah, coba lagi</span>
                    ) : (
                      <span>{isEn ? 'Tap unit digit below (ex: 7+8=15 -> tap 5)' : 'Pilih angka satuan di bawah (cth: 7+8=15 -> pilih 5)'}</span>
                    )}
                  </p>
                </div>

                {/* Tactile Keypad */}
                <div className="grid grid-cols-5 gap-1.5 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleHeroSubmit(num)}
                      className="h-10 rounded-md bg-[#FAFAFA] border border-[#D0D7DE] hover:border-amber-500 active:bg-[#0D1117] active:text-white font-mono font-bold text-base text-[#0D1117] shadow-2xs transition-all cursor-pointer touch-manipulation"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Readout Gauges */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E1E4E8] text-left">
                  <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E1E4E8]">
                    <span className="text-[10px] font-mono text-[#57606A] block">LAJU KERJA (PANKER)</span>
                    <span className="text-sm font-mono font-bold text-[#0D1117]">{heroPanker} kol/mnt</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#F6F8FA] border border-[#E1E4E8]">
                    <span className="text-[10px] font-mono text-[#57606A] block">KETELITIAN (TIANKER)</span>
                    <span className="text-sm font-mono font-bold text-emerald-600">98.5% (Norma A)</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-[#E1E4E8] flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-[#57606A]">Rekomendasi Plant:</span>
                  <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    Lolos Operator QC / CNC
                  </span>
                </div>

                <div className="mt-3">
                  <Link href="/candidate/practice" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 rounded-md border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] text-[#0D1117] text-xs font-mono font-medium cursor-pointer"
                    >
                      {isEn ? 'Open Fullscreen Test Station' : 'Buka Konsol Uji Penuh (Layar Penuh)'}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HORIZONTAL CORPORATE TIMELINE (Infographic Precision) */}
      <CorporateTimeline />

      {/* 3. JOB BOARD SECTION (Pilar A) */}
      <section id="jobs" className="py-20 bg-[#FFFFFF]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                {t.jobsSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D1117] mt-2">
                {t.jobsSection.title}
              </h2>
              <p className="text-xs text-[#57606A] mt-1">
                {t.jobsSection.subtitle}
              </p>
            </div>
            <Link href="/register">
              <Button variant="outline" size="sm" className="rounded-lg border-[#D0D7DE] text-xs h-8">
                {isEn ? 'Post a Job Opening' : 'Pasang Lowongan Pabrik'}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.length === 0 ? (
              <div className="col-span-full py-12 px-6 bg-white border border-[#E8E8EC] rounded-2xl text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#F5F5F7] border border-[#E8E8EC] flex items-center justify-center text-[#52525B] mb-3">
                  <Briefcase className="w-5 h-5 text-[#52525B]" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A]">
                  {isEn ? 'No job openings currently available' : 'Belum ada lowongan terbuka'}
                </h3>
                <p className="text-xs text-[#52525B] max-w-sm mt-1 leading-relaxed">
                  {isEn
                    ? 'Check back shortly or create a candidate profile to receive automatic vacancy updates.'
                    : 'Silakan cek kembali beberapa saat lagi atau lengkapi profil kandidat untuk notifikasi lowongan industri otomatis.'}
                </p>
              </div>
            ) : (
              jobs.map((job) => {
                const keywords = Array.isArray(job.requirements_keywords)
                  ? (job.requirements_keywords as string[])
                  : [];
                return (
                  <div
                    key={job.id}
                    className="bg-[#FFFFFF] border border-[#E1E4E8] rounded-xl p-5 shadow-xs hover:border-[#D0D7DE] transition-all duration-150 flex flex-col justify-between gpu-layer will-animate content-visibility-auto"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#57606A] font-medium">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          {job.expand?.employer_id?.company_name || 'Mitra Industri'}
                        </span>
                        {job.is_featured && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            {t.jobsSection.featured}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-[#0D1117] leading-snug mb-2">
                        {job.title}
                      </h3>

                      <p className="text-xs text-[#57606A] line-clamp-2 leading-relaxed mb-4">
                        {job.description?.replace(/<[^>]+>/g, '')}
                      </p>

                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {keywords.slice(0, 4).map((kw: string) => (
                            <span
                              key={kw}
                              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F6F8FA] text-[#24292F] border border-[#E1E4E8]"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[#E1E4E8] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Status: Open
                      </span>
                      <Link href={`/jobs/${job.id}`}>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg text-xs font-semibold text-[#0D1117] hover:bg-[#F6F8FA] h-8 px-3 touch-manipulation cursor-pointer"
                        >
                          {t.jobsSection.applyNow}
                          <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#57606A]" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 4. SERVICES CATALOG (Pilar B & C) */}
      <section id="services" className="py-20 bg-[#FAFAFA] border-t border-[#E8E8EC]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                {t.servicesSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D1117] mt-2">
                {t.servicesSection.title}
              </h2>
              <p className="text-xs text-[#57606A] mt-1">
                {t.servicesSection.subtitle}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-64 relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#57606A]" />
              <input
                type="text"
                placeholder={t.jobsSection.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#FFFFFF] border border-[#D0D7DE] rounded-lg text-xs text-[#0D1117] placeholder:text-[#57606A] focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={isEn ? "Clear search" : "Hapus pencarian"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#57606A] hover:text-[#0D1117] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: 'all', label: t.servicesSection.allTab },
              { id: 'pilar a', label: t.servicesSection.pilarA },
              { id: 'pilar b', label: t.servicesSection.pilarB },
              { id: 'pilar c', label: t.servicesSection.pilarC },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPillar(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer touch-manipulation ${
                  selectedPillar === tab.id
                    ? 'bg-[#0D1117] text-white border-[#0D1117] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#57606A] border-[#D0D7DE] hover:bg-[#F6F8FA]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-12 px-6 bg-white border border-[#E1E4E8] rounded-xl text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#F6F8FA] border border-[#E1E4E8] flex items-center justify-center text-[#57606A] mb-3">
                  <Search className="w-5 h-5 text-[#57606A]" />
                </div>
                <h3 className="text-sm font-bold text-[#0D1117]">
                  {isEn ? 'No services found' : 'Layanan tidak ditemukan'}
                </h3>
                <p className="text-xs text-[#57606A] max-w-sm mt-1 mb-4 leading-relaxed">
                  {isEn
                    ? 'We could not find any services matching your filter. Try adjusting your search term or select another pillar.'
                    : 'Tidak ada layanan yang sesuai dengan kriteria filter Anda. Coba ubah kata kunci atau pilih pilar lain.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setSelectedPillar('all'); }}
                  className="rounded-lg text-xs border-[#D0D7DE] text-[#0D1117] hover:bg-[#F6F8FA] touch-manipulation cursor-pointer"
                >
                  {isEn ? 'Reset Filter' : 'Reset Filter'}
                </Button>
              </div>
            ) : (
              filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-[#FFFFFF] border border-[#E1E4E8] rounded-xl p-5 shadow-xs hover:border-[#D0D7DE] transition-all duration-150 flex flex-col justify-between gpu-layer will-animate content-visibility-auto"
                >
                  <div>
                    <div className="mb-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F6F8FA] text-[#24292F] border border-[#E1E4E8]">
                        {svc.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#0D1117] leading-snug mb-2">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-[#57606A] leading-relaxed mb-6 line-clamp-3">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E1E4E8] flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#57606A] uppercase tracking-wider block font-medium">
                        {t.servicesSection.sessionFee}
                      </span>
                      <span className="text-base font-bold font-mono text-[#0D1117]">
                        Rp {Number(svc.price).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <Link href={`/booking/${svc.id}`}>
                      <Button
                        size="sm"
                        className="rounded-lg bg-[#0D1117] hover:bg-[#24292F] text-white text-xs font-medium px-4 h-8 transition-colors duration-150 touch-manipulation cursor-pointer"
                      >
                        {t.servicesSection.bookSession}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
