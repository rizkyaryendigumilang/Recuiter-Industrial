import Link from 'next/link';
import { AlertTriangle, Home, Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[#F6F8FA]">
      <div className="max-w-md w-full text-center bg-white border border-[#D0D7DE] rounded-xl p-8 shadow-sm">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <span className="inline-block px-2.5 py-1 text-xs font-mono font-semibold tracking-wider text-neutral-600 bg-neutral-100 border border-[#D0D7DE] rounded uppercase mb-3">
          Error 404 &bull; Halaman Tidak Ditemukan
        </span>

        <h1 className="text-2xl font-bold tracking-tight text-[#0D1117] mb-2 font-mono">
          Rute Di Luar Jalur Produksi
        </h1>

        <p className="text-sm text-neutral-600 mb-8 leading-relaxed">
          Halaman atau berkas yang Anda tuju tidak tersedia, telah dipindahkan, atau alamat URL yang dimasukkan kurang tepat.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full bg-[#0D1117] hover:bg-neutral-800 text-white font-medium gap-2">
              <Home className="w-4 h-4" />
              Ke Beranda
            </Button>
          </Link>
          <Link href="/jobs" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-[#D0D7DE] hover:bg-neutral-50 gap-2 text-neutral-700">
              <Briefcase className="w-4 h-4" />
              Lowongan Kerja
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-[#D0D7DE] text-xs text-neutral-400 font-mono">
          HRTech Recruiter Industrial System
        </div>
      </div>
    </div>
  );
}
