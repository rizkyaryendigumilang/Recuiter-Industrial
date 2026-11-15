'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useLanguage } from '@/lib/language-context';
import { getFallbackJobById } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Building2, MapPin, Briefcase, Activity, CheckCircle2 } from 'lucide-react';
import type { RecordModel } from 'pocketbase';

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4 animate-pulse">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-7 w-2/3 bg-slate-200 rounded-lg" />
              <div className="h-4 w-1/3 bg-slate-100 rounded" />
            </div>
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
              <div className="h-4 w-4/6 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}

function JobDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [job, setJob] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const j = await pb.collection('job_postings').getOne(id, { expand: 'employer_id' });
        setJob(j);
      } catch {
        const fallback = getFallbackJobById(id);
        if (fallback) {
          setJob(fallback);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4 animate-pulse">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-7 w-2/3 bg-slate-200 rounded-lg" />
            <div className="h-4 w-1/3 bg-slate-100 rounded" />
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-2">
          {isEn ? 'Job Not Found' : 'Lowongan tidak ditemukan'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isEn ? 'The job posting you are looking for is unavailable or closed.' : 'Lowongan yang Anda cari tidak tersedia atau telah ditutup.'}
        </p>
        <Link href="/jobs">
          <Button className="min-h-[44px]">{isEn ? 'View All Jobs' : 'Lihat Semua Lowongan'}</Button>
        </Link>
      </div>
    );
  }

  const keywords = Array.isArray(job.requirements_keywords) ? job.requirements_keywords as string[] : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl pb-28 sm:pb-8">
      <div className="mb-4">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/jobs');
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-slate-100 touch-manipulation min-h-[44px] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{isEn ? 'Back to Job Openings' : 'Kembali ke Daftar Lowongan'}</span>
        </button>
      </div>

      <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white">
        <CardHeader className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">
              {job.title}
            </CardTitle>
            {job.is_featured && (
              <Badge className="shrink-0 bg-amber-50 text-amber-800 border-amber-200 font-mono text-[10px]">
                {t.jobsSection.featured}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{job.expand?.employer_id?.company_name || (isEn ? 'Employer Company' : 'Perusahaan Mitra Industri')}</span>
            {job.expand?.employer_id?.business_sector && ` · ${job.expand.employer_id.business_sector}`}
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {job.description && (
            <div className="text-slate-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          )}

          {keywords.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
                  {t.jobsSection.requirements}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw: string) => (
                    <Badge key={kw} variant="outline" className="rounded-xl px-2.5 py-1 text-xs font-mono bg-slate-50 text-slate-700 border-slate-200">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Practice Simulation CTA for Candidates */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>Simulasi Tes Kraepelin Gratis</span>
              </span>
              <p className="text-[11px] text-amber-900 leading-snug">
                Latih kecepatan & ketelitian Anda sebelum melamar agar mendapat rekomendasi prioritas HR.
              </p>
            </div>
            <Link href="/candidate/practice" className="shrink-0">
              <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold border-amber-300 text-amber-950 bg-white hover:bg-amber-100 min-h-[40px] touch-manipulation">
                Mulai Tes Latihan
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="w-fit text-xs px-3 py-1">
              {job.status === 'open' ? (isEn ? 'Open Position' : 'Lowongan Terbuka') : job.status === 'closed' ? (isEn ? 'Closed' : 'Ditutup') : 'Draft'}
            </Badge>
            {job.status === 'open' && (
              <Link href={`/apply/${job.id}`} className="sm:shrink-0">
                <Button size="lg" className="w-full sm:w-auto rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs min-h-[44px] px-6 touch-manipulation">
                  {t.jobsSection.applyNow}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Floating Sticky Apply Bar */}
      {job.status === 'open' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate leading-snug">{job.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{job.expand?.employer_id?.company_name || 'Mitra Industri'}</p>
          </div>
          <Link href={`/apply/${job.id}`} className="shrink-0">
            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 h-10 rounded-xl shadow-xs touch-manipulation">
              {t.jobsSection.applyNow}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
