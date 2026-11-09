'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error secara terstruktur untuk debugging
    console.error('[Application Error Boundary caught error]:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F6F8FA]">
      <div className="max-w-md w-full text-center bg-white border border-[#D0D7DE] rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
          <AlertOctagon className="w-8 h-8" />
        </div>

        <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-red-700 bg-red-50 border border-red-200 rounded uppercase mb-3">
          Sistem Menemui Kendala
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-[#0D1117] mb-2 font-mono">
          Terjadi Gangguan Operasi
        </h1>

        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          Modul aplikasi mengalami interupsi yang tidak terduga. Silakan coba muat ulang komponen ini atau kembali ke menu utama.
        </p>

        {error.digest && (
          <div className="mb-6 px-3 py-2 bg-neutral-50 border border-[#D0D7DE] rounded font-mono text-xs text-neutral-500 break-all text-left">
            Kode Diagnostik: <span className="text-neutral-700 font-semibold">{error.digest}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-[#0D1117] hover:bg-neutral-800 text-white font-medium gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-[#D0D7DE] hover:bg-neutral-50 gap-2 text-neutral-700">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#D0D7DE] text-xs text-neutral-400 font-mono">
          HRTech Failure Recovery Subsystem
        </div>
      </div>
    </div>
  );
}
