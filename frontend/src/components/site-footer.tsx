'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/language-context';

export function SiteFooter() {
  const { t } = useLanguage();
  const [year, setYear] = useState<string>('2026');

  useEffect(() => {
    setYear(String(new Date().getFullYear()));
  }, []);

  return (
    <footer className="border-t border-[#E8E8EC] py-8 text-center text-xs text-[#86868B] bg-white">
      <div className="container mx-auto px-4 space-y-1">
        <p className="font-medium text-[#1D1D1F]">
          &copy; {year} {t.footer.copyright}
        </p>
        <p className="text-[11px] text-[#86868B]">
          {t.footer.tagline}
        </p>
      </div>
    </footer>
  );
}
