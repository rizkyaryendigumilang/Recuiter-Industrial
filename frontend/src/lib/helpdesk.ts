/**
 * Helpdesk VPS SSO Handoff Integration Library
 * Endpoint: https://43.156.236.102/helpdesk/handoff
 * 
 * Facilitates Just-In-Time (JIT) SSO ticket creation with user session context,
 * current page URL, complaint details, priority, category, auto_submit, and optional problem screenshots.
 */

import { pb } from '@/lib/pocketbase';

export const HELPDESK_CONFIG = {
  BASE_URL: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_HELPDESK_URL) || 'https://43.156.236.102/helpdesk/handoff',
  APP_SLUG: 'recruiter',
} as const;

export interface HelpdeskUserSession {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
  role?: string;
  [key: string]: any;
}

export type HelpdeskCategory =
  | 'bug_error'
  | 'account_access'
  | 'assessment_issue'
  | 'general_inquiry'
  | string;

export type HelpdeskPriority = 'low' | 'medium' | 'urgent';

export interface LaporkanKendalaOptions {
  subject?: string;
  description?: string;
  keluhan?: string; // alias for description
  category?: HelpdeskCategory;
  isUrgent?: boolean;
  priority?: HelpdeskPriority;
  autoSubmit?: boolean;
  photoUrl?: string;
  user?: HelpdeskUserSession | null;
  role?: string | null;
  fromUrl?: string;
}

export interface HelpdeskHandoffPayload extends LaporkanKendalaOptions {}

/**
 * Mengambil sesi pengguna aktif (PocketBase authStore, localStorage demo_user, atau fallback tamu).
 */
export function dapatkanSesiPenggunaAktif(): HelpdeskUserSession {
  if (typeof window !== 'undefined') {
    // 1. Cek dari PocketBase authStore
    if (pb.authStore.isValid && pb.authStore.record) {
      const rec = pb.authStore.record as any;
      return {
        id: rec.id,
        email: rec.email,
        name: rec.name || rec.username || (rec.email ? rec.email.split('@')[0] : 'Pengguna'),
        username: rec.username || rec.email,
        role: rec.role || 'Pengguna',
      };
    }

    // 2. Cek dari LocalStorage demo_user
    const savedDemo = localStorage.getItem('demo_user');
    if (savedDemo) {
      try {
        const u = JSON.parse(savedDemo);
        return {
          id: u.id,
          email: u.email,
          name: u.name || (u.email ? u.email.split('@')[0] : 'Demo User'),
          username: u.username || u.email,
          role: u.role || localStorage.getItem('demo_role') || 'Pengguna',
        };
      } catch {
        // ignore
      }
    }

    // 3. Fallback guest uid
    let guestId = localStorage.getItem('helpdesk_guest_uid');
    if (!guestId) {
      guestId = 'tamu_' + Math.random().toString(36).slice(2, 9);
      try {
        localStorage.setItem('helpdesk_guest_uid', guestId);
      } catch {
        // ignore localStorage errors
      }
    }

    return {
      id: guestId,
      username: guestId,
      name: 'Tamu / Pengguna',
      role: localStorage.getItem('demo_role') || 'Tamu',
    };
  }

  return {
    id: 'anonymous',
    username: 'anonymous',
    name: 'Pengguna',
    role: 'Tamu',
  };
}

/**
 * Resolves current user context with guest fallback.
 */
export function getHelpdeskUserContext(user?: HelpdeskUserSession | null, currentRole?: string | null) {
  const activeUser = user || dapatkanSesiPenggunaAktif();
  const uid = activeUser.id || activeUser.username || activeUser.email || 'anonymous';
  const name = activeUser.name || activeUser.username || (activeUser.email ? activeUser.email.split('@')[0] : 'Pengguna');
  let role = currentRole || activeUser.role || 'Pengguna';

  if (role) {
    if (role.toLowerCase() === 'admin') role = 'Admin';
    else if (role.toLowerCase() === 'employer') role = 'Employer';
    else if (role.toLowerCase() === 'candidate') role = 'Candidate';
  }

  const fromUrl = typeof window !== 'undefined' ? window.location.href : '';

  return {
    uid: uid.slice(0, 200),
    name: name.slice(0, 200),
    role,
    fromUrl,
  };
}

/**
 * Membangun URL tujuan handoff ke Helpdesk VPS lengkap dengan semua query parameters.
 */
export function buildHelpdeskUrl(options: LaporkanKendalaOptions = {}): string {
  const currentUser = options.user || dapatkanSesiPenggunaAktif();
  const fromUrl = options.fromUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const activeRole = options.role || currentUser.role || 'Pengguna';

  const descText = (options.description || options.keluhan || '').trim();
  let finalDescription = descText;
  if (options.photoUrl?.trim()) {
    finalDescription += `\n\n--- LAMPIRAN BUKTI KENDALA ---\nFoto/Screenshot: ${options.photoUrl.trim()}`;
  }

  // Tentukan subject
  let subject = options.subject?.trim();
  if (!subject) {
    if (descText) {
      subject = `[${HELPDESK_CONFIG.APP_SLUG}] Kendala: ${descText.slice(0, 50)}${descText.length > 50 ? '...' : ''}`;
    } else {
      subject = `[${HELPDESK_CONFIG.APP_SLUG}] Tiket Bantuan Pengguna (${activeRole})`;
    }
  }

  const category = options.category || 'bug_error';
  const priority = options.priority || (options.isUrgent ? 'urgent' : 'medium');
  const autoSubmit = options.autoSubmit !== false ? '1' : '0';

  const params = new URLSearchParams({
    app: HELPDESK_CONFIG.APP_SLUG,
    uid: (currentUser.id || currentUser.username || currentUser.email || 'anonymous').slice(0, 200),
    name: (currentUser.name || currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : 'Pengguna')).slice(0, 200),
    role: activeRole,
    from_url: fromUrl,
    new: '1',
    auto_submit: autoSubmit,
    subject: subject,
    description: finalDescription,
    category: category,
    priority: priority,
  });

  if (options.keluhan?.trim()) {
    params.set('keluhan', options.keluhan.trim());
  }

  if (options.photoUrl?.trim()) {
    params.set('photo_url', options.photoUrl.trim());
  }

  return `${HELPDESK_CONFIG.BASE_URL}?${params.toString()}`;
}

/**
 * Fungsi utama pengalihan kendala ke Helpdesk VPS via SSO JIT.
 * Format sesuai instruksi integrasi:
 * laporkanKendalaKeHelpdesk({ subject, description, category = 'bug_error', isUrgent = false })
 */
export function laporkanKendalaKeHelpdesk({
  subject = '',
  description = '',
  category = 'bug_error',
  isUrgent = false,
  autoSubmit = true,
  photoUrl,
  user,
  role,
  fromUrl,
  priority,
}: LaporkanKendalaOptions): string {
  const targetUrl = buildHelpdeskUrl({
    subject,
    description,
    category,
    isUrgent,
    priority,
    autoSubmit,
    photoUrl,
    user,
    role,
    fromUrl,
  });

  if (typeof window !== 'undefined') {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  return targetUrl;
}

/**
 * Alias kompatibilitas untuk pembukaan handoff helpdesk
 */
export function openHelpdeskHandoff(options: LaporkanKendalaOptions = {}): void {
  laporkanKendalaKeHelpdesk(options);
}
