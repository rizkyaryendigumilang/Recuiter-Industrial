'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(isEn ? 'Passwords do not match.' : 'Password tidak cocok.');
      return;
    }
    if (password.length < 8) {
      setError(isEn ? 'Password must be at least 8 characters.' : 'Password minimal 8 karakter.');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: confirmPassword,
        role,
      });
      await pb.collection('users').authWithPassword(email, password);
      if (role === 'employer') router.push('/employer');
      else router.push('/candidate');
    } catch {
      setError(
        isEn
          ? 'Registration failed. Email might already be registered.'
          : 'Pendaftaran gagal. Email mungkin sudah terdaftar.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] font-medium transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t.auth.backToHome}
        </Link>
        <LanguageSwitcher variant="pill" />
      </div>

      <Card className="w-full max-w-md rounded-3xl border-[#E8E8EC] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-[#0A0A0A]">
            {t.auth.registerTitle}
          </CardTitle>
          <p className="text-xs text-[#6B6B6B] mt-1">
            {t.auth.registerSubtitle}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl leading-relaxed">
                {error}
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
                className="rounded-xl border-[#E8E8EC] text-xs h-10 bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.passwordLabel}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-[#E8E8EC] text-xs h-10 bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.confirmPasswordLabel}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={isEn ? 'Re-type password' : 'Ulangi kata sandi'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl border-[#E8E8EC] text-xs h-10 bg-white"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.roleLabel}
              </Label>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setRole('candidate')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                    role === 'candidate'
                      ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm'
                      : 'border-[#E8E8EC] bg-white text-[#6B6B6B] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {t.auth.roleCandidate}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                    role === 'employer'
                      ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm'
                      : 'border-[#E8E8EC] bg-white text-[#6B6B6B] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {t.auth.roleEmployer}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs shadow-sm transition-all mt-3"
            >
              {loading ? t.common.loading : t.auth.registerBtn}
            </Button>
          </form>

          <p className="text-center text-xs text-[#86868B] mt-6 pt-4 border-t border-[#E8E8EC]">
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="text-[#6366F1] font-semibold hover:underline">
              {t.auth.loginLink}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
