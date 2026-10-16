'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings as SettingsIcon, 
  Key, 
  Globe, 
  Bell, 
  Building, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Download, 
  ShieldCheck, 
  Briefcase,
  Sliders,
  Server,
  DollarSign,
  PhoneCall,
  Lock,
  Compass,
  FileCheck2,
  Database
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isLoggedIn, role, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const userRole = role || 'candidate';

  // --- Common Profile Form State ---
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // --- Security / Password Form State ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // --- Candidate-Specific State ---
  const [careerHeadline, setCareerHeadline] = useState('');
  const [domicile, setDomicile] = useState('');
  const [readiness, setReadiness] = useState('immediate');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [jobAlertsWA, setJobAlertsWA] = useState(true);
  const [candidateSuccess, setCandidateSuccess] = useState(false);

  // --- Employer-Specific State ---
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [employerSuccess, setEmployerSuccess] = useState(false);

  // --- Admin-Specific State ---
  const [minKraepelin, setMinKraepelin] = useState(65);
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [uniqueCodeEnabled, setUniqueCodeEnabled] = useState(true);
  const [hotlinePhone, setHotlinePhone] = useState('+62 812-9988-7766');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);

  // --- PWA & Cache State ---
  const [isStandalone, setIsStandalone] = useState(false);
  const [cacheClearing, setCacheClearing] = useState(false);
  const [cacheMessage, setCacheMessage] = useState('');

  // Load initial data
  useEffect(() => {
    if (user) {
      setName(user.name || (user.email ? user.email.split('@')[0] : ''));
      setEmail(user.email || '');
      setPhone(user.phone || (typeof window !== 'undefined' ? localStorage.getItem('user_phone') || '' : ''));

      // Candidate state
      setCareerHeadline(user.career_headline || (typeof window !== 'undefined' ? localStorage.getItem('cand_headline') || 'Operator Manufaktur / Staff QC' : ''));
      setDomicile(user.domicile || (typeof window !== 'undefined' ? localStorage.getItem('cand_domicile') || 'Cikarang, Jawa Barat' : ''));
      setReadiness(user.readiness || (typeof window !== 'undefined' ? localStorage.getItem('cand_readiness') || 'immediate' : 'immediate'));
      setExpectedSalary(user.expected_salary || (typeof window !== 'undefined' ? localStorage.getItem('cand_salary') || '6.500.000' : ''));
      setPortfolioUrl(user.portfolio_url || (typeof window !== 'undefined' ? localStorage.getItem('cand_portfolio') || 'https://linkedin.com/in/candidate' : ''));

      // Employer state
      setCompanyName(user.company_name || (typeof window !== 'undefined' ? localStorage.getItem('company_name') || 'PT Industri Maju Indonesia' : ''));
      setIndustry(user.industry || (typeof window !== 'undefined' ? localStorage.getItem('company_industry') || 'Manufaktur & Otomotif' : ''));
      setCompanySize(user.company_size || (typeof window !== 'undefined' ? localStorage.getItem('company_size') || '250 - 500 Karyawan' : ''));
      setWebsite(user.website || (typeof window !== 'undefined' ? localStorage.getItem('company_website') || 'https://industrimaju.co.id' : ''));
      setAddress(user.address || (typeof window !== 'undefined' ? localStorage.getItem('company_address') || 'Kawasan Industri GIIC Cikarang, Jawa Barat' : ''));

      // Admin state
      if (typeof window !== 'undefined') {
        const savedKraepelin = localStorage.getItem('sys_min_kraepelin');
        if (savedKraepelin) setMinKraepelin(Number(savedKraepelin));

        const savedMatch = localStorage.getItem('sys_min_match');
        if (savedMatch) setMinMatchScore(Number(savedMatch));

        const savedUnique = localStorage.getItem('sys_unique_code');
        if (savedUnique !== null) setUniqueCodeEnabled(savedUnique === 'true');

        const savedHotline = localStorage.getItem('sys_hotline');
        if (savedHotline) setHotlinePhone(savedHotline);

        const savedMaint = localStorage.getItem('sys_maintenance');
        if (savedMaint !== null) setMaintenanceMode(savedMaint === 'true');
      }
    }

    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);

      const savedAlerts = localStorage.getItem('cand_job_alerts');
      if (savedAlerts !== null) setJobAlertsWA(savedAlerts === 'true');
    }
  }, [user]);

  // Handler: Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    try {
      await updateUser({ name, phone });
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_phone', phone);
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err?.message || 'Gagal menyimpan profil');
    }
  };

  // Handler: Save Password
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
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Gagal mengganti kata sandi');
    }
  };

  // Handler: Save Candidate Preferences
  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cand_headline', careerHeadline);
      localStorage.setItem('cand_domicile', domicile);
      localStorage.setItem('cand_readiness', readiness);
      localStorage.setItem('cand_salary', expectedSalary);
      localStorage.setItem('cand_portfolio', portfolioUrl);
      localStorage.setItem('cand_job_alerts', String(jobAlertsWA));
    }
    await updateUser({
      career_headline: careerHeadline,
      domicile,
      readiness,
      expected_salary: expectedSalary,
      portfolio_url: portfolioUrl,
    });
    setCandidateSuccess(true);
    setTimeout(() => setCandidateSuccess(false), 4000);
  };

  // Handler: Save Employer Data
  const handleSaveEmployer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_name', companyName);
      localStorage.setItem('company_industry', industry);
      localStorage.setItem('company_size', companySize);
      localStorage.setItem('company_website', website);
      localStorage.setItem('company_address', address);
    }
    await updateUser({
      company_name: companyName,
      industry,
      company_size: companySize,
      website,
      address,
    });
    setEmployerSuccess(true);
    setTimeout(() => setEmployerSuccess(false), 4000);
  };

  // Handler: Save Admin Configuration
  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('sys_min_kraepelin', String(minKraepelin));
      localStorage.setItem('sys_min_match', String(minMatchScore));
      localStorage.setItem('sys_unique_code', String(uniqueCodeEnabled));
      localStorage.setItem('sys_hotline', hotlinePhone);
      localStorage.setItem('sys_maintenance', String(maintenanceMode));
    }
    setAdminSuccess(true);
    setTimeout(() => setAdminSuccess(false), 4000);
  };

  // Handler: Purge Cache
  const handleClearCache = async () => {
    setCacheClearing(true);
    setCacheMessage('');
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
      setCacheMessage(t.settings.pwa.cacheCleared);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      setCacheClearing(false);
      setCacheMessage('Gagal membersihkan cache.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-[#E8E8EC]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
              <SettingsIcon className="w-4 h-4" />
              <span>
                {userRole === 'admin'
                  ? 'Admin System Settings'
                  : userRole === 'employer'
                  ? 'Employer Organization Settings'
                  : 'Candidate Career Settings'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {t.settings.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#6B6B6B] mt-1 max-w-2xl">
              {userRole === 'admin'
                ? 'Panel konfigurasi pusat parameter psikometri, ambang batas seleksi, dan integritas server.'
                : userRole === 'employer'
                ? 'Pengaturan profil perusahaan, kop surat psikogram resmi, dan saluran notifikasi rekrutmen.'
                : 'Pengaturan profil diri, preferensi lowongan kerja, kesiapan karir, dan notifikasi.'}
            </p>
          </div>

          {/* Role Indicator & Avatar */}
          <div className="flex items-center gap-3 bg-white border border-[#E8E8EC] px-3.5 py-2.5 rounded-2xl shadow-sm self-start sm:self-auto">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
              userRole === 'admin'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : userRole === 'employer'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {userRole === 'admin' ? (
                <ShieldCheck className="w-4 h-4" />
              ) : userRole === 'employer' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0A0A0A] truncate max-w-[140px]">
                {name || user?.email || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  className={`text-[9px] uppercase font-bold py-0 px-1.5 h-4 shadow-none ${
                    userRole === 'admin'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : userRole === 'employer'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  {userRole}
                </Badge>
                {isStandalone && (
                  <span className="text-[10px] text-emerald-600 font-medium">● PWA</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: KANDIDAT SETTINGS (Tailored for Candidates)           */}
        {/* ============================================================== */}
        {userRole === 'candidate' && (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-white border border-[#E8E8EC] p-1 rounded-xl w-full flex overflow-x-auto justify-start sm:justify-center gap-1 h-auto shadow-sm">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.settings.tabProfile}</span>
              </TabsTrigger>

              <TabsTrigger
                value="career"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.settings.tabCareer}</span>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t.settings.tabSecurity}</span>
              </TabsTrigger>

              <TabsTrigger
                value="pwa_candidate"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>PWA & Aplikasi</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: PROFIL KANDIDAT */}
            <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>Identitas Kandidat</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.profile.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B6B6B]">
                    Informasi ini digunakan recruiter perusahaan saat menghubungi Anda untuk jadwal wawancara kerja.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {profileSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{t.settings.profile.savedSuccess}</span>
                      </div>
                    )}
                    {profileError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{profileError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="cand_name" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.profile.name}
                        </Label>
                        <Input
                          id="cand_name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nama lengkap Anda..."
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="cand_email" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.profile.email}
                        </Label>
                        <Input
                          id="cand_email"
                          value={email}
                          disabled
                          className="rounded-lg text-xs bg-[#F5F5F7] border-[#E8E8EC] text-[#6B6B6B] cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cand_phone" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.profile.phone}
                      </Label>
                      <Input
                        id="cand_phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600 font-mono"
                      />
                      <p className="text-[11px] text-[#86868B]">
                        {t.settings.profile.phoneHint}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.settings.profile.saveBtn}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PREFERENSI KARIR */}
            <TabsContent value="career" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>Preferensi Karir & Pekerjaan</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.candidate.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B6B6B]">
                    {t.settings.candidate.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveCandidate} className="space-y-4">
                    {candidateSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{t.settings.candidate.savedSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="headline" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.candidate.careerHeadline}
                        </Label>
                        <Input
                          id="headline"
                          value={careerHeadline}
                          onChange={(e) => setCareerHeadline(e.target.value)}
                          placeholder="Operator Mesin / QA Inspector"
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="domicile" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.candidate.domicile}
                        </Label>
                        <Input
                          id="domicile"
                          value={domicile}
                          onChange={(e) => setDomicile(e.target.value)}
                          placeholder="Cikarang, Karawang, Bekasi..."
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="salary" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.candidate.expectedSalary}
                        </Label>
                        <Input
                          id="salary"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                          placeholder="6.500.000"
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="readiness" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.candidate.readiness}
                        </Label>
                        <select
                          id="readiness"
                          value={readiness}
                          onChange={(e) => setReadiness(e.target.value)}
                          className="w-full h-9 px-3 rounded-lg text-xs border border-[#E8E8EC] bg-white text-[#0A0A0A] focus:border-indigo-600 focus:outline-none"
                        >
                          <option value="immediate">{t.settings.candidate.readyImmediate}</option>
                          <option value="notice">{t.settings.candidate.readyNotice}</option>
                          <option value="passive">{t.settings.candidate.readyPassive}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="portfolio" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.candidate.portfolioUrl}
                      </Label>
                      <Input
                        id="portfolio"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                      />
                    </div>

                    <Separator className="bg-[#E8E8EC] my-2" />

                    {/* Job Alerts Switch */}
                    <label className="p-3.5 rounded-xl border border-[#E8E8EC] flex items-center justify-between cursor-pointer hover:bg-[#F5F5F7] transition-colors">
                      <div className="pr-4">
                        <p className="text-xs font-semibold text-[#0A0A0A]">
                          {t.settings.candidate.jobAlerts}
                        </p>
                        <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                          {t.settings.candidate.jobAlertsDesc}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={jobAlertsWA}
                        onChange={(e) => setJobAlertsWA(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                      />
                    </label>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.settings.candidate.saveBtn}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: KEAMANAN KANDIDAT */}
            <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <Key className="w-4 h-4" />
                    <span>Keamanan Kata Sandi</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.profile.passwordSection}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {passwordSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{t.settings.profile.savedSuccess}</span>
                      </div>
                    )}
                    {passwordError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="cur_pw_cand" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.profile.currentPassword}
                      </Label>
                      <Input
                        id="cur_pw_cand"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="new_pw_cand" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.profile.newPassword}
                      </Label>
                      <Input
                        id="new_pw_cand"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="conf_pw_cand" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.profile.confirmPassword}
                      </Label>
                      <Input
                        id="conf_pw_cand"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi baru"
                        className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="w-full border-[#E8E8EC] hover:bg-[#F5F5F7] text-[#0A0A0A] rounded-lg text-xs font-medium gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Perbarui Kata Sandi</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PWA & BAHASA KANDIDAT */}
            <TabsContent value="pwa_candidate" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-2xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>Aplikasi Mobile & PWA</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    Pengalaman Aplikasi & Akses Cepat
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Language Quick Toggle */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-[#0A0A0A]">Pilihan Bahasa</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLanguage('id')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          language === 'id' ? 'border-indigo-600 bg-indigo-50/50' : 'border-[#E8E8EC]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#0A0A0A]">🇮🇩 Bahasa Indonesia</span>
                        {language === 'id' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          language === 'en' ? 'border-indigo-600 bg-indigo-50/50' : 'border-[#E8E8EC]'
                        }`}
                      >
                        <span className="text-xs font-semibold text-[#0A0A0A]">🇬🇧 English</span>
                        {language === 'en' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </button>
                    </div>
                  </div>

                  <Separator className="bg-[#E8E8EC]" />

                  {/* PWA status */}
                  <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#0A0A0A]">
                        {isStandalone ? 'Aplikasi Terpasang (PWA)' : 'Browser Web'}
                      </p>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                        {isStandalone ? 'Aplikasi terinstal di beranda ponsel Anda.' : 'Buka dari Safari/Chrome di handphone untuk install.'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                      disabled={cacheClearing}
                      className="text-xs border-[#E8E8EC] gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${cacheClearing ? 'animate-spin' : ''}`} />
                      <span>{cacheClearing ? 'Memuat...' : 'Sync Cache'}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: ADMIN SETTINGS (Tailored for Administrators)           */}
        {/* ============================================================== */}
        {userRole === 'admin' && (
          <Tabs defaultValue="system" className="space-y-6">
            <TabsList className="bg-white border border-[#E8E8EC] p-1 rounded-xl w-full flex overflow-x-auto justify-start sm:justify-center gap-1 h-auto shadow-sm">
              <TabsTrigger
                value="system"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{t.settings.tabSystem}</span>
              </TabsTrigger>

              <TabsTrigger
                value="integrations"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Server className="w-3.5 h-3.5" />
                <span>{t.settings.tabIntegrations}</span>
              </TabsTrigger>

              <TabsTrigger
                value="admin_profile"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Profil & Keamanan</span>
              </TabsTrigger>

              <TabsTrigger
                value="pwa_admin"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Cache & PWA Global</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: KONFIGURASI SISTEM ADMIN */}
            <TabsContent value="system" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider">
                    <Sliders className="w-4 h-4" />
                    <span>Konfigurasi Rekrutmen & Asesmen</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.admin.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B6B6B]">
                    {t.settings.admin.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSaveAdmin} className="space-y-5">
                    {adminSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{t.settings.admin.savedSuccess}</span>
                      </div>
                    )}

                    {/* Passing Score Thresholds */}
                    <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC] space-y-4">
                      <h4 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center gap-2 text-indigo-700">
                        <FileCheck2 className="w-4 h-4" />
                        <span>{t.settings.admin.passingScoreTitle}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <Label htmlFor="kraepelin">{t.settings.admin.minKraepelin}</Label>
                            <span className="font-mono font-bold text-indigo-600">{minKraepelin}%</span>
                          </div>
                          <Input
                            id="kraepelin"
                            type="number"
                            min="30"
                            max="95"
                            value={minKraepelin}
                            onChange={(e) => setMinKraepelin(Number(e.target.value))}
                            className="rounded-lg text-xs border-[#E8E8EC] font-mono"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <Label htmlFor="ocr">{t.settings.admin.minMatchScore}</Label>
                            <span className="font-mono font-bold text-indigo-600">{minMatchScore}%</span>
                          </div>
                          <Input
                            id="ocr"
                            type="number"
                            min="30"
                            max="95"
                            value={minMatchScore}
                            onChange={(e) => setMinMatchScore(Number(e.target.value))}
                            className="rounded-lg text-xs border-[#E8E8EC] font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment & Hotline */}
                    <div className="space-y-3">
                      <label className="p-3.5 rounded-xl border border-[#E8E8EC] flex items-center justify-between cursor-pointer hover:bg-[#F5F5F7] transition-colors">
                        <div className="pr-4">
                          <p className="text-xs font-semibold text-[#0A0A0A] flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{t.settings.admin.uniqueCodeToggle}</span>
                          </p>
                          <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                            {t.settings.admin.uniqueCodeDesc}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={uniqueCodeEnabled}
                          onChange={(e) => setUniqueCodeEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                        />
                      </label>

                      <div className="space-y-1.5">
                        <Label htmlFor="hotline" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.admin.hotlinePhone}
                        </Label>
                        <Input
                          id="hotline"
                          value={hotlinePhone}
                          onChange={(e) => setHotlinePhone(e.target.value)}
                          placeholder="+62 812-xxxx-xxxx"
                          className="rounded-lg text-xs border-[#E8E8EC] font-mono"
                        />
                      </div>
                    </div>

                    {/* Maintenance Mode */}
                    <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
                      <div className="pr-4">
                        <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{t.settings.admin.maintenanceMode}</span>
                        </p>
                        <p className="text-[11px] text-rose-700/80 mt-0.5">
                          {t.settings.admin.maintenanceDesc}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-600 cursor-pointer"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-[#1D1D1F] hover:bg-black text-white rounded-lg text-xs font-medium gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.settings.admin.saveBtn}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: INTEGRASI & SERVER ADMIN */}
            <TabsContent value="integrations" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <Server className="w-4 h-4" />
                    <span>Infrastruktur & API</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.admin.serverTitle}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B6B6B]">
                    {t.settings.admin.serverDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#E8E8EC] bg-[#FAFAFA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0A0A0A]">{t.settings.admin.apiEndpoint}</p>
                        <p className="text-xs font-mono text-[#6B6B6B] mt-0.5">http://127.0.0.1:8090</p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                        ● {t.settings.admin.dbConnected}
                      </Badge>
                    </div>

                    <Separator className="bg-[#E8E8EC]" />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 bg-white rounded-lg border border-[#E8E8EC]">
                        <p className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Tabel Database</p>
                        <p className="text-sm font-bold text-[#0A0A0A] mt-0.5">8 Collections</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E8E8EC]">
                        <p className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Latency API</p>
                        <p className="text-sm font-bold text-emerald-600 mt-0.5">&lt; 15 ms</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E8E8EC] col-span-2 sm:col-span-1">
                        <p className="text-[10px] text-[#6B6B6B] uppercase font-semibold">Admin Panel PocketBase</p>
                        <a
                          href="http://127.0.0.1:8090/_/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          Buka PB Admin ➔
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PROFIL ADMIN & PASSWORD */}
            <TabsContent value="admin_profile" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0A0A0A]">Identitas Administrator</CardTitle>
                    <CardDescription className="text-xs text-[#6B6B6B]">Informasi kontak admin utama</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSaveProfile} className="space-y-3">
                      {profileSuccess && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg">Tersimpan!</div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">Nama Admin</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email Administrator</Label>
                        <Input value={email} disabled className="text-xs bg-[#F5F5F7]" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Nomor WhatsApp Admin</Label>
                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs font-mono" />
                      </div>
                      <Button type="submit" size="sm" className="w-full bg-[#1D1D1F] hover:bg-black text-white text-xs mt-2">
                        Simpan Profil Admin
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold text-[#0A0A0A]">Ganti Password Root</CardTitle>
                    <CardDescription className="text-xs text-[#6B6B6B]">Perbarui kata sandi akses admin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-3">
                      {passwordSuccess && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg">Password diubah!</div>
                      )}
                      {passwordError && (
                        <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">{passwordError}</div>
                      )}
                      <div className="space-y-1">
                        <Label className="text-xs">Password Saat Ini</Label>
                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Password Baru (min. 8 char)</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-xs" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Konfirmasi Password Baru</Label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-xs" />
                      </div>
                      <Button type="submit" variant="outline" size="sm" className="w-full text-xs mt-2">
                        Perbarui Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: CACHE & PWA GLOBAL */}
            <TabsContent value="pwa_admin" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0A0A0A]">PWA, Bahasa & Cache Global</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                    <div>
                      <p className="text-xs font-semibold text-[#0A0A0A]">Bahasa Utama Platform</p>
                      <p className="text-[11px] text-[#6B6B6B]">Ganti bahasa tampilan aktif</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={language === 'id' ? 'default' : 'outline'}
                        onClick={() => setLanguage('id')}
                        className={`text-xs h-7 px-3 ${language === 'id' ? 'bg-[#1D1D1F]' : ''}`}
                      >
                        🇮🇩 ID
                      </Button>
                      <Button
                        size="sm"
                        variant={language === 'en' ? 'default' : 'outline'}
                        onClick={() => setLanguage('en')}
                        className={`text-xs h-7 px-3 ${language === 'en' ? 'bg-[#1D1D1F]' : ''}`}
                      >
                        🇬🇧 EN
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F5F5F7] rounded-xl border border-[#E8E8EC] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#0A0A0A]">Purge PWA Service Worker Cache</p>
                      <p className="text-[11px] text-[#6B6B6B] mt-0.5">Hapus cache statis offline & reload sistem</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                      disabled={cacheClearing}
                      className="text-xs gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${cacheClearing ? 'animate-spin' : ''}`} />
                      <span>Purge Cache</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: EMPLOYER SETTINGS (Tailored for Employers)             */}
        {/* ============================================================== */}
        {userRole === 'employer' && (
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="bg-white border border-[#E8E8EC] p-1 rounded-xl w-full flex overflow-x-auto justify-start sm:justify-center gap-1 h-auto shadow-sm">
              <TabsTrigger
                value="company"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Building className="w-3.5 h-3.5" />
                <span>{t.settings.tabCompany}</span>
              </TabsTrigger>

              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>Profil PIC Recruiter</span>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Keamanan Kata Sandi</span>
              </TabsTrigger>

              <TabsTrigger
                value="pwa"
                className="flex items-center gap-2 py-2 px-3 sm:px-4 text-xs font-medium rounded-lg data-[state=active]:bg-[#1D1D1F] data-[state=active]:text-white transition-all"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>PWA & Preferensi</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: PROFIL PERUSAHAAN EMPLOYER */}
            <TabsContent value="company" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                    <Building className="w-4 h-4" />
                    <span>Identitas Perusahaan / Pabrik</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-[#0A0A0A]">
                    {t.settings.company.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#6B6B6B]">
                    Informasi ini akan tertera pada kop surat Psikogram PDF dan postingan lowongan kerja Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveEmployer} className="space-y-4">
                    {employerSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>{t.settings.company.savedSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="c_name" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.company.name}
                        </Label>
                        <Input
                          id="c_name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="PT Astra / PT Denso..."
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="c_ind" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.company.industry}
                        </Label>
                        <Input
                          id="c_ind"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="Manufaktur Otomotif / Logistik"
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="c_size" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.company.size}
                        </Label>
                        <Input
                          id="c_size"
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          placeholder="250 - 500 Karyawan"
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="c_web" className="text-xs font-medium text-[#0A0A0A]">
                          {t.settings.company.website}
                        </Label>
                        <Input
                          id="c_web"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://company.co.id"
                          className="rounded-lg text-xs border-[#E8E8EC] focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="c_addr" className="text-xs font-medium text-[#0A0A0A]">
                        {t.settings.company.address}
                      </Label>
                      <textarea
                        id="c_addr"
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Alamat pabrik / fasilitas industri..."
                        className="w-full p-2.5 rounded-lg text-xs border border-[#E8E8EC] focus:border-indigo-600 focus:outline-none text-[#0A0A0A] bg-white resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.settings.company.saveBtn}</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PROFIL PIC RECRUITER */}
            <TabsContent value="profile" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0A0A0A]">Kontak PIC Rekruter</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {profileSuccess && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg">Profil diperbarui!</div>
                    )}
                    <div className="space-y-1">
                      <Label className="text-xs">Nama PIC</Label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email</Label>
                      <Input value={email} disabled className="text-xs bg-[#F5F5F7]" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Nomor WhatsApp Resmi Rekruter</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs font-mono" />
                    </div>
                    <Button type="submit" size="sm" className="w-full bg-indigo-600 text-white text-xs">
                      Simpan Kontak PIC
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: KEAMANAN EMPLOYER */}
            <TabsContent value="security" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0A0A0A]">Ganti Kata Sandi</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    {passwordSuccess && <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg">Sukses!</div>}
                    {passwordError && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg">{passwordError}</div>}
                    <div className="space-y-1">
                      <Label className="text-xs">Password Saat Ini</Label>
                      <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Password Baru</Label>
                      <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Konfirmasi Password Baru</Label>
                      <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-xs" />
                    </div>
                    <Button type="submit" variant="outline" size="sm" className="w-full text-xs mt-2">
                      Perbarui Password
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB: PWA & BAHASA EMPLOYER */}
            <TabsContent value="pwa" className="space-y-6 focus-visible:outline-none">
              <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl max-w-2xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0A0A0A]">Bahasa & PWA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC]">
                    <span className="text-xs font-semibold">Bahasa Antarmuka</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant={language === 'id' ? 'default' : 'outline'} onClick={() => setLanguage('id')} className="text-xs h-7 px-3">
                        🇮🇩 ID
                      </Button>
                      <Button size="sm" variant={language === 'en' ? 'default' : 'outline'} onClick={() => setLanguage('en')} className="text-xs h-7 px-3">
                        🇬🇧 EN
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-[#F5F5F7] rounded-xl border border-[#E8E8EC] flex items-center justify-between">
                    <span className="text-xs font-medium">Cache Browser & Offline Data</span>
                    <Button variant="outline" size="sm" onClick={handleClearCache} disabled={cacheClearing} className="text-xs">
                      Bersihkan Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

      </div>
    </div>
  );
}
