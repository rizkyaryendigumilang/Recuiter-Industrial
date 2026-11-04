'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FALLBACK_INDUSTRIAL_JOBS } from '@/lib/mock-data';
import type { RecordModel } from 'pocketbase';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Filter, 
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
  const demoJobs = FALLBACK_INDUSTRIAL_JOBS;

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
          <Badge className="bg-[#F6F8FA] text-[#0D1117] border-[#E1E4E8] text-xs py-1 px-3 font-mono">
            <Briefcase className="w-3.5 h-3.5 mr-1 text-amber-600" />
            {isEn ? 'INDUSTRIAL JOB BOARD 2026' : 'BURSA LOWONGAN KERJA INDUSTRI 2026'}
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
                aria-label={isEn ? 'Search job position or company' : 'Cari posisi lowongan atau nama perusahaan'}
                className="pl-9 rounded-xl text-xs border-[#E8E8EC] focus:border-[#0D1117] h-10"
              />
            </div>

            {/* Location Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label={isEn ? 'Filter by industrial zone' : 'Filter kawasan industri'}
                className="w-full h-10 px-3 rounded-xl text-xs border border-[#E8E8EC] bg-white text-[#0A0A0A] focus:border-[#0D1117] focus:outline-none"
              >
                <option value="all">{isEn ? 'All Industrial Zones' : 'Semua Kawasan Industri'}</option>
                <option value="cikarang">Cikarang (MM2100, Jababeka, GIIC)</option>
                <option value="karawang">Karawang (KIIC, Suryacipta)</option>
                <option value="lainnya">{isEn ? 'Banten & Other Cities' : 'Banten & Kota Lainnya'}</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label={isEn ? 'Filter by employment type' : 'Filter tipe kontrak kerja'}
                className="w-full h-10 px-3 rounded-xl text-xs border border-[#E8E8EC] bg-white text-[#0A0A0A] focus:border-[#0D1117] focus:outline-none"
              >
                <option value="all">{isEn ? 'All Contract Types' : 'Semua Tipe Kontrak'}</option>
                <option value="kontrak">{isEn ? 'Factory Contract' : 'Kontrak Pabrik'}</option>
                <option value="fulltime">{isEn ? 'Permanent (Full-time)' : 'Karyawan Tetap (Full-time)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#6B6B6B]">
            <span>
              {isEn ? (
                <>Showing <strong>{filteredJobs.length}</strong> active openings</>
              ) : (
                <>Menampilkan <strong>{filteredJobs.length}</strong> lowongan kerja aktif</>
              )}
            </span>
            <Link href="/candidate/practice" className="text-amber-800 hover:text-amber-900 underline underline-offset-2 font-semibold flex items-center gap-1 font-mono">
              <span>{isEn ? 'Practice Kraepelin test before applying' : 'Latihan tes Kraepelin sebelum melamar'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <Card
                key={job.id}
                className="border-[#E8E8EC] hover:border-neutral-400 shadow-sm hover:shadow-md transition-all bg-white rounded-2xl flex flex-col justify-between content-visibility-auto gpu-layer will-animate"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {job.is_featured && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                            {isEn ? '★ FEATURED FACTORY' : '★ REKOMENDASI PABRIK'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] bg-[#F5F5F7] text-[#4B5563]">
                          {job.job_type || 'Full-time'}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-[#0A0A0A] leading-snug">
                        {job.title}
                      </CardTitle>
                      <p className="text-xs font-semibold text-[#0D1117] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-neutral-600" />
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
                      <span className="truncate">{job.salary_range || (isEn ? 'Standard Wage' : 'Sesuai UMK')}</span>
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
                        {isEn ? 'Position Details' : 'Detail Posisi'}
                      </Button>
                    </Link>

                    <Link href={`/apply/${job.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs font-semibold rounded-xl bg-[#0D1117] hover:bg-[#21262D] text-white h-9 gap-1 shadow-sm">
                        <span>{isEn ? 'Apply Now' : 'Lamar Sekarang'}</span>
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
