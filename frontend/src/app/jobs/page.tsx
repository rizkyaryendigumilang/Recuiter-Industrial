'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { pb } from '@/lib/pocketbase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Building2, 
  Filter, 
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Activity,
  Layers,
  X,
} from 'lucide-react';

export default function JobsPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [jobs, setJobs] = useState<RecordModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

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
      } catch {
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

    const categoryMatch = selectedCategory === 'all' ||
      (selectedCategory === 'operator' && (job.title?.toLowerCase().includes('operator') || job.description?.toLowerCase().includes('operator'))) ||
      (selectedCategory === 'teknisi' && (job.title?.toLowerCase().includes('teknisi') || job.title?.toLowerCase().includes('maintenance') || job.title?.toLowerCase().includes('plc'))) ||
      (selectedCategory === 'qc' && (job.title?.toLowerCase().includes('qc') || job.title?.toLowerCase().includes('qa') || job.title?.toLowerCase().includes('k3'))) ||
      (selectedCategory === 'gudang' && (job.title?.toLowerCase().includes('gudang') || job.title?.toLowerCase().includes('forklift') || job.title?.toLowerCase().includes('ppic')));

    return titleMatch && locationMatch && typeMatch && categoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Modern Header Banner */}
        <div className="p-8 sm:p-10 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-semibold">
              <Briefcase className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEn ? 'OFFICIAL INDUSTRIAL VACANCIES' : 'LOWONGAN KERJA PABRIK RESMI'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {isEn ? 'Manufacturing & Plant Openings' : 'Papan Lowongan Kerja Pabrik & Industri'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {isEn
                ? 'Discover verified plant openings across Karawang, Cikarang, Jababeka, MM2100, and EJIP with transparent skill matching.'
                : 'Temukan lowongan kerja resmi di kawasan industri Cikarang, Karawang, Banten, dan sekitarnya lengkap dengan simulasi tes ketelitian dan syarat K3.'}
            </p>
          </div>
        </div>

        {/* Quick Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: isEn ? 'All Positions' : 'Semua Posisi' },
            { id: 'operator', label: isEn ? 'Machine Operators' : 'Operator Produksi' },
            { id: 'teknisi', label: isEn ? 'Technician & PLC' : 'Teknisi & Maintenance' },
            { id: 'qc', label: isEn ? 'QA / QC & K3' : 'QA / QC & Ahli K3' },
            { id: 'gudang', label: isEn ? 'Warehouse & Forklift' : 'Gudang & SIO Forklift' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search & Location Filter Bar */}
        <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isEn ? 'Search position, skills, company...' : 'Cari posisi (Operator, QC, PLC Siemens), nama PT...'}
                aria-label={isEn ? 'Search job position or company' : 'Cari posisi lowongan atau nama perusahaan'}
                className="pl-10 pr-9 rounded-2xl text-xs border-slate-200 focus:border-slate-900 h-11 bg-slate-50/70"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label={isEn ? 'Clear search' : 'Hapus pencarian'}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Location Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label={isEn ? 'Filter by industrial zone' : 'Filter kawasan industri'}
                className="w-full h-11 px-3.5 rounded-2xl text-xs border border-slate-200 bg-slate-50/70 text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="all">{isEn ? 'All Industrial Zones' : 'Semua Kawasan Industri'}</option>
                <option value="cikarang">Cikarang (MM2100, Jababeka, GIIC)</option>
                <option value="karawang">Karawang (KIIC, Suryacipta)</option>
                <option value="lainnya">{isEn ? 'Banten & Other Hubs' : 'Banten & Kota Lainnya'}</option>
              </select>
            </div>

            {/* Contract Type Filter */}
            <div className="sm:col-span-3">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label={isEn ? 'Filter by employment type' : 'Filter tipe kontrak kerja'}
                className="w-full h-11 px-3.5 rounded-2xl text-xs border border-slate-200 bg-slate-50/70 text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none cursor-pointer"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-mono">
            <span>
              {isEn ? 'Showing ' : 'Menampilkan '}<strong className="text-slate-900">{filteredJobs.length}</strong>{isEn ? ' active jobs' : ' lowongan kerja aktif'}
            </span>
            <Link href="/candidate/practice" className="text-amber-700 hover:text-amber-800 underline underline-offset-2 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEn ? 'Practice free Kraepelin test before applying' : 'Latihan tes Kraepelin gratis sebelum melamar'}</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.length === 0 ? (
              <div className="col-span-full py-16 px-6 bg-white border border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 mb-3">
                  <Briefcase className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {isEn ? 'No positions match your search criteria' : 'Tidak ada lowongan yang sesuai kriteria pencarian'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
                  Coba ubah kata kunci pencarian, pilih kawasan industri lain, atau reset filter untuk melihat semua lowongan.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setSearchTerm(''); setSelectedLocation('all'); setSelectedType('all'); setSelectedCategory('all'); }}
                  className="rounded-xl text-xs border-slate-300 text-slate-900 hover:bg-slate-50"
                >
                  Reset Semua Filter
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {job.is_featured && (
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              ★ REKOMENDASI PABRIK
                            </span>
                          )}
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {job.job_type || 'Full-time'}
                          </span>
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-amber-700 transition-colors pt-1">
                          {job.title}
                        </h2>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{job.company_name || 'PT Industri Mitra Terverifikasi'}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>

                    {/* Location & Wage Strip */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-600 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.location || 'Kawasan Industri'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl text-emerald-800 font-bold truncate">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{job.salary_range || 'Sesuai UMK + Tunjangan'}</span>
                      </div>
                    </div>

                    {/* Competency Tags */}
                    {job.requirements && Array.isArray(job.requirements) && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requirements.slice(0, 3).map((req: string, i: number) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {req}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-5 mt-4 border-t border-slate-100">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold rounded-2xl border-slate-200 h-9.5 hover:bg-slate-50">
                        {isEn ? 'Position Details' : 'Detail Posisi'}
                      </Button>
                    </Link>

                    <Link href={`/apply/${job.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 text-white h-9.5 gap-1 shadow-2xs">
                        <span>{isEn ? 'Apply Now' : 'Lamar Sekarang'}</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
