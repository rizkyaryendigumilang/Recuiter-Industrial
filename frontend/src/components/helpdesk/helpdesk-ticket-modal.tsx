'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Button } from '@/components/ui/button';
import { triggerHaptic } from '@/lib/haptics';
import {
  laporkanKendalaKeHelpdesk,
  getHelpdeskUserContext,
  HelpdeskCategory,
} from '@/lib/helpdesk';
import {
  LifeBuoy,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Trash2,
  Sparkles,
  ShieldCheck,
  SendHorizontal,
  Flame,
  Bug,
  KeyRound,
  FileText,
  HelpCircle
} from 'lucide-react';

interface HelpdeskTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialKeluhan?: string;
  initialSubject?: string;
}

const CATEGORIES: { id: HelpdeskCategory; labelId: string; labelEn: string; icon: React.ElementType }[] = [
  { id: 'bug_error', labelId: 'Bug / Kendala Teknis', labelEn: 'Bug / Technical Issue', icon: Bug },
  { id: 'assessment_issue', labelId: 'Asesmen & Tes Kraepelin', labelEn: 'Assessment & Tests', icon: FileText },
  { id: 'account_access', labelId: 'Akun & Autentikasi', labelEn: 'Account & Access', icon: KeyRound },
  { id: 'general_inquiry', labelId: 'Pertanyaan Umum', labelEn: 'General Inquiry', icon: HelpCircle },
];

export function HelpdeskTicketModal({
  isOpen,
  onClose,
  initialKeluhan = '',
  initialSubject = '',
}: HelpdeskTicketModalProps) {
  const { user, role } = useAuth();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [subject, setSubject] = useState(initialSubject);
  const [keluhan, setKeluhan] = useState(initialKeluhan);
  const [category, setCategory] = useState<HelpdeskCategory>('bug_error');
  const [isUrgent, setIsUrgent] = useState(false);
  const [autoSubmit, setAutoSubmit] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial values
  useEffect(() => {
    if (isOpen) {
      setSubject(initialSubject);
      setKeluhan(initialKeluhan);
      setCategory('bug_error');
      setIsUrgent(false);
      setAutoSubmit(true);
      setErrorMessage(null);
      setIsSuccess(false);
      triggerHaptic.light();
    } else {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [isOpen, initialKeluhan, initialSubject]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const userContext = getHelpdeskUserContext(user, role);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isEn ? 'Please upload an image file (PNG, JPG, WEBP).' : 'Harap unggah berkas gambar (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(isEn ? 'Image size must be less than 5MB.' : 'Ukuran foto maksimal 5MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    triggerHaptic.light();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keluhan.trim()) {
      setErrorMessage(t.helpdesk.keluhanRequired);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let photoUrl = '';

    // If an optional screenshot/photo is provided, upload it first
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';
        const primaryEndpoint = `${basePath}/api/helpdesk/upload`.replace(/\/+/g, '/');

        let res = await fetch(primaryEndpoint, {
          method: 'POST',
          body: formData,
        });

        // Fallback to /api/helpdesk/upload if basePath route returns 404
        if (!res.ok && res.status === 404) {
          res = await fetch('/api/helpdesk/upload', {
            method: 'POST',
            body: formData,
          });
        }

        if (res.ok) {
          const data = await res.json();
          if (data.fullUrl) {
            photoUrl = data.fullUrl;
          } else if (data.url) {
            photoUrl = typeof window !== 'undefined' ? `${window.location.origin}${data.url}` : data.url;
          }
        } else {
          console.warn('Photo upload returned non-200, continuing with text description');
        }
      } catch (uploadErr) {
        console.warn('Photo upload error, proceeding without blocking handoff:', uploadErr);
      }
    }

    // Eksekusi handoff SSO JIT ke VPS Helpdesk
    laporkanKendalaKeHelpdesk({
      subject: subject.trim() || `[recruiter] Kendala: ${keluhan.trim().slice(0, 50)}`,
      description: keluhan.trim(),
      category,
      isUrgent,
      autoSubmit,
      photoUrl,
      user,
      role,
      fromUrl: typeof window !== 'undefined' ? window.location.href : '',
    });

    triggerHaptic.success();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  const handleDirectHandoff = () => {
    triggerHaptic.light();
    laporkanKendalaKeHelpdesk({
      subject: '[recruiter] Tiket Bantuan Langsung',
      description: 'Pengguna mengakses formulir tiket langsung dari menu bantuan aplikasi.',
      category: 'general_inquiry',
      isUrgent: false,
      autoSubmit: false,
      user,
      role,
      fromUrl: typeof window !== 'undefined' ? window.location.href : '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overscroll-contain">
      <div
        className="w-full max-w-xl max-h-[calc(100dvh-2rem)] flex flex-col bg-white border border-[#D0D7DE] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="helpdesk-modal-title"
      >
        {/* Modal Header */}
        <div className="relative px-5 py-4 border-b border-[#E1E4E8] bg-[#F6F8FA] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
              <LifeBuoy className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <h2
                id="helpdesk-modal-title"
                className="text-base sm:text-lg font-bold text-[#0D1117] tracking-tight flex items-center gap-2"
              >
                {t.helpdesk.modalTitle}
              </h2>
              <p className="text-[11px] text-[#57606A] line-clamp-1">
                {t.helpdesk.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full border border-[#D0D7DE] bg-white text-[#57606A] hover:text-[#0D1117] hover:bg-[#F6F8FA] flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Scrollable Content */}
        <div className="p-5 overflow-y-auto overscroll-contain space-y-4 text-xs text-[#24292F]">
          {/* Active Context Telemetry Strip */}
          <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0D1117] uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span>SSO Just-In-Time Handoff</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-white border border-[#D0D7DE] text-[#57606A]">
                APP: recruiter
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-[#E1E4E8] truncate">
                <span className="text-[#57606A] block text-[10px] uppercase font-mono">{t.helpdesk.userLabel}</span>
                <span className="font-semibold text-[#0D1117] truncate block" title={userContext.name}>
                  {userContext.name} <span className="text-amber-700 font-mono text-[10px]">({userContext.role})</span>
                </span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-[#E1E4E8] truncate">
                <span className="text-[#57606A] block text-[10px] uppercase font-mono">{t.helpdesk.pageLabel}</span>
                <span className="font-mono text-[#0D1117] truncate block text-[10px]" title={userContext.fromUrl}>
                  {typeof window !== 'undefined' ? window.location.pathname : '/'}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {isSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 animate-in fade-in"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-xs font-medium">{t.helpdesk.successToast}</p>
            </div>
          )}

          {/* Form */}
          <form id="helpdesk-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Kategori Kendala */}
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#0D1117]">
                {isEn ? 'Issue Category' : 'Kategori Kendala'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col items-start gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0D1117] bg-[#0D1117] text-white shadow-xs'
                          : 'border-[#D0D7DE] bg-white hover:bg-[#F6F8FA] text-[#0D1117]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-[#57606A]'}`} />
                      <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                        {isEn ? cat.labelEn : cat.labelId}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject (Optional / Auto) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="subject-input" className="block font-semibold text-[#0D1117]">
                  {isEn ? 'Subject / Summary' : 'Subjek / Judul Kendala'}
                </label>
                <span className="text-[10px] font-mono text-[#57606A]">Opsional (Otomatis)</span>
              </div>
              <input
                id="subject-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isEn ? 'Brief summary of issue (e.g., Timer stopped on column 5)' : 'Contoh: Timer Kraepelin macet di kolom 5'}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl border border-[#D0D7DE] focus:border-[#0D1117] focus:ring-1 focus:ring-[#0D1117] text-xs text-[#0D1117] placeholder:text-[#8C959F] outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Keluhan / Complaint Field */}
            <div className="space-y-1.5">
              <label htmlFor="keluhan-input" className="block font-semibold text-[#0D1117]">
                {t.helpdesk.keluhanLabel} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="keluhan-input"
                rows={3}
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                placeholder={t.helpdesk.keluhanPlaceholder}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D7DE] focus:border-[#0D1117] focus:ring-1 focus:ring-[#0D1117] text-xs text-[#0D1117] placeholder:text-[#8C959F] outline-none transition-all resize-y disabled:opacity-50"
              />
              <p className="text-[11px] text-[#57606A] flex items-center justify-between">
                <span>Mohon jelaskan secara spesifik agar tim kami cepat merespons.</span>
                <span className="font-mono">{keluhan.length} karakter</span>
              </p>
            </div>

            {/* Photo Problem Attachment (Non-mandatory) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-[#0D1117]">
                  {t.helpdesk.photoLabel}
                </label>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[#F6F8FA] border border-[#E1E4E8] text-[#57606A]">
                  Opsional
                </span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                className="hidden"
                id="photo-upload-input"
                disabled={isSubmitting}
              />

              {previewUrl ? (
                <div className="p-3 bg-[#F6F8FA] border border-[#D0D7DE] rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Preview Kendala"
                      className="w-14 h-14 object-cover rounded-lg border border-[#D0D7DE] bg-white shrink-0 shadow-2xs"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0D1117] truncate text-xs">
                        {selectedFile?.name}
                      </p>
                      <p className="text-[11px] text-[#57606A] font-mono mt-0.5">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileChange(null)}
                    disabled={isSubmitting}
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs rounded-lg h-8 px-2.5 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    {t.helpdesk.removePhoto}
                  </Button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all duration-150 ${
                    isDragging
                      ? 'border-amber-500 bg-amber-50/50'
                      : 'border-[#D0D7DE] hover:border-[#0D1117] hover:bg-[#F6F8FA] bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#F6F8FA] border border-[#E1E4E8] text-[#57606A] flex items-center justify-center mx-auto mb-1.5">
                    <Upload className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="font-medium text-[#0D1117] text-xs">
                    {t.helpdesk.photoDropzone}
                  </p>
                  <p className="text-[10px] text-[#8C959F] mt-0.5 font-mono">
                    Format: PNG, JPG, WEBP • Max 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Options: Urgent Priority & Auto Submit */}
            <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-[#D0D7DE] text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-xs font-semibold text-[#0D1117] flex items-center gap-1.5">
                  <Flame className={`w-3.5 h-3.5 ${isUrgent ? 'text-red-500' : 'text-[#8C959F]'}`} />
                  <span>{isEn ? 'Urgent Priority' : 'Tandai Mendesak (Urgent)'}</span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSubmit}
                  onChange={(e) => setAutoSubmit(e.target.checked)}
                  className="rounded border-[#D0D7DE] text-[#0D1117] focus:ring-[#0D1117] h-4 w-4"
                />
                <span className="text-xs text-[#57606A]">
                  {isEn ? 'Auto-submit on open (auto_submit=1)' : 'Auto-submit tiket langsung (auto_submit=1)'}
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#E1E4E8] bg-[#F6F8FA] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDirectHandoff}
            disabled={isSubmitting}
            className="text-[11px] text-[#57606A] hover:text-[#0D1117] underline underline-offset-2 transition-colors cursor-pointer text-center sm:text-left disabled:opacity-50"
          >
            {t.helpdesk.directLink}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border-[#D0D7DE] text-xs h-9 px-4 cursor-pointer"
            >
              {t.helpdesk.cancel}
            </Button>

            <Button
              form="helpdesk-form"
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl bg-[#0D1117] hover:bg-[#21262D] text-white text-xs font-semibold h-9 px-4 gap-2 shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>{t.helpdesk.uploading}</span>
                </>
              ) : (
                <>
                  <SendHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.helpdesk.submit}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
