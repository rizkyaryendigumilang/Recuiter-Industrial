/**
 * Helpdesk VPS SSO Handoff Integration Library
 * Endpoint: https://43.156.236.102/helpdesk/handoff
 * 
 * Facilitates Just-In-Time (JIT) SSO ticket creation with user session context,
 * current page URL, complaint details, and optional problem screenshots.
 */

export const HELPDESK_CONFIG = {
  BASE_URL: 'https://43.156.236.102/helpdesk/handoff',
  APP_SLUG: 'recruiter',
} as const;

export interface HelpdeskUserSession {
  id?: string;
  email?: string;
  name?: string;
  fullName?: string;
  role?: string;
  [key: string]: any;
}

export interface HelpdeskHandoffPayload {
  user?: HelpdeskUserSession | null;
  role?: string | null;
  fromUrl?: string;
  keluhan?: string;
  photoUrl?: string;
  subject?: string;
}

/**
 * Resolves current user context with guest fallback.
 */
export function getHelpdeskUserContext(user?: HelpdeskUserSession | null, currentRole?: string | null) {
  let uid = '';
  let name = '';
  let role = currentRole || user?.role || 'Tamu';

  if (user) {
    uid = user.id || user.email || '';
    name = user.name || user.fullName || (user.email ? user.email.split('@')[0] : '');
  }

  // Fallback if not logged in
  if (!uid && typeof window !== 'undefined') {
    let guestId = localStorage.getItem('helpdesk_guest_uid');
    if (!guestId) {
      guestId = 'tamu_' + Math.random().toString(36).slice(2, 9);
      try {
        localStorage.setItem('helpdesk_guest_uid', guestId);
      } catch {
        // ignore localStorage errors
      }
    }
    uid = guestId;
  }

  if (!uid) {
    uid = 'anonymous_' + Math.random().toString(36).slice(2, 7);
  }

  if (!name) {
    name = uid.startsWith('tamu_') ? 'Tamu / Pengguna Baru' : 'Pengguna';
  }

  // Capitalize or standardize role
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
 * Builds the SSO handoff URL with all required query parameters.
 */
export function buildHelpdeskUrl(options: HelpdeskHandoffPayload = {}): string {
  const context = getHelpdeskUserContext(options.user, options.role);
  const fromUrl = options.fromUrl || context.fromUrl;
  const keluhan = options.keluhan?.trim() || '';
  const photoUrl = options.photoUrl?.trim() || '';

  // Construct description combining complaint and photo proof
  let description = keluhan;
  if (photoUrl) {
    description += `\n\n--- LAMPIRAN BUKTI KENDALA ---\nFoto/Screenshot: ${photoUrl}`;
  }

  // Generate subject if not provided
  let subject = options.subject?.trim();
  if (!subject) {
    if (keluhan) {
      subject = `[${HELPDESK_CONFIG.APP_SLUG}] Kendala: ${keluhan.slice(0, 50)}${keluhan.length > 50 ? '...' : ''}`;
    } else {
      subject = `[${HELPDESK_CONFIG.APP_SLUG}] Tiket Bantuan Pengguna (${context.role})`;
    }
  }

  const params = new URLSearchParams();
  params.set('app', HELPDESK_CONFIG.APP_SLUG);
  params.set('uid', context.uid);
  params.set('name', context.name);
  params.set('role', context.role);
  params.set('from_url', fromUrl);
  params.set('new', '1');

  if (subject) params.set('subject', subject);
  if (description) params.set('description', description);
  if (keluhan) params.set('keluhan', keluhan);
  if (photoUrl) params.set('photo_url', photoUrl);

  return `${HELPDESK_CONFIG.BASE_URL}?${params.toString()}`;
}

/**
 * Opens the VPS Helpdesk handoff directly in a new tab.
 */
export function openHelpdeskHandoff(options: HelpdeskHandoffPayload = {}): void {
  const url = buildHelpdeskUrl(options);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
