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
        <div className="bg-[#FFFFFF] border border-[#E8E8EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-neutral-50 border border-neutral-200 border-l-2 border-l-red-600 text-neutral-800 text-xs px-4 py-3 rounded-lg">
                <strong className="text-red-700 font-semibold">{isEn ? 'Error:' : 'Gagal:'}</strong> {error}
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
                className="rounded-lg border-[#E8E8EC] text-sm h-10 bg-white"
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
                className="rounded-lg border-[#E8E8EC] text-sm h-10 bg-white"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs transition-colors duration-150"
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
              className="w-full h-10 rounded-lg border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-medium"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
              {isEn ? 'Auto-fill Demo Credentials' : 'Isi Kredensial Demo Admin'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
