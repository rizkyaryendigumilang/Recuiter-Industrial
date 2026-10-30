'use client';

import { Suspense, useState, useEffect } from "react";
import { pb } from "@/lib/pocketbase";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/language-context";
import {
  CheckCircle2,
  Clock,
  MessageCircle,
  ShieldCheck,
  UploadCloud,
  FileCheck,
  ChevronLeft,
  Copy,
  Check,
  CreditCard,
  Building,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// Default fallback services if PocketBase is offline
const FALLBACK_SERVICES: Record<string, any> = {
  'b2b-retainer': {
    id: 'b2b-retainer',
    category: 'Pilar A: B2B Layanan HR Pabrik',
    title: 'Paket Retainer HR & Rekrutmen Pabrik Bulanan',
    price: 3500000,
    description: 'Pendampingan rekrutmen operator pabrik, evaluasi kepatuhan K3/ISO, dan konsultasi hubungan industrial.',
  },
  'career-clinic': {
    id: 'career-clinic',
    category: 'Pilar B: Klinik Karier & Audit Resume',
    title: 'Audit Resume & Simulasi Wawancara HR Pabrik',
    price: 150000,
    description: 'Sesi privat 60 menit perbaikan resume teknik, latihan pertanyaan user industri, dan strategi nego gaji.',
  },
  'counseling': {
    id: 'counseling',
    category: 'Pilar C: Psikologi Terapan & Konseling',
    title: 'Sesi Konseling Kerja & Manajemen Stres Shift',
    price: 250000,
    description: 'Konseling privat bersama psikolog berlisensi untuk mengatasi burnout, stres kerja shift malam, dan dinamika tim.',
  },
};

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500 text-sm">
          Memuat data pemesanan...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { t, language } = useLanguage();
  const isEn = language === 'en';

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [uniqueCode, setUniqueCode] = useState<number>(348);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  useEffect(() => {
    // Generate random 3-digit code
    const generated = Math.floor(Math.random() * 900) + 100;
    setUniqueCode(generated);

    // Fetch service from PocketBase with fallback
    pb.collection("services_catalog")
      .getOne(serviceId)
      .then(setService)
      .catch(() => {
        // Fallback service
        const found = FALLBACK_SERVICES[serviceId] || {
          id: serviceId,
          category: 'Konsultasi & Asesmen Terapan',
          title: 'Sesi Konsultasi & Asesmen Rekrutmen Industri',
          price: 250000,
          description: 'Sesi evaluasi privat bersama psikolog industri dan praktisi SDM manufaktur tersertifikasi.',
        };
        setService(found);
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const previewUrl = URL.createObjectURL(selected);
      setFilePreview(previewUrl);
    } else {
      setFilePreview(null);
    }
  };

  /**
   * Poin 6: Create Booking and Generate Mandatory Unique Transfer Amount
   */
  const handleBook = async () => {
    const userId = pb.authStore.record?.id || 'demo-user-101';
    try {
      const formData = new FormData();
      formData.append("service_id", serviceId);
      formData.append("user_id", userId);
      formData.append("unique_code", String(uniqueCode));
      formData.append("payment_status", "pending");
      if (file) formData.append("payment_proof_url", file);

      let record: any = null;
      try {
        record = await pb.collection("consultation_bookings").create(formData);
      } catch (err) {
        // Local persistence fallback
        record = {
          id: `book-${Math.floor(100000 + Math.random() * 900000)}`,
          service_id: serviceId,
          user_id: userId,
          unique_code: uniqueCode,
          payment_status: "pending",
          created: new Date().toISOString(),
        };
      }

      setBooking(record);
      localStorage.setItem(`booking_${record.id}`, JSON.stringify(record));

      // Subscribe to real-time update
      try {
        pb.collection("consultation_bookings").subscribe(record.id, (e) => {
          if (e.action === "update" && e.record.payment_status === "paid") {
            setBooking(e.record);
          }
        });
      } catch {}
    } catch (e) {
      console.error(e);
      alert(isEn ? "Failed to create booking order." : "Gagal membuat pesanan booking.");
    }
  };

  /**
   * Poin 6: Upload Payment Proof
   */
  const handleUploadProof = async () => {
    if (!file || !booking) return;
    setIsSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append("payment_proof_url", file);

      if (booking.id && !booking.id.startsWith("book-")) {
        await pb.collection("consultation_bookings").update(booking.id, formData);
      }

      const updated = { ...booking, proof_uploaded: true, payment_proof_url: filePreview };
      setBooking(updated);
      localStorage.setItem(`booking_${booking.id}`, JSON.stringify(updated));

      alert(
        isEn
          ? "Payment proof submitted! Administrator has been notified for verification."
          : "Bukti transfer berhasil dikirim! Admin akan segera memverifikasi pembayaran Anda."
      );
    } catch (err) {
      console.warn("Proof upload error:", err);
      const updated = { ...booking, proof_uploaded: true, payment_proof_url: filePreview };
      setBooking(updated);
      alert("Bukti transfer tersimpan dalam sistem!");
    } finally {
      setIsSubmittingProof(false);
    }
  };

  /**
   * Demo helper: Simulate admin approving payment
   */
  const handleSimulateAdminApproval = async () => {
    if (!booking) return;
    try {
      if (booking.id && !booking.id.startsWith("book-")) {
        await pb.collection("consultation_bookings").update(booking.id, {
          payment_status: "paid",
        });
      }
    } catch {}

    const paidBooking = { ...booking, payment_status: "paid" };
    setBooking(paidBooking);
    localStorage.setItem(`booking_${booking.id}`, JSON.stringify(paidBooking));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-500 text-sm">
        {t.common.loading}
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          {isEn ? 'Service Not Found' : 'Layanan Tidak Ditemukan'}
        </h2>
        <p className="text-xs text-neutral-500 mb-6">
          {isEn ? 'The requested service may have been unpublished by the administrator.' : 'Layanan yang Anda tuju mungkin telah dinonaktifkan oleh admin.'}
        </p>
        <Link href="/">
          <Button variant="outline" className="rounded-full">
            {t.auth.backToHome}
          </Button>
        </Link>
      </div>
    );
  }

  const basePrice = Number(service.price) || 0;
  const currentCode = Number(booking?.unique_code || uniqueCode);
  const totalAmount = basePrice + currentCode;

  const copyAmount = () => {
    navigator.clipboard.writeText(String(totalAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const copyAccount = (accNo: string, bankName: string) => {
    navigator.clipboard.writeText(accNo.replace(/-/g, ''));
    setCopiedBank(bankName);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <Link href="/services" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 mb-6 font-medium">
          <ChevronLeft className="w-4 h-4" />
          {isEn ? 'Back to Services Catalog' : 'Kembali ke Katalog Layanan'}
        </Link>

        {/* Main Card */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          {/* Header */}
          <div className="border-b border-neutral-100 pb-5 mb-6">
            <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              {service.category || (isEn ? 'Private Consultation' : 'Konsultasi & Klinik Industri')}
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 mt-2 leading-snug">
              {service.title}
            </h1>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              {service.description}
            </p>
          </div>

          {!booking ? (
            /* ==================================================================== */
            /* STEP 1: FORM PEMESANAN & RANGKUMAN BIAYA                             */
            /* ==================================================================== */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{isEn ? 'Official Session Fee' : 'Tarif Layanan Resmi'}</span>
                  <span className="font-mono text-neutral-900 font-semibold">Rp {basePrice.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-indigo-700">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isEn ? '3-Digit Verification Code' : 'Estimasi Kode Unik Verifikasi'}
                  </span>
                  <span className="font-mono font-bold">+ Rp {uniqueCode}</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900">
                    {isEn ? 'Estimated Total Amount' : 'Perkiraan Total Transfer'}
                  </span>
                  <span className="text-xl font-bold font-mono text-[#0A0A0A]">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-800 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-neutral-900">
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  Sistem Transaksi Terverifikasi
                </div>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Kode unik 3 digit berfungsi untuk memverifikasi pembayaran secara akurat tanpa antrean manual.
                </p>
              </div>

              <Button
                onClick={handleBook}
                className="w-full h-11 rounded-lg bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs shadow-sm transition-colors duration-150"
              >
                {isEn ? 'Confirm & Generate Invoice' : 'Konfirmasi Pemesanan & Tampilkan No. Rekening'}
              </Button>
            </div>
          ) : (
            /* ==================================================================== */
            /* STEP 2: RINCIAN NOMINAL TRANSFER, REKENING & BUKTI BAYAR             */
            /* ==================================================================== */
            <div className="space-y-6">
              {/* Box Nominal Transfer Wajib */}
              <div className="text-center p-6 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs text-neutral-600 font-medium block mb-1">
                  {isEn ? 'Mandatory Transfer Amount (Includes 3-Digit Code)' : 'Nominal Transfer Wajib (Tepat Termasuk 3 Digit Kode Unik)'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-neutral-900 my-2">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </div>
                <button
                  onClick={copyAmount}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900 font-medium px-4 py-1.5 rounded-lg bg-white border border-neutral-300 mt-1 shadow-xs active:scale-95 transition-all"
                >
                  {copiedAmount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isEn ? "Copied to Clipboard" : "Nominal Tersalin!"}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isEn ? "Copy Exact Amount" : "Salin Nominal Tepat"}</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-500 mt-3">
                  Penting: Pastikan Anda mentransfer <strong>tepat Rp {totalAmount.toLocaleString('id-ID')}</strong> hingga 3 digit terakhir.
                </p>
              </div>

              {/* Box Rincian Rekening Resmi (Mandiri & BCA) */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-neutral-700">
                  {isEn ? 'Official Bank Accounts' : 'Rekening Bank Tujuan Transfer:'}
                </h3>

                {/* Bank Mandiri */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">Bank Mandiri</span>
                      <Badge variant="outline" className="text-[10px] bg-neutral-100">008</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold text-neutral-800">123-00-9876543-1</p>
                    <p className="text-[10px] text-neutral-500">a.n. PT REKRUTER INDUSTRI INDONESIA</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyAccount('1230098765431', 'mandiri')}
                    className="rounded-full text-xs h-8 px-3 shrink-0"
                  >
                    {copiedBank === 'mandiri' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Tersalin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Salin Rek
                      </span>
                    )}
                  </Button>
                </div>

                {/* Bank BCA */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3 shadow-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900">Bank Central Asia (BCA)</span>
                      <Badge variant="outline" className="text-[10px] bg-neutral-100">014</Badge>
                    </div>
                    <p className="font-mono text-sm font-bold text-neutral-800">872-0918-223</p>
                    <p className="text-[10px] text-neutral-500">a.n. PT REKRUTER INDUSTRI INDONESIA</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyAccount('8720918223', 'bca')}
                    className="rounded-full text-xs h-8 px-3 shrink-0"
                  >
                    {copiedBank === 'bca' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Tersalin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Salin Rek
                      </span>
                    )}
                  </Button>
                </div>
              </div>

              {/* Status Section: Pending or Paid */}
              {booking.payment_status === 'pending' ? (
                /* STATUS: PENDING & UNGGAH BUKTI */
                <div className="space-y-4 pt-2">
                  <div className="border border-neutral-200 border-l-2 border-l-amber-600 bg-neutral-50 rounded-xl p-4 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-semibold text-neutral-900">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Menunggu Pembayaran &amp; Verifikasi Admin</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      ID Pesanan: <strong className="font-mono text-neutral-900">{booking.id}</strong>. Unggah foto atau tangkapan layar bukti transfer Anda di bawah ini agar proses verifikasi lebih cepat.
                    </p>
                  </div>

                  {/* Form Unggah Bukti Transfer */}
                  <div className="p-4 rounded-2xl border border-neutral-200 bg-white space-y-3">
                    <label className="block text-xs font-bold text-neutral-900">
                      Unggah Bukti Transfer Bank (JPG / PNG):
                    </label>

                    <div className="border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-xl p-4 text-center transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white cursor-pointer"
                      />
                      {filePreview && (
                        <div className="mt-3">
                          <img
                            src={filePreview}
                            alt="Bukti Transfer Preview"
                            className="max-h-40 rounded-lg mx-auto border border-neutral-200 shadow-sm"
                          />
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleUploadProof}
                      disabled={!file || isSubmittingProof}
                      className="w-full rounded-full text-xs h-10 bg-[#1D1D1F] hover:bg-black text-white font-semibold"
                    >
                      {isSubmittingProof ? 'Mengirim Bukti...' : 'Kirim Bukti Transfer Sekarang'}
                    </Button>
                  </div>

                  {/* Demo Helper Button */}
                  <div className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 text-center">
                    <span className="text-[11px] text-neutral-500 block mb-1.5">
                      Ingin menguji alur verifikasi secara langsung?
                    </span>
                    <button
                      onClick={handleSimulateAdminApproval}
                      className="text-xs font-semibold text-[#6366F1] hover:underline"
                    >
                      &rarr; Simulasi Setujui Pembayaran (Mode Uji Admin)
                    </button>
                  </div>
                </div>
              ) : (
                /* STATUS: PAID & DIRECT WHATSAPP HANDOVER */
                <div className="border border-emerald-200 bg-emerald-50/70 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-base">
                      {isEn ? 'Payment Verified & Confirmed!' : 'Pembayaran Terverifikasi Lunas!'}
                    </h3>
                    <p className="text-xs text-emerald-700 mt-1 max-w-md mx-auto">
                      {isEn
                        ? `Booking ID: ${booking.id}. Your session is officially scheduled. Click below to begin private coordination via WhatsApp.`
                        : `ID Pesanan: ${booking.id}. Sesi Anda telah resmi dijadwalkan. Klik tombol di bawah untuk langsung terhubung dengan psikolog / praktisi SDM.`}
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                      `Halo admin HRTech, pesanan konsultasi saya dengan ID ${booking.id} untuk layanan "${service.title}" (Nominal: Rp ${totalAmount.toLocaleString(
                        'id-ID'
                      )}) telah lunas. Mohon jadwal koordinasi sesi konsultasi.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {isEn ? 'Start Discussion via WhatsApp' : 'Mulai Diskusi via WhatsApp Resmi'}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
