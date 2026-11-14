'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Home, 
  Briefcase, 
  Activity, 
  User, 
  HelpCircle,
  Settings
} from 'lucide-react';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isLoggedIn, role } = useAuth();

  const getProfileLink = () => {
    if (!isLoggedIn) return { href: '/login', label: 'Masuk' };
    if (role === 'employer') return { href: '/employer', label: 'Panel HR' };
    if (role === 'admin') return { href: '/admin', label: 'Admin' };
    return { href: '/candidate', label: 'Profil' };
  };

  const profile = getProfileLink();

  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/jobs', label: 'Lowongan', icon: Briefcase },
    { href: '/candidate/practice', label: 'Kraepelin', icon: Activity },
    { href: profile.href, label: profile.label, icon: User },
    { href: isLoggedIn ? '/settings' : '/help', label: isLoggedIn ? 'Setelan' : 'Bantuan', icon: isLoggedIn ? Settings : HelpCircle },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_16px_rgba(15,23,42,0.04)]">
      <nav className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-90 touch-manipulation cursor-pointer ${
                active ? 'text-slate-950 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-amber-100/70 text-amber-900' : ''}`}>
                <Icon className={`w-4.5 h-4.5 ${active ? 'stroke-[2.4px]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
