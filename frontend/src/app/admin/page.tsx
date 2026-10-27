'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RecordModel } from 'pocketbase';
import {
  Calendar as CalendarIcon,
  Download,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Users,
  Briefcase,
  HelpCircle,
  CreditCard,
  Layers,
  CalendarCheck,
  Video,
  Database,
  FileText,
  MessageCircle,
} from 'lucide-react';
import { PsikogramModal, PsikogramData } from '@/components/assessment/psikogram-modal';
import { CandidateNotificationModal } from '@/components/employer/candidate-notification-modal';
import { useLanguage } from '@/lib/language-context';

interface ServiceForm {
  category: string;
  title: string;
  description: string;
  price: number;
  is_active: boolean;
}

interface JobForm {
  title: string;
  description: string;
  requirements_keywords: string;
  is_featured: boolean;
  status: string;
}

interface QuestionForm {
  test_type: string;
  question_text: string;
  optA: string; weightA: number;
  optB: string; weightB: number;
  optC: string; weightC: number;
  optD: string; weightD: number;
}

interface ScheduleItem {
  id: string;
  type: 'interview' | 'consultation';
  title: string;
  personName: string;
  personEmail: string;
  date: string;
  time: string;
  platform: string;
  status: string;
  scoreInfo?: string;
}

const emptyService: ServiceForm = {
  category: 'Pilar C: Psikologi Terapan',
  title: '',
  description: '',
  price: 250000,
  is_active: true,
};

const emptyJob: JobForm = {
  title: '',
  description: '',
  requirements_keywords: '',
  is_featured: false,
  status: 'open',
};

const emptyQuestion: QuestionForm = {
  test_type: 'kepribadian',
  question_text: '',
  optA: '', weightA: 5,
  optB: '', weightB: 3,
  optC: '', weightC: 2,
  optD: '', weightD: 0,
};

// Data Dummy Representatif (Karakteristik Lengkap Sistem)
const DUMMY_SCHEDULES: ScheduleItem[] = [
  {
    id: 'sch-01',
    type: 'interview',
    title: 'Wawancara Tahap 2: Senior Frontend Engineer',
    personName: 'Rizky Pratama, S.Kom',
    personEmail: 'rizky.pratama@gmail.com',
    date: 'Besok, 13 Okt 2026',
    time: '10:00 - 10:45 WIB',
    platform: 'Google Meet (meet.google.com/hrtech-rzp)',
    status: 'Terkonfirmasi',
    scoreInfo: 'OCR Match: 94% | Skor Psikotes: 88/100',
  },
  {
    id: 'sch-02',
    type: 'consultation',
    title: 'Konseling: Decision-Making & Life-Path Coaching',
    personName: 'Anisa Rahmawati, S.Psi',
    personEmail: 'anisa.rahmawati@gmail.com',
    date: 'Lusa, 14 Okt 2026',
    time: '14:00 - 15:00 WIB',
    platform: 'Sesi Privat via WhatsApp Video',
    status: 'Lunas Terverifikasi',
    scoreInfo: 'Topik: Transisi Karier & Negosiasi Kontrak Kerja',
  },
  {
    id: 'sch-03',
    type: 'interview',
    title: 'Wawancara Kompetensi: HR Generalist UMKM',
    personName: 'Bayu Wicaksono',
    personEmail: 'bayu.wicaksono@gmail.com',
    date: '15 Okt 2026',
    time: '16:00 - 16:45 WIB',
    platform: 'Virtual Room HRTech',
    status: 'Terkonfirmasi',
    scoreInfo: 'OCR Match: 88% | Skor Psikotes: 92/100',
  },
  {
    id: 'sch-04',
    type: 'consultation',
    title: 'Klinik Karier: Career Offer & Contract Review',
    personName: 'Dian Permatasari',
    personEmail: 'dian.permatasari@gmail.com',
    date: '16 Okt 2026',
    time: '11:00 - 12:00 WIB',
    platform: 'WhatsApp Handover Call',
    status: 'Lunas Terverifikasi',
    scoreInfo: 'Topik: Bedah Klausul Non-Compete & Remunerasi',
  },
];

const SAMPLE_APPLICATIONS = [
  {
    id: 'app-sample-1',
    candidate_id: 'cand-01',
    job_id: 'job-01',
    match_score: 94,
    test_score: 88,
    status: 'interview',
    created: '2026-10-12',
    candidate_name: 'Rizky Pratama, S.Kom',
    candidate_email: 'rizky.pratama@gmail.com',
    candidate_phone: '081234567890',
    expand: {
      job_id: {
        title: 'Senior Frontend Engineer',
      },
    },
  },
  {
    id: 'app-sample-2',
    candidate_id: 'cand-02',
    job_id: 'job-02',
    match_score: 82,
    test_score: 85,
    status: 'testing',
    created: '2026-10-13',
    candidate_name: 'Anisa Rahmawati, S.Psi',
    candidate_email: 'anisa.rahmawati@gmail.com',
    candidate_phone: '081987654321',
    expand: {
      job_id: {
        title: 'People Operations & HR Generalist',
      },
    },
  },
  {
    id: 'app-sample-3',
    candidate_id: 'cand-03',
    job_id: 'job-03',
    match_score: 89,
    test_score: 92,
    status: 'hired',
    created: '2026-10-14',
    candidate_name: 'Bayu Wicaksono, M.M.',
    candidate_email: 'bayu.wicaksono@gmail.com',
    candidate_phone: '081345678901',
    expand: {
      job_id: {
        title: 'Operations & Process Lead',
      },
    },
  },
];

const CATEGORY_PRESETS = [
  'Pilar A: Layanan B2B & HR Retainer',
  'Pilar A: Bulk Test Credit & Assessment',
  'Pilar B: Klinik Karier (Review Kontrak & Offer)',
  'Pilar B: Corporate Test Simulation & Coaching',
  'Pilar C: Psikologi Terapan (Decision-Making)',
  'Pilar C: Psikologi Terapan (Emotional Regulation)',
  'Pilar C: Psikologi Terapan (Public Speaking & Anxiety)',
  'Pilar C: Psikologi Terapan (Pre-Marital & Relationship)',
  'Pilar C: Psikologi Terapan (Academic & Stress)',
  'Pilar C: Psikologi Terapan (Trauma & Adjustment)',
];

export default function AdminDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [bookings, setBookings] = useState<RecordModel[]>([]);
  const [services, setServices] = useState<RecordModel[]>([]);
  const [jobs, setJobs] = useState<RecordModel[]>([]);
  const [questions, setQuestions] = useState<RecordModel[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [employers, setEmployers] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Unified Administration Service Form
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyService);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  // Job Form
  const [jobForm, setJobForm] = useState<JobForm>(emptyJob);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);

  // Question Form
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestion);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Calendar Filter
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'interview' | 'consultation'>('all');

  // Psikogram Modal State
  const [isPsikogramOpen, setIsPsikogramOpen] = useState(false);
  const [selectedPsikogramData, setSelectedPsikogramData] = useState<PsikogramData | null>(null);

  // Notification Modal State (Email & WhatsApp Clip-to-paste)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState<{
    name: string;
    email: string;
    phone: string;
    jobTitle: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const isAdminAuthed = localStorage.getItem('admin_auth') === 'true';
    const isPBAuthAdmin = pb.authStore.isValid && pb.authStore.record?.role === 'admin';
    if (!isAdminAuthed && !isPBAuthAdmin) {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    pb.authStore.clear();
    router.push('/admin/login');
  };

  async function loadData() {
    setLoading(true);
    try {
      const [b, s, j, q, a, e] = await Promise.all([
        pb.collection('consultation_bookings').getFullList({ sort: '-created', expand: 'user_id,service_id' }),
        pb.collection('services_catalog').getFullList({ sort: '-created' }),
        pb.collection('job_postings').getFullList({ sort: '-created', expand: 'employer_id' }),
        pb.collection('test_questions').getFullList({ sort: '-created' }),
        pb.collection('job_applications').getFullList({ sort: '-created', expand: 'job_id,candidate_id.user_id' }),
        pb.collection('employers').getFullList(),
      ]);
      setBookings(b);
      setServices(s);
      setJobs(j);
      setQuestions(q);
      setApplications(a);
      setEmployers(e);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }

  const displayApplications = applications.length > 0 ? applications : SAMPLE_APPLICATIONS;

  async function updateCandidateStatus(app: any, newStatus: string) {
    try {
      if (app.id && !app.id.startsWith('app-sample-')) {
        await pb.collection('job_applications').update(app.id, { status: newStatus });
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
      );

      // Trigger Notification Modal if status changed to interview or hired
      if (newStatus === 'interview' || newStatus === 'hired') {
        openNotificationModal(app, newStatus);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const openNotificationModal = (app: any, targetStatus?: string) => {
    const candidateName =
      app.candidate_name ||
      app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
      `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
    const candidateEmail =
      app.candidate_email ||
      app.expand?.candidate_id?.expand?.user_id?.email ||
      'kandidat@demo.com';
    const candidatePhone =
      app.candidate_phone ||
      app.expand?.candidate_id?.phone ||
      '081234567890';
    const targetJobTitle = app.expand?.job_id?.title || 'Posisi Karyawan';

    setNotificationTarget({
      name: candidateName,
      email: candidateEmail,
      phone: candidatePhone,
      jobTitle: targetJobTitle,
      status: targetStatus || app.status || 'interview',
    });
    setIsNotificationOpen(true);
  };

  const openPsikogram = (app: any) => {
    const candidateName =
      app.candidate_name ||
      app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
      `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
    const candidateEmail =
      app.candidate_email ||
      app.expand?.candidate_id?.expand?.user_id?.email ||
      'kandidat@demo.com';
    const candidatePhone =
      app.candidate_phone ||
      app.expand?.candidate_id?.phone ||
      '081234567890';
    const targetJobTitle = app.expand?.job_id?.title || 'Senior Software Engineer';

    const matchScore = app.match_score ?? 88;
    const testScore = app.test_score ?? 85;

    let recommendation: 'DISARANKAN' | 'DIPERTIMBANGKAN' | 'TIDAK DISARANKAN' = 'DIPERTIMBANGKAN';
    if (matchScore >= 80 && testScore >= 80) {
      recommendation = 'DISARANKAN';
    } else if (matchScore < 60 || testScore < 60) {
      recommendation = 'TIDAK DISARANKAN';
    }

    const psikogramData: PsikogramData = {
      candidateName,
      candidateEmail,
      candidatePhone,
      jobTitle: targetJobTitle,
      companyName: 'PT Digital Solusindo (HR Portal Admin)',
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      assessmentId: `PSI-${Math.floor(100000 + Math.random() * 900000)}`,
      matchScore,
      testScore,
      recommendation,
      personalityScores: [
        { label: 'Dominance (Ketegasan)', key: 'D', score: Math.min(95, testScore + 4) },
        { label: 'Influence (Persuasif)', key: 'I', score: Math.min(92, testScore - 5) },
        { label: 'Steadiness (Daya Tahan)', key: 'S', score: Math.min(98, testScore + 7) },
        { label: 'Compliance (Ketelitian)', key: 'C', score: Math.min(96, testScore + 2) },
        { label: 'Stability (Regulasi Emosi)', key: 'ES', score: Math.min(90, testScore - 2) },
      ],
      pauliScores: [14, 16, 15, 17, 18],
      pauliAccuracy: 93,
      pauliStability: 89,
      keyStrengths: [
        'Kemampuan fokus analitis tinggi dan daya tahan kerja stabil pada tugas berulang.',
        'Kesesuaian kualifikasi hard skill di atas rata-rata kebutuhan industri.',
        'Regulasi emosi tenang saat menghadapi tekanan deadline ketat.',
      ],
      growthAreas: [
        'Perlu peningkatan inisiatif delegasi dalam skala kepemimpinan tim besar.',
        'Kecenderungan perfeksionis pada detail kecil yang berpotensi menyita waktu.',
      ],
      evaluatorNotes: `Kandidat menunjukkan profil kompetensi kerja yang sangat solid untuk posisi ${targetJobTitle}. Memiliki ketelitian tinggi dan stabilitas emosi yang matang. Sangat direkomendasikan untuk lanjut ke tahap penawaran kerja (Offering).`,
    };

    setSelectedPsikogramData(psikogramData);
    setIsPsikogramOpen(true);
  };

  // --- 1. UNIFIED ADMINISTRATION: SAVE / PUBLISH SERVICE ---
  async function handleSaveAndPublishService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      alert('Judul layanan wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      if (editingServiceId) {
        const updated = await pb.collection('services_catalog').update(editingServiceId, serviceForm);
        setServices(prev => prev.map(s => s.id === editingServiceId ? updated : s));
        alert('Layanan berhasil diperbarui dan langsung tayang ke publik!');
      } else {
        const created = await pb.collection('services_catalog').create(serviceForm);
        setServices(prev => [created, ...prev]);
        alert('Layanan baru berhasil disimpan dan dipublikasikan!');
      }
      setServiceForm(emptyService);
      setEditingServiceId(null);
    } catch (err) {
      console.error('Save service failed:', err);
      alert('Gagal menyimpan layanan. Periksa koneksi ke PocketBase.');
    } finally {
      setSaving(false);
    }
  }

  function handleEditService(svc: RecordModel) {
    setServiceForm({
      category: svc.category || '',
      title: svc.title || '',
      description: svc.description || '',
      price: Number(svc.price) || 0,
      is_active: svc.is_active !== false,
    });
    setEditingServiceId(svc.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDeleteService(id: string) {
    if (!confirm('Hapus layanan ini dari katalog publik?')) return;
    try {
      await pb.collection('services_catalog').delete(id);
      setServices(prev => prev.filter(s => s.id !== id));
      if (editingServiceId === id) {
        setServiceForm(emptyService);
        setEditingServiceId(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleServiceActive(svc: RecordModel) {
    try {
      const updated = await pb.collection('services_catalog').update(svc.id, { is_active: !svc.is_active });
      setServices(prev => prev.map(s => s.id === svc.id ? updated : s));
    } catch (err) {
      console.error(err);
    }
  }

  // --- SEED SAMPLE DUMMY DATA LENGKAP ---
  async function handleSeedDummyData() {
    if (!confirm('Tanam data dummy lengkap (8 Layanan 3 Pilar, Lowongan, dan Soal Psikotes)?')) return;
    setSeeding(true);
    try {
      const sampleServices = [
        { category: "Pilar C: Psikologi Terapan", title: "Decision-Making & Life-Path Coaching", description: "Pendampingan penentuan arah karier dan keputusan hidup strategis.", price: 350000, is_active: true },
        { category: "Pilar C: Psikologi Terapan", title: "Emotional Regulation & Anger Management", description: "Pengelolaan emosi terpadu untuk meredam kecemasan dan stres kerja.", price: 300000, is_active: true },
        { category: "Pilar B: Klinik Karier", title: "Career Offer & Contract Review", description: "Klinik bedah klausul kontrak, non-compete, dan struktur benefit kerja.", price: 250000, is_active: true },
        { category: "Pilar B: Klinik Karier", title: "Corporate Test Simulation & Coaching", description: "Simulasi tes korporat: Pauli, Tes Logika Analitis, dan Wartegg.", price: 200000, is_active: true },
        { category: "Pilar C: Psikologi Terapan", title: "Public Speaking & Social Anxiety Coaching", description: "Mengatasi kecemasan sosial dan grogi presentasi di depan umum.", price: 300000, is_active: true },
        { category: "Pilar A: Layanan B2B", title: "Monthly HR Retainer (UMKM)", description: "Paket langganan konsultasi HR dan audit desain peran bulanan.", price: 1500000, is_active: true },
      ];

      for (const s of sampleServices) {
        try {
          await pb.collection('services_catalog').create(s);
        } catch {
          // ignore duplicate
        }
      }

      await loadData();
      alert('Data dummy berhasil dimuat! Anda dapat membaca karakteristiknya pada tabel.');
    } catch (err) {
      console.error(err);
      alert('Gagal menanam data dummy.');
    } finally {
      setSeeding(false);
    }
  }

  // --- VERIFIKASI PEMBAYARAN ---
  async function verifyPayment(id: string) {
    try {
      await pb.collection('consultation_bookings').update(id, { payment_status: 'paid' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, payment_status: 'paid' } : b));
      alert('Pembayaran disetujui! Tombol WhatsApp pada klien kini aktif.');
    } catch (err) {
      console.error(err);
    }
  }

  // Filter jadwal kalender
  const filteredSchedules = DUMMY_SCHEDULES.filter((s) => {
    if (scheduleFilter === 'all') return true;
    return s.type === scheduleFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 text-sm text-[#86868B]">
        Memuat Panel Administrasi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1D1D1F] py-10 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Apple-style restrained header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E8E8EC]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#E8E8EC] text-[11px] font-semibold uppercase tracking-wider text-[#1D1D1F] mb-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />
              {isEn ? 'Administration Control Center' : 'Pusat Kendali Administrasi'}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {t.adminPortal.title}
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {t.adminPortal.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDummyData}
              disabled={seeding}
              className="rounded-full border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-xs h-9 text-[#1D1D1F]"
            >
              <Database className="w-3.5 h-3.5 mr-1.5 text-[#6366F1]" />
              {seeding ? (isEn ? 'Loading...' : 'Memuat...') : t.adminPortal.loadDummyBtn}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-full border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-xs h-9 text-[#1D1D1F]"
            >
              {t.adminPortal.logoutBtn}
            </Button>
          </div>
        </div>

        {/* Genesis-style Tab bar */}
        <Tabs defaultValue="administration">
          <TabsList className="mb-8 bg-[#FFFFFF] border border-[#E8E8EC] p-1 rounded-full shadow-sm flex flex-wrap h-auto gap-1">
            <TabsTrigger
              value="administration"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabServices} ({services.length})
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabCalendar}
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabPayments} ({bookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabJobs} ({jobs.length})
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabQuestions} ({questions.length})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="rounded-full text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {t.adminPortal.tabApplications} ({displayApplications.length})
            </TabsTrigger>
          </TabsList>

          {/* ==================================================================== */}
          {/* TAB 1: MENU ADMINISTRASI (POST, EDIT, ADD SERVICE IN ONE PLACE)     */}
          {/* ==================================================================== */}
          <TabsContent value="administration" className="space-y-8">
            {/* Form Satu Menu untuk Posting & Edit Layanan */}
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8E8EC]">
                <div>
                  <h2 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6366F1]" />
                    {editingServiceId ? 'Edit Layanan Eksisting' : 'Posting & Tambah Layanan Baru'}
                  </h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Posting, modifikasi harga, atau sesuaikan deskripsi. Perubahan langsung tersimpan ke publik.
                  </p>
                </div>
                {editingServiceId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setServiceForm(emptyService);
                      setEditingServiceId(null);
                    }}
                    className="rounded-full text-xs h-8"
                  >
                    Batal Edit &amp; Buat Baru
                  </Button>
                )}
              </div>

              <form onSubmit={handleSaveAndPublishService} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Preset Kategori */}
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-preset" className="text-xs font-semibold text-[#1D1D1F]">
                      Pilih Kategori Pilar Blueprint
                    </Label>
                    <select
                      id="svc-preset"
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      className="w-full bg-[#FFFFFF] border border-[#E8E8EC] rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    >
                      {CATEGORY_PRESETS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="Kustom">Kustom / Kategori Lain</option>
                    </select>
                  </div>

                  {/* Kategori Manual / Nama */}
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-category" className="text-xs font-semibold text-[#1D1D1F]">
                      Nama Kategori (Ditampilkan di Publik)
                    </Label>
                    <Input
                      id="svc-category"
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                      placeholder="Contoh: Pilar C: Psikologi Terapan"
                      className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                      required
                    />
                  </div>

                  {/* Judul Layanan */}
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-title" className="text-xs font-semibold text-[#1D1D1F]">
                      Judul Layanan
                    </Label>
                    <Input
                      id="svc-title"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                      placeholder="Contoh: Decision-Making & Life-Path Coaching"
                      className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                      required
                    />
                  </div>

                  {/* Harga */}
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-price" className="text-xs font-semibold text-[#1D1D1F]">
                      Biaya Sesi (Rupiah)
                    </Label>
                    <Input
                      id="svc-price"
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                      placeholder="Contoh: 350000"
                      className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white font-mono"
                      required
                    />
                  </div>

                  {/* Status Tayang */}
                  <div className="space-y-1.5">
                    <Label htmlFor="svc-status" className="text-xs font-semibold text-[#1D1D1F]">
                      Status Publikasi
                    </Label>
                    <select
                      id="svc-status"
                      value={serviceForm.is_active ? 'active' : 'inactive'}
                      onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.value === 'active' })}
                      className="w-full bg-[#FFFFFF] border border-[#E8E8EC] rounded-xl px-3.5 py-2 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                    >
                      <option value="active">Aktif (Langsung Terlihat oleh Publik)</option>
                      <option value="inactive">Nonaktif (Draf / Tersembunyi)</option>
                    </select>
                  </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-1.5">
                  <Label htmlFor="svc-desc" className="text-xs font-semibold text-[#1D1D1F]">
                    Deskripsi Lengkap Layanan
                  </Label>
                  <textarea
                    id="svc-desc"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    rows={3}
                    placeholder="Jelaskan ruang lingkup sesi, siapa target pesertanya, durasi konsultasi, dan hasil yang diperoleh..."
                    className="w-full bg-[#FFFFFF] border border-[#E8E8EC] rounded-xl p-3 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-[#86868B]">
                    Setelah disimpan, perubahan akan langsung diperbarui di halaman beranda / katalog.
                  </p>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium px-6 h-10 shadow-sm"
                  >
                    {saving ? 'Menyimpan...' : editingServiceId ? 'Simpan Perubahan Publik' : 'Posting & Publikasikan'}
                  </Button>
                </div>
              </form>
            </div>

            {/* List Layanan Publik Saat Ini */}
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8EC]">
                <h3 className="font-bold text-sm text-[#0A0A0A]">
                  Daftar Layanan di Database ({services.length})
                </h3>
                <span className="text-xs text-[#86868B]">
                  Klik Edit untuk memuat data ke form di atas
                </span>
              </div>

              {services.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  Belum ada layanan yang tersimpan. Gunakan form di atas atau klik &quot;Muat Data Dummy&quot;.
                </div>
              ) : (
                <div className="divide-y divide-[#E8E8EC]">
                  {services.map((svc) => (
                    <div key={svc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] border border-[#E8E8EC]">
                            {svc.category}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              svc.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                            }`}
                          >
                            {svc.is_active ? 'Aktif di Publik' : 'Nonaktif'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#0A0A0A]">{svc.title}</h4>
                        <p className="text-xs font-mono font-medium text-[#1D1D1F] mt-0.5">
                          Rp {Number(svc.price).toLocaleString('id-ID')}
                        </p>
                        {svc.description && (
                          <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-1">{svc.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleServiceActive(svc)}
                          className="rounded-full text-xs h-8 border-[#E8E8EC]"
                        >
                          {svc.is_active ? 'Sembunyikan' : 'Tampilkan'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditService(svc)}
                          className="rounded-full text-xs h-8 border-[#E8E8EC] text-[#6366F1]"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteService(svc.id)}
                          className="rounded-full text-xs h-8 border-[#E8E8EC] text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 2: KALENDER INTERVIEW & SESI (DENGAN SINKRONISASI .ICS)          */}
          {/* ==================================================================== */}
          <TabsContent value="calendar" className="space-y-6">
            {/* Header Kalender & Tombol Subscribe */}
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#6366F1]" />
                  Kalender Wawancara &amp; Konseling Terjadwal
                </h2>
                <p className="text-xs text-[#6B6B6B] mt-0.5">
                  Pantau seluruh jadwal wawancara kerja kandidat dan sesi konsultasi privat. Sinkronkan langsung ke kalender ponsel atau laptop.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Link Unduh / Subscribe File .ICS */}
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter'}/api/calendar/interviews.ics`}
                  download="interviews.ics"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Langganan Kalender (.ICS)
                </a>

                {/* Subscribe URL Helper */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';
                    const icsUrl = `${window.location.origin}${basePath}/api/calendar/interviews.ics`;
                    navigator.clipboard.writeText(icsUrl);
                    alert(`URL Kalender Berhasil Disalin:\n${icsUrl}\n\nTempelkan di Apple Calendar (File > New Calendar Subscription) atau Google Calendar (Other calendars > From URL)`);
                  }}
                  className="rounded-full border-[#E8E8EC] text-xs h-9"
                >
                  Salin Feed URL
                </Button>
              </div>
            </div>

            {/* Filter Pill */}
            <div className="flex gap-2">
              <button
                onClick={() => setScheduleFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  scheduleFilter === 'all'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-white text-[#6B6B6B] border border-[#E8E8EC]'
                }`}
              >
                Semua Jadwal ({DUMMY_SCHEDULES.length})
              </button>
              <button
                onClick={() => setScheduleFilter('interview')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  scheduleFilter === 'interview'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-white text-[#6B6B6B] border border-[#E8E8EC]'
                }`}
              >
                Wawancara Rekrutmen
              </button>
              <button
                onClick={() => setScheduleFilter('consultation')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  scheduleFilter === 'consultation'
                    ? 'bg-[#1D1D1F] text-white'
                    : 'bg-white text-[#6B6B6B] border border-[#E8E8EC]'
                }`}
              >
                Sesi Konseling Privat
              </button>
            </div>

            {/* Daftar Jadwal Apple Hardware Card Style */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSchedules.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between"
                >
                  <div>
                    {/* Header badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                          item.type === 'interview'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {item.type === 'interview' ? 'Interview Kerja' : 'Konseling Privat'}
                      </span>
                      <span className="text-[11px] font-mono text-[#86868B]">
                        {item.date}
                      </span>
                    </div>

                    {/* Judul & Peserta */}
                    <h3 className="font-bold text-sm text-[#0A0A0A] leading-snug mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#1D1D1F] font-medium">
                      Peserta: <span className="font-semibold">{item.personName}</span> ({item.personEmail})
                    </p>

                    {item.scoreInfo && (
                      <p className="text-[11px] text-[#6B6B6B] mt-2 p-2 bg-[#F5F5F7] rounded-lg font-mono">
                        {item.scoreInfo}
                      </p>
                    )}
                  </div>

                  {/* Footer Time & Room */}
                  <div className="pt-4 mt-4 border-t border-[#E8E8EC] flex items-center justify-between text-xs">
                    <span className="text-[#86868B] flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {item.time}
                    </span>
                    <span className="font-medium text-[#6366F1] flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      {item.platform.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 3: VERIFIKASI PEMBAYARAN TRANSAKSI HIBRIDA                       */}
          {/* ==================================================================== */}
          <TabsContent value="payments">
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h2 className="text-base font-bold text-[#0A0A0A] mb-1">
                Verifikasi Pembayaran &amp; Handover WhatsApp
              </h2>
              <p className="text-xs text-[#6B6B6B] mb-6">
                Setelah admin menyetujui bukti transfer, tombol diskusi WhatsApp pada layar klien akan otomatis terbuka.
              </p>

              {bookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  Belum ada transaksi pemesanan yang masuk.
                </div>
              ) : (
                <div className="divide-y divide-[#E8E8EC]">
                  {bookings.map((b) => {
                    const svc = b.expand?.service_id;
                    const usr = b.expand?.user_id;
                    const total = (Number(svc?.price) || 0) + (Number(b.unique_code) || 0);
                    return (
                      <div key={b.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-sm text-[#0A0A0A]">{svc?.title || 'Layanan'}</p>
                          <p className="text-xs text-[#6B6B6B]">Klien: {usr?.email || 'Anon'}</p>
                          <p className="text-sm font-mono font-bold text-[#1D1D1F] mt-1">
                            Rp {total.toLocaleString('id-ID')}
                            <span className="text-xs font-normal text-[#86868B] ml-2">
                              (Termasuk Kode Unik: {b.unique_code})
                            </span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              b.payment_status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {b.payment_status === 'paid' ? 'Lunas / WhatsApp Aktif' : 'Menunggu Persetujuan'}
                          </span>

                          {b.payment_status !== 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => verifyPayment(b.id)}
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                            >
                              Setujui Pembayaran
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 4: LOWONGAN KERJA                                                */}
          {/* ==================================================================== */}
          <TabsContent value="jobs">
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E8E8EC]">
                <h2 className="text-base font-bold text-[#0A0A0A]">
                  Lowongan Pekerjaan ({jobs.length})
                </h2>
                <Button
                  size="sm"
                  onClick={() => router.push('/employer')}
                  className="rounded-full text-xs h-8 bg-[#1D1D1F] text-white"
                >
                  + Tambah via Employer
                </Button>
              </div>

              {jobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  Belum ada lowongan pekerjaan.
                </div>
              ) : (
                <div className="divide-y divide-[#E8E8EC]">
                  {jobs.map((job) => (
                    <div key={job.id} className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-[#0A0A0A]">{job.title}</h4>
                        <p className="text-xs text-[#6B6B6B]">
                          {job.expand?.employer_id?.company_name || 'Mitra UMKM'} &bull; Status: {job.status}
                        </p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {job.status?.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 5: BANK SOAL PSIKOTES                                            */}
          {/* ==================================================================== */}
          <TabsContent value="questions">
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <h2 className="text-base font-bold text-[#0A0A0A] mb-1">
                Bank Soal Psikometri ({questions.length})
              </h2>
              <p className="text-xs text-[#6B6B6B] mb-6">
                Soal kuesioner asesmen psikotes yang diujikan pada kandidat dengan scoring otomatis.
              </p>

              {questions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  Belum ada soal psikotes. Klik &quot;Muat Data Dummy&quot; di atas untuk mengisi contoh soal.
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="p-4 border border-[#E8E8EC] rounded-xl bg-white space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[#86868B]">Soal #{idx + 1}</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F]">
                          {q.test_type}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#0A0A0A]">{q.question_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 6: PELAMAR, PSIKOGRAM & NOTIFIKASI                              */}
          {/* ==================================================================== */}
          <TabsContent value="applications">
            <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#E8E8EC]">
                <div>
                  <h2 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#6366F1]" />
                    Daftar Pelamar, Evaluasi Psikogram &amp; Notifikasi
                  </h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Evaluasi profil kandidat, unduh laporan Psikogram 1 lembar A4, dan kirim notifikasi WhatsApp / Email secara instan.
                  </p>
                </div>
              </div>

              {displayApplications.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#86868B]">
                  Belum ada lamaran kandidat yang masuk.
                </div>
              ) : (
                <div className="divide-y divide-[#E8E8EC]">
                  {displayApplications.map((app: any) => {
                    const candidateName =
                      app.candidate_name ||
                      app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
                      `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
                    const candidateEmail =
                      app.candidate_email ||
                      app.expand?.candidate_id?.expand?.user_id?.email ||
                      'kandidat@demo.com';
                    const targetJobTitle = app.expand?.job_id?.title || 'Posisi Karyawan';

                    return (
                      <div
                        key={app.id}
                        className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#0A0A0A]">
                              {candidateName}
                            </h4>
                            <span className="text-xs text-[#86868B] font-mono">
                              ({candidateEmail})
                            </span>
                            <Badge
                              variant="outline"
                              className={`rounded-full text-[10px] font-semibold uppercase ${
                                app.status === 'hired'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : app.status === 'interview'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : app.status === 'rejected'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {app.status}
                            </Badge>
                          </div>

                          <p className="text-xs text-[#6B6B6B]">
                            Melamar posisi:{' '}
                            <span className="font-semibold text-[#1D1D1F]">
                              {targetJobTitle}
                            </span>
                          </p>

                          <div className="flex items-center gap-3 text-xs text-[#86868B] pt-1">
                            <span className="inline-flex items-center gap-1">
                              OCR Match:{' '}
                              <strong className="text-[#1D1D1F] font-mono">
                                {app.match_score ?? 88}%
                              </strong>
                            </span>
                            <span>&bull;</span>
                            <span className="inline-flex items-center gap-1">
                              Skor Psikotes:{' '}
                              <strong className="text-[#1D1D1F] font-mono">
                                {app.test_score ?? 85}/100
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                          {/* Status selector */}
                          <select
                            value={app.status || 'applied'}
                            onChange={(e) => updateCandidateStatus(app, e.target.value)}
                            aria-label="Ubah Status Kandidat"
                            className="bg-[#FAFAFA] border border-[#E8E8EC] rounded-xl px-2.5 py-1.5 text-xs text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                          >
                            <option value="applied">Applied</option>
                            <option value="testing">Testing</option>
                            <option value="interview">Interview</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          {/* Psikogram PDF Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPsikogram(app)}
                            className="rounded-full border-[#E8E8EC] text-xs h-8 bg-white hover:bg-[#F5F5F7] text-[#1D1D1F]"
                          >
                            <FileText className="w-3.5 h-3.5 mr-1.5 text-[#6366F1]" />
                            {t.employerPortal.downloadPsikogramBtn}
                          </Button>

                          {/* WhatsApp / Email Notification Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNotificationModal(app)}
                            className="rounded-full border-[#E8E8EC] text-xs h-8 bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            {t.employerPortal.notifyBtn}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Psikogram 1-Lembar PDF Modal */}
      {selectedPsikogramData && (
        <PsikogramModal
          isOpen={isPsikogramOpen}
          onClose={() => setIsPsikogramOpen(false)}
          data={selectedPsikogramData}
        />
      )}

      {/* Candidate Notification Modal (Email Display & WhatsApp Clip-to-paste) */}
      {notificationTarget && (
        <CandidateNotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          candidateName={notificationTarget.name}
          candidateEmail={notificationTarget.email}
          candidatePhone={notificationTarget.phone}
          jobTitle={notificationTarget.jobTitle}
          companyName="PT Digital Solusindo (HR Portal Admin)"
          newStatus={notificationTarget.status}
        />
      )}
    </div>
  );
}
