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

export default function ServiceDetailPage() {
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
      <ServiceDetailContent />
    </Suspense>
  );
}

function ServiceDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [service, setService] = useState<RecordModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await pb.collection('services_catalog').getOne(id);
        setService(s);
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

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-2">
          {isEn ? 'Service Not Found' : 'Layanan tidak ditemukan'}
        </h1>
        <p className="text-muted-foreground mb-6">
          {isEn ? 'The service you requested is not available or has been archived.' : 'Layanan yang Anda cari tidak tersedia atau telah dihapus.'}
        </p>
        <Link href="/">
          <Button>{t.auth.backToHome}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        &larr; {t.common.back}
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <Badge variant="outline" className="text-xs font-normal mb-2 w-fit">{service.category}</Badge>
          <CardTitle className="text-2xl">{service.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {service.description && (
            <p className="text-muted-foreground leading-relaxed">{service.description}</p>
          )}

          <Separator />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.servicesSection.sessionFee}</p>
              <p className="text-3xl font-bold text-primary">
                Rp {Number(service.price).toLocaleString('id-ID')}
              </p>
            </div>
            <Link href={`/booking/${service.id}`} className="sm:shrink-0">
              <Button size="lg" className="w-full sm:w-auto">
                {t.servicesSection.bookSession}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
