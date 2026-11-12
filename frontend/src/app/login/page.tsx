'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { useHelpdesk } from '@/components/helpdesk/helpdesk-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LanguageSwitcher } from '@/components/language-switcher';
import { RoleSelectionDialog } from '@/components/auth/role-selection-dialog';
import { triggerTelegramAuth } from '@/lib/social-auth';
import { triggerHaptic } from '@/lib/haptics';
import {
  ShieldCheck,
  Briefcase,
  User,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Fingerprint,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  FileText,
  KeyRound,
  Shield,
  Smartphone
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithOAuth, loginWithTelegram, loginAsDemo, requestPasswordReset } = useAuth();
  const { t, language } = useLanguage();
  const { openHelpdesk } = useHelpdesk();
  const isEn = language === 'en';

  // 1. Form States
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 2. Feedback States
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | 'telegram' | 'apple' | 'biometric' | null>(null);

  // 3. Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [legalModalOpen, setLegalModalOpen] = useState<'privacy' | 'terms' | null>(null);

  // 4. Biometric Availability Check
  const [hasBiometric, setHasBiometric] = useState(false);

  // Check saved identity & biometrics on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('remember_me_identity');
      if (saved) {
        setIdentity(saved);
        setRememberMe(true);
      }
      if (window.PublicKeyCredential) {
        setHasBiometric(true);
      }
    }
  }, []);

  // Form submit handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');

    const cleanIdentity = identity.trim();
    if (!cleanIdentity) {
      setError(isEn ? 'Please enter your email, username, or phone number.' : 'Harap masukkan email, username, atau nomor telepon.');
      triggerHaptic.warning();
      return;
    }

    if (!password) {
      setError(isEn ? 'Please enter your password.' : 'Harap masukkan kata sandi Anda.');
      triggerHaptic.warning();
      return;
    }

    setLoading(true);

    try {
      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('remember_me_identity', cleanIdentity);
        } else {
          localStorage.removeItem('remember_me_identity');
        }
      }

      await login(cleanIdentity, password);
      triggerHaptic.success();
    } catch {
      triggerHaptic.warning();
      setError(
        isEn
          ? 'Invalid account identity or password. Please verify your credentials or use the 1-Click Demo buttons below.'
          : 'Identitas akun atau kata sandi tidak cocok. Silakan periksa kembali atau gunakan tombol Akses Demo di bawah.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Social & SSO Logins
  const handleOAuthLogin = async (provider: 'google' | 'github' | 'apple') => {
    setError('');
    setSuccessInfo('');
    setOauthLoading(provider);
    triggerHaptic.light();

    if (provider === 'apple') {
      // Mock Apple ID Sign-In authentication for Apple HIG flow
      setTimeout(() => {
        setOauthLoading(null);
        loginAsDemo('candidate');
        triggerHaptic.success();
      }, 700);
      return;
    }

    try {
      await loginWithOAuth(provider);
      triggerHaptic.success();
    } catch (err: any) {
      triggerHaptic.warning();
      console.error(`OAuth login error (${provider}):`, err);
      setError(
        isEn
          ? `Failed to authenticate with ${provider.toUpperCase()}. Please check network or use direct demo access.`
          : `Gagal login dengan ${provider.toUpperCase()}. Periksa koneksi atau gunakan akses demo langsung.`
      );
    } finally {
      setOauthLoading(null);
    }
  };

  const handleTelegramLogin = async () => {
    setError('');
    setSuccessInfo('');
    setOauthLoading('telegram');
    triggerHaptic.light();
    try {
      await triggerTelegramAuth(loginWithTelegram, isEn);
      triggerHaptic.success();
    } catch (err: any) {
      triggerHaptic.warning();
      console.error('Telegram login error:', err);
      setError(isEn ? 'Telegram authentication was cancelled or failed.' : 'Autentikasi Telegram dibatalkan atau gagal.');
    } finally {
      setOauthLoading(null);
    }
  };

  // Biometric / Passkey Login
  const handleBiometricAuth = async () => {
    setError('');
    setSuccessInfo('');
    setOauthLoading('biometric');
    triggerHaptic.light();

    try {
      // Simulated WebAuthn / Passkey Biometric challenge
      await new Promise((resolve) => setTimeout(resolve, 800));
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('demo_user') : null;

      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        loginAsDemo(parsed.role || 'candidate');
        triggerHaptic.success();
      } else {
        // Fallback to active candidate demo session
        loginAsDemo('candidate');
        triggerHaptic.success();
      }
    } catch (err: any) {
      triggerHaptic.warning();
      setError(isEn ? 'Biometric authentication failed. Please enter your password.' : 'Verifikasi biometrik gagal. Silakan masukkan kata sandi manual.');
    } finally {
      setOauthLoading(null);
    }
  };

  // Password Recovery Submit
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetSubmitting(true);
    triggerHaptic.light();

    try {
      await requestPasswordReset(resetEmail.trim());
      setResetSuccess(true);
      triggerHaptic.success();
    } catch {
      setResetSuccess(true);
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#F6F8FA] flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Top bar with back link, language switcher & helpdesk button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#57606A] hover:text-[#0D1117] font-medium transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.auth.backToHome}</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openHelpdesk()}
              className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer"
              title={t.auth.needHelp}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.auth.needHelp}</span>
            </button>
            <LanguageSwitcher variant="pill" />
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#0D1117] text-white flex items-center justify-center font-bold text-xs font-mono mx-auto shadow-sm mb-3 border border-[#30363D]">
            RI
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D1117]">
            {t.auth.loginTitle}
          </h1>
          <p className="text-xs text-[#57606A] mt-1 max-w-sm mx-auto leading-relaxed">
            {t.auth.loginSubtitle}
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Main Login Card */}
        <div className="bg-white border border-[#D0D7DE] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Social OAuth & Passkey Logins */}
          <div className="space-y-2 mb-6">
            {/* Google Login */}
            <button
              type="button"
              disabled={oauthLoading !== null || loading}
              onClick={() => handleOAuthLogin('google')}
              className="w-full h-11 px-4 rounded-xl border border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-[#0D1117] text-xs font-semibold shadow-2xs flex items-center justify-center gap-3 transition-all cursor-pointer touch-manipulation disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{oauthLoading === 'google' ? t.common.loading : (isEn ? 'Continue with Google' : 'Masuk dengan Google')}</span>
            </button>

            {/* Apple & GitHub Row */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={oauthLoading !== null || loading}
                onClick={() => handleOAuthLogin('github')}
                className="h-10 px-3 rounded-xl border border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-[#0D1117] text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation disabled:opacity-50 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0 fill-[#0D1117]" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>

              <button
                type="button"
                disabled={oauthLoading !== null || loading}
                onClick={() => handleOAuthLogin('apple')}
                className="h-10 px-3 rounded-xl border border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-[#0D1117] text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation disabled:opacity-50 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0 fill-black" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.83-10.43-12.04-22.37-15.63-35.81-3.59-13.44-5.38-25.96-5.38-37.58 0-15.11 3.8-27.79 11.4-38.04 7.6-10.25 17.2-15.48 28.8-15.7 4.12 0 8.97 1.08 14.54 3.25 5.57 2.17 9.4 3.3 11.48 3.4 1.74 0 5.69-1.2 11.87-3.59 6.18-2.39 11.22-3.48 15.11-3.25 12.28.65 22.04 4.89 29.28 12.71-10.65 6.52-15.86 15.42-15.65 26.71.22 9.12 3.79 16.71 10.72 22.77 6.93 6.06 15.17 9.42 24.71 10.08-2.39 7.38-5.32 14.75-8.8 22.11zM119.22 33.15c0-7.39 2.58-14.28 7.74-20.67 5.16-6.39 11.77-10.63 19.82-12.73.65 1.52.98 3.15.98 4.89 0 7.39-2.73 14.35-8.2 20.89-5.47 6.54-12.08 10.46-19.84 11.75-.11-1.3-.5-2.67-.5-4.13z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Telegram Login */}
            <button
              type="button"
              disabled={oauthLoading !== null || loading}
              onClick={() => handleTelegramLogin()}
              className="w-full h-10 px-4 rounded-xl border border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-[#0D1117] text-xs font-semibold shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer touch-manipulation disabled:opacity-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#229ED9]" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.536-.196 1.006.128.832.942z" />
              </svg>
              <span>{oauthLoading === 'telegram' ? t.common.loading : (isEn ? 'Sign in with Telegram' : 'Masuk dengan Telegram')}</span>
            </button>

            {/* Modern Biometrics / Passkey Option */}
            {hasBiometric && (
              <button
                type="button"
                disabled={oauthLoading !== null || loading}
                onClick={handleBiometricAuth}
                className="w-full h-10 px-4 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/70 text-amber-950 text-xs font-semibold shadow-2xs flex items-center justify-center gap-2.5 transition-all cursor-pointer touch-manipulation disabled:opacity-50 active:scale-[0.98]"
              >
                {oauthLoading === 'biometric' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <Fingerprint className="w-4 h-4 text-amber-700" />
                )}
                <span>{t.auth.biometricBtn}</span>
              </button>
            )}
          </div>

          {/* Solid Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D0D7DE]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#57606A] text-[11px] font-mono uppercase font-semibold">
                {t.auth.socialDivider}
              </span>
            </div>
          </div>

          {/* Validation & Error State Banners */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 bg-red-50 border border-red-200 text-red-900 text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold">{isEn ? 'Authentication Failed: ' : 'Gagal Masuk: '}</span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                aria-label="Tutup pesan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {successInfo && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="flex-1 font-medium">{successInfo}</p>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Identitas (Username / Email / Nomor Telepon) */}
            <div className="space-y-1.5">
              <Label htmlFor="identity" className="text-xs font-semibold text-[#0D1117] flex items-center justify-between">
                <span>{t.auth.identityLabel}</span>
                <span className="text-[10px] text-red-500 font-mono">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#57606A]">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="identity"
                  type="text"
                  placeholder={t.auth.identityPlaceholder}
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  className="pl-9 pr-3 rounded-xl border-[#D0D7DE] text-xs h-10.5 bg-white text-[#0D1117] placeholder:text-[#8C959F] focus:border-[#0D1117] focus:ring-1 focus:ring-[#0D1117]"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  required
                />
              </div>
            </div>

            {/* Input Kata Sandi & Show/Hide Toggle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-[#0D1117]">
                  {t.auth.passwordLabel} <span className="text-red-500 font-mono">*</span>
                </Label>

                {/* Tautan Lupa Kata Sandi */}
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(identity.includes('@') ? identity : '');
                    setResetSuccess(false);
                    setForgotModalOpen(true);
                  }}
                  className="text-[11px] text-amber-800 hover:text-amber-950 hover:underline font-medium cursor-pointer"
                >
                  {t.auth.forgotPassword}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#57606A]">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t.auth.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 rounded-xl border-[#D0D7DE] text-xs h-10.5 bg-white text-[#0D1117] placeholder:text-[#8C959F] focus:border-[#0D1117] focus:ring-1 focus:ring-[#0D1117]"
                  autoComplete="current-password"
                  required
                />
                {/* Tombol Show/Hide Password */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    triggerHaptic.light();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#57606A] hover:text-[#0D1117] transition-colors cursor-pointer"
                  aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                  title={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Opsi Ingat Saya (Remember Me) */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D0D7DE] text-[#0D1117] focus:ring-[#0D1117] h-4 w-4"
                />
                <span className="text-xs text-[#57606A] font-medium">
                  {t.auth.rememberMe}
                </span>
              </label>
            </div>

            {/* Tombol Utama (Submit / Login CTA) */}
            <Button
              type="submit"
              disabled={loading || oauthLoading !== null}
              className="w-full h-11 rounded-xl bg-[#0D1117] hover:bg-[#21262D] text-white font-semibold text-xs transition-all duration-150 mt-2 touch-manipulation cursor-pointer active:scale-[0.98] shadow-xs flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>{t.common.loading}</span>
                </>
              ) : (
                <span>{t.auth.loginBtn}</span>
              )}
            </Button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D0D7DE]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#57606A] text-[11px] font-mono uppercase font-semibold">
                {t.auth.quickDemo}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => loginAsDemo('admin')}
              className="w-full p-3 rounded-xl border border-[#D0D7DE] hover:border-[#0D1117] hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-left transition-all duration-150 flex items-center justify-between group cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F6F8FA] border border-[#E1E4E8] text-[#0D1117] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1117]">
                    {isEn ? 'Log in as Administrator' : 'Login sebagai Administrator'}
                  </p>
                  <p className="text-[10px] text-[#57606A] font-mono">
                    admin@hrtech.id / {isEn ? 'Full system control & interviews' : 'Akses panel kendali & kalender'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C959F] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo('employer')}
              className="w-full p-3 rounded-xl border border-[#D0D7DE] hover:border-[#0D1117] hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-left transition-all duration-150 flex items-center justify-between group cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F6F8FA] border border-[#E1E4E8] text-[#0D1117] flex items-center justify-center shrink-0">
                  <Briefcase className="w-4 h-4 text-[#0D1117]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1117]">
                    {isEn ? 'Log in as Employer (Plant HR)' : 'Login sebagai Employer (HR Pabrik)'}
                  </p>
                  <p className="text-[10px] text-[#57606A] font-mono">
                    employer@demo.com / {isEn ? 'Post manufacturing jobs & filter' : 'Pasang lowongan & seleksi pelamar'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C959F] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => loginAsDemo('candidate')}
              className="w-full p-3 rounded-xl border border-[#D0D7DE] hover:border-[#0D1117] hover:bg-[#F6F8FA] active:bg-[#EEF2F6] text-left transition-all duration-150 flex items-center justify-between group cursor-pointer touch-manipulation active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F6F8FA] border border-[#E1E4E8] text-[#0D1117] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#0D1117]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0D1117]">
                    {isEn ? 'Log in as Candidate (Operator)' : 'Login sebagai Kandidat (Operator)'}
                  </p>
                  <p className="text-[10px] text-[#57606A] font-mono">
                    kandidat@demo.com / {isEn ? 'Simulate Kraepelin & upload resume' : 'Tes Kraepelin & unggah resume'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C959F] group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Tautan Pendaftaran (Sign Up / Register) */}
          <div className="text-center text-xs text-[#57606A] mt-6 pt-4 border-t border-[#D0D7DE]">
            <span>{t.auth.noAccount}</span>{' '}
            <Link
              href="/register"
              className="text-[#0D1117] hover:text-amber-800 font-bold underline underline-offset-2 transition-colors cursor-pointer ml-1"
            >
              {t.auth.registerLink}
            </Link>
          </div>
        </div>

        {/* Komponen Pendukung: Legal & Help Links */}
        <div className="text-center text-[11px] text-[#57606A] space-x-3 pt-2">
          <button
            type="button"
            onClick={() => setLegalModalOpen('privacy')}
            className="hover:text-[#0D1117] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {t.auth.privacyPolicy}
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => setLegalModalOpen('terms')}
            className="hover:text-[#0D1117] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {t.auth.termsOfService}
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => openHelpdesk()}
            className="hover:text-[#0D1117] underline underline-offset-2 transition-colors cursor-pointer"
          >
            {t.auth.needHelp}
          </button>
        </div>
      </div>

      {/* MODAL 1: Pemulihan Kata Sandi (Forgot Password) */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain">
          <div
            className="w-full max-w-md bg-white border border-[#D0D7DE] rounded-2xl shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="forgot-password-title"
          >
            <div className="flex items-center justify-between border-b border-[#E1E4E8] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                </div>
                <h3 id="forgot-password-title" className="text-sm font-bold text-[#0D1117]">
                  {t.auth.forgotPasswordTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="text-[#57606A] hover:text-[#0D1117] p-1 rounded-md cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#57606A] leading-relaxed">
              {t.auth.forgotPasswordSubtitle}
            </p>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isEn ? 'Email Dispatched' : 'Email Terkirim'}</span>
                </div>
                <p className="leading-relaxed">{t.auth.forgotPasswordSuccess}</p>
                <Button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full h-9 rounded-lg bg-[#0D1117] text-white text-xs font-semibold mt-2 cursor-pointer"
                >
                  {isEn ? 'Back to Sign In' : 'Kembali ke Halaman Masuk'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email" className="text-xs font-semibold text-[#0D1117]">
                    {isEn ? 'Registered Email Address' : 'Alamat Email Terdaftar'}
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="rounded-xl border-[#D0D7DE] text-xs h-10 bg-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotModalOpen(false)}
                    className="rounded-xl text-xs h-9 cursor-pointer"
                  >
                    {isEn ? 'Cancel' : 'Batal'}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={resetSubmitting}
                    className="rounded-xl bg-[#0D1117] hover:bg-[#21262D] text-white text-xs font-semibold h-9 px-4 cursor-pointer"
                  >
                    {resetSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>{t.common.loading}</span>
                      </>
                    ) : (
                      <span>{t.auth.forgotPasswordBtn}</span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Tautan Legal (Privacy Policy & Terms) */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain">
          <div
            className="w-full max-w-lg bg-white border border-[#D0D7DE] rounded-2xl shadow-xl p-6 space-y-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[#E1E4E8] pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#0D1117]" />
                <h3 className="text-sm font-bold text-[#0D1117]">
                  {legalModalOpen === 'privacy' ? t.auth.privacyPolicy : t.auth.termsOfService}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalOpen(null)}
                className="text-[#57606A] hover:text-[#0D1117] p-1 cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#57606A] space-y-3 leading-relaxed">
              {legalModalOpen === 'privacy' ? (
                <>
                  <p>
                    <strong>1. Pengumpulan Data:</strong> Recruiter Industrial hanya mengumpulkan data identitas profesional, data resume (ekstraksi OCR), dan hasil asesmen psikometri untuk keperluan evaluasi penempatan kerja di sektor industri manufaktur.
                  </p>
                  <p>
                    <strong>2. Keamanan Kredensial:</strong> Kata sandi dienkripsi menggunakan hashing standar industri. Kredensial Telegram dan OAuth diverifikasi dengan validasi kriptografi HMAC-SHA256 tanpa menyimpan kata sandi plain-text.
                  </p>
                  <p>
                    <strong>3. Integritas Hasil Tes:</strong> Nilai kecepatan (Panker), ketelitian (Tianker), dan stabilitas (Janker) disimpan secara aman sesuai kode etik HIMPSI (Himpunan Psikologi Indonesia).
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>1. Ketentuan Akun:</strong> Pengguna wajib memberikan informasi yang akurat dan sah. Satu kandidat hanya berhak memiliki satu profil terverifikasi.
                  </p>
                  <p>
                    <strong>2. Aturan Tes Asesmen:</strong> Selama tes ketahanan Kraepelin berlangsung, sistem anti-cheat memantau perpindahan tab browser. Pelanggaran berulang dapat membatalkan sesi tes.
                  </p>
                  <p>
                    <strong>3. Tanggung Jawab:</strong> Akses demo disediakan khusus untuk evaluasi fitur platform dan tidak menggantikan proses penempatan resmi perusahaan.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-[#E1E4E8] flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => setLegalModalOpen(null)}
                className="rounded-xl bg-[#0D1117] text-white text-xs font-semibold h-8 px-4 cursor-pointer"
              >
                {isEn ? 'Close' : 'Tutup'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Selection Modal for brand new OAuth users */}
      <RoleSelectionDialog />
    </div>
  );
}
