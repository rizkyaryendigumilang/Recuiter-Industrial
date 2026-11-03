'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { RoleSelectionDialog } from '@/components/auth/role-selection-dialog';
import { ChevronLeft } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'candidate' | 'employer'>('candidate');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | 'telegram' | null>(null);
  const router = useRouter();
  const { loginWithOAuth, loginWithTelegram } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const handleTelegramLogin = async () => {
    setError('');
    setOauthLoading('telegram');
    try {
      const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
      if (botName && typeof window !== 'undefined') {
        const authUrl = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${encodeURIComponent(window.location.origin)}&request_access=write`;
        window.open(authUrl, 'telegram_auth', 'width=550,height=470');
        return;
      }

      const testTgId = prompt(
        isEn
          ? 'Enter your Telegram Username or ID to test Telegram registration:'
          : 'Masukkan Username atau ID Telegram untuk mendaftar:',
        'pendaftar_telegram'
      );
      if (!testTgId) {
        setOauthLoading(null);
        return;
      }
      await loginWithTelegram({
        id: testTgId.replace(/[^a-zA-Z0-9_]/g, '') || '87654321',
        first_name: testTgId,
        username: testTgId,
        auth_date: Math.floor(Date.now() / 1000),
      });
    } catch (err: any) {
      console.error('Telegram registration error:', err);
      setError(
        isEn
          ? 'Failed to register with Telegram: ' + (err.message || 'Unknown error')
          : 'Gagal mendaftar dengan Telegram: ' + (err.message || 'Kesalahan sistem')
      );
    } finally {
      setOauthLoading(null);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError('');
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
    } catch (err: any) {
      console.error(`OAuth registration error (${provider}):`, err);
      setError(
        isEn
          ? `Failed to register with ${provider === 'google' ? 'Google' : 'GitHub'}. Please check provider settings or use email registration.`
          : `Gagal mendaftar dengan ${provider === 'google' ? 'Google' : 'GitHub'}. Silakan coba kembali atau gunakan pendaftaran email.`
      );
    } finally {
      setOauthLoading(null);
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100dvh-8rem)] min-h-[calc(100vh-8rem)] px-4 py-8">
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#52525B] hover:text-[#1D1D1F] font-medium transition-colors"
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
          <p className="text-xs text-[#52525B] mt-1">
            {t.auth.registerSubtitle}
          </p>
        </CardHeader>
        <CardContent>
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
              <span>{oauthLoading === 'google' ? t.common.loading : (isEn ? 'Register with Google' : 'Daftar dengan Google')}</span>
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
              <span>{oauthLoading === 'github' ? t.common.loading : (isEn ? 'Register with GitHub' : 'Daftar dengan GitHub')}</span>
            </button>

            <button
              type="button"
              disabled={oauthLoading !== null || loading}
              onClick={() => handleTelegramLogin()}
              className="w-full h-11 px-4 rounded-xl border border-[#E8E8EC] bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold shadow-xs flex items-center justify-center gap-3 transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#229ED9]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.942z" />
              </svg>
              <span>{oauthLoading === 'telegram' ? t.common.loading : (isEn ? 'Register with Telegram' : 'Daftar dengan Telegram')}</span>
            </button>
          </div>

          {/* Divider: atau daftar dengan surel */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8EC]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#52525B] text-[11px] font-medium">
                {isEn ? 'or register with email' : 'atau daftar dengan email'}
              </span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
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
              <Label htmlFor="password" className="text-xs font-semibold text-[#1D1D1F]">
                {t.auth.passwordLabel}
              </Label>
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
                className="rounded-lg border-[#E8E8EC] text-xs h-10 bg-white"
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
                  className={`p-3 rounded-lg border text-xs font-semibold transition-colors duration-150 text-center ${
                    role === 'candidate'
                      ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm'
                      : 'border-[#E8E8EC] bg-white text-[#52525B] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {t.auth.roleCandidate}
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3 rounded-lg border text-xs font-semibold transition-colors duration-150 text-center ${
                    role === 'employer'
                      ? 'border-[#1D1D1F] bg-[#1D1D1F] text-white shadow-sm'
                      : 'border-[#E8E8EC] bg-white text-[#52525B] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {t.auth.roleEmployer}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-lg bg-[#1D1D1F] hover:bg-[#000000] text-white font-medium text-xs transition-colors duration-150 mt-3"
            >
              {loading ? t.common.loading : t.auth.registerBtn}
            </Button>
          </form>

          <p className="text-center text-xs text-[#52525B] mt-6 pt-4 border-t border-[#E8E8EC]">
            {t.auth.hasAccount}{' '}
            <Link href="/login" className="text-[#6366F1] font-semibold hover:underline">
              {t.auth.loginLink}
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Role Selection Dialog for First-Time OAuth Sign-ups */}
      <RoleSelectionDialog />
    </div>
  );
}
