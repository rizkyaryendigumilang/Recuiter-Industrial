/**
 * Settings Architecture & Configuration Specification
 * Professional SaaS Settings Layout & Categories
 */

export interface SettingsGroup {
  id: string;
  label: string;
  labelEn: string;
}

export interface SettingsCategory {
  id: string;
  groupId: string;
  label: string;
  desc: string;
  keywords: string[];
  roles: ('candidate' | 'employer' | 'admin' | string)[];
}

export interface SettingsPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  defaultLanding: string;
  theme: string;
  accentColor: string;
  density: string;
  fontSize: string;
  emailAlerts: boolean;
  pushAlerts: boolean;
  inAppAlerts: boolean;
  jobAlertsWA: boolean;
  assessmentReminderFreq: string;
  autoGradingKraepelin: boolean;
  autoInterviewInvite: boolean;
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'general', label: 'Pengaturan Umum', labelEn: 'General Settings' },
  { id: 'workspace', label: 'Workspace & SaaS', labelEn: 'Workspace & SaaS' },
  { id: 'developer', label: 'Data & Developer', labelEn: 'Data & Developer' },
  { id: 'support', label: 'Bantuan & Info', labelEn: 'Support & Info' },
];

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  // General Group
  {
    id: 'account',
    groupId: 'general',
    label: 'Account & Profile',
    desc: 'Informasi dan identitas pengguna, kontak, dan kredensial akses',
    keywords: ['profil', 'nama', 'email', 'avatar', 'password', 'kata sandi', 'telepon', 'phone'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'preferences',
    groupId: 'general',
    label: 'Preferences',
    desc: 'Preferensi bahasa antarmuka, zona waktu, dan format tanggal',
    keywords: ['bahasa', 'language', 'timezone', 'waktu', 'format', 'landing page', 'wib'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'appearance',
    groupId: 'general',
    label: 'Appearance',
    desc: 'Tema warna, kontras industri, ukuran font, dan kepadatan antarmuka',
    keywords: ['tema', 'theme', 'dark', 'light', 'warna', 'density', 'font', 'tampilan'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'notifications',
    groupId: 'general',
    label: 'Notifications',
    desc: 'Saluran pemberitahuan WhatsApp, email alert, dan frekuensi asesmen',
    keywords: ['notifikasi', 'email', 'whatsapp', 'wa', 'push', 'alert', 'frekuensi', 'pengingat'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'security',
    groupId: 'general',
    label: 'Security & Privacy',
    desc: 'Autentikasi dua faktor (2FA), sesi aktif, riwayat login, dan passkey biometrik',
    keywords: ['keamanan', 'security', '2fa', 'sesi', 'session', 'login', 'passkey', 'biometrik', 'perangkat'],
    roles: ['candidate', 'employer', 'admin'],
  },

  // Workspace Group
  {
    id: 'workspace',
    groupId: 'workspace',
    label: 'Workspace & Organization',
    desc: 'Profil instansi/pabrik, anggota tim rekrutmen, dan batas ambang HIMPSI',
    keywords: ['workspace', 'perusahaan', 'pt', 'pabrik', 'tim', 'anggota', 'organisasi', 'himpsi', 'ambang'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'billing',
    groupId: 'workspace',
    label: 'Subscription & Billing',
    desc: 'Paket langganan aktif, kuota tes Kraepelin, riwayat tagihan dan faktur',
    keywords: ['billing', 'tagihan', 'paket', 'subscription', 'invoice', 'pembayaran', 'kredit', 'kuota'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'integrations',
    groupId: 'workspace',
    label: 'Integrations',
    desc: 'Sinkronisasi Google Calendar, Bot Telegram, dan Helpdesk VPS SSO',
    keywords: ['integrasi', 'google', 'calendar', 'telegram', 'helpdesk', 'sso', 'api', 'webhook'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'automation',
    groupId: 'workspace',
    label: 'Automation & Rules',
    desc: 'Alur grading Kraepelin otomatis, auto-dispatch jadwal interview, dan trigger webhooks',
    keywords: ['otomatisasi', 'automation', 'rules', 'auto-grading', 'kraepelin', 'dispatch', 'trigger'],
    roles: ['employer', 'admin'],
  },

  // Developer Group
  {
    id: 'data',
    groupId: 'developer',
    label: 'Data & Storage',
    desc: 'Ekspor data JSON/CSV, antrean asesmen offline, snapshot backup, dan cache PWA',
    keywords: ['data', 'ekspor', 'export', 'csv', 'json', 'cache', 'pwa', 'offline', 'storage', 'backup'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'developer',
    groupId: 'developer',
    label: 'Developer Settings',
    desc: 'Kunci API (API Key), pengujian payload Webhooks HMAC, dan audit logs',
    keywords: ['developer', 'api', 'key', 'webhook', 'hmac', 'token', 'log', 'audit'],
    roles: ['employer', 'admin'],
  },
  {
    id: 'privacy',
    groupId: 'developer',
    label: 'Privacy & Data Control',
    desc: 'Kebijakan retensi data asesmen psikologi, persetujuan GDPR/UU PDP, dan hapus akun',
    keywords: ['privasi', 'privacy', 'retensi', 'consent', 'persetujuan', 'pdp', 'gdpr', 'hapus akun'],
    roles: ['candidate', 'employer', 'admin'],
  },

  // Support Group
  {
    id: 'help',
    groupId: 'support',
    label: 'Help & Support',
    desc: 'Pusat bantuan FAQ, tiket kendala VPS Helpdesk, dan hotline WhatsApp teknis',
    keywords: ['bantuan', 'help', 'support', 'faq', 'kendala', 'tiket', 'panduan', 'hotline'],
    roles: ['candidate', 'employer', 'admin'],
  },
  {
    id: 'about',
    groupId: 'support',
    label: 'About & Version',
    desc: 'Versi sistem v1.2.0, catatan rilis (changelog), ketentuan layanan, dan legal',
    keywords: ['about', 'versi', 'version', 'changelog', 'rilis', 'legal', 'syarat', 'ketentuan'],
    roles: ['candidate', 'employer', 'admin'],
  },
];

/**
 * Filter categories based on search query and current user role
 */
export function filterSettingsCategories(
  categories: SettingsCategory[],
  query: string = '',
  role: string = 'candidate'
): SettingsCategory[] {
  const cleanQuery = query.trim().toLowerCase();

  return categories.filter((cat) => {
    // 1. Role match
    const roleMatches = cat.roles.includes(role);
    if (!roleMatches) return false;

    // 2. Query match
    if (!cleanQuery) return true;

    const labelMatch = cat.label.toLowerCase().includes(cleanQuery);
    const descMatch = cat.desc.toLowerCase().includes(cleanQuery);
    const keywordMatch = cat.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery));

    return labelMatch || descMatch || keywordMatch;
  });
}

/**
 * Default preferences schema for Reset to Default
 */
export const DEFAULT_PREFERENCES: SettingsPreferences = {
  language: 'id',
  timezone: 'Asia/Jakarta',
  dateFormat: 'DD/MM/YYYY',
  defaultLanding: '/candidate',
  theme: 'light',
  accentColor: 'amber',
  density: 'comfortable',
  fontSize: 'md',
  emailAlerts: true,
  pushAlerts: true,
  inAppAlerts: true,
  jobAlertsWA: true,
  assessmentReminderFreq: 'daily_digest',
  autoGradingKraepelin: true,
  autoInterviewInvite: false,
};
