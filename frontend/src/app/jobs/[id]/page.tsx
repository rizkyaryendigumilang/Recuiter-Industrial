'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { RecordModel } from 'pocketbase';

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded mb-8" />
          <div className="h-64 bg-muted animate-pulse rounded-xl" />
        </div>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}

function JobDetailContent() {
  const { id } = useParams<{ id: string }>();
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
        // not found
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-4" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded mb-8" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
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
        <Link href="/">
          <Button>{t.auth.backToHome}</Button>
        </Link>
      </div>
    );
  }

  const keywords = Array.isArray(job.requirements_keywords) ? job.requirements_keywords as string[] : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; {t.common.back}
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-start justify-between gap-3 mb-2">
            <CardTitle className="text-2xl">{job.title}</CardTitle>
            {job.is_featured && <Badge className="shrink-0">{t.jobsSection.featured}</Badge>}
          </div>
          <p className="text-muted-foreground">
            {job.expand?.employer_id?.company_name || (isEn ? 'Employer Company' : 'Perusahaan Mitra')}
            {job.expand?.employer_id?.business_sector && ` · ${job.expand.employer_id.business_sector}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {job.description && (
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{job.description}</div>
          )}

          {keywords.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">
                  {t.jobsSection.requirements}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw: string) => (
                    <Badge key={kw} variant="outline">{kw}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'} className="w-fit">
              {job.status === 'open' ? (isEn ? 'Open Position' : 'Lowongan Terbuka') : job.status === 'closed' ? (isEn ? 'Closed' : 'Ditutup') : 'Draft'}
            </Badge>
            {job.status === 'open' && (
              <Link href={`/apply/${job.id}`} className="sm:shrink-0">
                <Button size="lg" className="w-full sm:w-auto">
                  {t.jobsSection.applyNow}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
