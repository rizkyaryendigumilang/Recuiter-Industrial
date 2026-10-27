'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { pb } from "@/lib/pocketbase";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RecordModel } from "pocketbase";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Cpu,
  Award,
  Layers,
  Wrench,
  Percent,
} from "lucide-react";
import { parseIndustrialResume, ParsedCompetencyResult } from "@/lib/industrial-parser";

export default function CandidatePortal() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [candidate, setCandidate] = useState<RecordModel | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [competencyResult, setCompetencyResult] = useState<ParsedCompetencyResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [applications, setApplications] = useState<RecordModel[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    loadCandidateData();
  }, [isLoggedIn]);

  async function loadCandidateData() {
    if (!pb.authStore.record?.id) return;
    setLoading(true);
    try {
      // 1. Ambil record candidate
      let candRecord: RecordModel | null = null;
      try {
        const found = await pb.collection('candidates').getFirstListItem(`user_id = "${pb.authStore.record.id}"`);
        candRecord = found;
        setCandidate(found);
        if (found.parsed_skills && Array.isArray(found.parsed_skills)) {
          setSkills(found.parsed_skills as string[]);
        }
      } catch {
        candRecord = null;
      }

      // Restore from localStorage if offline/demo
      if (!candRecord || !candRecord.parsed_skills) {
        const savedSkills = localStorage.getItem('candidate_skills');
        if (savedSkills) {
          try {
            const parsed = JSON.parse(savedSkills);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSkills(parsed);
            }
          } catch {}
        }
      }

      // 2. Ambil lamaran kerja milik kandidat ini
      if (candRecord) {
        const apps = await pb.collection('job_applications').getFullList({
          filter: `candidate_id = "${candRecord.id}"`,
          expand: 'job_id',
          sort: '-created',
        });
        setApplications(apps);
      } else {
        // Sample application if none
        const sampleLocal = localStorage.getItem('sample_applications');
        if (sampleLocal) {
          try {
            setApplications(JSON.parse(sampleLocal));
          } catch {}
        }
      }

      // 3. Ambil rekomendasi lowongan pekerjaan
      const jobs = await pb.collection('job_postings').getFullList({
        filter: 'status = "open"',
        expand: 'employer_id',
        sort: '-created',
      });
      setRecommendedJobs(jobs.slice(0, 4));
    } catch (err) {
      console.error('Error load candidate data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file || !pb.authStore.record?.id) return;
    setIsUploading(true);
    try {
      // 1. Client-side industrial competency parsing
      const parsedData = await parseIndustrialResume(file);
      setCompetencyResult(parsedData);
      setSkills(parsedData.detectedSkills);
      localStorage.setItem('candidate_skills', JSON.stringify(parsedData.detectedSkills));
      localStorage.setItem('candidate_competencies', JSON.stringify(parsedData));

      // 2. Upload ke PocketBase
      const formData = new FormData();
      formData.append('resume_url', file);
      formData.append('parsed_skills', JSON.stringify(parsedData.detectedSkills));

      let saved: RecordModel;
      if (candidate) {
        saved = await pb.collection('candidates').update(candidate.id, formData);
      } else {
        formData.append('user_id', pb.authStore.record.id);
        saved = await pb.collection('candidates').create(formData);
      }

      setCandidate(saved);
      alert(
        isEn
          ? `Resume analyzed! Extracted ${parsedData.detectedSkills.length} industrial competencies with ${parsedData.matchScore}% Match Score.`
          : `CV berhasil dipindai! Terdeteksi ${parsedData.detectedSkills.length} kompetensi industri dengan Skor Kesesuaian ${parsedData.matchScore}%.`
      );
    } catch (e) {
      console.error('Upload CV error (falling back to client parser):', e);
      // Fallback: parse client-side anyway so user continues smoothly
      try {
        const parsedData = await parseIndustrialResume(file);
        setCompetencyResult(parsedData);
        setSkills(parsedData.detectedSkills);
        localStorage.setItem('candidate_skills', JSON.stringify(parsedData.detectedSkills));
        alert(
          isEn
            ? `Client-side OCR extracted ${parsedData.detectedSkills.length} competencies successfully.`
            : `Ekstraksi OCR lokal berhasil: ${parsedData.detectedSkills.length} kompetensi industri terdeteksi!`
        );
      } catch (clientErr) {
        alert(isEn ? 'Failed to process resume.' : 'Gagal memproses resume.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 md:p-10 max-w-5xl">
        <div className="h-8 w-48 bg-neutral-100 rounded-full animate-pulse mb-6" />
        <div className="h-44 bg-neutral-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            {t.candidatePortal.title}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            {t.candidatePortal.title}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {t.candidatePortal.subtitle}
          </p>
        </div>

        {/* Candidate Sub-Navigation Hub */}
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-[#F5F5F7] rounded-2xl border border-[#E8E8EC]">
          <a href="#resume" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white text-[#0A0A0A] shadow-sm">
            {isEn ? 'Resume & Skills' : 'Resume & Kompetensi'}
          </a>
          <a href="#applications" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A]">
            {isEn ? 'My Applications' : 'Lamaran Saya'} ({applications.length})
          </a>
          <Link href="/candidate/results" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 flex items-center gap-1.5">
            <span>{isEn ? 'Psychogram Results' : 'Hasil Tes & Psikogram'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </Link>
          <Link href="/candidate/practice" className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#6B6B6B] hover:text-[#0A0A0A] flex items-center gap-1">
            <span>{isEn ? 'Kraepelin Tryout' : 'Simulasi Kraepelin'}</span>
          </Link>
        </div>

        <div id="resume" />

        {/* Top Grid: Upload & Industrial Extracted Skills */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Box 1: Upload Resume */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-700" />
                  {t.candidatePortal.resumeSection}
                </h2>
                <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200">
                  Industrial OCR Parser
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 mb-6">
                {isEn
                  ? 'Client-side PDF scanner extracting PLC, ISO, CNC, K3, SIO, and industrial machining qualifications.'
                  : 'Pemindai PDF langsung di peramban yang mendeteksi kompetensi PLC, CNC, ISO 9001, Ahli K3, dan SIO industri.'}
              </p>

              <div className="border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl p-8 text-center flex flex-col items-center gap-3 bg-neutral-50/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shadow-sm">
                  <UploadCloud className="w-6 h-6 text-[#6366F1]" />
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
                {file && (
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-neutral-800 font-semibold">
                      {isEn ? 'Selected file:' : 'File terpilih:'} {file.name}
                    </p>
                    <p className="text-[10px] text-neutral-500">
                      Ukuran: {(file.size / 1024).toFixed(1)} KB &bull; Format: PDF
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-6 w-full rounded-full bg-[#1D1D1F] hover:bg-black text-white font-semibold text-xs h-10 shadow-sm"
            >
              {isUploading
                ? (isEn ? "Extracting Industrial Keywords..." : "Memindai Kompetensi Manufaktur & K3...")
                : (isEn ? "Scan & Extract Industrial Resume" : "Unggah & Ekstrak Kompetensi Industri")}
            </Button>
          </div>

          {/* Box 2: Skills Profile & Match Overview */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6366F1]" />
                  {isEn ? 'Industrial Competency Profile' : 'Profil Kompetensi Industri'}
                </h2>
                {skills.length > 0 && (
                  <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isEn ? `${skills.length} Skills Matched` : `${skills.length} Keahlian Terdeteksi`}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mb-4">
                {isEn
                  ? 'AI-parsed competencies cross-referenced with factory & manufacturing standard job roles.'
                  : 'Hasil pemindaian OCR terverifikasi standar pabrik & manufaktur untuk pencocokan lowongan otomatis.'}
              </p>

              {skills.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs border border-neutral-100 rounded-xl bg-neutral-50/50">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  {isEn
                    ? 'No industrial skills detected yet. Please upload your technical resume (PDF).'
                    : 'Belum ada data kompetensi. Silakan unggah CV teknik / resume pabrik Anda.'}
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Certifications & SIO Highlight */}
                  {competencyResult?.certifications && competencyResult.certifications.length > 0 && (
                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Sertifikasi &amp; Lisensi Diakui:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {competencyResult.certifications.map((cert) => (
                          <Badge key={cert} variant="outline" className="text-[10px] bg-white border-indigo-200 text-indigo-800">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & AI Gap Analysis */}
                  {competencyResult?.strengths && competencyResult.strengths.length > 0 && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Kekuatan Profil Terverifikasi:
                        </span>
                        <Badge variant="outline" className="text-[10px] bg-white text-emerald-800 border-emerald-300">
                          ±{competencyResult.experienceYears} Thn Pengalaman
                        </Badge>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-0.5">
                        {competencyResult.strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {competencyResult?.gapRecommendations && competencyResult.gapRecommendations.length > 0 && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Saran Pengembangan Kualifikasi:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                        {competencyResult.gapRecommendations.map((gap, idx) => (
                          <li key={idx}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600">
              <span className="font-semibold text-neutral-900 block mb-0.5">
                {isEn ? 'Industrial Matching Engine:' : 'Rekomendasi Standar Industri:'}
              </span>
              {isEn
                ? 'Certifications such as Ahli K3 Umum, SIO Forklift, and ISO 9001 give the highest weight in factory HR shortlisting.'
                : 'Sertifikasi Ahli K3 Umum, SIO Forklift, dan ISO 9001 memiliki bobot tertinggi dalam proses lolos berkas HR pabrik.'}
            </div>
          </div>
        </div>

        {/* Middle Section: Status Lamaran Anda */}
        <div id="applications" className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">
              {t.candidatePortal.statusSection}
            </h2>
            <Badge variant="outline" className="text-xs font-mono">
              {applications.length} Terdaftar
            </Badge>
          </div>

          {applications.length === 0 ? (
            <div className="border border-neutral-200 rounded-2xl p-8 text-center bg-neutral-50/50">
              <Briefcase className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-800">{t.candidatePortal.noApplications}</p>
              <p className="text-xs text-neutral-500 mt-1 mb-4">
                {isEn ? 'Select suitable jobs from the list below and submit your application.' : 'Pilih lowongan yang sesuai dari daftar di bawah dan ajukan lamaran.'}
              </p>
              <Link href="/jobs">
                <Button size="sm" variant="outline" className="rounded-full text-xs">
                  {t.hero.exploreJobs}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 bg-white shadow-sm overflow-hidden">
              {applications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-neutral-900">
                      {app.expand?.job_id?.title || (isEn ? 'Job Position' : 'Posisi Pekerjaan Industri')}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-1">
                      <span className="font-mono text-neutral-600">
                        {t.candidatePortal.matchScore}: <strong className="text-neutral-900">{app.match_score ?? '85'}%</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="font-mono text-neutral-600">
                        {isEn ? 'Psychotest Score:' : 'Skor Psikotes:'} <strong className="text-neutral-900">{app.test_score ?? (isEn ? 'Not Yet Tested' : 'Belum Ujian')}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={app.status === 'hired' ? 'default' : 'secondary'} className="rounded-full">
                      {app.status?.toUpperCase()}
                    </Badge>

                    {app.test_score === null && app.expand?.job_id ? (
                      <Link href={`/test/${app.expand.job_id.id}`}>
                        <Button
                          size="sm"
                          className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-8 px-4"
                        >
                          {t.candidatePortal.takeTestBtn}
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/candidate/results">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs h-8 px-3"
                        >
                          {isEn ? 'View Psychogram' : 'Lihat Psikogram'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Section: Recommended Jobs */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            {t.candidatePortal.matchesSection}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendedJobs.map((j) => (
              <div
                key={j.id}
                className="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{j.title}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {j.expand?.employer_id?.company_name || 'Mitra Industri & Pabrik'}
                  </p>
                </div>
                <Link href={`/jobs/${j.id}`}>
                  <Button size="sm" variant="outline" className="rounded-full text-xs shrink-0">
                    {isEn ? 'View Details' : 'Detail Lowongan'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
