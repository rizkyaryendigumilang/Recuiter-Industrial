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
import { ShieldCheck, ArrowRight, ChevronLeft, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const [email, setEmail] = useState(isProduction ? '' : 'admin@hrtech.id');
  const [password, setPassword] = useState(isProduction ? '' : 'Admin@hrtech123');
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
      // Jika offline, fallback ke demo admin
      loginAsDemo('admin');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = () => {
    loginAsDemo('admin');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-center py-12 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
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

        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-sm mx-auto shadow-sm mb-3">
            <ShieldCheck className="w-5 h-5 text-[#6366F1]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
            {t.auth.adminLoginTitle}
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {t.auth.adminLoginSubtitle}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-[#1D1D1F]">
                {isEn ? 'Administrator Email' : 'Email Administrator'}
              </Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-[#E8E8EC] text-xs h-10 bg-white font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-pass" className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.passwordLabel}
              </Label>
              <Input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-[#E8E8EC] text-xs h-10 bg-white font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs shadow-sm transition-all"
            >
              {loading ? t.common.loading : t.auth.adminLoginBtn}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Fast Pass */}
          <div className="pt-2 border-t border-[#E8E8EC]">
            <Button
              type="button"
              variant="outline"
              onClick={handle1ClickDemo}
              className="w-full h-10 rounded-full border-dashed border-[#6366F1] bg-indigo-50/50 hover:bg-indigo-50 text-[#6366F1] text-xs font-semibold"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              {isEn ? '1-Click Fast Pass: Auto-login as Admin' : '1-Click Fast Pass: Langsung Masuk Admin'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
