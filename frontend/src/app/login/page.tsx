'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  ShieldCheck,
  Briefcase,
  User,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, loginAsDemo } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch {
      setError(
        isEn
          ? 'Invalid email or password. Please double check or use the 1-Click Demo Access buttons below.'
          : 'Email atau password salah. Silakan periksa kembali atau gunakan tombol Akses Demo di bawah.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'employer' | 'candidate') => {
    loginAsDemo(role);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Top bar with back link & language switcher */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.auth.backToHome}
          </Link>
          <LanguageSwitcher variant="pill" />
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm mx-auto shadow-sm mb-3">
            HR
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {t.auth.loginSubtitle}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Main Login Card */}
        <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-neutral-50 border border-neutral-200 border-l-2 border-l-red-600 text-neutral-800 text-xs px-4 py-3 rounded-lg leading-relaxed">
                <strong className="text-red-700 font-semibold">{isEn ? 'Error:' : 'Gagal:'}</strong> {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.emailLabel}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border-[#E8E8EC] text-xs h-10 bg-white"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-[#1D1D1F]">
                  {t.auth.passwordLabel}
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border-[#E8E8EC] text-xs h-10 bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs transition-colors duration-150 mt-2"
            >
              {loading ? t.common.loading : t.auth.loginBtn}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8EC]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#86868B] text-[11px] font-medium">
                {t.auth.quickDemo}
              </span>
            </div>
          </div>

          {/* 1-Click Role Switcher Demo */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Administrator' : 'Login sebagai Administrator'}
                  </p>
                  <p className="text-[10px] text-[#86868B]">
                    admin@hrtech.id &bull; {isEn ? 'Access Admin Controls & Calendar' : 'Akses Menu Administrasi & Kalender'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#86868B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employer')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Employer (SME)' : 'Login sebagai Employer (UMKM)'}
                  </p>
                  <p className="text-[10px] text-[#86868B]">
                    employer@demo.com &bull; {isEn ? 'Post jobs & review applicants' : 'Pasang lowongan & pantau pelamar'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#86868B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('candidate')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Job Seeker' : 'Login sebagai Kandidat Pelamar'}
                  </p>
                  <p className="text-[10px] text-[#86868B]">
                    kandidat@demo.com &bull; {isEn ? 'Upload CV, OCR match, & assessments' : 'Unggah CV, OCR matching, & tes psikotes'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#86868B] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Footer Register Link */}
          <p className="text-center text-xs text-[#86868B] mt-6 pt-4 border-t border-[#E8E8EC]">
            {t.auth.noAccount}{' '}
            <Link href="/register" className="text-[#6366F1] font-semibold hover:underline">
              {t.auth.registerLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
