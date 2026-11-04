'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Server
} from 'lucide-react';

export default function SettingsPage() {
  const { user, role, updateUser } = useAuth();
  const { t } = useLanguage();

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
        await Promise.all(cacheNames.map((n) => caches.delete(n)));
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
    <div className="min-h-screen bg-[#F6F8FA] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D0D7DE]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1 font-mono">
              <SettingsIcon className="w-4 h-4 text-amber-600" />
              <span>
                {userRole === 'admin'
                  ? 'Admin System Settings'
                  : userRole === 'employer'
                  ? 'Employer Organization Settings'
                  : 'Candidate Career Settings'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0D1117]">
              {t.settings.title}
            </h1>
            <p className="text-xs text-[#57606A] mt-0.5">
              {userRole === 'admin'
                ? 'Konfigurasi parameter psikometri, ambang batas seleksi, dan integritas server.'
                : userRole === 'employer'
                ? 'Pengaturan profil perusahaan dan saluran notifikasi rekrutmen.'
                : 'Pengaturan profil diri, preferensi kerja, dan notifikasi.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-white border border-[#D0D7DE] p-2 rounded-xl shadow-2xs">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F6F8FA] text-[#0D1117] border border-[#E1E4E8]">
              {userRole === 'admin' ? (
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              ) : userRole === 'employer' ? (
                <Briefcase className="w-4 h-4 text-amber-600" />
              ) : (
                <User className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#0D1117] truncate max-w-[140px]">
                {name || user?.email || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge className="text-[9px] uppercase font-mono font-bold py-0 px-1.5 h-4 shadow-none bg-[#0D1117] text-white">
                  {userRole}
                </Badge>
                {isStandalone && (
                  <span className="text-[10px] text-emerald-600 font-medium">● PWA</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Unified Tabs Layout */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white border border-[#D0D7DE] p-1 rounded-xl w-full flex overflow-x-auto justify-start sm:justify-center gap-1 h-auto shadow-xs">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{t.settings.tabProfile}</span>
            </TabsTrigger>

            {userRole === 'candidate' && (
              <TabsTrigger
                value="career"
                className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{t.settings.tabCareer}</span>
              </TabsTrigger>
            )}

            {userRole === 'employer' && (
              <TabsTrigger
                value="company"
                className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
              >
                <Building className="w-3.5 h-3.5" />
                <span>Profil Perusahaan</span>
              </TabsTrigger>
            )}

            {userRole === 'admin' && (
              <TabsTrigger
                value="system"
                className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Konfigurasi Sistem</span>
              </TabsTrigger>
            )}

            <TabsTrigger
              value="security"
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t.settings.tabSecurity}</span>
            </TabsTrigger>

            <TabsTrigger
              value="pwa"
              className="flex items-center gap-1.5 py-2 px-3 sm:px-4 text-xs font-mono font-medium rounded-lg data-[state=active]:bg-[#0D1117] data-[state=active]:text-white transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>PWA & Offline</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SHARED PROFILE */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#0D1117]">
                  {t.settings.profile.title}
                </CardTitle>
                <CardDescription className="text-xs text-[#57606A]">
                  Informasi kontak yang digunakan sistem dan rekan industri untuk berkomunikasi dengan Anda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{t.settings.profile.savedSuccess}</span>
                    </div>
                  )}
                  {profileError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="user_name" className="text-xs font-mono text-[#0D1117]">
                        {t.settings.profile.name}
                      </Label>
                      <Input
                        id="user_name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap..."
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="user_email" className="text-xs font-mono text-[#0D1117]">
                        {t.settings.profile.email}
                      </Label>
                      <Input
                        id="user_email"
                        value={email}
                        disabled
                        className="rounded-lg text-xs bg-[#F6F8FA] border-[#D0D7DE] text-[#57606A] cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="user_phone" className="text-xs font-mono text-[#0D1117]">
                      {t.settings.profile.phone}
                    </Label>
                    <Input
                      id="user_phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117] font-mono"
                    />
                    <p className="text-[11px] text-[#57606A]">
                      {t.settings.profile.phoneHint}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.settings.profile.saveBtn}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: CANDIDATE CAREER (CONDITIONAL) */}
          {userRole === 'candidate' && (
            <TabsContent value="career" className="space-y-6">
              <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0D1117]">
                    {t.settings.candidate.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-[#57606A]">
                    {t.settings.candidate.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveCandidate} className="space-y-4">
                    {candidateSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Preferensi karir berhasil disimpan!</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="career_headline" className="text-xs font-mono text-[#0D1117]">
                        Headline / Target Posisi Industri
                      </Label>
                      <Input
                        id="career_headline"
                        value={careerHeadline}
                        onChange={(e) => setCareerHeadline(e.target.value)}
                        placeholder="Contoh: Operator Manufaktur / Staff QC"
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="domicile" className="text-xs font-mono text-[#0D1117]">
                          Domisili / Wilayah Kerja
                        </Label>
                        <Input
                          id="domicile"
                          value={domicile}
                          onChange={(e) => setDomicile(e.target.value)}
                          placeholder="Contoh: Cikarang, Karawang"
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="expected_salary" className="text-xs font-mono text-[#0D1117]">
                          Ekspektasi Gaji Bulanan (IDR)
                        </Label>
                        <Input
                          id="expected_salary"
                          value={expectedSalary}
                          onChange={(e) => setExpectedSalary(e.target.value)}
                          placeholder="Contoh: 6.500.000"
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117] font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="portfolio_url" className="text-xs font-mono text-[#0D1117]">
                        Tautan Portofolio / LinkedIn / CV Online
                      </Label>
                      <Input
                        id="portfolio_url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://..."
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117] font-mono"
                      />
                    </div>

                    <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0D1117]">Notifikasi Lowongan WhatsApp</p>
                        <p className="text-[11px] text-[#57606A]">Kirim info lowongan pabrik sesuai kualifikasi tes Kraepelin.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={jobAlertsWA}
                        onChange={(e) => setJobAlertsWA(e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-500" />
                      <span>Simpan Preferensi Karir</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* TAB 2: EMPLOYER COMPANY (CONDITIONAL) */}
          {userRole === 'employer' && (
            <TabsContent value="company" className="space-y-6">
              <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0D1117]">
                    Profil Perusahaan & Unit Industri
                  </CardTitle>
                  <CardDescription className="text-xs text-[#57606A]">
                    Informasi resmi instansi untuk kop surat hasil psikogram dan job posting.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveEmployer} className="space-y-4">
                    {employerSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Data perusahaan berhasil diperbarui!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="comp_name" className="text-xs font-mono text-[#0D1117]">Nama Perusahaan / PT</Label>
                        <Input
                          id="comp_name"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="PT..."
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="industry" className="text-xs font-mono text-[#0D1117]">Sektor Industri</Label>
                        <Input
                          id="industry"
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="Contoh: Manufaktur Otomotif, Elektronik"
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="comp_size" className="text-xs font-mono text-[#0D1117]">Skala Karyawan</Label>
                        <Input
                          id="comp_size"
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          placeholder="Contoh: 250 - 500 Karyawan"
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="comp_website" className="text-xs font-mono text-[#0D1117]">Website Resmi</Label>
                        <Input
                          id="comp_website"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117] font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="comp_address" className="text-xs font-mono text-[#0D1117]">Alamat Pabrik / Fasilitas Operasional</Label>
                      <Input
                        id="comp_address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Kawasan Industri..."
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-500" />
                      <span>Simpan Profil Perusahaan</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* TAB 2: ADMIN SYSTEM (CONDITIONAL) */}
          {userRole === 'admin' && (
            <TabsContent value="system" className="space-y-6">
              <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-[#0D1117]">
                    Parameter Engine & Operasional Sistem
                  </CardTitle>
                  <CardDescription className="text-xs text-[#57606A]">
                    Pengaturan ambang batas tes seleksi dan preferensi gerbang pembayaran manual.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveAdmin} className="space-y-4">
                    {adminSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Parameter operasional sistem berhasil disimpan!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="min_kraepelin" className="text-xs font-mono text-[#0D1117]">
                          Batas Minimum Skor Kraepelin (Lolos Screening)
                        </Label>
                        <Input
                          id="min_kraepelin"
                          type="number"
                          value={minKraepelin}
                          onChange={(e) => setMinKraepelin(Number(e.target.value))}
                          className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="min_match" className="text-xs font-mono text-[#0D1117]">
                          Batas Match Rate Kompetensi (%)
                        </Label>
                        <Input
                          id="min_match"
                          type="number"
                          value={minMatchScore}
                          onChange={(e) => setMinMatchScore(Number(e.target.value))}
                          className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="hotline_phone" className="text-xs font-mono text-[#0D1117]">
                        Nomor Hotline WhatsApp Dukungan Admin
                      </Label>
                      <Input
                        id="hotline_phone"
                        value={hotlinePhone}
                        onChange={(e) => setHotlinePhone(e.target.value)}
                        className="rounded-lg text-xs border-[#D0D7DE] font-mono"
                      />
                    </div>

                    <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0D1117]">Sistem Kode Unik 3-Digit</p>
                        <p className="text-[11px] text-[#57606A]">Tambahkan kode unik anti-tabrakan otomatis pada booking konsultasi.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={uniqueCodeEnabled}
                        onChange={(e) => setUniqueCodeEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-[#0D1117]">Mode Pemeliharaan (Maintenance)</p>
                        <p className="text-[11px] text-[#57606A]">Hanya administrator yang dapat mengakses dashboard rekrutmen.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="h-4 w-4 rounded border-[#D0D7DE] text-[#0D1117] focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-amber-500" />
                      <span>Simpan Konfigurasi Admin</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* TAB 3: SHARED SECURITY */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#0D1117]">
                  {t.settings.profile.passwordSection}
                </CardTitle>
                <CardDescription className="text-xs text-[#57606A]">
                  Perbarui kata sandi akun untuk menjaga keamanan akses portal.
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
                    <Label htmlFor="curr_pass" className="text-xs font-mono text-[#0D1117]">
                      {t.settings.profile.currentPassword}
                    </Label>
                    <Input
                      id="curr_pass"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new_pass" className="text-xs font-mono text-[#0D1117]">
                        {t.settings.profile.newPassword}
                      </Label>
                      <Input
                        id="new_pass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="conf_pass" className="text-xs font-mono text-[#0D1117]">
                        {t.settings.profile.confirmPassword}
                      </Label>
                      <Input
                        id="conf_pass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-lg text-xs border-[#D0D7DE] focus:border-[#0D1117]"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    className="w-full sm:w-auto bg-[#0D1117] hover:bg-[#21262D] text-white rounded-lg text-xs font-mono gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.settings.profile.saveBtn}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: SHARED PWA */}
          <TabsContent value="pwa" className="space-y-6">
            <Card className="border-[#D0D7DE] bg-white rounded-xl shadow-xs">
              <CardHeader>
                <CardTitle className="text-base font-bold text-[#0D1117]">
                  {t.settings.pwa.title}
                </CardTitle>
                <CardDescription className="text-xs text-[#57606A]">
                  {t.settings.pwa.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-[#F6F8FA] border border-[#E1E4E8] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#0D1117]">Status PWA</p>
                    <p className="text-[11px] text-[#57606A]">
                      {isStandalone ? t.settings.pwa.statusStandalone : t.settings.pwa.statusBrowser}
                    </p>
                  </div>
                  <Badge className={`text-xs font-mono ${isStandalone ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-800'}`}>
                    {isStandalone ? 'INSTALLED' : 'BROWSER'}
                  </Badge>
                </div>

                {cacheMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{cacheMessage}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={handleClearCache}
                    disabled={cacheClearing}
                    variant="outline"
                    size="sm"
                    className="border-[#D0D7DE] text-xs font-mono gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cacheClearing ? 'animate-spin' : ''}`} />
                    <span>{t.settings.pwa.clearCacheBtn}</span>
                  </Button>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-[#D0D7DE] text-xs font-mono gap-1.5 cursor-pointer"
                  >
                    <span>Muat Ulang Halaman</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
