'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RecordModel } from 'pocketbase';
import { 
  HeartHandshake, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Award,
  Calendar
} from 'lucide-react';

export default function ServicesPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [services, setServices] = useState<RecordModel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fallbackServices: RecordModel[] = [
    {
      id: 'srv-01',
      title: 'Konseling Karir Individu & Pengelolaan Stres Kerja',
      category: 'counseling',
      price: 150000,
      description: 'Sesi privat 60 menit bersama Psikolog Klinis/Industri berlisensi SIPP untuk mengatasi burnout, kecemasan interview, dan navigasi karir.',
      duration: '60 Menit',
      is_active: true,
      features: ['Konsultasi 1-on-1 via Google Meet', 'Asesmen Inventori Burnout', 'Ringkasan Catatan Psikolog'],
      collectionId: 'services_catalog',
      collectionName: 'services_catalog',
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
    },
    {
      id: 'srv-02',
      title: 'Paket Asesmen Psikometri Massal Karyawan Pabrik',
      category: 'assessment',
      price: 350000,
      description: 'Asesmen lengkap Kraepelin/Pauli, DISC, dan tes ketelitian kerja untuk kandidat operator dan staf lini produksi pabrik.',
      duration: 'Online / On-site',
      is_active: true,
      features: ['Engine Tes Kraepelin Digital', 'Laporan Psikogram 1 Lembar PDF', 'Radar Chart Rekomendasi HR'],
      collectionId: 'services_catalog',
      collectionName: 'services_catalog',
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
    },
    {
      id: 'srv-03',
      title: 'Simulasi Wawancara Kerja & Bedah CV Industri',
      category: 'coaching',
      price: 125000,
      description: 'Review resume berstandar ATS industri manufaktur dan simulasi wawancara user dengan mantan HRD pabrik multinasional.',
      duration: '45 Menit',
      is_active: true,
      features: ['Koreksi Format Resume ATS', 'Mock Interview STAR Method', 'Feedback Langsung'],
      collectionId: 'services_catalog',
      collectionName: 'services_catalog',
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
    },
    {
      id: 'srv-04',
      title: 'Konsultasi Ergonomi & Beban Kerja Mental Shift',
      category: 'industrial',
      price: 750000,
      description: 'Audit beban kerja psikososial untuk manajemen pabrik yang ingin menekan angka absensi dan turnover operator shift malam.',
      duration: 'Sesi B2B Khusus',
      is_active: true,
      features: ['Analisis NASA-TLX', 'Rekomendasi Ergonomi Kognitif', 'Sertifikat Audit'],
      collectionId: 'services_catalog',
      collectionName: 'services_catalog',
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
    }
  ];

  useEffect(() => {
    async function loadServices() {
      try {
        const fetched = await pb.collection('services_catalog').getFullList({
          filter: 'is_active = true',
          sort: 'price',
        });
        if (fetched.length > 0) {
          setServices(fetched);
        } else {
          setServices(fallbackServices);
        }
      } catch {
        setServices(fallbackServices);
      }
    }
    loadServices();
  }, []);

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Title */}
        <div className="text-center space-y-2 border-b border-[#E8E8EC] pb-6">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-1 px-3">
            <HeartHandshake className="w-3.5 h-3.5 mr-1" />
            LAYANAN PSIKOLOGI TERAPAN & ASESMEN 2026
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
            {isEn ? 'Psychological Counseling & Assessment Services' : 'Katalog Konseling Karir & Asesmen'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-2xl mx-auto">
            {isEn
              ? 'Book licensed psychological counseling, career transition coaching, or corporate psychometric evaluation packages.'
              : 'Dapatkan pendampingan karir dari psikolog berlisensi SIPP/HIMPSI dan paket asesmen psikometri terstandar industri.'}
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'Semua Layanan' },
              { id: 'counseling', label: 'Konseling Individu' },
              { id: 'assessment', label: 'Asesmen Perusahaan (B2B)' },
              { id: 'coaching', label: 'Bedah CV & Interview' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#1D1D1F] text-white shadow-sm'
                    : 'bg-white border border-[#E8E8EC] text-[#6B6B6B] hover:text-[#0A0A0A]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((srv) => (
            <Card
              key={srv.id}
              className="border-[#E8E8EC] hover:border-indigo-300 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 border-indigo-200">
                    {srv.category || 'Service'}
                  </Badge>
                  <span className="text-xs text-[#86868B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{srv.duration || '60 Menit'}</span>
                  </span>
                </div>
                <CardTitle className="text-lg font-bold text-[#0A0A0A] mt-2">
                  {srv.title}
                </CardTitle>
                <CardDescription className="text-xs text-[#6B6B6B] leading-relaxed">
                  {srv.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {srv.features && Array.isArray(srv.features) && (
                  <div className="space-y-1.5 bg-[#FAFAFA] p-3.5 rounded-xl border border-[#E8E8EC] text-xs">
                    <p className="font-semibold text-[#0A0A0A] text-[11px] uppercase tracking-wider">
                      Fasilitas yang didapatkan:
                    </p>
                    {srv.features.map((feat: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-[#4B5563]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F7]">
                  <div>
                    <p className="text-[10px] text-[#86868B] uppercase font-semibold">Biaya Layanan</p>
                    <p className="text-lg font-black text-[#0A0A0A]">
                      Rp {Number(srv.price || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <Link href={`/booking/${srv.id}`}>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold h-10 px-4 gap-1.5 shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Pesan Sesi</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
