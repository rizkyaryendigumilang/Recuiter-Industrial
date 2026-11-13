'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  User,
  Settings as SettingsIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Download,
  ShieldCheck,
  Briefcase,
  Building,
  Smartphone,
  Lock,
  Compass,
  Sliders,
  DollarSign,
  PhoneCall,
  Server,
  Palette,
  Bell,
  CreditCard,
  Share2,
  Cpu,
  Database,
  Key,
  ShieldAlert,
  HelpCircle,
  Info,
  LogOut,
  Search,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Trash2,
  Users,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';
import { laporkanKendalaKeHelpdesk } from '@/lib/helpdesk';
import {
  SETTINGS_CATEGORIES,
  SETTINGS_GROUPS,
  DEFAULT_PREFERENCES,
  filterSettingsCategories,
  type SettingsCategory,
  type SettingsGroup,
} from '@/lib/settings-config';

export default function SettingsPage() {
  const router = useRouter();
  const { user, role, updateUser, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const userRole = role || 'candidate';

  // --- Active Tab & Search State ---
  const [activeCategory, setActiveCategory] = useState<string>('account');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- Autosave & Notification Indicator ---
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');

  // --- Profile / Account State ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [careerHeadline, setCareerHeadline] = useState('');
  const [domicile, setDomicile] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // --- Password / Security State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  // --- Preferences State ---
  const [timezone, setTimezone] = useState('Asia/Jakarta');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [defaultLanding, setDefaultLanding] = useState('/candidate');

  // --- Appearance State ---
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState('amber');
  const [density, setDensity] = useState('comfortable');
  const [fontSize, setFontSize] = useState('md');

  // --- Notification State ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [jobAlertsWA, setJobAlertsWA] = useState(true);
  const [reminderFreq, setReminderFreq] = useState('daily_digest');

  // --- Workspace & Organization State (Employer/Admin) ---
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [minKraepelin, setMinKraepelin] = useState(65);
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [uniqueCodeEnabled, setUniqueCodeEnabled] = useState(true);
  const [hotlinePhone, setHotlinePhone] = useState('+62 812-9988-7766');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // --- Automation State ---
  const [autoGradingKraepelin, setAutoGradingKraepelin] = useState(true);
  const [autoInterviewInvite, setAutoInterviewInvite] = useState(false);
  const [thresholdAutoReject, setThresholdAutoReject] = useState(50);
  const [scheduledBackup, setScheduledBackup] = useState(true);

  // --- Developer State ---
  const [apiKey, setApiKey] = useState('rec_live_8f9c73a1e4b52d9847e112bc90a');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/recruiter-dispatch');
  const [webhookSecret] = useState('whsec_7d8e9f2a4b1c3e5d6a8b0c2e4f6a8b0c');
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);
  const [webhookTesting, setWebhookTesting] = useState(false);

  // --- Privacy & Consent State ---
  const [dataRetention, setDataRetention] = useState('1_year');
  const [pdpConsent, setPdpConsent] = useState(true);

  // --- PWA & Cache State ---
  const [isStandalone, setIsStandalone] = useState(false);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  // --- Confirmation Dialog States ---
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [confirmClearCacheOpen, setConfirmClearCacheOpen] = useState(false);
  const [confirmSignOutOpen, setConfirmSignOutOpen] = useState(false);
  const [confirmRevokeKeyOpen, setConfirmRevokeKeyOpen] = useState(false);
  const [confirmDeleteAccountOpen, setConfirmDeleteAccountOpen] = useState(false);

  // Load initial settings on mount
  useEffect(() => {
    if (user) {
      setName(user.name || (user.email ? user.email.split('@')[0] : ''));
      setEmail(user.email || '');
      setUsername(user.username || (user.email ? user.email.split('@')[0] : 'user_recruiter'));
      setPhone(user.phone || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') || '' : ''));

      // Candidate state
      setCareerHeadline(user.career_headline || (typeof window !== 'undefined' ? localStorage.getItem('cand_headline') || 'Operator Manufaktur / Staff QC' : ''));
      setDomicile(user.domicile || (typeof window !== 'undefined' ? localStorage.getItem('cand_domicile') || 'Cikarang, Jawa Barat' : ''));
      setExpectedSalary(user.expected_salary || (typeof window !== 'undefined' ? localStorage.getItem('cand_salary') || '6.500.000' : ''));
      setPortfolioUrl(user.portfolio_url || (typeof window !== 'undefined' ? localStorage.getItem('cand_portfolio') || 'https://linkedin.com/in/candidate' : ''));

      // Employer state
      setCompanyName(user.company_name || (typeof window !== 'undefined' ? localStorage.getItem('company_name') || 'PT Industri Maju Indonesia' : ''));
      setIndustry(user.industry || (typeof window !== 'undefined' ? localStorage.getItem('company_industry') || 'Manufaktur Otomotif' : ''));
      setCompanySize(user.company_size || (typeof window !== 'undefined' ? localStorage.getItem('company_size') || '250 - 500 Karyawan' : ''));
      setWebsite(user.website || (typeof window !== 'undefined' ? localStorage.getItem('company_website') || 'https://industrimaju.co.id' : ''));
      setAddress(user.address || (typeof window !== 'undefined' ? localStorage.getItem('company_address') || 'Kawasan Industri GIIC Cikarang, Jawa Barat' : ''));
    }

    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);

      // Load saved preferences
      const savedTz = localStorage.getItem('pref_timezone');
      if (savedTz) setTimezone(savedTz);

      const savedDf = localStorage.getItem('pref_date_format');
      if (savedDf) setDateFormat(savedDf);

      const savedLanding = localStorage.getItem('pref_default_landing');
      if (savedLanding) setDefaultLanding(savedLanding);

      const savedTheme = localStorage.getItem('pref_theme') as 'light' | 'dark' | 'system';
      if (savedTheme) setThemeMode(savedTheme);

      const savedAccent = localStorage.getItem('pref_accent');
      if (savedAccent) setAccentColor(savedAccent);

      const savedDensity = localStorage.getItem('pref_density');
      if (savedDensity) setDensity(savedDensity);

      const savedFontSize = localStorage.getItem('pref_font_size');
      if (savedFontSize) setFontSize(savedFontSize);

      const savedEmailAlerts = localStorage.getItem('notif_email');
      if (savedEmailAlerts !== null) setEmailAlerts(savedEmailAlerts === 'true');

      const savedPushAlerts = localStorage.getItem('notif_push');
      if (savedPushAlerts !== null) setPushAlerts(savedPushAlerts === 'true');

      const savedJobWA = localStorage.getItem('cand_job_alerts');
      if (savedJobWA !== null) setJobAlertsWA(savedJobWA === 'true');

      const saved2FA = localStorage.getItem('sec_2fa');
      if (saved2FA !== null) setTwoFactorEnabled(saved2FA === 'true');

      const savedAutoKraepelin = localStorage.getItem('auto_kraepelin');
      if (savedAutoKraepelin !== null) setAutoGradingKraepelin(savedAutoKraepelin === 'true');

      const savedAutoInterview = localStorage.getItem('auto_interview');
      if (savedAutoInterview !== null) setAutoInterviewInvite(savedAutoInterview === 'true');

      const savedKraepelin = localStorage.getItem('sys_min_kraepelin');
      if (savedKraepelin) setMinKraepelin(Number(savedKraepelin));

      const savedMatch = localStorage.getItem('sys_min_match');
      if (savedMatch) setMinMatchScore(Number(savedMatch));

      const savedApiKey = localStorage.getItem('dev_api_key');
      if (savedApiKey) setApiKey(savedApiKey);
    }
  }, [user]);

  // Trigger simulated autosave indicator
  const triggerAutosave = () => {
    setAutosaveStatus('saving');
    setTimeout(() => {
      setAutosaveStatus('saved');
    }, 600);
  };

  // Filter categories
  const filteredCategories: SettingsCategory[] = filterSettingsCategories(
    SETTINGS_CATEGORIES,
    searchQuery,
    userRole
  );

  // Group filtered categories
  const groupedCategories = SETTINGS_GROUPS.map((group: SettingsGroup) => ({
    ...group,
    categories: filteredCategories.filter((c: SettingsCategory) => c.groupId === group.id),
  })).filter((group) => group.categories.length > 0);

  // Handler: Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    triggerAutosave();

    try {
      await updateUser({
        name,
        username,
        phone,
        career_headline: careerHeadline,
        domicile,
        expected_salary: expectedSalary,
        portfolio_url: portfolioUrl,
      });

      if (typeof window !== 'undefined') {
        localStorage.setItem('user_phone', phone);
        localStorage.setItem('cand_headline', careerHeadline);
        localStorage.setItem('cand_domicile', domicile);
        localStorage.setItem('cand_salary', expectedSalary);
        localStorage.setItem('cand_portfolio', portfolioUrl);
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err?.message || 'Gagal menyimpan profil.');
    }
  };

  // Handler: Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError(t.settings.profile.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.settings.profile.passwordMismatch);
      return;
    }

    try {
      await updateUser({
        password: newPassword,
        passwordConfirm: confirmPassword,
        oldPassword: currentPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
      triggerAutosave();
    } catch (err: any) {
      setPasswordError(err?.message || 'Gagal mengganti kata sandi.');
    }
  };

  // Handler: Save Preferences
  const handleSavePreferences = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('pref_timezone', timezone);
      localStorage.setItem('pref_date_format', dateFormat);
      localStorage.setItem('pref_default_landing', defaultLanding);
    }
    triggerAutosave();
  };

  // Handler: Save Appearance
  const handleSaveAppearance = (
    newTheme?: 'light' | 'dark' | 'system',
    newAccent?: string,
    newDensity?: string,
    newFontSize?: string
  ) => {
    const t = newTheme || themeMode;
    const a = newAccent || accentColor;
    const d = newDensity || density;
    const f = newFontSize || fontSize;

    if (newTheme) setThemeMode(newTheme);
    if (newAccent) setAccentColor(newAccent);
    if (newDensity) setDensity(newDensity);
    if (newFontSize) setFontSize(newFontSize);

    if (typeof window !== 'undefined') {
      localStorage.setItem('pref_theme', t);
      localStorage.setItem('pref_accent', a);
      localStorage.setItem('pref_density', d);
      localStorage.setItem('pref_font_size', f);
    }
    triggerAutosave();
  };

  // Handler: Toggle Notifications
  const handleToggleNotification = (key: string, value: boolean) => {
    if (key === 'email') setEmailAlerts(value);
    if (key === 'push') setPushAlerts(value);
    if (key === 'inApp') setInAppAlerts(value);
    if (key === 'jobWA') setJobAlertsWA(value);

    if (typeof window !== 'undefined') {
      if (key === 'email') localStorage.setItem('notif_email', String(value));
      if (key === 'push') localStorage.setItem('notif_push', String(value));
      if (key === 'inApp') localStorage.setItem('notif_inapp', String(value));
      if (key === 'jobWA') localStorage.setItem('cand_job_alerts', String(value));
    }
    triggerAutosave();
  };

  // Handler: Save Workspace & Organization
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_name', companyName);
      localStorage.setItem('company_industry', industry);
      localStorage.setItem('company_size', companySize);
      localStorage.setItem('company_website', website);
      localStorage.setItem('company_address', address);
      localStorage.setItem('sys_min_kraepelin', String(minKraepelin));
      localStorage.setItem('sys_min_match', String(minMatchScore));
      localStorage.setItem('sys_unique_code', String(uniqueCodeEnabled));
      localStorage.setItem('sys_hotline', hotlinePhone);
      localStorage.setItem('sys_maintenance', String(maintenanceMode));
    }

    await updateUser({
      company_name: companyName,
      industry,
      company_size: companySize,
      website,
      address,
    });
    triggerAutosave();
  };

  // Handler: Save Automation Rules
  const handleSaveAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('auto_kraepelin', String(autoGradingKraepelin));
      localStorage.setItem('auto_interview', String(autoInterviewInvite));
      localStorage.setItem('auto_threshold_reject', String(thresholdAutoReject));
      localStorage.setItem('auto_backup', String(scheduledBackup));
    }
    triggerAutosave();
  };

  // Handler: Test Webhook Dispatcher
  const handleTestWebhook = async () => {
    setWebhookTesting(true);
    setWebhookTestStatus(null);
    try {
      const res = await fetch('/api/webhooks/status-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: 'candidate.assessment.completed',
          candidateId: user?.id || 'demo_candidate_1',
          assessmentScore: 88,
          timestamp: new Date().toISOString(),
          webhookUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setWebhookTestStatus('Berhasil mengirim HMAC payload pengujian! Status HTTP 200.');
      } else {
        setWebhookTestStatus(`Respon server: ${data.error || 'Terjadi galat respons'}`);
      }
    } catch {
      setWebhookTestStatus('Uji coba webhook gagal. Pastikan koneksi atau endpoint aktif.');
    } finally {
      setWebhookTesting(false);
    }
  };

  // Handler: Regenerate API Key
  const handleRegenerateApiKey = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const newKey = `rec_live_${randomHex}`;
    setApiKey(newKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev_api_key', newKey);
    }
    setConfirmRevokeKeyOpen(false);
    triggerAutosave();
  };

  // Handler: Copy API Key
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  // Handler: Purge Cache
  const handleClearCache = async () => {
    setCacheClearing(true);
    setCacheMessage('');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((n) => caches.delete(n)));
      }
      setCacheMessage(t.settings.pwa.cacheCleared);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      setCacheClearing(false);
      setCacheMessage('Gagal membersihkan cache.');
    }
  };

  // Handler: Reset to Defaults
  const handleResetToDefaults = () => {
    setLanguage(DEFAULT_PREFERENCES.language as 'id' | 'en');
    setTimezone(DEFAULT_PREFERENCES.timezone);
    setDateFormat(DEFAULT_PREFERENCES.dateFormat);
    setDefaultLanding(DEFAULT_PREFERENCES.defaultLanding);
    setThemeMode(DEFAULT_PREFERENCES.theme as 'light' | 'dark' | 'system');
    setAccentColor(DEFAULT_PREFERENCES.accentColor);
    setDensity(DEFAULT_PREFERENCES.density);
    setFontSize(DEFAULT_PREFERENCES.fontSize);
    setEmailAlerts(DEFAULT_PREFERENCES.emailAlerts);
    setPushAlerts(DEFAULT_PREFERENCES.pushAlerts);
    setInAppAlerts(DEFAULT_PREFERENCES.inAppAlerts);
    setJobAlertsWA(DEFAULT_PREFERENCES.jobAlertsWA);
    setReminderFreq(DEFAULT_PREFERENCES.assessmentReminderFreq);
    setAutoGradingKraepelin(DEFAULT_PREFERENCES.autoGradingKraepelin);
    setAutoInterviewInvite(DEFAULT_PREFERENCES.autoInterviewInvite);

    if (typeof window !== 'undefined') {
      localStorage.setItem('app_language', DEFAULT_PREFERENCES.language);
      localStorage.setItem('pref_timezone', DEFAULT_PREFERENCES.timezone);
      localStorage.setItem('pref_date_format', DEFAULT_PREFERENCES.dateFormat);
      localStorage.setItem('pref_default_landing', DEFAULT_PREFERENCES.defaultLanding);
      localStorage.setItem('pref_theme', DEFAULT_PREFERENCES.theme);
      localStorage.setItem('pref_accent', DEFAULT_PREFERENCES.accentColor);
      localStorage.setItem('pref_density', DEFAULT_PREFERENCES.density);
      localStorage.setItem('pref_font_size', DEFAULT_PREFERENCES.fontSize);
      localStorage.setItem('notif_email', String(DEFAULT_PREFERENCES.emailAlerts));
      localStorage.setItem('notif_push', String(DEFAULT_PREFERENCES.pushAlerts));
      localStorage.setItem('cand_job_alerts', String(DEFAULT_PREFERENCES.jobAlertsWA));
      localStorage.setItem('auto_kraepelin', String(DEFAULT_PREFERENCES.autoGradingKraepelin));
      localStorage.setItem('auto_interview', String(DEFAULT_PREFERENCES.autoInterviewInvite));
    }

    setConfirmResetOpen(false);
    triggerAutosave();
  };

  // Handler: Sign Out
  const handleSignOut = () => {
    setConfirmSignOutOpen(false);
    logout();
    router.push('/login');
  };

  // Handler: Export Data
  const handleExportData = (type: 'json' | 'csv') => {
    const payload = {
      user: { id: user?.id, name, email, phone, role: userRole },
      preferences: { timezone, dateFormat, defaultLanding, theme: themeMode },
      notifications: { emailAlerts, pushAlerts, jobAlertsWA },
      timestamp: new Date().toISOString(),
    };

    let blob: Blob;
    let filename: string;

    if (type === 'json') {
      blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      filename = `recruiter_settings_${user?.id || 'export'}.json`;
    } else {
      const csvContent = `Key,Value\nUser Name,"${name}"\nEmail,"${email}"\nPhone,"${phone}"\nRole,"${userRole}"\nTimezone,"${timezone}"\nDateFormat,"${dateFormat}"\nExportDate,"${new Date().toISOString()}"\n`;
      blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      filename = `recruiter_settings_${user?.id || 'export'}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Category Icon Resolver
  const renderCategoryIcon = (id: string, className = 'w-4 h-4') => {
    switch (id) {
      case 'account':
        return <User className={className} />;
      case 'preferences':
        return <Sliders className={className} />;
      case 'appearance':
        return <Palette className={className} />;
      case 'notifications':
        return <Bell className={className} />;
      case 'security':
        return <Lock className={className} />;
      case 'workspace':
        return <Building className={className} />;
      case 'billing':
        return <CreditCard className={className} />;
      case 'integrations':
        return <Share2 className={className} />;
      case 'automation':
        return <Cpu className={className} />;
      case 'data':
        return <Database className={className} />;
      case 'developer':
        return <Key className={className} />;
      case 'privacy':
        return <ShieldAlert className={className} />;
      case 'help':
        return <HelpCircle className={className} />;
      case 'about':
        return <Info className={className} />;
      default:
        return <SettingsIcon className={className} />;
    }
  };

  const currentCategoryObj = SETTINGS_CATEGORIES.find((c: SettingsCategory) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#F6F8FA] text-[#0D1117] py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* TOP BAR: Title, Search & Global Autosave State */}
        <div className="bg-white border border-[#D0D7DE] rounded-xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0D1117] text-white flex items-center justify-center shadow-xs">
              <SettingsIcon className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0D1117]">
                  {t.settings.title}
                </h1>
                <Badge className="font-mono text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {userRole}
                </Badge>
                {isStandalone && (
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-700 border-emerald-300">
                    PWA Installed
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#57606A] mt-0.5">
                Konfigurasi profil identitas, otomasi seleksi industri, dan pengaturan sistem SaaS terpusat.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Autosave Status Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F6F8FA] border border-[#D0D7DE] rounded-lg text-xs font-mono">
              {autosaveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span className="text-[#57606A]">Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-800 font-medium">Perubahan tersimpan otomatis</span>
                </>
              )}
            </div>

            {/* Reset to Default Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmResetOpen(true)}
              className="text-xs font-mono border-[#D0D7DE] hover:bg-neutral-100 gap-1.5 cursor-pointer text-[#57606A]"
              title="Kembalikan semua preferensi ke pengaturan awal"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset ke Default</span>
            </Button>

            {/* Helpdesk Quick Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => laporkanKendalaKeHelpdesk({ user, role: userRole, fromUrl: '/settings' })}
              className="text-xs font-mono border-[#D0D7DE] text-amber-800 bg-amber-50/50 hover:bg-amber-100/50 gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Bantuan</span>
            </Button>
          </div>
        </div>

        {/* MOBILE CATEGORY SCROLLER (< lg) */}
        <div className="lg:hidden flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606A]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengaturan..."
              className="pl-9 pr-8 text-xs bg-white border-[#D0D7DE] rounded-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {filteredCategories.map((cat: SettingsCategory) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-[#0D1117] text-white border-[#0D1117] shadow-xs'
                      : 'bg-white text-[#57606A] border-[#D0D7DE] hover:bg-neutral-50'
                  }`}
                >
                  {renderCategoryIcon(cat.id, 'w-3.5 h-3.5')}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DESKTOP 2-COLUMN LAYOUT: Sidebar Navigation + Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR NAVIGATION (Desktop: 3 cols out of 12) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4 sticky top-6">
            <div className="bg-white border border-[#D0D7DE] rounded-xl p-3 shadow-2xs space-y-4">
              
              {/* Search Settings Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606A]" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pengaturan..."
                  className="pl-9 pr-8 text-xs bg-[#F6F8FA] border-[#D0D7DE] focus:bg-white rounded-lg h-9"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Navigation Category Groups */}
              <div className="space-y-4 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
                {groupedCategories.length === 0 ? (
                  <div className="text-center py-6 px-2">
                    <p className="text-xs text-[#57606A]">Tidak ada pengaturan yang cocok dengan "{searchQuery}".</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-xs font-mono text-amber-700"
                    >
                      Reset Pencarian
                    </Button>
                  </div>
                ) : (
                  groupedCategories.map((group) => (
                    <div key={group.id} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase text-[#57606A]">
                        {group.label}
                      </div>
                      <div className="space-y-0.5">
                        {group.categories.map((cat: SettingsCategory) => {
                          const isActive = activeCategory === cat.id;
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setActiveCategory(cat.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                                isActive
                                  ? 'bg-[#0D1117] text-white font-medium shadow-xs'
                                  : 'text-[#0D1117] hover:bg-neutral-100'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 truncate">
                                <span className={isActive ? 'text-amber-400' : 'text-[#57606A]'}>
                                  {renderCategoryIcon(cat.id, 'w-4 h-4')}
                                </span>
                                <span className="truncate">{cat.label}</span>
                              </div>
                              {cat.id === 'notifications' && (
                                <span className={`w-2 h-2 rounded-full ${jobAlertsWA ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                              )}
                              {cat.id === 'billing' && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                  PRO
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sign Out Action in Sidebar */}
              <div className="pt-2 border-t border-[#D0D7DE]">
                <button
                  onClick={() => setConfirmSignOutOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Keluar dari Akun (Sign Out)</span>
                </button>
              </div>

            </div>
          </aside>

          {/* MAIN SETTINGS CONTENT AREA (Desktop: 9 cols out of 12) */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-6">
            
            {/* Current Section Banner */}
            {currentCategoryObj && (
              <div className="bg-white border border-[#D0D7DE] rounded-xl p-4 sm:p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-[#57606A] mb-1">
                    <span>Pengaturan</span>
                    <span>/</span>
                    <span className="text-[#0D1117] font-semibold">{currentCategoryObj.label}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0D1117]">
                    {currentCategoryObj.label}
                  </h2>
                  <p className="text-xs text-[#57606A] mt-0.5">
                    {currentCategoryObj.desc}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] text-[#57606A] border-[#D0D7DE]">
                    ID: {currentCategoryObj.id}
                  </Badge>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 1: ACCOUNT & PROFILE                                             */}
            {/* ========================================================================= */}
            {activeCategory === 'account' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-[#0D1117]">
                          Informasi Akun & Identitas
                        </CardTitle>
                        <CardDescription className="text-xs text-[#57606A]">
                          Biodata kontak, username unik, dan kredensial akses Anda di platform.
                        </CardDescription>
                      </div>
                      <Badge className="font-mono text-xs bg-[#0D1117] text-white">
                        {userRole.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {profileSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>Perubahan akun dan identitas profil berhasil disimpan!</span>
                        </div>
                      )}
                      {profileError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{profileError}</span>
                        </div>
                      )}

                      {/* Avatar & Display Name Quick View */}
                      <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#0D1117] text-white flex items-center justify-center font-bold text-xl font-mono border-2 border-amber-500 shadow-xs">
                          {(name || email || 'U').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#0D1117]">{name || 'Nama Lengkap'}</p>
                            <Badge className="text-[9px] font-mono bg-emerald-100 text-emerald-800 border-emerald-300">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-[#57606A] font-mono">@{username || 'user'}</p>
                          <p className="text-[11px] text-[#57606A]">{email || 'email@perusahaan.com'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="account_name" className="text-xs font-mono text-[#0D1117]">
                            Nama Lengkap
                          </Label>
                          <Input
                            id="account_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: Budi Santoso"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="account_username" className="text-xs font-mono text-[#0D1117]">
                            Username Akun
                          </Label>
                          <Input
                            id="account_username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="budi_santoso"
                            className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="account_email" className="text-xs font-mono text-[#0D1117]">
                            Alamat Email (Akun Utama)
                          </Label>
                          <Input
                            id="account_email"
                            value={email}
                            disabled
                            className="rounded-lg text-xs bg-[#F6F8FA] border-[#D0D7DE] text-[#57606A] font-mono cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="account_phone" className="text-xs font-mono text-[#0D1117]">
                            Nomor WhatsApp / Kontak
                          </Label>
                          <Input
                            id="account_phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                          />
                        </div>
                      </div>

                      {/* Role Specific Headline / Bio */}
                      <div className="space-y-1.5">
                        <Label htmlFor="account_headline" className="text-xs font-mono text-[#0D1117]">
                          {userRole === 'employer' ? 'Posisi / Departemen di Perusahaan' : 'Headline Karir / Profil Singkat'}
                        </Label>
                        <Input
                          id="account_headline"
                          value={careerHeadline}
                          onChange={(e) => setCareerHeadline(e.target.value)}
                          placeholder={userRole === 'employer' ? 'HR Manager / Talent Acquisition' : 'Operator Manufaktur / Staff QC'}
                          className="rounded-lg text-xs border-[#D0D7DE]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="account_domicile" className="text-xs font-mono text-[#0D1117]">
                            Wilayah / Domisili Kerja
                          </Label>
                          <Input
                            id="account_domicile"
                            value={domicile}
                            onChange={(e) => setDomicile(e.target.value)}
                            placeholder="Cikarang / Karawang / Bekasi"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="account_salary" className="text-xs font-mono text-[#0D1117]">
                            {userRole === 'employer' ? 'Alokasi Budget Gaji (IDR)' : 'Ekspektasi Gaji Bulanan (IDR)'}
                          </Label>
                          <Input
                            id="account_salary"
                            value={expectedSalary}
                            onChange={(e) => setExpectedSalary(e.target.value)}
                            placeholder="Contoh: 6.500.000"
                            className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          size="sm"
                          className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5 text-amber-500" />
                          <span>Simpan Identitas Profil</span>
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Ubah Password Card */}
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Ubah Kata Sandi Akun
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Pastikan kata sandi minimal 8 karakter dengan kombinasi huruf dan angka.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-4">
                      {passwordSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>Kata sandi berhasil diperbarui!</span>
                        </div>
                      )}
                      {passwordError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{passwordError}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <Label htmlFor="acc_curr_pass" className="text-xs font-mono text-[#0D1117]">
                          Kata Sandi Saat Ini
                        </Label>
                        <div className="relative">
                          <Input
                            id="acc_curr_pass"
                            type={showPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="rounded-lg text-xs border-[#D0D7DE] pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="acc_new_pass" className="text-xs font-mono text-[#0D1117]">
                            Kata Sandi Baru
                          </Label>
                          <Input
                            id="acc_new_pass"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="acc_conf_pass" className="text-xs font-mono text-[#0D1117]">
                            Konfirmasi Kata Sandi Baru
                          </Label>
                          <Input
                            id="acc_conf_pass"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ketik ulang kata sandi baru"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Perbarui Kata Sandi</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 2: PREFERENCES                                                   */}
            {/* ========================================================================= */}
            {activeCategory === 'preferences' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Preferensi Regional & Perilaku Sistem
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Sesuaikan zona waktu asesmen industri, bahasa antarmuka, dan format tanggal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Bahasa Antarmuka */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Bahasa Antarmuka (Interface Language)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage('id');
                            triggerAutosave();
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            language === 'id'
                              ? 'border-[#0D1117] bg-neutral-50 ring-1 ring-[#0D1117]'
                              : 'border-[#D0D7DE] hover:bg-neutral-50'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-[#0D1117]">Bahasa Indonesia (ID)</p>
                            <p className="text-[11px] text-[#57606A]">Standar psikotes HIMPSI & regulasi Disnaker</p>
                          </div>
                          {language === 'id' && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLanguage('en');
                            triggerAutosave();
                          }}
                          className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            language === 'en'
                              ? 'border-[#0D1117] bg-neutral-50 ring-1 ring-[#0D1117]'
                              : 'border-[#D0D7DE] hover:bg-neutral-50'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-[#0D1117]">English (US/UK)</p>
                            <p className="text-[11px] text-[#57606A]">International standard for multinational factory units</p>
                          </div>
                          {language === 'en' && <Check className="w-4 h-4 text-emerald-600" />}
                        </button>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                      <Label htmlFor="pref_tz" className="text-xs font-mono text-[#0D1117]">
                        Zona Waktu Operasional (Timezone)
                      </Label>
                      <select
                        id="pref_tz"
                        value={timezone}
                        onChange={(e) => {
                          setTimezone(e.target.value);
                          if (typeof window !== 'undefined') localStorage.setItem('pref_timezone', e.target.value);
                          triggerAutosave();
                        }}
                        className="w-full h-9 rounded-lg border border-[#D0D7DE] bg-white px-3 text-xs font-mono text-[#0D1117] focus:outline-none focus:ring-1 focus:ring-[#0D1117]"
                      >
                        <option value="Asia/Jakarta">WIB (UTC+7) - Jakarta, Cikarang, Karawang, Surabaya</option>
                        <option value="Asia/Makassar">WITA (UTC+8) - Bali, Balikpapan, Makassar, Manado</option>
                        <option value="Asia/Jayapura">WIT (UTC+9) - Jayapura, Ambon, Sorong</option>
                        <option value="UTC">UTC (GMT+0) - Universal Coordinated Time</option>
                      </select>
                      <p className="text-[11px] text-[#57606A]">
                        Waktu ini digunakan untuk timestamp pengerjaan tes Kraepelin dan jadwal interview.
                      </p>
                    </div>

                    {/* Format Tanggal */}
                    <div className="space-y-2">
                      <Label htmlFor="pref_df" className="text-xs font-mono text-[#0D1117]">
                        Format Tanggal & Waktu
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'].map((fmt) => (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              setDateFormat(fmt);
                              if (typeof window !== 'undefined') localStorage.setItem('pref_date_format', fmt);
                              triggerAutosave();
                            }}
                            className={`p-2.5 rounded-lg border text-center font-mono text-xs transition-all cursor-pointer ${
                              dateFormat === fmt
                                ? 'border-[#0D1117] bg-[#0D1117] text-white font-bold'
                                : 'border-[#D0D7DE] bg-white text-[#0D1117] hover:bg-neutral-50'
                            }`}
                          >
                            <span>{fmt}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Default Landing Page */}
                    <div className="space-y-2">
                      <Label htmlFor="pref_landing" className="text-xs font-mono text-[#0D1117]">
                        Halaman Awal Saat Masuk (Default Landing Page)
                      </Label>
                      <select
                        id="pref_landing"
                        value={defaultLanding}
                        onChange={(e) => {
                          setDefaultLanding(e.target.value);
                          if (typeof window !== 'undefined') localStorage.setItem('pref_default_landing', e.target.value);
                          triggerAutosave();
                        }}
                        className="w-full h-9 rounded-lg border border-[#D0D7DE] bg-white px-3 text-xs font-mono text-[#0D1117] focus:outline-none focus:ring-1 focus:ring-[#0D1117]"
                      >
                        <option value="/candidate">Portal Kandidat & OCR Resume (/candidate)</option>
                        <option value="/assessment">Tes Kraepelin & Asesmen Psikometri (/assessment)</option>
                        <option value="/jobs">Katalog Lowongan Kerja Pabrik (/jobs)</option>
                        <option value="/employer">Dashboard Rekruter & Shortlist (/employer)</option>
                        <option value="/admin">Panel Kontrol Administrator (/admin)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 3: APPEARANCE                                                    */}
            {/* ========================================================================= */}
            {activeCategory === 'appearance' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Tema Tampilan & Estetika Antarmuka
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Konfigurasi visual mengikuti standar Industrial Foundry & Noto Sans.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Mode Tema: Light / Dark / System */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Mode Warna (Theme Mode)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'light', label: 'Terang (Light)', desc: 'Kontras tinggi standar pabrik' },
                          { id: 'dark', label: 'Gelap (Dark)', desc: 'Nyaman untuk shift malam' },
                          { id: 'system', label: 'Otomatis (System)', desc: 'Sinkron dengan OS perangkat' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSaveAppearance(item.id as any)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              themeMode === item.id
                                ? 'border-[#0D1117] bg-neutral-50 ring-1 ring-[#0D1117]'
                                : 'border-[#D0D7DE] hover:bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-bold text-[#0D1117]">{item.label}</p>
                            <p className="text-[11px] text-[#57606A] mt-0.5">{item.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Warna Aksen Industri (Accent Palette)
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'amber', label: 'Safety Amber', hex: '#D97706', border: 'border-amber-600' },
                          { id: 'slate', label: 'Steel Graphite', hex: '#334155', border: 'border-slate-700' },
                          { id: 'emerald', label: 'Production Green', hex: '#059669', border: 'border-emerald-600' },
                          { id: 'blue', label: 'Industrial Blue', hex: '#2563EB', border: 'border-blue-600' },
                        ].map((col) => (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => handleSaveAppearance(undefined, col.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              accentColor === col.id
                                ? 'border-[#0D1117] bg-neutral-50 ring-1 ring-[#0D1117]'
                                : 'border-[#D0D7DE] hover:bg-neutral-50'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: col.hex }} />
                            <span className="text-xs font-mono font-medium text-[#0D1117]">{col.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Density */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Kepadatan Antarmuka (Interface Density)
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'compact', label: 'Kompak (Compact)', desc: 'Untuk layar kecil & tabular' },
                          { id: 'comfortable', label: 'Standar (Comfortable)', desc: 'Rekomendasi produktivitas' },
                          { id: 'relaxed', label: 'Luas (Relaxed)', desc: 'Jarak lapang ramah sentuhan' },
                        ].map((den) => (
                          <button
                            key={den.id}
                            type="button"
                            onClick={() => handleSaveAppearance(undefined, undefined, den.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              density === den.id
                                ? 'border-[#0D1117] bg-neutral-50 ring-1 ring-[#0D1117]'
                                : 'border-[#D0D7DE] hover:bg-neutral-50'
                            }`}
                          >
                            <p className="text-xs font-bold text-[#0D1117]">{den.label}</p>
                            <p className="text-[11px] text-[#57606A] mt-0.5">{den.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Ukuran Tipografi Dasar
                      </Label>
                      <div className="flex items-center gap-3">
                        {[
                          { id: 'sm', label: '14px (Kecil)' },
                          { id: 'md', label: '16px (Normal)' },
                          { id: 'lg', label: '18px (Besar)' },
                        ].map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() => handleSaveAppearance(undefined, undefined, undefined, sz.id)}
                            className={`px-4 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                              fontSize === sz.id
                                ? 'border-[#0D1117] bg-[#0D1117] text-white font-bold'
                                : 'border-[#D0D7DE] bg-white text-[#0D1117] hover:bg-neutral-50'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 4: NOTIFICATIONS                                                 */}
            {/* ========================================================================= */}
            {activeCategory === 'notifications' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Saluran & Frekuensi Notifikasi
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Atur cara platform mengirimkan pembaruan status lamaran dan pengingat asesmen Kraepelin.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* WhatsApp Alert */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Notifikasi WhatsApp Otomatis</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Kirimkan undangan interview pabrik dan skor Kraepelin langsung via WhatsApp ke nomor Anda.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={jobAlertsWA}
                        onChange={(e) => handleToggleNotification('jobWA', e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Email Alert */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Pemberitahuan Email & Salinan PDF</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Dapatkan berkas ringkasan lembar evaluasi psikogram A4 langsung di kotak masuk email Anda.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailAlerts}
                        onChange={(e) => handleToggleNotification('email', e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* In-App Alerts */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-neutral-700" />
                          <p className="text-xs font-bold text-[#0D1117]">Push & In-App Toast Alerts</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Tampilkan banner toast langsung saat kandidat menyelesaikan kolom tes Pauli/Kraepelin.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={pushAlerts}
                        onChange={(e) => handleToggleNotification('push', e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Frekuensi Pengingat */}
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="notif_freq" className="text-xs font-mono text-[#0D1117]">
                        Frekuensi Ringkasan Asesmen
                      </Label>
                      <select
                        id="notif_freq"
                        value={reminderFreq}
                        onChange={(e) => {
                          setReminderFreq(e.target.value);
                          triggerAutosave();
                        }}
                        className="w-full h-9 rounded-lg border border-[#D0D7DE] bg-white px-3 text-xs font-mono text-[#0D1117] focus:outline-none focus:ring-1 focus:ring-[#0D1117]"
                      >
                        <option value="realtime">Instan (Real-time Setiap Ada Pelamar Masuk)</option>
                        <option value="daily_digest">Rangkuman Harian (Daily Digest - Jam 17:00 WIB)</option>
                        <option value="weekly">Rangkuman Mingguan (Weekly Summary - Setiap Senin)</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 5: SECURITY & PRIVACY                                            */}
            {/* ========================================================================= */}
            {activeCategory === 'security' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Keamanan Akun & Manajemen Sesi
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Perlindungan dua faktor (2FA), passkey biometrik, dan monitor perangkat yang terhubung.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 2FA Toggle */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Autentikasi Dua Faktor (2FA - TOTP)</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Memerlukan kode 6-digit dari Google Authenticator saat masuk dari perangkat baru.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => {
                          setTwoFactorEnabled(e.target.checked);
                          if (typeof window !== 'undefined') localStorage.setItem('sec_2fa', String(e.target.checked));
                          triggerAutosave();
                        }}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Biometric / Passkey */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Masuk Cepat Biometrik (Passkey / FIDO2)</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Gunakan sensor sidik jari, Touch ID, atau Face ID perangkat tanpa mengetik password.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={biometricEnabled}
                        onChange={(e) => {
                          setBiometricEnabled(e.target.checked);
                          triggerAutosave();
                        }}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Active Sessions List */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-mono text-[#0D1117]">
                          Sesi Perangkat yang Sedang Aktif
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => alert('Sesi pada perangkat lain berhasil dihentikan.')}
                          className="text-[11px] font-mono text-rose-700 hover:bg-rose-50 h-7"
                        >
                          Keluar dari Sesi Lain
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 bg-white border border-[#D0D7DE] rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0D1117]">
                                Windows 11 • Google Chrome (Perangkat Ini)
                              </p>
                              <p className="text-[11px] text-[#57606A] font-mono">
                                IP: 182.253.xx.xx • Cikarang, Jawa Barat • Aktif sekarang
                              </p>
                            </div>
                          </div>
                          <Badge className="font-mono text-[9px] bg-emerald-100 text-emerald-800 border-emerald-300">
                            CURRENT
                          </Badge>
                        </div>

                        <div className="p-3 bg-white border border-[#D0D7DE] rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0D1117]">
                                Android 14 • Recruiter Mobile APK
                              </p>
                              <p className="text-[11px] text-[#57606A] font-mono">
                                IP: 114.124.xx.xx • Karawang • 3 jam yang lalu
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-mono text-[9px] text-[#57606A]">
                            STANDBY
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 6: WORKSPACE & ORGANIZATION                                      */}
            {/* ========================================================================= */}
            {activeCategory === 'workspace' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Profil Organisasi & Unit Industri Pabrik
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Informasi resmi yang tertera pada kop surat hasil psikogram dan ambang batas seleksi HIMPSI.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveWorkspace} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="ws_company_name" className="text-xs font-mono text-[#0D1117]">
                            Nama Perusahaan / PT Pabrik
                          </Label>
                          <Input
                            id="ws_company_name"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="PT Industri Maju Indonesia"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="ws_industry" className="text-xs font-mono text-[#0D1117]">
                            Sektor Industri
                          </Label>
                          <Input
                            id="ws_industry"
                            value={industry}
                            onChange={(e) => setIndustry(e.target.value)}
                            placeholder="Manufaktur Otomotif & Presisi"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="ws_size" className="text-xs font-mono text-[#0D1117]">
                            Skala Karyawan
                          </Label>
                          <Input
                            id="ws_size"
                            value={companySize}
                            onChange={(e) => setCompanySize(e.target.value)}
                            placeholder="250 - 500 Karyawan"
                            className="rounded-lg text-xs border-[#D0D7DE]"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="ws_website" className="text-xs font-mono text-[#0D1117]">
                            Situs Web Resmi
                          </Label>
                          <Input
                            id="ws_website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://industrimaju.co.id"
                            className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="ws_address" className="text-xs font-mono text-[#0D1117]">
                          Alamat Fasilitas Operasional / Pabrik
                        </Label>
                        <Input
                          id="ws_address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Kawasan Industri GIIC Cikarang Pusat, Jawa Barat"
                          className="rounded-lg text-xs border-[#D0D7DE]"
                        />
                      </div>

                      {/* HIMPSI Benchmarking Thresholds */}
                      <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-3">
                        <p className="text-xs font-bold text-[#0D1117]">
                          Ambang Batas Minimum Seleksi (HIMPSI Benchmarks)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="ws_kraepelin" className="text-[11px] font-mono text-[#57606A]">
                              Batas Skor Kraepelin (Lolos Screening)
                            </Label>
                            <Input
                              id="ws_kraepelin"
                              type="number"
                              value={minKraepelin}
                              onChange={(e) => setMinKraepelin(Number(e.target.value))}
                              className="rounded-lg text-xs bg-white border-[#D0D7DE] font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="ws_match" className="text-[11px] font-mono text-[#57606A]">
                              Batas OCR Match Rate Keahlian (%)
                            </Label>
                            <Input
                              id="ws_match"
                              type="number"
                              value={minMatchScore}
                              onChange={(e) => setMinMatchScore(Number(e.target.value))}
                              className="rounded-lg text-xs bg-white border-[#D0D7DE] font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simpan Profil Organisasi</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 7: SUBSCRIPTION & BILLING                                        */}
            {/* ========================================================================= */}
            {activeCategory === 'billing' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-[#0D1117]">
                          Paket Langganan & Saldo Kuota Asesmen
                        </CardTitle>
                        <CardDescription className="text-xs text-[#57606A]">
                          Kelola lisensi psikotes, kuota Kraepelin, dan riwayat faktur tagihan.
                        </CardDescription>
                      </div>
                      <Badge className="font-mono text-xs bg-amber-100 text-amber-900 border border-amber-300">
                        INDUSTRIAL PRO TIER
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quota Progress */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-[#0D1117]">Sisa Kuota Uji Kraepelin & OCR:</span>
                        <span className="font-bold text-amber-800">45 / 100 Sesi Tersisa (45%)</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-600 rounded-full w-[45%]" />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="text-[11px] text-[#57606A]">
                          Perpanjangan otomatis: 01 Desember 2026.
                        </p>
                        <Button
                          size="sm"
                          onClick={() => alert('Membuka gerbang pembayaran top-up kuota Kraepelin...')}
                          className="bg-[#0D1117] text-white hover:bg-neutral-800 text-xs font-mono h-7 px-3"
                        >
                          Top-Up Kuota (+50 Sesi)
                        </Button>
                      </div>
                    </div>

                    {/* Invoice History */}
                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Riwayat Faktur & Pembayaran Terakhir
                      </Label>
                      <div className="overflow-x-auto border border-[#D0D7DE] rounded-xl">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-[#F6F8FA] border-b border-[#D0D7DE] text-[#57606A]">
                            <tr>
                              <th className="p-2.5">No. Faktur</th>
                              <th className="p-2.5">Tanggal</th>
                              <th className="p-2.5">Deskripsi</th>
                              <th className="p-2.5">Nominal</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#D0D7DE]">
                            <tr>
                              <td className="p-2.5 font-bold">INV-2026-1102</td>
                              <td className="p-2.5 text-[#57606A]">02 Nov 2026</td>
                              <td className="p-2.5">Langganan Industrial Pro (Bulanan)</td>
                              <td className="p-2.5">Rp 1.450.000</td>
                              <td className="p-2.5 text-emerald-700 font-bold">LUNAS</td>
                            </tr>
                            <tr>
                              <td className="p-2.5 font-bold">INV-2026-1002</td>
                              <td className="p-2.5 text-[#57606A]">02 Okt 2026</td>
                              <td className="p-2.5">Paket Tambahan 50 Tes Kraepelin</td>
                              <td className="p-2.5">Rp 750.000</td>
                              <td className="p-2.5 text-emerald-700 font-bold">LUNAS</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 8: INTEGRATIONS                                                  */}
            {/* ========================================================================= */}
            {activeCategory === 'integrations' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Integrasi Layanan Pihak Ketiga & JIT SSO
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Hubungkan platform dengan Google Calendar, Telegram Bot, dan sistem tiket Helpdesk VPS.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Google Workspace */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Google Calendar & Google Meet</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Sinkronisasi jadwal wawancara kerja teknis langsung ke kalender perekrut dan kandidat.
                        </p>
                      </div>
                      <Badge className="font-mono text-xs bg-emerald-100 text-emerald-800 border-emerald-300">
                        CONNECTED
                      </Badge>
                    </div>

                    {/* Telegram Bot */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-sky-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Bot Telegram Asesmen (@RecruiterIndustrialBot)</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Kirim peringatan cepat ke grup HR saat hasil tes Kraepelin siap ditinjau.
                        </p>
                      </div>
                      <Badge className="font-mono text-xs bg-emerald-100 text-emerald-800 border-emerald-300">
                        ACTIVE
                      </Badge>
                    </div>

                    {/* VPS Helpdesk JIT SSO */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-bold text-[#0D1117]">Sistem Tiket VPS Helpdesk JIT SSO</p>
                        </div>
                        <p className="text-[11px] text-[#57606A]">
                          Handoff token Just-In-Time otomatis ke helpdesk pusat di IP VPS 43.156.236.102.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => laporkanKendalaKeHelpdesk({ user, role: userRole, fromUrl: '/settings' })}
                        className="text-xs font-mono border-[#D0D7DE] text-amber-800 bg-amber-50 hover:bg-amber-100"
                      >
                        Buka Handoff
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 9: AUTOMATION & RULES                                            */}
            {/* ========================================================================= */}
            {activeCategory === 'automation' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Alur Kerja Otomatis & Trigger Rekrutmen
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Atur automasi evaluasi psikometri dan pengiriman undangan wawancara tanpa campur tangan manual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveAutomation} className="space-y-4">
                      {/* Auto Grading Kraepelin */}
                      <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-amber-600" />
                            <p className="text-xs font-bold text-[#0D1117]">Auto-Scoring Engine Kraepelin (Panker/Tianker)</p>
                          </div>
                          <p className="text-[11px] text-[#57606A]">
                            Hitung otomatis kecepatan kerja (Panker), ketelitian (Tianker), dan stabilitas (Janker) saat tes selesai.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoGradingKraepelin}
                          onChange={(e) => setAutoGradingKraepelin(e.target.checked)}
                          className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Auto Interview Dispatch */}
                      <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <p className="text-xs font-bold text-[#0D1117]">Auto-Dispatch Undangan Interview</p>
                          </div>
                          <p className="text-[11px] text-[#57606A]">
                            Kirimkan otomatis tautan jadwal wawancara via WhatsApp jika skor Kraepelin &ge; ambang batas.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoInterviewInvite}
                          onChange={(e) => setAutoInterviewInvite(e.target.checked)}
                          className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                        />
                      </div>

                      {/* Scheduled Backup */}
                      <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-sky-600" />
                            <p className="text-xs font-bold text-[#0D1117]">Pencadangan Database Terenkripsi Otomatis (Cron)</p>
                          </div>
                          <p className="text-[11px] text-[#57606A]">
                            Jalankan snapshot AES-256-GCM setiap pukul 00:00 WIB ke penyimpanan terisolasi.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={scheduledBackup}
                          onChange={(e) => setScheduledBackup(e.target.checked)}
                          className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        className="bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simpan Aturan Otomasi</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 10: DATA & STORAGE                                               */}
            {/* ========================================================================= */}
            {activeCategory === 'data' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Pengelolaan Data, Ekspor, dan Penyimpanan Offline
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Unduh arsip portofolio Anda, pantau status cache PWA, dan bersihkan memori lokal.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status PWA */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#0D1117]">Status Progressive Web App (PWA)</p>
                        <p className="text-[11px] text-[#57606A]">
                          {isStandalone
                            ? 'Aplikasi berjalan dalam mode mandiri (Standalone APK/PWA)'
                            : 'Aplikasi berjalan di dalam browser web standard'}
                        </p>
                      </div>
                      <Badge className={`font-mono text-xs ${isStandalone ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'}`}>
                        {isStandalone ? 'STANDALONE' : 'BROWSER'}
                      </Badge>
                    </div>

                    {/* Offline Queue */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#0D1117]">Antrean Asesmen Offline</p>
                        <p className="text-[11px] text-[#57606A]">
                          Tes Pauli/Kraepelin yang tersimpan di IndexedDB saat offline.
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs text-[#57606A]">
                        0 PENDING SYNC
                      </Badge>
                    </div>

                    {/* Export Actions */}
                    <div className="p-4 bg-white border border-[#D0D7DE] rounded-xl space-y-3">
                      <p className="text-xs font-bold text-[#0D1117]">Ekspor Salinan Data Akun</p>
                      <p className="text-[11px] text-[#57606A]">
                        Unduh seluruh profil, riwayat skor psikotes, dan konfigurasi Anda dalam format terbuka.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportData('json')}
                          className="text-xs font-mono border-[#D0D7DE] gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Arsip JSON</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportData('csv')}
                          className="text-xs font-mono border-[#D0D7DE] gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh Rekap CSV</span>
                        </Button>
                      </div>
                    </div>

                    {/* Clear Cache Card */}
                    <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-rose-900">Bersihkan Cache & Refresh Aplikasi</p>
                        <p className="text-[11px] text-rose-800">
                          Hapus aset cache lokal browser jika terdapat ketidaksesuaian tampilan formulir.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmClearCacheOpen(true)}
                        className="text-xs font-mono border-rose-300 text-rose-800 hover:bg-rose-100 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bersihkan Cache</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 11: DEVELOPER SETTINGS                                           */}
            {/* ========================================================================= */}
            {activeCategory === 'developer' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Pengaturan Pengembang & Kunci API
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Integrasi API publik, kunci otentikasi HMAC Webhooks, dan log audit server.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* API Key */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-mono text-[#0D1117]">
                          Kunci API Produksi (Live API Key)
                        </Label>
                        <button
                          type="button"
                          onClick={() => setConfirmRevokeKeyOpen(true)}
                          className="text-[11px] font-mono text-rose-700 hover:underline cursor-pointer"
                        >
                          Regenerasi Kunci
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Input
                            type={showApiKey ? 'text' : 'password'}
                            value={apiKey}
                            readOnly
                            className="bg-[#F6F8FA] border-[#D0D7DE] font-mono text-xs pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                          >
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyApiKey}
                          className="text-xs font-mono border-[#D0D7DE] gap-1.5"
                        >
                          {apiKeyCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{apiKeyCopied ? 'Tersalin' : 'Salin'}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Webhook Configuration */}
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="dev_wh_url" className="text-xs font-mono text-[#0D1117]">
                        Endpoint Webhook Notifikasi Kelulusan
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          id="dev_wh_url"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://perusahaan.com/api/recruiter-webhook"
                          className="font-mono text-xs border-[#D0D7DE]"
                        />
                        <Button
                          size="sm"
                          onClick={handleTestWebhook}
                          disabled={webhookTesting}
                          className="bg-[#0D1117] text-white hover:bg-neutral-800 text-xs font-mono gap-1.5 whitespace-nowrap"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${webhookTesting ? 'animate-spin' : ''}`} />
                          <span>{webhookTesting ? 'Menguji...' : 'Uji Webhook'}</span>
                        </Button>
                      </div>
                      {webhookTestStatus && (
                        <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
                          {webhookTestStatus}
                        </p>
                      )}
                    </div>

                    {/* Webhook Secret */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-mono text-[#57606A]">
                        Webhook HMAC Signing Secret (SHA-256)
                      </Label>
                      <Input
                        value={webhookSecret}
                        readOnly
                        className="bg-[#F6F8FA] border-[#D0D7DE] font-mono text-[11px] text-[#57606A]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 12: PRIVACY & DATA CONTROL                                       */}
            {/* ========================================================================= */}
            {activeCategory === 'privacy' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Privasi & Kendali Hak Data Pengguna
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Kepatuhan terhadap UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Retensi Asesmen */}
                    <div className="space-y-2">
                      <Label htmlFor="priv_retention" className="text-xs font-mono text-[#0D1117]">
                        Masa Retensi Penyimpanan Berkas Psikotes & CV
                      </Label>
                      <select
                        id="priv_retention"
                        value={dataRetention}
                        onChange={(e) => {
                          setDataRetention(e.target.value);
                          triggerAutosave();
                        }}
                        className="w-full h-9 rounded-lg border border-[#D0D7DE] bg-white px-3 text-xs font-mono text-[#0D1117]"
                      >
                        <option value="6_months">6 Bulan (Standar Batch Rekrutmen)</option>
                        <option value="1_year">1 Tahun (Rekomendasi Arsip HR)</option>
                        <option value="2_years">2 Tahun (Audit K3 & ISO 9001)</option>
                        <option value="permanent">Permanen Selama Akun Aktif</option>
                      </select>
                    </div>

                    {/* PDP Consent Toggle */}
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#0D1117]">Persetujuan Pemrosesan Psikometri UU PDP</p>
                        <p className="text-[11px] text-[#57606A]">
                          Data skor Kraepelin dan OCR resume hanya diproses untuk tujuan pencocokan kerja yang sah.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={pdpConsent}
                        onChange={(e) => {
                          setPdpConsent(e.target.checked);
                          triggerAutosave();
                        }}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Danger Zone: Delete Account */}
                    <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-rose-900">Hapus Akun & Data Permanen (Right to be Forgotten)</p>
                        <p className="text-[11px] text-rose-800">
                          Tindakan ini akan menghapus permanen seluruh riwayat lamaran dan lembar asesmen.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmDeleteAccountOpen(true)}
                        className="text-xs font-mono gap-1.5 whitespace-nowrap bg-rose-700 hover:bg-rose-800 text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Minta Hapus Akun</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 13: HELP & SUPPORT                                               */}
            {/* ========================================================================= */}
            {activeCategory === 'help' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0D1117]">
                      Pusat Bantuan, FAQ, & Dukungan Teknis
                    </CardTitle>
                    <CardDescription className="text-xs text-[#57606A]">
                      Temukan jawaban panduan penggunaan asesmen atau laporkan kendala ke helpdesk resmi.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* FAQ Items */}
                    <div className="space-y-3">
                      <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-1">
                        <p className="text-xs font-bold text-[#0D1117]">1. Bagaimana alur pengisian tes Kraepelin?</p>
                        <p className="text-[11px] text-[#57606A]">
                          Kandidat menjumlahkan dua angka vertikal dan mengetikkan digit satuan secepat dan seteliti mungkin.
                          Terdapat 5 kolom dengan durasi 15 detik per kolom untuk mengukur daya tahan kerja industri.
                        </p>
                      </div>

                      <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-1">
                        <p className="text-xs font-bold text-[#0D1117]">2. Apakah format CV PDF didukung secara langsung?</p>
                        <p className="text-[11px] text-[#57606A]">
                          Ya! Parser PDF internal membaca token stream berkas CV asli dan mencocokkan kata kunci kompetensi
                          manufaktur, sertifikasi K3, PLC, serta ISO 9001 tanpa memerlukan server OCR eksternal.
                        </p>
                      </div>

                      <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-1">
                        <p className="text-xs font-bold text-[#0D1117]">3. Bagaimana cara mengajukan kendala sistem ke Helpdesk?</p>
                        <p className="text-[11px] text-[#57606A]">
                          Klik tombol handoff tiket di bawah ini. Sesi login Anda akan diverifikasi otomatis oleh VPS
                          tanpa perlu login ulang untuk membuat tiket laporan perbaikan.
                        </p>
                      </div>
                    </div>

                    {/* Support Channels Action */}
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-amber-900">Butuh Bantuan Langsung dari Tim Teknis?</p>
                        <p className="text-[11px] text-amber-800">
                          Hotline WhatsApp tersedia hari Senin - Sabtu pukul 08:00 - 17:00 WIB.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => laporkanKendalaKeHelpdesk({ user, role: userRole, fromUrl: '/settings' })}
                          className="bg-[#0D1117] text-white hover:bg-neutral-800 text-xs font-mono gap-1.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Buat Tiket VPS</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open('https://wa.me/6281299887766', '_blank')}
                          className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-mono gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CATEGORY 14: ABOUT & VERSION                                              */}
            {/* ========================================================================= */}
            {activeCategory === 'about' && (
              <div className="space-y-6">
                <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-[#0D1117]">
                          Tentang Recruiter Industrial SaaS
                        </CardTitle>
                        <CardDescription className="text-xs text-[#57606A]">
                          Informasi lisensi perangkat lunak, arsitektur teknis, dan catatan rilis.
                        </CardDescription>
                      </div>
                      <Badge className="font-mono text-xs bg-[#0D1117] text-white">
                        v1.2.0-PROD
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-[#F6F8FA] border border-[#E1E4E8] rounded-xl space-y-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div>
                          <p className="text-[10px] text-[#57606A] uppercase font-bold">Framework</p>
                          <p className="font-bold text-[#0D1117]">Next.js 16 (Turbopack)</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#57606A] uppercase font-bold">Database</p>
                          <p className="font-bold text-[#0D1117]">PocketBase WAL</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#57606A] uppercase font-bold">Styling</p>
                          <p className="font-bold text-[#0D1117]">Tailwind CSS 4</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#57606A] uppercase font-bold">Host VPS</p>
                          <p className="font-bold text-[#0D1117]">43.156.236.102</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-mono text-[#0D1117]">
                        Catatan Rilis v1.2.0 (Changelog Highlights)
                      </Label>
                      <ul className="space-y-1.5 text-xs text-[#57606A] list-disc list-inside">
                        <li>Implementasi arsitektur menu Pengaturan standar SaaS profesional dengan Sidebar Navigasi.</li>
                        <li>Mesin ekstraksi CV PDF asli dengan pendeteksi kompetensi industri tanpa ketergantungan Cloud.</li>
                        <li>Optimasi konkurensi SQLite Write-Ahead Logging (WAL) dan ledger audit trail anti-manipulasi.</li>
                        <li>Sistem pencadangan otomatis terenkripsi AES-256-GCM dengan verifikasi manifest checksum SHA-256.</li>
                        <li>Dispatcher Webhook asynchronous dengan validasi kriptografis HMAC-SHA256.</li>
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-[#D0D7DE] flex items-center justify-between text-xs text-[#57606A]">
                      <p>© 2026 Recruiter Industrial. Hak cipta dilindungi undang-undang.</p>
                      <div className="flex gap-3 text-xs font-mono text-amber-800">
                        <a href="/terms" className="hover:underline">Syarat Ketentuan</a>
                        <span>•</span>
                        <a href="/privacy" className="hover:underline">Kebijakan Privasi</a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* CONFIRMATION DIALOGS                                                      */}
      {/* ========================================================================= */}

      {/* 1. Reset to Defaults Dialog */}
      <Dialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#0D1117]">
              Konfirmasi Reset Pengaturan?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#57606A]">
              Tindakan ini akan mengembalikan seluruh preferensi bahasa, zona waktu, tema, dan saluran notifikasi
              ke setelan pabrik default. Data identitas profil Anda tidak akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmResetOpen(false)}
              className="text-xs font-mono border-[#D0D7DE]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleResetToDefaults}
              className="bg-[#0D1117] text-white hover:bg-neutral-800 text-xs font-mono"
            >
              Ya, Reset Pengaturan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Clear Cache Dialog */}
      <Dialog open={confirmClearCacheOpen} onOpenChange={setConfirmClearCacheOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-900">
              Bersihkan Cache Lokal & Muat Ulang?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#57606A]">
              Seluruh aset cache statis, font, dan template hasil psikotes yang tersimpan di perangkat ini akan
              dibersihkan, dan halaman akan dimuat ulang dari server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearCacheOpen(false)}
              className="text-xs font-mono border-[#D0D7DE]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={cacheClearing}
              onClick={handleClearCache}
              className="bg-rose-700 text-white hover:bg-rose-800 text-xs font-mono"
            >
              {cacheClearing ? 'Membersihkan...' : 'Ya, Bersihkan & Refresh'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Sign Out Dialog */}
      <Dialog open={confirmSignOutOpen} onOpenChange={setConfirmSignOutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#0D1117]">
              Konfirmasi Keluar dari Akun?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#57606A]">
              Sesi kerja Anda saat ini akan dihentikan secara aman. Anda dapat masuk kembali kapan saja dengan
              kredensial Anda.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmSignOutOpen(false)}
              className="text-xs font-mono border-[#D0D7DE]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSignOut}
              className="bg-rose-700 text-white hover:bg-rose-800 text-xs font-mono"
            >
              Ya, Keluar Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Revoke / Regenerate API Key Dialog */}
      <Dialog open={confirmRevokeKeyOpen} onOpenChange={setConfirmRevokeKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-amber-900">
              Regenerasi Kunci API Produksi?
            </DialogTitle>
            <DialogDescription className="text-xs text-[#57606A]">
              Kunci API saat ini akan langsung dinonaktifkan. Pastikan Anda segera memperbarui konfigurasi pada
              server eksternal yang mengonsumsi endpoint ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmRevokeKeyOpen(false)}
              className="text-xs font-mono border-[#D0D7DE]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleRegenerateApiKey}
              className="bg-amber-600 text-white hover:bg-amber-700 text-xs font-mono"
            >
              Ya, Buat Kunci Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Delete Account Request Dialog */}
      <Dialog open={confirmDeleteAccountOpen} onOpenChange={setConfirmDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-900">
              Pengajuan Penghapusan Akun Permanen
            </DialogTitle>
            <DialogDescription className="text-xs text-[#57606A]">
              Sesuai ketentuan UU PDP, permintaan penghapusan akun akan diverifikasi oleh tim administrasi
              dalam waktu 3 hari kerja sebelum penghapusan data definitif dilakukan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteAccountOpen(false)}
              className="text-xs font-mono border-[#D0D7DE]"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setConfirmDeleteAccountOpen(false);
                alert('Permintaan penghapusan akun telah dicatat. Tim kepatuhan data akan menghubungi email Anda.');
              }}
              className="bg-rose-700 text-white hover:bg-rose-800 text-xs font-mono"
            >
              Kirim Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
