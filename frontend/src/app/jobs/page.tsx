'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { RecordModel } from 'pocketbase';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Filter, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function JobsPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [jobs, setJobs] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Fallback demo jobs for industrial recruitment
  const demoJobs: RecordModel[] = [
    {
      id: 'job-ind-01',
      title: 'Operator Produksi & Assembly Line',
      company_name: 'PT Astra Otoparts Tbk',
      location: 'Kawasan Industri KIIC, Karawang',
      job_type: 'Kontrak (Full-time)',
      salary_range: 'Rp 5.600.000 - Rp 6.800.000',
      description: 'Penempatan di lini perakitan presisi komponen otomotif. Bersedia bekerja 3 shift.',
      requirements: ['SMK Teknik Mesin / Otomotif / Listrik', 'Ketelitian tinggi tes Kraepelin', 'Usia 18 - 24 tahun'],
      status: 'open',
      is_featured: true,
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
      collectionId: 'job_postings',
      collectionName: 'job_postings',
    },
    {
      id: 'job-ind-02',
      title: 'Staff Quality Assurance (QA / QC Inspector)',
      company_name: 'PT Denso Indonesia',
      location: 'Kawasan Industri MM2100, Cikarang Barat',
      job_type: 'Kontrak 1 Tahun',
      salary_range: 'Rp 6.200.000 - Rp 7.500.000',
      description: 'Melakukan inspeksi visual dan pengukuran alat ukur presisi (Caliper, Micrometer).',
      requirements: ['D3 / S1 Teknik Mesin / Industri', 'Paham ISO 9001 & Kaizen', 'DISC Compliance tinggi'],
      status: 'open',
      is_featured: true,
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
      collectionId: 'job_postings',
      collectionName: 'job_postings',
    },
    {
      id: 'job-ind-03',
      title: 'Teknisi Maintenance & PLC Automation',
      company_name: 'PT Unilever Manufacturing Indonesia',
      location: 'Kawasan Industri Jababeka V, Cikarang',
      job_type: 'Full-time Tetap',
      salary_range: 'Rp 7.800.000 - Rp 9.500.000',
      description: 'Pemeliharaan preventif mesin industri conveyor, sistem hidrolik, dan pemrograman PLC.',
      requirements: ['D3 / S1 Teknik Elektro / Mekatronika', 'Pengalaman PLC Omron / Siemens', 'Sertifikat K3 Listrik'],
      status: 'open',
      is_featured: false,
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
      collectionId: 'job_postings',
      collectionName: 'job_postings',
    },
    {
      id: 'job-ind-04',
      title: 'Staff Logistik & Pergudangan (Warehouse)',
      company_name: 'PT Mayora Indah Tbk',
      location: 'Kawasan Industri Cikande, Banten',
      job_type: 'Kontrak Pabrik',
      salary_range: 'Rp 5.200.000 - Rp 6.100.000',
      description: 'Pengendalian stok masuk dan keluar bahan baku produksi serta koordinasi forklift.',
      requirements: ['SMA / SMK Sederajat', 'Menguasai SAP / WMS dasar', 'Surat Izin Operasi (SIO) Forklift nilai plus'],
      status: 'open',
      is_featured: false,
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
      collectionId: 'job_postings',
      collectionName: 'job_postings',
    },
    {
      id: 'job-ind-05',
      title: 'Foreman / Leader Shift Produksi',
      company_name: 'PT Yamaha Motor Manufacturing',
      location: 'Pulo Gadung / Karawang Timur',
      job_type: 'Full-time',
      salary_range: 'Rp 8.500.000 - Rp 11.000.000',
      description: 'Memimpin regu kerja shift 25 operator, mengontrol target harian OEE dan kedisiplinan 5S.',
      requirements: ['Pengalaman minimal 3 tahun Leader Produksi', 'DISC Dominance & Leadership teruji'],
      status: 'open',
      is_featured: true,
      created: '2026-10-14T00:00:00.000Z',
      updated: '2026-10-14T00:00:00.000Z',
      collectionId: 'job_postings',
      collectionName: 'job_postings',
    }
  ];

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const fetched = await pb.collection('job_postings').getFullList({
          filter: 'status = "open"',
          expand: 'employer_id',
          sort: '-created',
        });
        if (fetched.length > 0) {
          setJobs(fetched);
        } else {
          setJobs(demoJobs);
        }
      } catch (err) {
        setJobs(demoJobs);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, []);

  // Filter Jobs
  const filteredJobs = jobs.filter((job) => {
    const titleMatch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const locationMatch = selectedLocation === 'all' || 
      (selectedLocation === 'karawang' && job.location?.toLowerCase().includes('karawang')) ||
      (selectedLocation === 'cikarang' && (job.location?.toLowerCase().includes('cikarang') || job.location?.toLowerCase().includes('mm2100') || job.location?.toLowerCase().includes('jababeka'))) ||
      (selectedLocation === 'lainnya' && !job.location?.toLowerCase().includes('cikarang') && !job.location?.toLowerCase().includes('karawang'));

    const typeMatch = selectedType === 'all' ||
      (selectedType === 'fulltime' && job.job_type?.toLowerCase().includes('full')) ||
      (selectedType === 'kontrak' && job.job_type?.toLowerCase().includes('kontrak'));

    return titleMatch && locationMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="text-center sm:text-left space-y-2 border-b border-[#E8E8EC] pb-4">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-1 px-3">
            <Briefcase className="w-3.5 h-3.5 mr-1" />
            BURSA LOWONGAN KERJA INDUSTRI 2026
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] tracking-tight">
            {isEn ? 'Industrial & Manufacturing Careers' : 'Papan Lowongan Kerja Manufaktur'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-2xl">
            {isEn
              ? 'Discover verified openings across industrial corridors: Karawang, Cikarang, Jababeka, MM2100, and EJIP with AI Skill Matching.'
              : 'Temukan lowongan terverifikasi di kawasan industri terkemuka dengan pencocokan otomatis kualifikasi dan asesmen psikotes langsung.'}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-white border border-[#E8E8EC] rounded-2xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isEn ? 'Search position, skills, company...' : 'Cari posisi (Operator, QC, Teknisi), nama PT...'}
                className="pl-9 rounded-xl text-xs border-[#E8E8EC] focus:border-indigo-600 h-10"
              />
            </div>

            {/* Location Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs border border-[#E8E8EC] bg-white text-[#0A0A0A] focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">Semua Kawasan Industri</option>
                <option value="cikarang">Cikarang (MM2100, Jababeka, GIIC)</option>
                <option value="karawang">Karawang (KIIC, Suryacipta)</option>
                <option value="lainnya">Banten & Kota Lainnya</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl text-xs border border-[#E8E8EC] bg-white text-[#0A0A0A] focus:border-indigo-600 focus:outline-none"
              >
                <option value="all">Semua Tipe Kontrak</option>
                <option value="kontrak">Kontrak Pabrik</option>
                <option value="fulltime">Karyawan Tetap (Full-time)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span>Menampilkan <strong>{filteredJobs.length}</strong> lowongan kerja aktif</span>
            <Link href="/candidate/practice" className="text-indigo-600 hover:underline font-semibold flex items-center gap-1">
              <span>Latihan tes Kraepelin sebelum melamar ➔</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="border-[#E8E8EC] hover:border-indigo-300 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col justify-between content-visibility-auto gpu-layer will-animate"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.is_featured && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                            ★ REKOMENDASI PABRIK
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] bg-[#F5F5F7] text-[#4B5563]">
                          {job.job_type || 'Full-time'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-[#0A0A0A] leading-snug">
                        {job.title}
                      </CardTitle>
                      <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{job.company_name || 'PT Industri Mitra Terverifikasi'}</span>
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <p className="text-[#6B6B6B] line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4B5563] pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#86868B] flex-shrink-0" />
                      <span className="truncate">{job.location || 'Kawasan Industri'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate font-semibold text-[#0A0A0A]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{job.salary_range || 'Sesuai UMK'}</span>
                    </div>
                  </div>

                  {job.requirements && Array.isArray(job.requirements) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.requirements.slice(0, 3).map((req: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#4B5563] border border-[#E8E8EC]">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t border-[#F5F5F7]">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-xl border-[#E8E8EC] h-9">
                        Detail Posisi
                      </Button>
                    </Link>

                    <Link href={`/apply/${job.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white h-9 gap-1 shadow-sm">
                        <span>Lamar Sekarang</span>
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
    </div>
  );
}
