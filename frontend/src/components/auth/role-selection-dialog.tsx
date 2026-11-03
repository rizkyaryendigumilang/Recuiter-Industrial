'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { User, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

export function RoleSelectionDialog() {
  const { needsRoleSelection, assignRole } = useAuth();
  const { language } = useLanguage();
  const isEn = language === 'en';

  if (!needsRoleSelection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A]">
            {isEn ? 'Welcome! Choose Your Role' : 'Selamat Datang! Pilih Peran Anda'}
          </h2>
          <p className="text-xs text-[#52525B] leading-relaxed max-w-xs mx-auto">
            {isEn
              ? 'Complete your profile setup by selecting whether you are looking for work or hiring for an industrial plant.'
              : 'Pilih apakah Anda mencari pekerjaan industri atau ingin merekrut tenaga kerja untuk pabrik.'}
          </p>
        </div>

        <div className="space-y-3">
          {/* Candidate Card */}
          <button
            type="button"
            onClick={() => assignRole('candidate')}
            className="w-full p-4 rounded-xl border border-[#E8E8EC] hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer touch-manipulation"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] group-hover:bg-indigo-600 group-hover:text-white text-[#1D1D1F] flex items-center justify-center shrink-0 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-indigo-950">
                  {isEn ? 'Job Seeker / Candidate' : 'Kandidat / Pencari Kerja'}
                </p>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  {isEn
                    ? 'Upload resume, tryout Kraepelin test, apply to jobs'
                    : 'Unggah CV, simulasi tes Kraepelin, dan lamar posisi pabrik'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#52525B] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Employer Card */}
          <button
            type="button"
            onClick={() => assignRole('employer')}
            className="w-full p-4 rounded-xl border border-[#E8E8EC] hover:border-indigo-600 hover:bg-indigo-50/40 text-left transition-all duration-150 flex items-center justify-between group cursor-pointer touch-manipulation"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] group-hover:bg-indigo-600 group-hover:text-white text-[#1D1D1F] flex items-center justify-center shrink-0 transition-colors">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-indigo-950">
                  {isEn ? 'Employer / Manufacturing Plant' : 'Perusahaan / HR Plant'}
                </p>
                <p className="text-[11px] text-[#52525B] mt-0.5 leading-snug">
                  {isEn
                    ? 'Post job openings, review applicants & psychograms'
                    : 'Pasang lowongan kerja, tinjau psikogram pelamar & ATS'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#52525B] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
