'use client';

import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { CorporateTimeline } from '@/components/corporate-timeline';
import { useLanguage } from '@/lib/language-context';
import {
  Briefcase,
  ArrowRight,
  Building2,
  CheckCircle2,
  Search,
  Layers,
  ChevronRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

// Fallback data industri manufaktur jika PocketBase belum di-seed
const FALLBACK_SERVICES = [
  { id: 'fb-1', category: 'Pilar C: Asesmen Psikometri', title: 'Asesmen Massal Kraepelin & Ketahanan Kerja Operator', description: 'Uji psikotes Kraepelin/Pauli massal tersertifikasi HIMPSI untuk seleksi operator pabrik dan teknisi perakitan presisi.', price: 150000 },
  { id: 'fb-2', category: 'Pilar C: Evaluasi Ergonomi', title: 'Beban Mental Kerja & Stabilitas Regulasi Shift Malam', description: 'Evaluasi kesiapan psikologis dan daya tahan shift malam 3-gilir untuk memitigasi risiko insiden kecelakaan kerja.', price: 275000 },
  { id: 'fb-3', category: 'Pilar B: Sertifikasi K3 & Mutu', title: 'Klinik Sertifikasi Ahli K3 Umum & SIO Kemnaker', description: 'Verifikasi kelengkapan berkas lisensi K3, SIO Forklift, dan standar SMK3 PP 50/2012 sebelum penempatan kerja.', price: 250000 },
  { id: 'fb-4', category: 'Pilar B: Pemetaan Kompetensi', title: 'Uji Kalibrasi & Akurasi 7 QC Tools (ISO 9001:2015)', description: 'Simulasi pengukuran dimensi presisi menggunakan micrometer/caliper dan studi kasus diagram Ishikawa/Pareto.', price: 200000 },
  { id: 'fb-5', category: 'Pilar A: Layanan B2B Plant', title: 'Corporate Industrial Recruitment Retainer (Pabrik)', description: 'Layanan penyediaan tenaga teknis siap kerja: screening CV berbasis AI, tes psikometri, dan orientasi plant.', price: 2500000 },
  { id: 'fb-6', category: 'Pilar A: Layanan B2B Plant', title: 'Audit Ergonomi & Pemetaan Kinerja Line Produksi', description: 'Observasi kepatuhan SOP 5S, laju kelelahan kerja operator, dan rekomendasi rotasi workstation manufaktur.', price: 3200000 },
];

const FALLBACK_JOBS = [
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

export default function HomePage() {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [services, setServices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, j] = await Promise.all([
          pb.collection('services_catalog').getFullList({ filter: 'is_active = true', sort: 'price' }),
          pb.collection('job_postings').getFullList({ filter: 'status = "open"', expand: 'employer_id', sort: '-created' }),
        ]);
        setServices(s.length > 0 ? s : FALLBACK_SERVICES);
        setJobs(j.length > 0 ? j : FALLBACK_JOBS);
      } catch {
        // Fallback jika PB offline
        setServices(FALLBACK_SERVICES);
        setJobs(FALLBACK_JOBS);
      } finally {
        setLoading(false);
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
      {/* 1. HERO SECTION (Apple x Genesis: Quiet Confidence, Deep Ink, Spacious Canvas) */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 bg-[#FFFFFF] border-b border-[#E8E8EC]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] border border-[#E8E8EC] text-[11px] font-medium tracking-wide text-[#86868B] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
            {t.hero.badge}
          </div>

          {/* Headline (Editorial Apple-Restrained Typography) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-[#0A0A0A] leading-[1.08] mb-6">
            {t.hero.titlePrimary}{' '}
            <span className="text-[#6366F1]">{t.hero.titleHighlight}</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#6B6B6B] max-w-2xl mx-auto leading-relaxed mb-10">
            {t.hero.subtitle}
          </p>

          {/* Quiet, Confident Pill CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="#jobs" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-11 px-7 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white text-xs font-medium shadow-sm transition-all"
              >
                {t.hero.exploreJobs}
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
            <Link href="#services" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 px-7 rounded-full border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium"
              >
                {t.hero.bookConsultation}
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-11 px-6 rounded-full border-dashed border-[#6366F1] bg-indigo-50/40 hover:bg-indigo-50 text-[#6366F1] text-xs font-semibold"
              >
                {t.nav.loginDemo} &rarr;
              </Button>
            </Link>
          </div>

          {/* Minimal Hardware Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 pt-10 border-t border-[#E8E8EC] text-left">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[#0A0A0A]">
                {t.hero.statMatchRateVal}
              </p>
              <p className="text-xs text-[#86868B] mt-1">{t.hero.statMatchRate}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[#0A0A0A]">
                {t.hero.statPillarsVal}
              </p>
              <p className="text-xs text-[#86868B] mt-1">{t.hero.statPillars}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[#0A0A0A]">
                {t.hero.statPsikogramVal}
              </p>
              <p className="text-xs text-[#86868B] mt-1">{t.hero.statPsikogram}</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-semibold font-mono tracking-tight text-[#0A0A0A]">Sync .ICS</p>
              <p className="text-xs text-[#86868B] mt-1">Apple &amp; Google Calendar</p>
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
              <span className="text-xs font-mono font-medium text-[#6366F1] uppercase tracking-wider">
                {t.jobsSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">
                {t.jobsSection.title}
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {t.jobsSection.subtitle}
              </p>
            </div>
            <Link href="/register">
              <Button variant="outline" size="sm" className="rounded-full border-[#E8E8EC] text-xs h-8">
                {isEn ? 'Post a Job Opening →' : 'Pasang Lowongan →'}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => {
              const keywords = Array.isArray(job.requirements_keywords)
                ? (job.requirements_keywords as string[])
                : [];
              return (
                <div
                  key={job.id}
                  className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-transform transition-shadow duration-150 ease-out flex flex-col justify-between gpu-layer will-animate content-visibility-auto"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#52525B] font-medium">
                        <Building2 className="w-3.5 h-3.5 text-[#6366F1]" />
                        {job.expand?.employer_id?.company_name || 'Mitra UMKM'}
                      </span>
                      {job.is_featured && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366F1] border border-indigo-100">
                          {t.jobsSection.featured}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-[#0A0A0A] leading-snug mb-2">
                      {job.title}
                    </h3>

                    <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed mb-4">
                      {job.description?.replace(/<[^>]+>/g, '')}
                    </p>

                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {keywords.slice(0, 4).map((kw: string) => (
                          <span
                            key={kw}
                            className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E8E8EC]"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E8E8EC] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Status: Open
                    </span>
                    <Link href={`/jobs/${job.id}`}>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full text-xs font-semibold text-[#0A0A0A] hover:bg-[#F5F5F7] h-8 px-3"
                      >
                        {t.jobsSection.applyNow}
                        <ChevronRight className="w-3.5 h-3.5 ml-1 text-[#86868B]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. SERVICES CATALOG (Pilar B & C) */}
      <section id="services" className="py-20 bg-[#FAFAFA] border-t border-[#E8E8EC]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-medium text-[#6366F1] uppercase tracking-wider">
                {t.servicesSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0A0A0A] mt-1">
                {t.servicesSection.title}
              </h2>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {t.servicesSection.subtitle}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-64 relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#86868B]" />
              <input
                type="text"
                placeholder={t.jobsSection.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E8E8EC] rounded-full text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#6366F1] shadow-sm"
              />
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border active:scale-95 transition-transform duration-100 cursor-pointer ${
                  selectedPillar === tab.id
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                    : 'bg-[#FFFFFF] text-[#6B6B6B] border-[#E8E8EC] hover:bg-[#F5F5F7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((svc) => (
              <div
                key={svc.id}
                className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-transform transition-shadow duration-150 ease-out flex flex-col justify-between gpu-layer will-animate content-visibility-auto"
              >
                <div>
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E8E8EC] uppercase tracking-wider">
                      {svc.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#0A0A0A] leading-snug mb-2">
                    {svc.title}
                  </h3>

                  <p className="text-xs text-[#6B6B6B] leading-relaxed mb-6 line-clamp-3">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E8EC] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#86868B] uppercase tracking-wider block font-medium">
                      {t.servicesSection.sessionFee}
                    </span>
                    <span className="text-base font-bold font-mono text-[#0A0A0A]">
                      Rp {Number(svc.price).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <Link href={`/booking/${svc.id}`}>
                    <Button
                      size="sm"
                      className="rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium px-4 h-8 shadow-sm"
                    >
                      {t.servicesSection.bookSession}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
