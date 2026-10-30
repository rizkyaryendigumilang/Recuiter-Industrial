'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RecordModel } from 'pocketbase';
import {
  FileText,
  Printer,
  MessageCircle,
  Mail,
  Send,
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Download,
  LayoutGrid,
  List,
  ArrowRight,
  ArrowLeft,
  MoveRight,
  UserCheck,
  XCircle,
  HelpCircle,
  Calendar,
  CheckSquare,
  Square,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import type { PsikogramData } from '@/components/assessment/psikogram-modal';
import { useLanguage } from '@/lib/language-context';

// Dynamic lazy-loaded modals to shrink initial JS bundle and boost FCP/TTI
const PsikogramModal = dynamic(
  () => import('@/components/assessment/psikogram-modal').then((mod) => mod.PsikogramModal),
  { ssr: false }
);

const CandidateNotificationModal = dynamic(
  () => import('@/components/employer/candidate-notification-modal').then((mod) => mod.CandidateNotificationModal),
  { ssr: false }
);


// Sample fallback applications for employer testing
const SAMPLE_APPLICATIONS = [
  {
    id: 'app-sample-1',
    candidate_id: 'cand-01',
    job_id: 'job-01',
    match_score: 94,
    test_score: 88,
    status: 'interview',
    created: '2026-10-12',
    candidate_name: 'Rizky Pratama, S.T.',
    candidate_email: 'rizky.pratama@gmail.com',
    candidate_phone: '081234567890',
    expand: {
      job_id: {
        title: 'Teknisi Maintenance Mesin PLC & CNC',
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
        title: 'Staff HR & Industrial Relations',
      },
    },
  },
  {
    id: 'app-sample-3',
    candidate_id: 'cand-03',
    job_id: 'job-01',
    match_score: 96,
    test_score: 92,
    status: 'hired',
    created: '2026-10-14',
    candidate_name: 'Bayu Wicaksono (Ahli K3 Umum)',
    candidate_email: 'bayu.wicaksono@gmail.com',
    candidate_phone: '081345678901',
    expand: {
      job_id: {
        title: 'Officer K3 & Lingkungan Pabrik (HSE)',
      },
    },
  },
  {
    id: 'app-sample-4',
    candidate_id: 'cand-04',
    job_id: 'job-01',
    match_score: 74,
    test_score: 72,
    status: 'applied',
    created: '2026-10-14',
    candidate_name: 'Hendro Prasetyo (SIO Forklift)',
    candidate_email: 'hendro.prasetyo@gmail.com',
    candidate_phone: '081289012345',
    expand: {
      job_id: {
        title: 'Operator Forklift Gudang Raw Material',
      },
    },
  },
];

export default function EmployerDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, role } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const [employer, setEmployer] = useState<RecordModel | null>(null);
  const [jobs, setJobs] = useState<RecordModel[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: 'kanban' or 'list'
  const [pipelineView, setPipelineView] = useState<'kanban' | 'list'>('kanban');

  // Drag and drop state
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  // Form profile employer
  const [companyName, setCompanyName] = useState('PT Industri Manufaktur Presisi');
  const [businessSector, setBusinessSector] = useState('Manufaktur & Fabrikasi Logam');

  // Form buat lowongan
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);

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

  // Batch Multi-Select ATS State
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  // Interview Scheduler State
  const [isInterviewOpen, setIsInterviewOpen] = useState(false);
  const [interviewApp, setInterviewApp] = useState<any>(null);
  const [interviewDate, setInterviewDate] = useState('2026-10-30');
  const [interviewTime, setInterviewTime] = useState('09:00 WIB');
  const [interviewLocation, setInterviewLocation] = useState('Head Office / Google Meet');
  const [interviewNotes, setInterviewNotes] = useState('Harap membawa berkas sertifikasi dan CV terbaru.');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (role !== 'employer' && role !== 'admin') {
      router.push('/candidate');
      return;
    }

    loadEmployerData();
  }, [isLoggedIn, role]);

  async function loadEmployerData() {
    setLoading(true);
    try {
      if (pb.authStore.record?.id) {
        let empRecord: RecordModel | null = null;
        try {
          const found = await pb.collection('employers').getFirstListItem(`user_id = "${pb.authStore.record.id}"`);
          empRecord = found;
          setEmployer(found);
          setCompanyName(found.company_name || 'PT Industri Manufaktur Presisi');
          setBusinessSector(found.business_sector || 'Manufaktur & Fabrikasi Logam');
        } catch {
          empRecord = null;
          setEmployer(null);
        }

        if (empRecord) {
          const myJobs = await pb.collection('job_postings').getFullList({
            filter: `employer_id = "${empRecord.id}"`,
            sort: '-created',
          });
          setJobs(myJobs);

          if (myJobs.length > 0) {
            const jobIds = myJobs.map((j) => `job_id = "${j.id}"`).join(' || ');
            const apps = await pb.collection('job_applications').getFullList({
              filter: jobIds,
              expand: 'job_id,candidate_id.user_id',
              sort: '-created',
            });
            setApplications(apps.length > 0 ? apps : SAMPLE_APPLICATIONS);
          } else {
            setApplications(SAMPLE_APPLICATIONS);
          }
        } else {
          setApplications(SAMPLE_APPLICATIONS);
        }
      } else {
        setApplications(SAMPLE_APPLICATIONS);
      }
    } catch (err) {
      console.error('Error load employer data:', err);
      setApplications(SAMPLE_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  }

  async function saveEmployerProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;
    try {
      if (employer) {
        const updated = await pb.collection('employers').update(employer.id, {
          company_name: companyName,
          business_sector: businessSector,
        });
        setEmployer(updated);
      } else if (pb.authStore.record?.id) {
        const created = await pb.collection('employers').create({
          user_id: pb.authStore.record.id,
          company_name: companyName,
          business_sector: businessSector,
          retainer_active: false,
          credit_balance: 5,
        });
        setEmployer(created);
      }
      alert('Profil perusahaan berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan profil perusahaan.');
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    setIsCreatingJob(true);
    try {
      const kwArray = keywords.split(',').map((s) => s.trim()).filter(Boolean);
      const newJob = {
        employer_id: employer?.id || 'demo-employer',
        title: jobTitle,
        description: jobDesc,
        requirements_keywords: kwArray,
        status: 'open',
        is_featured: false,
      };

      if (employer?.id) {
        await pb.collection('job_postings').create(newJob);
      }

      setJobs((prev) => [newJob as any, ...prev]);
      setJobTitle('');
      setJobDesc('');
      setKeywords('');
      alert('Lowongan berhasil dipublikasikan!');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat lowongan.');
    } finally {
      setIsCreatingJob(false);
    }
  }

  // Handle status update and trigger notification modal
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

  // Toggle selection for batch actions
  const toggleSelectApp = (id: string) => {
    setSelectedAppIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch status updater
  const handleBatchStatus = async (newStatus: string) => {
    if (selectedAppIds.length === 0) return;
    try {
      for (const id of selectedAppIds) {
        const app = applications.find((a) => a.id === id);
        if (app && app.id && !app.id.startsWith('app-sample-')) {
          await pb.collection('job_applications').update(app.id, { status: newStatus });
        }
      }
      setApplications((prev) =>
        prev.map((a) => (selectedAppIds.includes(a.id) ? { ...a, status: newStatus } : a))
      );
      setSelectedAppIds([]);
    } catch (e) {
      console.error(e);
    }
  };

  const openInterviewModal = (app: any) => {
    setInterviewApp(app);
    setIsInterviewOpen(true);
  };

  const generateWhatsAppInterview = () => {
    if (!interviewApp) return;
    const cName = interviewApp.candidate_name || 'Kandidat';
    const jTitle = interviewApp.expand?.job_id?.title || 'Posisi Karyawan';
    const text = encodeURIComponent(
      `Halo ${cName},\n\nSelamat! Anda diundang ke tahap Wawancara Kerja untuk posisi *${jTitle}* di *${companyName}*.\n\n📅 Tanggal: ${interviewDate}\n⏰ Waktu: ${interviewTime}\n📍 Lokasi/Tautan: ${interviewLocation}\n📝 Catatan: ${interviewNotes}\n\nMohon konfirmasi kehadiran Anda dengan membalas pesan ini. Terima kasih.\n*Tim Rekruter Industrial*`
    );
    const phone = interviewApp.candidate_phone || '6281234567890';
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  /**
   * Poin 3: Export candidate pipeline data to Excel / CSV (.csv with UTF-8 BOM)
   */
  const exportToCsv = () => {
    if (applications.length === 0) {
      alert(isEn ? 'No candidates to export.' : 'Tidak ada data kandidat untuk diekspor.');
      return;
    }

    const headers = [
      'Nama Kandidat',
      'Email',
      'Nomor WhatsApp',
      'Posisi Pekerjaan',
      'Skor OCR Match (%)',
      'Skor Psikotes (/100)',
      'Status Seleksi',
      'Tanggal Lamaran',
    ];

    const rows = applications.map((app) => {
      const cName =
        app.candidate_name ||
        app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
        `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
      const cEmail =
        app.candidate_email ||
        app.expand?.candidate_id?.expand?.user_id?.email ||
        '-';
      const cPhone =
        app.candidate_phone ||
        app.expand?.candidate_id?.phone ||
        '-';
      const jTitle = app.expand?.job_id?.title || 'Posisi Karyawan';
      const ocrScore = app.match_score ?? '-';
      const testScore = app.test_score ?? 'Belum Ujian';
      const statusText =
        app.status === 'applied' ? '1. Screening (Applied)' :
        app.status === 'testing' ? '2. Tes Psikotes' :
        app.status === 'interview' ? '3. Wawancara' :
        app.status === 'hired' ? '4. Diterima' :
        app.status === 'rejected' ? '5. Tidak Lolos' : app.status;
      const dateText = app.created ? new Date(app.created).toLocaleDateString('id-ID') : '-';

      return [
        `"${cName.replace(/"/g, '""')}"`,
        `"${cEmail.replace(/"/g, '""')}"`,
        `"${cPhone.replace(/"/g, '""')}"`,
        `"${jTitle.replace(/"/g, '""')}"`,
        `"${ocrScore}"`,
        `"${testScore}"`,
        `"${statusText}"`,
        `"${dateText}"`,
      ].join(',');
    });

    // Prepend UTF-8 Byte Order Mark (\uFEFF) so Microsoft Excel opens cleanly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const cleanCompName = (companyName || 'Perusahaan').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `Pipeline_Pelamar_${cleanCompName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    const app = applications.find((a) => a.id === appId);
    if (app && app.status !== targetStatus) {
      updateCandidateStatus(app, targetStatus);
    }
    setDraggedAppId(null);
  };

  // Open Notification Modal
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

  // Open Psikogram PDF Modal
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
    const targetJobTitle = app.expand?.job_id?.title || 'Teknisi Maintenance Mesin';

    const matchScore = app.match_score ?? 88;
    const testScore = app.test_score ?? 85;

    // Recommendation logic:
    let recommendation: 'DISARANKAN' | 'DIPERTIMBANGKAN' | 'TIDAK DISARANKAN' = 'DIPERTIMBANGKAN';
    if (matchScore >= 80 && testScore >= 80) {
      recommendation = 'DISARANKAN';
    } else if (matchScore < 60 || testScore < 60) {
      recommendation = 'TIDAK DISARANKAN';
    }

    // Check for saved psychometric details
    const details = app.psychometric_details || {};
    if (details.recommendation) {
      if (details.recommendation.includes('Direkomendasikan')) recommendation = 'DISARANKAN';
      else if (details.recommendation.includes('Tidak')) recommendation = 'TIDAK DISARANKAN';
      else recommendation = 'DIPERTIMBANGKAN';
    }

    const personalityScores = Array.isArray(details.disc_dimensions) && details.disc_dimensions.length > 0
      ? details.disc_dimensions
      : [
          { label: 'Dominance (Ketegasan)', key: 'D', score: Math.min(95, testScore + 4) },
          { label: 'Influence (Persuasif)', key: 'I', score: Math.min(92, testScore - 5) },
          { label: 'Steadiness (Daya Tahan)', key: 'S', score: Math.min(98, testScore + 7) },
          { label: 'Compliance (Ketelitian)', key: 'C', score: Math.min(96, testScore + 2) },
          { label: 'Stability (Regulasi Emosi)', key: 'ES', score: Math.min(90, testScore - 2) },
        ];

    const pauliScores = Array.isArray(details.column_speeds) && details.column_speeds.length > 0
      ? details.column_speeds
      : [14, 16, 15, 17, 18];

    const pauliAccuracy = details.tianker || 93;
    const pauliStability = details.janker || 89;

    const psikogramData: PsikogramData = {
      candidateName,
      candidateEmail,
      candidatePhone,
      jobTitle: targetJobTitle,
      companyName: companyName || 'PT Industri Manufaktur Presisi',
      date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      assessmentId: `PSI-${Math.floor(100000 + Math.random() * 900000)}`,
      matchScore,
      testScore,
      recommendation,
      personalityScores,
      pauliScores,
      pauliAccuracy,
      pauliStability,
      keyStrengths: [
        'Kemampuan fokus analitis tinggi dan daya tahan kerja stabil pada tugas berulang & shift pabrik.',
        'Kesesuaian kualifikasi hard skill teknik manufaktur terverifikasi di atas rata-rata industri.',
        'Regulasi emosi tenang saat menghadapi target output produksi yang ketat.',
      ],
      growthAreas: [
        'Perlu peningkatan inisiatif delegasi dalam skala kepemimpinan regu lini produksi.',
        'Kecenderungan perfeksionis pada detail kalibrasi yang membutuhkan manajemen waktu seimbang.',
      ],
      evaluatorNotes: `Kandidat menunjukkan profil kompetensi kerja yang solid untuk posisi ${targetJobTitle}. Memiliki ketelitian tinggi dan kepatuhan standar K3 Kemnaker yang baik. Disarankan untuk tahap wawancara teknis plant.`,
    };

    setSelectedPsikogramData(psikogramData);
    setIsPsikogramOpen(true);
  };

  // Pipeline stages definition
  const STAGES = [
    {
      key: 'applied',
      label: isEn ? '1. Applied (Screening)' : '1. Screening Berkas',
      color: 'bg-neutral-100 text-neutral-800 border-neutral-300',
      badgeColor: 'bg-neutral-200 text-neutral-800',
      dropBg: 'hover:bg-neutral-50/80',
    },
    {
      key: 'testing',
      label: isEn ? '2. Testing (Psychotest)' : '2. Uji Psikotes & Kraepelin',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeColor: 'bg-blue-100 text-blue-800',
      dropBg: 'hover:bg-blue-50/40',
    },
    {
      key: 'interview',
      label: isEn ? '3. Interview (HR/User)' : '3. Wawancara HR/User',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      badgeColor: 'bg-purple-100 text-purple-800',
      dropBg: 'hover:bg-purple-50/40',
    },
    {
      key: 'hired',
      label: isEn ? '4. Hired (Offering)' : '4. Diterima Kerja',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      dropBg: 'hover:bg-emerald-50/40',
    },
    {
      key: 'rejected',
      label: isEn ? '5. Rejected' : '5. Tidak Lolos',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      badgeColor: 'bg-rose-100 text-rose-800',
      dropBg: 'hover:bg-rose-50/40',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 sm:px-6 text-neutral-900 font-sans">
      <div className="container mx-auto max-w-6xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E8E8EC]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                {isEn ? 'Industrial ATS Dashboard' : 'Pilar A • Portal Rekrutmen Industri'}
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {isEn ? 'B2B Enterprise HR' : 'B2B Enterprise HR'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {t.employerPortal.title}
            </h1>
            <p className="text-xs text-[#6B6B6B] mt-0.5">
              {companyName} &bull; {isEn ? 'Sector:' : 'Sektor:'} {businessSector}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tombol Ekspor CSV Pipeline */}
            <Button
              onClick={exportToCsv}
              variant="outline"
              size="sm"
              className="rounded-lg text-xs h-9 bg-white border-[#E8E8EC] text-neutral-800 hover:bg-neutral-50 flex items-center gap-1.5 font-medium shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-neutral-600" />
              {isEn ? 'Export to Excel (.CSV)' : 'Ekspor Pipeline ke Excel (.CSV)'}
            </Button>

            <Badge variant="outline" className="text-xs font-normal">
              {isEn ? 'Assessment Credits:' : 'Kredit Asesmen:'} {employer?.credit_balance ?? 5}
            </Badge>
            <Badge variant={employer?.retainer_active ? 'default' : 'secondary'} className="text-xs">
              {employer?.retainer_active ? (isEn ? 'HR Retainer Active' : 'HR Retainer Aktif') : (isEn ? 'Regular' : 'Reguler')}
            </Badge>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="candidates">
          <TabsList className="mb-6 bg-white border border-[#E8E8EC] p-1 rounded-xl shadow-xs flex flex-wrap h-auto gap-1">
            <TabsTrigger
              value="candidates"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2 transition-colors duration-150"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {t.employerPortal.tabApplicants} ({applications.length})
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2 transition-colors duration-150"
            >
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              {isEn ? 'My Openings' : 'Lowongan Saya'} ({jobs.length})
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2 transition-colors duration-150"
            >
              + {t.employerPortal.tabCreateJob}
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-lg text-xs font-medium data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white px-4 py-2 transition-colors duration-150"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {t.employerPortal.tabProfile}
            </TabsTrigger>
          </TabsList>

          {/* ==================================================================== */}
          {/* TAB 1: PELAMAR MASUK + ATS KANBAN BOARD + EXCEL EXPORT               */}
          {/* ==================================================================== */}
          <TabsContent value="candidates" className="space-y-4">
            <div className="bg-white border border-[#E8E8EC] rounded-3xl p-6 shadow-sm">
              {/* Top Pipeline Bar & View Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E8E8EC]">
                <div>
                  <h2 className="text-base font-bold text-[#0A0A0A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#6366F1]" />
                    {isEn ? 'Recruitment Pipeline & ATS Tracking' : 'Pipeline Rekrutmen & Pemantauan ATS'}
                  </h2>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    {isEn
                      ? 'Drag-and-drop candidates between recruitment stages, download 1-page psychograms, or export full pipeline.'
                      : 'Tarik & lepas kartu pelamar antar tahapan seleksi, unduh psikogram 1 lembar PDF, atau ekspor laporan ke Excel.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Switcher: Kanban vs List */}
                  <div className="flex items-center bg-[#F4F4F6] p-1 rounded-xl border border-neutral-200">
                    <button
                      onClick={() => setPipelineView('kanban')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        pipelineView === 'kanban'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Kanban ATS
                    </button>
                    <button
                      onClick={() => setPipelineView('list')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        pipelineView === 'list'
                          ? 'bg-white text-neutral-900 shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Daftar Tabel
                    </button>
                  </div>
                </div>
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#86868B]">
                  Belum ada kandidat yang melamar pada lowongan Anda.
                </div>
              ) : pipelineView === 'kanban' ? (
                /* ==================================================================== */
                /* POIN 2: ATS KANBAN BOARD VIEW (5 STAGES)                             */
                /* ==================================================================== */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                    <span>Tips: Tarik &amp; lepas (drag &amp; drop) kartu kandidat untuk memindahkan status seleksi secara instan.</span>
                    <span className="font-medium text-neutral-700">{applications.length} Total Kandidat</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
                    {STAGES.map((stage, stageIdx) => {
                      const stageApps = applications.filter((a) => (a.status || 'applied') === stage.key);

                      return (
                        <div
                          key={stage.key}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, stage.key)}
                          className={`flex flex-col rounded-2xl border border-[#E8E8EC] bg-[#FAFAFA] min-h-[500px] transition-colors p-3 ${stage.dropBg}`}
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E8E8EC]">
                            <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                              {stage.label}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${stage.badgeColor}`}>
                              {stageApps.length}
                            </span>
                          </div>

                          {/* Column Cards */}
                          <div className="space-y-2.5 flex-1">
                            {stageApps.map((app) => {
                              const cName =
                                app.candidate_name ||
                                app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
                                `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
                              const cPhone =
                                app.candidate_phone ||
                                app.expand?.candidate_id?.phone ||
                                '081234567890';
                              const jTitle = app.expand?.job_id?.title || 'Posisi Karyawan';

                              return (
                                <div
                                  key={app.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, app.id)}
                                  className="p-3.5 rounded-xl bg-white border border-[#E8E8EC] shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-neutral-300 transition-all cursor-grab active:cursor-grabbing space-y-2.5 gpu-layer will-animate"
                                >
                                  {/* Candidate Header with Multi-Select Checkbox */}
                                  <div>
                                    <div className="flex items-start justify-between gap-1.5">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <input
                                          type="checkbox"
                                          checked={selectedAppIds.includes(app.id)}
                                          onChange={(e) => {
                                            e.stopPropagation();
                                            toggleSelectApp(app.id);
                                          }}
                                          className="rounded border-neutral-300 text-indigo-600 h-3.5 w-3.5 cursor-pointer shrink-0"
                                        />
                                        <h4 className="font-bold text-xs text-neutral-900 leading-tight truncate">
                                          {cName}
                                        </h4>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-neutral-600 truncate mt-0.5 font-medium pl-5">
                                      {jTitle}
                                    </p>
                                  </div>

                                  {/* Score Badges */}
                                  <div className="flex items-center gap-1.5 text-[10px] pl-5">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-mono font-semibold">
                                      OCR: {app.match_score ? `${app.match_score}%` : 'N/A'}
                                    </span>
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-mono font-semibold">
                                      Tes: {app.test_score ?? 'N/A'}
                                    </span>
                                  </div>

                                  {/* Quick Stage Controls with enlarged 36px touch targets */}
                                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                                    {stageIdx > 0 ? (
                                      <button
                                        onClick={() => updateCandidateStatus(app, STAGES[stageIdx - 1].key)}
                                        title="Pindah ke tahap sebelumnya"
                                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 active:scale-90 transition-transform cursor-pointer"
                                      >
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                      </button>
                                    ) : <span className="w-8" />}

                                    <div className="flex items-center gap-1">
                                      {/* Interview Scheduler Button */}
                                      <button
                                        onClick={() => openInterviewModal(app)}
                                        title="Jadwalkan Wawancara"
                                        className="h-8 w-8 rounded-lg flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 active:scale-90 transition-transform cursor-pointer"
                                      >
                                        <Calendar className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Psikogram Button */}
                                      <button
                                        onClick={() => openPsikogram(app)}
                                        title="Unduh Psikogram PDF"
                                        className="h-8 w-8 rounded-lg flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-[#6366F1] border border-indigo-200 active:scale-90 transition-transform cursor-pointer"
                                      >
                                        <FileText className="w-3.5 h-3.5" />
                                      </button>

                                      {/* WhatsApp Notification Button */}
                                      <button
                                        onClick={() => openNotificationModal(app)}
                                        title="Kirim Notifikasi WA"
                                        className="h-8 w-8 rounded-lg flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 active:scale-90 transition-transform cursor-pointer"
                                      >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {stageIdx < STAGES.length - 1 ? (
                                      <button
                                        onClick={() => updateCandidateStatus(app, STAGES[stageIdx + 1].key)}
                                        title="Loloskan ke tahap berikutnya"
                                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900 active:scale-90 transition-transform cursor-pointer"
                                      >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                      </button>
                                    ) : <span className="w-8" />}
                                  </div>
                                </div>
                              );
                            })}

                            {stageApps.length === 0 && (
                              <div className="h-28 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-[11px] text-neutral-400">
                                Letakkan di sini
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* ==================================================================== */
                /* TABEL / LIST VIEW                                                    */
                /* ==================================================================== */
                <div className="divide-y divide-[#E8E8EC]">
                  {applications.map((app) => {
                    const cName =
                      app.candidate_name ||
                      app.expand?.candidate_id?.expand?.user_id?.email?.split('@')[0] ||
                      `Kandidat #${app.candidate_id?.slice(0, 5) || '101'}`;
                    const cEmail =
                      app.candidate_email ||
                      app.expand?.candidate_id?.expand?.user_id?.email ||
                      'kandidat@demo.com';
                    const cPhone =
                      app.candidate_phone ||
                      app.expand?.candidate_id?.phone ||
                      '081234567890';
                    const jTitle = app.expand?.job_id?.title || 'Posisi Karyawan';

                    return (
                      <div
                        key={app.id}
                        className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#FAFAFA]/80 p-3 rounded-xl transition-colors content-visibility-auto gpu-layer"
                      >
                        {/* Info Pelamar with Multi-Select Checkbox */}
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedAppIds.includes(app.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectApp(app.id);
                            }}
                            className="mt-1 rounded border-neutral-300 text-indigo-600 h-4 w-4 cursor-pointer shrink-0"
                          />
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-[#0A0A0A] truncate">{cName}</h3>
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {jTitle}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#6B6B6B]">
                              Email: <span className="font-mono text-neutral-800">{cEmail}</span> &bull; WA: <span className="font-mono">{cPhone}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                              <span className="font-mono text-blue-700 font-semibold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                                OCR Match: {app.match_score ? `${app.match_score}%` : 'Dalam Review'}
                              </span>
                              <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Skor Psikotes: {app.test_score ?? 'Belum Ujian'} / 100
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Dropdown & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Status Selector */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-neutral-600">Tahap:</span>
                            <div className="relative">
                              <select
                                value={app.status || 'applied'}
                                onChange={(e) => updateCandidateStatus(app, e.target.value)}
                                className="border border-[#E8E8EC] rounded-xl pl-3 pr-7 py-1 text-xs bg-white font-medium focus:ring-2 focus:ring-[#6366F1] focus:outline-none appearance-none cursor-pointer shadow-sm hover:border-neutral-300 transition-colors"
                              >
                                <option value="applied">1. Screening (Applied)</option>
                                <option value="testing">2. Testing (Psikotes)</option>
                                <option value="interview">3. Interview (Wawancara)</option>
                                <option value="hired">4. Hired (Diterima)</option>
                                <option value="rejected">5. Rejected (Ditolak)</option>
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400">
                                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Tombol Jadwalkan Wawancara */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openInterviewModal(app)}
                            className="rounded-full text-xs h-8 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center gap-1.5 font-semibold"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Jadwalkan</span>
                          </Button>

                          {/* Tombol Lihat & Unduh Psikogram PDF */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openPsikogram(app)}
                            className="rounded-full text-xs h-8 border-[#E8E8EC] bg-white hover:bg-neutral-100 flex items-center gap-1.5 text-neutral-800"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                            {t.employerPortal.downloadPsikogramBtn}
                          </Button>

                          {/* Tombol Notifikasi WA/Email Clip-to-paste */}
                          <Button
                            size="sm"
                            onClick={() => openNotificationModal(app)}
                            className="rounded-full text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 font-semibold shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
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

          {/* ==================================================================== */}
          {/* TAB 2: LOWONGAN SAYA                                                 */}
          {/* ==================================================================== */}
          <TabsContent value="jobs">
            <div className="bg-white border border-[#E8E8EC] rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4 pb-2 border-b border-[#E8E8EC]">
                Lowongan Kerja Aktif
              </h3>
              {jobs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#86868B]">
                  Belum ada lowongan. Buka tab &quot;Buat Lowongan Baru&quot; untuk mulai merekrut.
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 border border-[#E8E8EC] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-[#0A0A0A]">{job.title}</h4>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {Array.isArray(job.requirements_keywords) &&
                            job.requirements_keywords.map((kw: string) => (
                              <Badge key={kw} variant="outline" className="text-[10px]">
                                {kw}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                        {job.status?.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 3: BUAT LOWONGAN BARU                                            */}
          {/* ==================================================================== */}
          <TabsContent value="create">
            <div className="bg-white border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4 pb-2 border-b border-[#E8E8EC]">
                Formulir Perekrutan Karyawan Baru
              </h3>
              <form onSubmit={handleCreateJob} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="jtitle" className="text-xs font-semibold text-[#1D1D1F]">
                    Judul Posisi Lowongan
                  </Label>
                  <Input
                    id="jtitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Contoh: Teknisi Mesin Bubut CNC & Milling / Staff K3"
                    className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jdesc" className="text-xs font-semibold text-[#1D1D1F]">
                    Deskripsi Pekerjaan &amp; Tanggung Jawab
                  </Label>
                  <textarea
                    id="jdesc"
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={4}
                    placeholder="Tuliskan tugas utama, kualifikasi pendidikan, dan lingkungan kerja..."
                    className="w-full rounded-xl border border-[#E8E8EC] p-3 text-xs focus:ring-1 focus:ring-[#6366F1] bg-white outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jkw" className="text-xs font-semibold text-[#1D1D1F]">
                    Kata Kunci Keahlian Teknis (Koma sebagai pemisah)
                  </Label>
                  <Input
                    id="jkw"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="CNC, PLC Siemens, ISO 9001, Ahli K3 Umum, SIO Forklift"
                    className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isCreatingJob}
                  className="rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs px-6 h-9 font-semibold"
                >
                  {isCreatingJob ? 'Mempublikasikan...' : 'Publikasikan Lowongan'}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* ==================================================================== */}
          {/* TAB 4: PROFIL PERUSAHAAN                                             */}
          {/* ==================================================================== */}
          <TabsContent value="profile">
            <div className="bg-white border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm max-w-xl">
              <h3 className="font-bold text-sm text-[#0A0A0A] mb-4 pb-2 border-b border-[#E8E8EC]">
                Identitas Perusahaan Mitra
              </h3>
              <form onSubmit={saveEmployerProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="compName" className="text-xs font-semibold text-[#1D1D1F]">
                    Nama Entitas Perusahaan
                  </Label>
                  <Input
                    id="compName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bizSec" className="text-xs font-semibold text-[#1D1D1F]">
                    Sektor Manufaktur / Bisnis
                  </Label>
                  <Input
                    id="bizSec"
                    value={businessSector}
                    onChange={(e) => setBusinessSector(e.target.value)}
                    className="rounded-xl border-[#E8E8EC] text-xs h-9 bg-white"
                  />
                </div>
                <Button
                  type="submit"
                  className="rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs px-6 h-9 font-semibold"
                >
                  Simpan Perubahan
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Psikogram Modal */}
      {selectedPsikogramData && (
        <PsikogramModal
          isOpen={isPsikogramOpen}
          onClose={() => setIsPsikogramOpen(false)}
          data={selectedPsikogramData}
        />
      )}

      {/* Candidate Notification Modal */}
      {notificationTarget && (
        <CandidateNotificationModal
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          candidateName={notificationTarget.name}
          candidateEmail={notificationTarget.email}
          candidatePhone={notificationTarget.phone}
          jobTitle={notificationTarget.jobTitle}
          companyName={companyName}
          newStatus={notificationTarget.status}
        />
      )}

      {/* Floating Batch Action Bar for ATS Multi-Select */}
      {selectedAppIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1D1D1F] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-neutral-700 animate-in fade-in slide-in-from-bottom-3 max-w-full overflow-x-auto">
          <span className="text-xs font-semibold whitespace-nowrap">
            {selectedAppIds.length} Kandidat Dipilih
          </span>
          <div className="h-4 w-px bg-neutral-600" />
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[11px] text-neutral-400">Pindahkan ke:</span>
            <button
              onClick={() => handleBatchStatus('testing')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Testing
            </button>
            <button
              onClick={() => handleBatchStatus('interview')}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Wawancara
            </button>
            <button
              onClick={() => handleBatchStatus('hired')}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Diterima
            </button>
            <button
              onClick={() => handleBatchStatus('rejected')}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Tolak
            </button>
          </div>
          <button
            onClick={() => setSelectedAppIds([])}
            className="text-neutral-400 hover:text-white text-xs underline ml-2 whitespace-nowrap cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Interview Slot Scheduler Modal */}
      {isInterviewOpen && interviewApp && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E8EC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0A0A0A]">Penjadwalan Wawancara</h4>
                  <p className="text-[11px] text-[#6B6B6B]">
                    {interviewApp.candidate_name || 'Kandidat'} &bull; {interviewApp.expand?.job_id?.title || 'Posisi'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInterviewOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-neutral-800">Tanggal Wawancara</Label>
                <Input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="rounded-xl border-[#E8E8EC] h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-neutral-800">Waktu / Jam Sesi</Label>
                <Input
                  type="text"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  placeholder="Contoh: 09:30 WIB - 10:30 WIB"
                  className="rounded-xl border-[#E8E8EC] h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-neutral-800">Lokasi / Tautan Online</Label>
                <Input
                  type="text"
                  value={interviewLocation}
                  onChange={(e) => setInterviewLocation(e.target.value)}
                  placeholder="Contoh: Ruang Rapat HR Lt. 2 / Google Meet"
                  className="rounded-xl border-[#E8E8EC] h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-neutral-800">Instruksi Tambahan</Label>
                <Input
                  type="text"
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Contoh: Harap membawa portofolio & berkas asli"
                  className="rounded-xl border-[#E8E8EC] h-9 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={generateWhatsAppInterview}
                className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-10 font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Kirim Undangan WhatsApp Langsung</span>
              </Button>

              <Button
                variant="outline"
                onClick={async () => {
                  await updateCandidateStatus(interviewApp, 'interview');
                  setIsInterviewOpen(false);
                  alert('Status kandidat berhasil dipindahkan ke tahap Wawancara!');
                }}
                className="w-full rounded-full text-xs h-9 border-[#E8E8EC] hover:bg-neutral-100"
              >
                Simpan Jadwal & Loloskan ke Tahap Wawancara
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
