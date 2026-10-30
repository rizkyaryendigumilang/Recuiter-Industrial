'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useState, Suspense } from 'react';
import { Menu, LogOut, User, Briefcase, ShieldCheck, ArrowRight, Settings, Activity, HelpCircle, Award } from 'lucide-react';

function NavContent() {
  const { isLoggedIn, role, logout, user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/jobs', label: t.nav.jobs },
    { href: '/services', label: t.nav.services },
    { href: '/candidate/practice', label: t.nav.practice, icon: Activity },
    { href: '/help', label: t.nav.help, icon: HelpCircle },
    ...(isLoggedIn && role === 'candidate'
      ? [
          { href: '/candidate', label: t.nav.candidatePortal, icon: User },
          { href: '/candidate/results', label: t.nav.results, icon: Award },
        ]
      : []),
    ...(isLoggedIn && role === 'employer' ? [{ href: '/employer', label: t.nav.employerDashboard, icon: Briefcase }] : []),
    ...(isLoggedIn && role === 'admin' ? [{ href: '/admin', label: t.nav.admin, icon: ShieldCheck }] : []),
    ...(isLoggedIn ? [{ href: '/settings', label: t.nav.settings, icon: Settings }] : []),
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium active:scale-95 transition-transform duration-100 cursor-pointer ${
              isActive(l.href)
                ? 'bg-[#1D1D1F] text-white shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F7]'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {/* Language Switcher & Auth Actions (Desktop) */}
      <div className="hidden lg:flex items-center gap-3">
        {/* Language Selection Menu */}
        <LanguageSwitcher variant="dropdown" />

        {isLoggedIn ? (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#52525B] font-medium bg-[#F5F5F7] px-3 py-1.5 rounded-full truncate max-w-[170px] border border-[#E8E8EC]">
              {user?.email}
            </span>
            <Link href="/settings">
              <Button
                variant="outline"
                size="sm"
                className={`rounded-full h-8 w-8 min-h-[32px] min-w-[32px] p-0 border-[#E8E8EC] active:scale-90 transition-transform cursor-pointer ${
                  isActive('/settings')
                    ? 'bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]'
                    : 'text-[#6B6B6B] hover:text-[#0A0A0A] hover:bg-[#F5F5F7]'
                }`}
                title={t.nav.settings}
              >
                <Settings className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="rounded-full text-xs font-medium border-[#E8E8EC] text-[#1D1D1F] hover:bg-[#F5F5F7] h-8 px-3 active:scale-95 transition-transform cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1 text-[#86868B]" />
              {t.nav.logout}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-xs font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] h-8 px-3.5"
              >
                {t.nav.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="rounded-full text-xs font-medium bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-sm h-8 px-4 transition-all"
              >
                {t.nav.register}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Mobile & Tablet Drawer */}
      <div className="flex items-center gap-2 lg:hidden">
        <LanguageSwitcher variant="pill" />
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="lg:hidden" render={<Button variant="ghost" size="sm" className="p-2 rounded-full text-[#1D1D1F] hover:bg-[#F5F5F7]" />}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80 pt-10 bg-[#FFFFFF] border-l border-[#E8E8EC]">
            <div className="flex flex-col gap-2">
              <div className="px-3 pb-3 border-b border-[#E8E8EC]">
                <p className="font-bold text-lg text-[#0A0A0A]">
                  HR<span className="text-[#6366F1]">Tech</span>
                </p>
                <p className="text-xs text-[#86868B] mt-0.5">{t.nav.brandSub}</p>
              </div>

              {/* Mobile Language Selector */}
              <div className="py-2 px-1">
                <LanguageSwitcher variant="mobile" />
              </div>

              <div className="border-t border-[#E8E8EC] my-1" />

              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isActive(l.href)
                      ? 'bg-[#1D1D1F] text-white'
                      : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="border-t border-[#E8E8EC] my-3" />
              {isLoggedIn ? (
                <div className="space-y-3 px-1">
                  <p className="text-xs text-[#86868B] truncate px-2 font-mono">{user?.email}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { logout(); setOpen(false); }}
                    className="w-full rounded-full border-[#E8E8EC]"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t.nav.logout}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full rounded-full border-[#E8E8EC] text-xs">
                      {t.auth.loginTitle}
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button size="sm" className="w-full rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-medium">
                      {t.nav.register}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-[#FFFFFF]/85 backdrop-blur-xl border-b border-[#E8E8EC]">
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-7 h-7 rounded-lg bg-[#0A0A0A] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm group-hover:bg-[#6366F1] transition-colors">
            HR
          </span>
          <span className="font-bold text-base tracking-tight text-[#0A0A0A]">
            Tech<span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6366F1] ml-0.5 align-baseline"></span>
          </span>
        </Link>
        <Suspense fallback={<div className="h-7 w-20 bg-[#F5F5F7] rounded-full animate-pulse" />}>
          <NavContent />
        </Suspense>
      </div>
    </header>
  );
}
