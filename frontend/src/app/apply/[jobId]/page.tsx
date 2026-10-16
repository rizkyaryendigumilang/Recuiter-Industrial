'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        setError(isEn ? 'Job position not found.' : 'Lowongan tidak ditemukan.');
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
            <div className="text-5xl mb-4 text-emerald-600">&#10003;</div>
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {isEn ? 'Apply Position:' : 'Lamaran:'} {job?.title || '...'}
          </CardTitle>
          {job?.expand?.employer_id?.company_name && (
            <p className="text-sm text-muted-foreground">{job.expand.employer_id.company_name}</p>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleApply} className="space-y-4">
            <div className="space-y-2">
              <Label>{t.auth.emailLabel}</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{isEn ? 'Phone / WhatsApp Number' : 'Nomor HP / WhatsApp'}</Label>
              <Input id="phone" type="tel" placeholder="08xxxxxxxxxx" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consent">{isEn ? 'Consent & Agreement' : 'Persetujuan'}</Label>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="consent" required className="mt-1" />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  {isEn
                    ? 'I consent to the collection and processing of my profile data for recruitment purposes.'
                    : 'Saya menyetujui data saya diproses untuk keperluan rekrutmen.'}
                </label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t.common.loading : (isEn ? 'Submit Job Application' : 'Kirim Lamaran')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
