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
import { RoleSelectionDialog } from '@/components/auth/role-selection-dialog';
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
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const router = useRouter();
  const { login, loginWithOAuth, loginAsDemo } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('');
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      console.error(`OAuth login error (${provider}):`, err);
      setError(
        isEn
          ? `Failed to authenticate with ${provider === 'google' ? 'Google' : 'GitHub'}. Please ensure the provider is configured in PocketBase or use demo access.`
          : `Gagal login dengan ${provider === 'google' ? 'Google' : 'GitHub'}. Pastikan kredensial aktif di server atau gunakan akses demo.`
      );
    } finally {
      setOauthLoading(null);
    }
  };

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
          {/* Social OAuth2 Buttons (Google & GitHub) */}
          <div className="space-y-2.5 mb-6">
            <button
              type="button"
              disabled={oauthLoading !== null || loading}
              onClick={() => handleOAuthLogin('google')}
              className="w-full h-11 px-4 rounded-xl border border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{oauthLoading === 'google' ? t.common.loading : (isEn ? 'Continue with Google' : 'Masuk dengan Google')}</span>
            </button>

            <button
              type="button"
              disabled={oauthLoading !== null || loading}
              onClick={() => handleOAuthLogin('github')}
              className="w-full h-11 px-4 rounded-xl border border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#1D1D1F]" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>{oauthLoading === 'github' ? t.common.loading : (isEn ? 'Continue with GitHub' : 'Masuk dengan GitHub')}</span>
            </button>
          </div>

          {/* Divider: atau masuk dengan email */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8EC]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#52525B] text-[11px] font-medium">
                {isEn ? 'or sign in with email' : 'atau masuk dengan email'}
              </span>
            </div>
          </div>

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
              disabled={loading || oauthLoading !== null}
              className="w-full h-10 rounded-lg bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs transition-colors duration-150 mt-2 touch-manipulation"
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
              <span className="bg-white px-3 text-[#52525B] text-[11px] font-medium">
                {t.auth.quickDemo}
              </span>
            </div>
          </div>

          {/* 1-Click Role Switcher Demo */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group cursor-pointer touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Administrator' : 'Login sebagai Administrator'}
                  </p>
                  <p className="text-[10px] text-[#52525B]">
                    admin@hrtech.id &bull; {isEn ? 'Access Admin Controls & Calendar' : 'Akses Menu Administrasi & Kalender'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#52525B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employer')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group cursor-pointer touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Employer (SME)' : 'Login sebagai Employer (UMKM)'}
                  </p>
                  <p className="text-[10px] text-[#52525B]">
                    employer@demo.com &bull; {isEn ? 'Post jobs & review applicants' : 'Pasang lowongan & pantau pelamar'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#52525B] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('candidate')}
              className="w-full p-3 rounded-xl border border-[#E8E8EC] hover:border-neutral-400 hover:bg-[#F5F5F7] text-left transition-colors duration-150 flex items-center justify-between group cursor-pointer touch-manipulation"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] group-hover:text-black transition-colors">
                    {isEn ? 'Log in as Job Seeker' : 'Login sebagai Kandidat Pelamar'}
                  </p>
                  <p className="text-[10px] text-[#52525B]">
                    kandidat@demo.com &bull; {isEn ? 'Upload CV, OCR match, & assessments' : 'Unggah CV, OCR matching, & tes psikotes'}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#52525B] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Footer Register Link */}
          <p className="text-center text-xs text-[#52525B] mt-6 pt-4 border-t border-[#E8E8EC]">
            {t.auth.noAccount}{' '}
            <Link href="/register" className="text-[#6366F1] font-semibold hover:underline">
              {t.auth.registerLink}
            </Link>
          </p>
        </div>
      </div>

      {/* Role Selection Modal for brand new OAuth users */}
      <RoleSelectionDialog />
    </div>
  );
}
