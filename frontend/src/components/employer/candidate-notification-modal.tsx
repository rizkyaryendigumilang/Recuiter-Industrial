'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/language-context';
import {
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  X,
  Send,
  Calendar,
  Building2,
} from 'lucide-react';

interface CandidateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobTitle: string;
  companyName: string;
  newStatus: 'interview' | 'hired' | string;
}

export function CandidateNotificationModal({
  isOpen,
  onClose,
  candidateName,
  candidateEmail,
  candidatePhone = '6281234567890',
  jobTitle,
  companyName,
  newStatus,
}: CandidateNotificationModalProps) {
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [copiedWA, setCopiedWA] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format clean phone number for wa.me
  const cleanPhone = candidatePhone.replace(/\D/g, '').replace(/^0/, '62');

  // Generate templates based on status
  const isInterview = newStatus === 'interview';
  const stageTitle = isInterview
    ? (isEn ? 'Job Interview' : 'Wawancara Kerja (Interview)')
    : (isEn ? 'Hired / Accepted' : 'Penerimaan Kerja (Hired)');

  const waTemplate = isInterview
    ? (isEn
        ? `Hello ${candidateName}, congratulations! Your application for the position of *${jobTitle}* at *${companyName}* has passed resume screening and psychometric assessments.\n\nWe would like to invite you to attend an *Interview Session* with our recruitment team.\n\nPlease confirm your schedule availability by replying to this message. Thank you!\n\n— HR Team ${companyName}`
        : `Halo ${candidateName}, selamat! Lamaran Anda untuk posisi *${jobTitle}* di *${companyName}* telah lolos seleksi berkas dan tes asesmen psikometri.\n\nKami mengundang Anda untuk menghadiri sesi *Wawancara Kerja* bersama tim rekrutmen kami.\n\nMohon konfirmasi ketersediaan jadwal Anda dengan membalas pesan ini. Terima kasih!\n\n— Tim HR ${companyName}`)
    : (isEn
        ? `Hello ${candidateName}, congratulations! Based on your entire evaluation and interview process, you have been officially *HIRED* for the position of *${jobTitle}* at *${companyName}*.\n\nWe will send the formal Offering Letter to your email (${candidateEmail}). Please review and sign the document.\n\nWelcome to the team!\n— HR Team ${companyName}`
        : `Halo ${candidateName}, selamat! Berdasarkan seluruh rangkaian evaluasi asesmen dan wawancara kerja, Anda dinyatakan *DITERIMA (HIRED)* untuk posisi *${jobTitle}* di *${companyName}*.\n\nKami akan mengirimkan surat penawaran kerja (Offering Letter) resmi ke email Anda (${candidateEmail}). Mohon kesediaannya untuk memeriksa berkas tersebut.\n\nSelamat bergabung!\n— Tim HR ${companyName}`);

  const emailSubject = isInterview
    ? (isEn ? `[Interview Invitation] Position: ${jobTitle} - ${companyName}` : `[Undangan Interview] Posisi ${jobTitle} - ${companyName}`)
    : (isEn ? `[Congratulations!] Selection Results for ${jobTitle} - ${companyName}` : `[Selamat!] Hasil Seleksi Kerja Posisi ${jobTitle} - ${companyName}`);

  const emailBody = isEn
    ? `Dear ${candidateName},\n\n${waTemplate.replace(/\*/g, '')}\n\nWarm regards,\nHR Team ${companyName}`
    : `Yth. ${candidateName},\n\n${waTemplate.replace(/\*/g, '')}\n\nSalam hormat,\nTim HR ${companyName}`;

  const mailtoUrl = `mailto:${candidateEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waTemplate)}`;

  const copyWAText = () => {
    navigator.clipboard.writeText(waTemplate);
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 2500);
  };

  const copyEmailText = () => {
    navigator.clipboard.writeText(candidateEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden text-neutral-900 animate-in zoom-in-95 duration-200 ease-out gpu-layer will-animate"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <Send className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#0A0A0A]">
                {t.notification.title}
              </h3>
              <p className="text-[11px] text-neutral-500">
                {isEn ? 'Status updated to:' : 'Status diperbarui ke:'} <strong className="text-emerald-700 uppercase">{stageTitle}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* Target Profile Card */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">{candidateName}</span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {jobTitle}
              </Badge>
            </div>
            <p className="text-neutral-500 text-[11px]">
              {isEn ? 'Company:' : 'Perusahaan:'} <strong>{companyName}</strong>
            </p>
          </div>

          {/* 1. EMAIL SECTION */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#6366F1]" />
                {t.notification.emailLabel}
              </span>
              <button
                onClick={copyEmailText}
                className="text-[11px] text-[#6366F1] hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedEmail ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    {t.common.copied}
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    {t.notification.copyEmailBtn}
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between">
              <span className="font-mono text-neutral-800 font-semibold">{candidateEmail}</span>
              <a href={mailtoUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="outline" className="h-7 text-[11px] rounded-full">
                  {t.notification.openMailBtn} &rarr;
                </Button>
              </a>
            </div>
          </div>

          {/* 2. WHATSAPP SECTION (Clip to Paste) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-800 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                {t.notification.waLabel}
              </span>
              <span className="font-mono text-[11px] text-neutral-500">
                {isEn ? 'No:' : 'No:'} {candidatePhone}
              </span>
            </div>

            {/* Template Box */}
            <div className="relative p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-[11px] text-neutral-700 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto">
              {waTemplate}
            </div>

            {/* Actions for WhatsApp */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                onClick={copyWAText}
                variant="outline"
                className="rounded-full text-xs h-9 border-neutral-300 hover:bg-neutral-100 flex items-center justify-center gap-1.5 font-medium"
              >
                {copiedWA ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    {t.notification.copiedFeedback}
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    {t.notification.copyWABtn}
                  </>
                )}
              </Button>

              <a href={waUrl} target="_blank" rel="noreferrer" className="w-full">
                <Button
                  type="button"
                  className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 flex items-center justify-center gap-1.5 font-semibold shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  {t.notification.openWABtn}
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex justify-end">
          <Button
            onClick={onClose}
            className="rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs h-8 px-6"
          >
            {t.notification.closeBtn}
          </Button>
        </div>
      </div>
    </div>
  );
}
