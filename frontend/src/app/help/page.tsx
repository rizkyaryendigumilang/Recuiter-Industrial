'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Activity, 
  Compass, 
  MessageSquare, 
  PhoneCall, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export default function HelpAndGuidesPage() {
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: isEn ? 'What is the Kraepelin / Pauli test used for?' : 'Untuk apa tes Kraepelin / Pauli digunakan dalam seleksi industri?',
      a: isEn 
        ? 'The Kraepelin / Pauli test (also known as the newspaper test) measures working speed, accuracy, endurance, and emotional stability under repetitive, timed conditions typical in manufacturing and industrial operations.'
        : 'Tes Kraepelin / Pauli (tes koran) digunakan untuk mengukur kecepatan kerja, ketelitian, daya tahan terhadap stres monotonik, dan kestabilan emosi dalam situasi kerja berulang seperti di pabrik dan lini produksi.'
    },
    {
      q: isEn ? 'How do I answer Kraepelin addition on mobile or desktop?' : 'Bagaimana cara menjawab penjumlahan Kraepelin di handphone atau laptop?',
      a: isEn
        ? 'Add two adjacent vertically stacked single digits. If the sum is 10 or greater, write only the last digit (e.g., 7 + 8 = 15, so you input 5). When the timer alerts "PINDAH / MOVE", immediately proceed to the next column.'
        : 'Jumlahkan dua angka yang berdekatan secara vertikal. Jika hasilnya puluhan (10 atau lebih), ambil hanya angka satuannya (contoh: 7 + 8 = 15, maka Anda cukup mengetik angka 5). Saat terdengar bunyi atau tanda "PINDAH", segera lanjutkan ke kolom berikutnya.'
    },
    {
      q: isEn ? 'Is there a right or wrong answer in the DISC Personality Assessment?' : 'Apakah ada jawaban benar atau salah dalam tes kepribadian DISC?',
      a: isEn
        ? 'No. DISC evaluates your behavioral tendencies (Dominance, Influence, Steadiness, Conscientiousness). Choose the option that most honestly reflects how you behave in a professional workplace.'
        : 'Tidak ada jawaban benar atau salah. Asesmen DISC memetakan gaya kerja alami Anda (Dominance, Influence, Steadiness, Conscientiousness). Pilihlah jawaban yang paling mencerminkan diri Anda di lingkungan kerja.'
    },
    {
      q: isEn ? 'How does the payment verification with unique codes work?' : 'Bagaimana proses verifikasi pembayaran transfer manual klinik karir?',
      a: isEn
        ? 'When booking a consultation, the system generates a total amount with a 3-digit unique code (e.g., Rp 150.412). Transfer the exact nominal and upload your transfer proof in the booking portal. Admin verifies within 15 minutes.'
        : 'Saat memesan sesi konsultasi karir, sistem menambahkan 3 digit kode unik (misal: Rp 150.412). Pastikan mentransfer sesuai nominal persis dan unggah bukti transfer. Admin akan memverifikasi dalam waktu 15 menit.'
    },
    {
      q: isEn ? 'Can I take the assessment on a smartphone as a PWA?' : 'Apakah tes asesmen dapat dikerjakan lewat smartphone (PWA)?',
      a: isEn
        ? 'Yes! You can install Recruiter Industrial as a PWA directly from Safari or Chrome. The practice and official test engines include on-screen numpads optimized for one-thumb mobile tapping.'
        : 'Ya, tentu! Anda dapat memasang aplikasi Recruiter Industrial ke layar utama handphone Anda via Chrome atau Safari. Tersedia keypad angka virtual di layar yang nyaman ditekan dengan satu jempol.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs py-1 px-3">
            <BookOpen className="w-3.5 h-3.5 mr-1" />
            {isEn ? 'KNOWLEDGE BASE & GUIDES' : 'PUSAT BANTUAN & PANDUAN RESMI'}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] tracking-tight">
            {isEn ? 'Assessment Guides & Candidate Support' : 'Panduan Asesmen & Pusat Bantuan'}
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] max-w-2xl mx-auto">
            {isEn
              ? 'Master the industrial Kraepelin endurance test, understand psychometric DISC profiles, and discover preparation tips for manufacturing career selection.'
              : 'Kuasai teknik tes ketahanan Kraepelin, pahami dimensi kepribadian DISC, dan raih skor maksimal dalam seleksi kerja industri manufaktur.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/candidate/practice">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl h-10 px-4 gap-2 shadow-sm">
                <Activity className="w-4 h-4" />
                <span>{isEn ? 'Tryout Kraepelin Test Now' : 'Coba Simulasi Kraepelin Sekarang'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <a
              href="https://wa.me/6281299887766?text=Halo%20Admin%20HRTech,%20saya%20butuh%20bantuan%20terkait%20asesmen"
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" size="sm" className="border-[#E8E8EC] hover:bg-white text-[#0A0A0A] text-xs font-medium rounded-xl h-10 px-4 gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>{isEn ? 'WhatsApp Support Hotline' : 'Hotline WhatsApp Admin'}</span>
              </Button>
            </a>
          </div>
        </div>

        {/* 2 Core Guides Cards (Kraepelin & DISC) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Panduan Kraepelin */}
          <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-2 bg-indigo-600 w-full" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                <Activity className="w-4 h-4" />
                <span>{isEn ? 'Endurance Test Guide' : 'Panduan Tes Ketahanan'}</span>
              </div>
              <CardTitle className="text-xl font-bold text-[#0A0A0A]">
                {isEn ? 'Tes Kraepelin / Pauli (Tes Koran)' : 'Teknik Mengerjakan Tes Kraepelin'}
              </CardTitle>
              <CardDescription className="text-xs text-[#6B6B6B]">
                {isEn 
                  ? 'Key rules, digit reduction, and stamina management tips for industrial operators.'
                  : 'Aturan penjumlahan satuan, ritme stabil, dan cara mempertahankan ketelitian.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-[#4B5563] leading-relaxed">
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <p className="font-semibold text-indigo-900">
                  {isEn ? '1. Formula: Take Unit Digit Only' : '1. Aturan Penjumlahan Angka Satuan'}
                </p>
                <p className="text-[#4B5563]">
                  {isEn 
                    ? 'Always add adjacent digits vertically. If sum is 10 or greater, write only the ones place. Example: 8 + 6 = 14 ➔ write 4.'
                    : 'Jumlahkan dua angka berdekatan. Jika hasilnya puluhan, hanya ketik angka belakangnya. Contoh: 8 + 6 = 14 ➔ ketik 4.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC] space-y-2">
                <p className="font-semibold text-[#0A0A0A]">
                  {isEn ? '2. Rhythm & Stamina Curve' : '2. Menjaga Irama & Kurva Stabilitas'}
                </p>
                <p className="text-[#6B6B6B]">
                  {isEn 
                    ? 'Avoid sprinting in the first column and dropping in later columns. Industrial evaluators favor a stable or ascending curve over erratic peaks.'
                    : 'Jangan langsung terburu-buru di kolom pertama lalu kelelahan di akhir. HR industri lebih menyukai grafik garis yang stabil atau meningkat bertahap dibanding grafik yang anjlok drastis.'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC] space-y-2">
                <p className="font-semibold text-[#0A0A0A]">
                  {isEn ? '3. Instant Reaction on Column Transition' : '3. Reaksi Cepat Saat Pindah Kolom'}
                </p>
                <p className="text-[#6B6B6B]">
                  {isEn
                    ? 'When the system flashes "PINDAH", switch columns instantly without re-checking previous sums.'
                    : 'Begitu tanda "PINDAH" muncul, segera alihkan pandangan dan mulai dari dasar kolom berikutnya tanpa menengok ke belakang.'}
                </p>
              </div>

              <Link href="/candidate/practice" className="block pt-2">
                <Button size="sm" variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50 text-xs font-semibold gap-1.5 rounded-lg">
                  <Activity className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Launch Interactive Tryout' : 'Mulai Simulasi Tryout Kraepelin'}</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Panduan DISC */}
          <Card className="border-[#E8E8EC] shadow-sm bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-2 bg-emerald-500 w-full" />
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4" />
                <span>{isEn ? 'Behavioral Profile Guide' : 'Panduan Profil Perilaku'}</span>
              </div>
              <CardTitle className="text-xl font-bold text-[#0A0A0A]">
                {isEn ? 'DISC Psychometric Assessment' : 'Memahami Dimensi Kepribadian DISC'}
              </CardTitle>
              <CardDescription className="text-xs text-[#6B6B6B]">
                {isEn 
                  ? 'Understanding Dominance, Influence, Steadiness, and Compliance in manufacturing roles.'
                  : 'Empat dimensi kecocokan peran kerja: Produksi, QA, Leader Shift, dan Engineering.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-[#4B5563] leading-relaxed">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-100">
                  <span className="font-bold text-red-800 text-xs">D — Dominance</span>
                  <p className="text-[11px] text-red-900/80 mt-1">
                    {isEn ? 'Decisive, goal-driven, strong under urgency (Supervisor, Foreman).' : 'Tegas, fokus target, tangguh dalam tekanan target output (Foreman/Leader).'}
                  </p>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-800 text-xs">I — Influence</span>
                  <p className="text-[11px] text-amber-900/80 mt-1">
                    {isEn ? 'Persuasive, communicative, enthusiastic (Trainer, Safety Officer).' : 'Komunikatif, antusias, mudah berkoordinasi (HSE & Safety, Trainer).'}
                  </p>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="font-bold text-blue-800 text-xs">S — Steadiness</span>
                  <p className="text-[11px] text-blue-900/80 mt-1">
                    {isEn ? 'Patient, reliable, loyal, high endurance for repetitive tasks (Operator).' : 'Sabar, konsisten, tahan kerja berulang berjam-jam (Operator Line).'}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-800 text-xs">C — Compliance</span>
                  <p className="text-[11px] text-emerald-900/80 mt-1">
                    {isEn ? 'Detail-oriented, precision, SOP adherence (Quality Control / QA).' : 'Teliti, taat SOP standar industri, zero defect (Quality Control).'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFAFA] rounded-xl border border-[#E8E8EC] space-y-1">
                <p className="font-semibold text-[#0A0A0A]">
                  {isEn ? 'Tips for Candidates:' : 'Kunci Jawaban untuk Kandidat:'}
                </p>
                <p className="text-[#6B6B6B]">
                  {isEn
                    ? 'Do not try to fake an ideal profile. Consistency between questions is checked by psychometric correlation algorithms.'
                    : 'Jawablah dengan jujur dan konsisten sesuai cara Anda bertindak saat menghadapi masalah kerja. Algoritma menghitung tingkat konsistensi jawaban.'}
                </p>
              </div>

              <Link href="/candidate/results" className="block pt-2">
                <Button size="sm" variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs font-semibold gap-1.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isEn ? 'View Sample Psychogram' : 'Lihat Contoh Laporan Psikogram'}</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0A0A0A]">
              {isEn ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan (FAQ)'}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6B6B]">
              {isEn ? 'Answers to common questions about tests, payments, and account setup.' : 'Jawaban seputar tes psikotes, sistem seleksi, dan verifikasi akun.'}
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E8E8EC] rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-[#0A0A0A]">
                      {faq.q}
                    </span>
                    <span className="p-1 rounded-full text-[#6B6B6B] flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-[#4B5563] leading-relaxed border-t border-[#F5F5F7] pt-3 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Hotline Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold">
              {isEn ? 'Need technical assistance or custom company assessment?' : 'Butuh bantuan teknis atau asesmen khusus perusahaan?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {isEn
                ? 'Our licensed psychological team and support staff are on standby via WhatsApp Hotline.'
                : 'Tim psikolog berlisensi dan support teknis kami siap mendampingi melalui layanan WhatsApp resmi.'}
            </p>
          </div>

          <a
            href="https://wa.me/6281299887766?text=Halo%20Admin%20HRTech,%20saya%20ingin%20berkonsultasi"
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0"
          >
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg gap-2 h-11 px-5">
              <PhoneCall className="w-4 h-4" />
              <span>Chat WhatsApp: 0812-9988-7766</span>
            </Button>
          </a>
        </div>

      </div>
    </div>
  );
}
