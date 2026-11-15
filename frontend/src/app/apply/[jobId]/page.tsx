'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getFallbackJobById } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';

export default function ApplyJobPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      }
    >
      <ApplyJobContent />
    </Suspense>
  );
}

function ApplyJobContent() {
  const { jobId } = useParams<{ jobId: string }>();
  const { user, isLoggedIn } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';
  const router = useRouter();

  const [job, setJob] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    async function load() {
      try {
        const j = await pb.collection('job_postings').getOne(jobId, { expand: 'employer_id' });
        setJob(j);
      } catch {
        const fallback = getFallbackJobById(jobId);
        if (fallback) {
          setJob(fallback);
        } else {
          setError(isEn ? 'Job position not found.' : 'Lowongan tidak ditemukan.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [jobId, isLoggedIn, router, isEn]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError('');

    try {
      // Get or create candidate record
      let candidate: RecordModel;
      try {
        candidate = await pb.collection('candidates').getFirstListItem(`user_id = "${user.id}"`);
      } catch {
        candidate = await pb.collection('candidates').create({ user_id: user.id });
      }

      await pb.collection('job_applications').create({
        job_id: jobId,
        candidate_id: candidate.id,
        consent_given: true,
        status: 'applied',
      });

      setSuccess(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : (isEn ? 'Failed to submit application.' : 'Gagal mengirim lamaran.');
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <Card>
          <CardContent className="py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isEn ? 'Application Submitted!' : 'Lamaran Terkirim!'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isEn
                ? <>Your application for the position of <strong>{job?.title}</strong> has been received successfully.</>
                : <>Lamaran Anda untuk posisi <strong>{job?.title}</strong> telah berhasil dikirim.</>}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/candidate')}>
                {isEn ? 'View Application Status' : 'Lihat Status Lamaran'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                {t.auth.backToHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-slate-100 touch-manipulation min-h-[44px] transition-colors"
        >
          <span>&larr; {isEn ? 'Back to Job Details' : 'Kembali ke Rincian Lowongan'}</span>
        </button>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-950">
            {isEn ? 'Apply Position:' : 'Kirim Lamaran:'} {job?.title || '...'}
          </CardTitle>
          {job?.expand?.employer_id?.company_name && (
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              {job.expand.employer_id.company_name}
            </p>
          )}
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm p-4 rounded-2xl flex items-start gap-2.5">
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleApply} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-900">{t.auth.emailLabel}</Label>
              <Input value={user?.email || ''} disabled className="h-11 rounded-xl bg-slate-100 text-slate-600 font-mono text-xs border-slate-200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-900">
                {isEn ? 'WhatsApp Phone Number' : 'Nomor WhatsApp Aktif'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                placeholder="Contoh: 081234567890"
                required
                className="h-11 rounded-xl text-xs sm:text-sm border-slate-200 focus:border-slate-900 bg-white"
              />
              <p className="text-[11px] text-slate-500">
                {isEn
                  ? 'Used by plant HR for official Kraepelin assessment links and interview invitations.'
                  : 'Digunakan oleh tim HR pabrik untuk mengirim jadwal tes ketelitian dan panggilan wawancara.'}
              </p>
            </div>
            <div className="pt-2">
              <label htmlFor="consent" className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer touch-manipulation transition-colors select-none">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 h-4 w-4 shrink-0 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  {isEn
                    ? 'I consent to the collection and processing of my profile and assessment data for official factory recruitment.'
                    : 'Saya menyetujui data profil dan hasil asesmen kerja saya diproses untuk kebutuhan seleksi kerja resmi pabrik.'}
                </span>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full min-h-[48px] rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs touch-manipulation cursor-pointer"
              disabled={submitting}
            >
              {submitting ? t.common.loading : (isEn ? 'Submit Job Application' : 'Kirim Lamaran Sekarang')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
