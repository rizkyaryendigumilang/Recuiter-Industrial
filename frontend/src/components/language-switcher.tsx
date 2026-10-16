'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'pill' | 'dropdown' | 'mobile';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'pill') {
    return (
      <div className={`inline-flex items-center p-0.5 rounded-full bg-[#F5F5F7] border border-[#E8E8EC] text-xs ${className}`}>
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            language === 'id'
              ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold'
              : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
          }`}
          title="Ubah ke Bahasa Indonesia"
        >
          <span className="text-xs">🇮🇩</span>
          <span>ID</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            language === 'en'
              ? 'bg-white text-[#0A0A0A] shadow-sm font-semibold'
              : 'text-[#6B6B6B] hover:text-[#0A0A0A]'
          }`}
          title="Switch to English"
        >
          <span className="text-xs">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <label className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider px-2">
          {language === 'id' ? 'Pilih Bahasa / Language' : 'Select Language'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLanguage('id')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
              language === 'id'
                ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                : 'bg-white text-[#1D1D1F] border-[#E8E8EC] hover:bg-[#F5F5F7]'
            }`}
          >
            <span>🇮🇩</span>
            <span>Indonesia (ID)</span>
            {language === 'id' && <Check className="w-3.5 h-3.5 ml-auto" />}
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
              language === 'en'
                ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-sm'
                : 'bg-white text-[#1D1D1F] border-[#E8E8EC] hover:bg-[#F5F5F7]'
            }`}
          >
            <span>🇬🇧</span>
            <span>English (EN)</span>
            {language === 'en' && <Check className="w-3.5 h-3.5 ml-auto" />}
          </button>
        </div>
      </div>
    );
  }

  // Default: Elegant Dropdown
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFFFFF] hover:bg-[#F5F5F7] border border-[#E8E8EC] text-[#1D1D1F] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-3.5 h-3.5 text-[#6366F1]" />
        <span className="font-semibold">{language === 'id' ? 'ID' : 'EN'}</span>
        <span className="text-[10px] text-[#86868B] hidden sm:inline">
          {language === 'id' ? '🇮🇩' : '🇬🇧'}
        </span>
        <ChevronDown className={`w-3 h-3 text-[#86868B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl bg-white p-1.5 shadow-xl border border-[#E8E8EC] z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#86868B]">
            {language === 'id' ? 'Pilih Bahasa' : 'Choose Language'}
          </div>
          <button
            type="button"
            onClick={() => {
              setLanguage('id');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
              language === 'id'
                ? 'bg-[#F5F5F7] font-semibold text-[#0A0A0A]'
                : 'text-[#48484A] hover:bg-[#FAFAFA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇮🇩</span>
              <div className="text-left">
                <p className="leading-tight">Bahasa Indonesia</p>
                <p className="text-[10px] text-[#86868B] font-mono">ID / Default</p>
              </div>
            </div>
            {language === 'id' && <Check className="w-4 h-4 text-[#6366F1]" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors mt-0.5 ${
              language === 'en'
                ? 'bg-[#F5F5F7] font-semibold text-[#0A0A0A]'
                : 'text-[#48484A] hover:bg-[#FAFAFA]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇬🇧</span>
              <div className="text-left">
                <p className="leading-tight">English</p>
                <p className="text-[10px] text-[#86868B] font-mono">EN / Global</p>
              </div>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-[#6366F1]" />}
          </button>
        </div>
      )}
    </div>
  );
}
