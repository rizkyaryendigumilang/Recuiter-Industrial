'use client';

import Link from 'next/link';
import { cachedPbGetFullList } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { StageshowHeroConsole } from './stageshow-hero-console';
import { StageshowBentoGrid } from './stageshow-bento-grid';
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
  Activity,
  ShieldCheck,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  HelpCircle,
  Cpu,
} from 'lucide-react';

// Fallback data industri manufaktur jika PocketBase offline
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
    location: 'Cikarang (Kawasan MM2100)',
    salary: 'Rp 6.800.000 - Rp 8.500.000',
    expand: { employer_id: { company_name: 'PT Cikarang Presisi Parts' } }
  },
  {
    id: 'fb-j2',
    title: 'Operator CNC Milling & Machining Center (3-Axis)',
    description: 'Setup tooling, running program G-Code mesin CNC, dan inspeksi dimensi toleransi mikro 0.01mm sesuai engineering drawing.',
    requirements_keywords: ['CNC Milling', 'Caliper & Micrometer', 'Mastercam', 'ISO 9001:2015'],
    is_featured: true,
    location: 'Karawang (Kawasan KIIC)',
    salary: 'Rp 5.500.000 - Rp 6.800.000',
    expand: { employer_id: { company_name: 'PT Karawang Precision Tools' } }
  },
  {
    id: 'fb-j3',
    title: 'Supervisor QA/QC & Ahli K3 Umum Kemnaker',
    description: 'Memastikan kepatuhan zero-accident di lantai fabrikasi serta verifikasi standar mutu inspeksi produk ekspor (FMEA/SPC).',
    requirements_keywords: ['Ahli K3 Umum', 'ISO 9001:2015', '7 QC Tools', 'Welding Inspection'],
    is_featured: true,
    location: 'Cilegon (Kawasan Krakatau)',
    salary: 'Rp 8.000.000 - Rp 11.000.000',
    expand: { employer_id: { company_name: 'PT Indo Steel Heavy Fabrikasi' } }
  },
  {
    id: 'fb-j4',
    title: 'Operator Forklift Gudang Raw Material (SIO Kemnaker)',
    description: 'Bongkar muat bahan baku industri di sistem racking gudang 6 meter, mematuhi SOP manuver keselamatan operasional forklift.',
    requirements_keywords: ['SIO Forklift', 'Gudang FIFO', 'K3 Gudang', 'PPIC Buffer Stock'],
    is_featured: false,
    location: 'Cikarang (Kawasan Jababeka 1)',
    salary: 'Rp 5.200.000 - Rp 6.200.000',
    expand: { employer_id: { company_name: 'PT Cikarang Multi Logistics' } }
  },
  {
    id: 'fb-j5',
    title: 'Staff PPIC (Production Planning & Inventory Control)',
    description: 'Menyusun jadwal produksi mingguan assembly plant, sinkronisasi stok bahan baku impor, dan pemantauan OEE mesin.',
    requirements_keywords: ['PPIC', 'SAP ERP', 'Kaizen / 5S', 'Bill of Materials'],
    is_featured: true,
    location: 'Karawang (Surya Cipta)',
    salary: 'Rp 6.000.000 - Rp 7.500.000',
    expand: { employer_id: { company_name: 'PT Astra Otoparts Component' } }
  },
  {
    id: 'fb-j6',
    title: 'Welder Fabrikasi Struktur Baja 3G / 6G (SMAW & GTAW)',
    description: 'Pengelasan pipa bertekanan tinggi dan konstruksi girder baja dengan lolos uji penetrant (NDT) standar mutu ASME.',
    requirements_keywords: ['Welding 3G/6G', 'SMAW & GTAW', 'Uji NDT', 'Keselamatan K3'],
    is_featured: false,
    location: 'Gresik (Kawasan JIIPE)',
    salary: 'Rp 6.500.000 - Rp 8.000.000',
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
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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

  const FAQS = [
    {
      q: isEn ? 'How does the automated Kraepelin/Pauli test engine calculate scores?' : 'Bagaimana engine Kraepelin/Pauli otomatis menghitung skor kandidat?',
      a: isEn
        ? 'Our system evaluates four psychological dimensions in real-time: Panker (work speed per minute), Tianker (accuracy percentage), Hanker (stamina endurance slope), and Janker (work curve stability), benchmarking directly against HIMPSI manufacturing norms.'
        : 'Sistem mengevaluasi 4 dimensi psikofisik secara real-time: Panker (kecepatan kerja per menit), Tianker (persentase akurasi & ketelitian), Hanker (kurva ketahanan stamina), dan Janker (stabilitas ritme kerja), dikalibrasikan langsung dengan norma HIMPSI industri manufaktur.'
    },
    {
      q: isEn ? 'Are K3 Kemnaker certificates and SIO licenses verified automatically?' : 'Apakah sertifikasi K3 Kemnaker dan lisensi SIO diverifikasi resmi?',
      a: isEn
        ? 'Yes. Every uploaded certificate (SIO Forklift, Ahli K3 Umum, Welder 3G/6G) is validated using OCR stream technology against national Kemnaker regulatory databases (SMK3 PP No. 50/2012).'
        : 'Ya. Setiap sertifikasi yang diunggah (SIO Forklift, Ahli K3 Umum, Juru Las 3G/6G) divalidasi menggunakan OCR stream dan format barcode resmi Kemnaker RI sesuai standar kepatuhan SMK3 PP No. 50 Tahun 2012.'
    },
    {
      q: isEn ? 'How quickly can a factory hire qualified technical operators?' : 'Berapa cepat pabrik dapat merekrut tenaga operator yang siap kerja?',
      a: isEn
        ? 'With pre-calibrated Kraepelin psychograms and verified technical credentials, plant HR can shortlist, interview, and deploy qualified operators within 48 hours.'
        : 'Dengan psikogram Kraepelin yang sudah teruji dan sertifikasi kompetensi teknis yang telah diverifikasi, HR pabrik dapat melakukan shortlisting, wawancara, dan penempatan kerja dalam waktu rata-rata 48 jam.'
    },
    {
      q: isEn ? 'Can this platform integrate with our existing factory ATS or HRIS?' : 'Dapatkah platform ini diintegrasikan dengan sistem ATS atau HRIS pabrik?',
      a: isEn
        ? 'Yes. We provide modern REST APIs and secure HMAC-signed Webhooks that automatically sync candidate application statuses, Kraepelin test scores, and interview invites to your HRIS.'
        : 'Bisa. Kami menyediakan REST API dan Webhook terenkripsi HMAC yang secara otomatis menyinkronkan status lamaran, skor psikotes Kraepelin, dan jadwal wawancara langsung ke sistem HRIS/ATS internal pabrik Anda.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans">
      {/* 1. HERO SECTION (Modern, Airy, Tactile & Interactive) */}
      <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 border-b border-slate-200/80 overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[350px] bg-amber-400/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-[500px] h-[350px] bg-emerald-400/8 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left: Headline & Informative Value Proposition */}
            <div className="lg:col-span-7 text-left space-y-6">
              {/* Contextual Announcement Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-mono text-slate-800 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-semibold text-slate-950">{isEn ? 'Industrial ATS Engine' : 'Rekrutmen Manufaktur Terpadu'}</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-600">{isEn ? 'HIMPSI Norms & K3 Kemnaker' : 'Norma HIMPSI & K3 Kemnaker'}</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                {isEn 
                  ? 'Precision Factory Recruitment & HIMPSI Psychometric Calibration.'
                  : 'Rekrutmen Operator Pabrik & Kalibrasi Psikometri Terpadu.'}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                {isEn
                  ? 'Precision technical workforce screening: automated Kraepelin/Pauli test engine calibrated to HIMPSI norms, Kemnaker K3 license verification, and 3-shift mental load mitigation.'
                  : 'Solusi seleksi tenaga teknis pabrik: auto-scoring tes Kraepelin/Pauli standar HIMPSI, verifikasi lisensi K3 Kemnaker, audit 7 QC Tools, dan evaluasi beban kerja shift malam.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="#jobs">
                  <Button
                    size="lg"
                    className="h-11 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm hover:shadow-md active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-amber-400" />
                    {isEn ? 'Explore Factory Vacancies' : 'Jelajahi Lowongan Pabrik'}
                  </Button>
                </Link>
                <Link href="/candidate/practice">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 px-6 rounded-2xl border-slate-300/90 bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold shadow-2xs active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-emerald-600" />
                    {isEn ? 'Practice Kraepelin Test' : 'Simulasi Uji Kraepelin'}
                  </Button>
                </Link>
                <Link href="#services">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="h-11 px-4 rounded-2xl text-slate-600 hover:text-slate-950 hover:bg-slate-100/80 text-xs font-semibold active:scale-98 transition-all cursor-pointer"
                  >
                    {isEn ? 'B2B Plant Retainer' : 'Konsultasi B2B Pabrik'}
                  </Button>
                </Link>
              </div>

              {/* Live Stat Badges (Telemetry Row) */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="p-3 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 block">14,200+</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Operator Teruji</span>
                </div>
                <div className="p-3 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 block">98.6%</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Akurasi Norma</span>
                </div>
                <div className="p-3 bg-white/70 border border-slate-200/80 rounded-2xl shadow-2xs">
                  <span className="text-xl sm:text-2xl font-extrabold font-mono text-amber-700 block">48 Jam</span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight">Penempatan Cepat</span>
                </div>
              </div>

              {/* Industrial Corridors & Cluster Indicators */}
              <div className="pt-2">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                  {isEn ? 'Connected Industrial Corridors' : 'Klaster Kawasan Industri Terkoneksi'}
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-700">
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">Cikarang (MM2100 &bull; GIIC)</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">Karawang (KIIC &bull; Surya Cipta)</span>
                  <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs">Banten &bull; Jawa Timur</span>
                </div>
              </div>
            </div>

            {/* Right: Modern High-Tech Machine Console */}
            <div className="lg:col-span-5 relative">
              <StageshowHeroConsole isEn={isEn} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. STAGESHOW BENTO GRID (Precision Manufacturing Architecture) */}
      <StageshowBentoGrid isEn={isEn} />

      {/* 3. WHY CHOOSE US (4 Key Architectural Differentiators) */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              NILAI PRESISE INDUSTRI
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Mengapa Pabrik Memilih Recruiter Industrial?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Arsitektur rekrutmen dirancang khusus menjawab tantangan operasional plant: nol kesalahan, kepatuhan K3, dan ketahanan fisik-mental kerja 3-shift.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Kraepelin Auto-Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kalkulasi otomatis algoritma Panker, Tianker, Hanker, dan Janker standar HIMPSI tanpa koreksi manual kertas.
              </p>
            </div>

            <div className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Validasi K3 Kemnaker</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verifikasi keaslian SIO Forklift, sertifikat Ahli K3 Umum, dan SMK3 PP No. 50/2012 secara real-time.
              </p>
            </div>

            <div className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">AI Stream OCR CV</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deteksi otomatis 11 kamus kompetensi manufaktur (PLC Siemens, CNC, 7 QC Tools) dalam hitungan &lt; 1.2 detik.
              </p>
            </div>

            <div className="p-6 bg-slate-50/70 border border-slate-200/80 rounded-3xl hover:border-slate-300 hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Mitigasi Kelelahan Shift</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluasi kesiapan ritme sirkadian kerja malam untuk menekan angka kecelakaan kerja pabrik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. JOB BOARD SECTION (Pilar A) */}
      <section id="jobs" className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {t.jobsSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">
                {t.jobsSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                {t.jobsSection.subtitle}
              </p>
            </div>
            <Link href="/jobs">
              <Button variant="outline" size="sm" className="rounded-2xl border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold h-9 px-4 shadow-2xs">
                {isEn ? 'View All Vacancies →' : 'Lihat Semua Lowongan →'}
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.length === 0 ? (
              <div className="col-span-full py-16 px-6 bg-white border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                  <Briefcase className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? 'No job openings currently available' : 'Belum ada lowongan terbuka'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 leading-relaxed">
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
                    className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate max-w-[180px]">{job.expand?.employer_id?.company_name || 'Mitra Industri Plant'}</span>
                        </span>
                        {job.is_featured && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                            {t.jobsSection.featured}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                        {job.title}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {job.description?.replace(/<[^>]+>/g, '')}
                      </p>

                      {/* Location & Salary Tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px] font-mono text-slate-500">
                        <span className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.location || 'Kawasan Industri'}
                        </span>
                        {job.salary && (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg font-semibold">
                            {job.salary}
                          </span>
                        )}
                      </div>

                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {keywords.slice(0, 3).map((kw: string) => (
                            <span
                              key={kw}
                              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Aktif Menerima
                      </span>
                      <Link href={`/jobs/${job.id}`}>
                        <Button
                          size="sm"
                          className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-8 px-3.5 transition-all cursor-pointer shadow-2xs"
                        >
                          {t.jobsSection.applyNow}
                          <ArrowRight className="w-3 h-3 ml-1" />
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

      {/* 5. SERVICES CATALOG (Pilar B & C) */}
      <section id="services" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {t.servicesSection.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">
                {t.servicesSection.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                {t.servicesSection.subtitle}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-72 relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.jobsSection.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={isEn ? "Clear search" : "Hapus pencarian"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900 cursor-pointer"
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer touch-manipulation ${
                  selectedPillar === tab.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length === 0 ? (
              <div className="col-span-full py-16 px-6 bg-slate-50 border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                  <Search className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? 'No services found' : 'Layanan tidak ditemukan'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                  {isEn
                    ? 'We could not find any services matching your filter. Try adjusting your search term or select another pillar.'
                    : 'Tidak ada layanan yang sesuai dengan kriteria filter Anda. Coba ubah kata kunci atau pilih pilar lain.'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchQuery(''); setSelectedPillar('all'); }}
                  className="rounded-xl text-xs border-slate-300 text-slate-900 hover:bg-white touch-manipulation cursor-pointer"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              filteredServices.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="mb-3">
                      <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                        {svc.category}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 leading-snug mb-2 group-hover:text-amber-700 transition-colors">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-3">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block font-medium">
                        {t.servicesSection.sessionFee}
                      </span>
                      <span className="text-base font-extrabold font-mono text-slate-950">
                        Rp {Number(svc.price).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <Link href={`/booking/${svc.id}`}>
                      <Button
                        size="sm"
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 h-8 transition-colors duration-150 touch-manipulation cursor-pointer shadow-2xs"
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

      {/* 6. INTERACTIVE FAQ SECTION (Informative Clarity) */}
      <section className="py-20 bg-slate-50/70 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-mono font-semibold shadow-2xs">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              PERTANYAAN UMUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Panduan &amp; FAQ Rekrutmen Industri
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Informasi lengkap seputar metode penilaian Kraepelin, validasi sertifikasi K3, dan alur kerja platform.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm text-slate-900 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-slate-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-900' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. HIGH-CONVERTING BOTTOM CTA BANNER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative rounded-3xl bg-slate-950 text-white p-8 sm:p-14 overflow-hidden border border-slate-800 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-5 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                EKOSISTEM HR TECH INDUSTRI
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Siap Melangkah Menuju Standar Rekrutmen Presisi?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                Bergabunglah bersama ribuan operator teruji dan puluhan pabrik terkemuka di kawasan industri Jababeka, MM2100, KIIC, dan seluruh Indonesia.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/candidate/practice">
                  <Button
                    size="lg"
                    className="h-11 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4 text-slate-950" />
                    Mulai Tes Kraepelin Gratis
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-11 px-6 rounded-2xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white text-xs font-bold active:scale-98 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Daftar Sebagai Pabrik / HR
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
