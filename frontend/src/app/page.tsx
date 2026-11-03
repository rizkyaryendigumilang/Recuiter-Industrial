import type { Metadata } from 'next';
import { HomeView } from '@/components/home/home-view';

export const metadata: Metadata = {
  title: 'Recruiter Industrial — Platform Rekrutmen Manufaktur & Psikometri Kraepelin HIMPSI',
  description:
    'Ekosistem HR Tech industri manufaktur modern: seleksi operator pabrik, psikotes Kraepelin/Pauli auto-scoring standar HIMPSI, verifikasi sertifikasi K3 Kemnaker, audit ISO 9001, dan evaluasi beban mental shift kerja.',
  keywords: [
    'rekrutmen manufaktur',
    'psikotes kraepelin',
    'tes pauli online',
    'seleksi operator pabrik',
    'sertifikasi k3 kemnaker',
    'sio forklift',
    'teknisi plc siemens',
    'operator cnc milling',
    'himpsi psikometri',
    'hr tech industri',
    'lowongan kerja cikarang karawang',
  ],
  authors: [{ name: 'Recruiter Industrial' }],
  creator: 'Recruiter Industrial Engineering Team',
  publisher: 'Recruiter Industrial',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Recruiter Industrial — Rekrutmen Manufaktur & Psikometri Kraepelin HIMPSI',
    description:
      'Solusi rekrutmen pabrik modern dengan engine psikometri Kraepelin dan verifikasi kompetensi teknis industri secara real-time.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Recruiter Industrial',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recruiter Industrial — Rekrutmen Manufaktur & Psikometri Kraepelin',
    description:
      'Platform rekrutmen manufaktur dan psikometri kerja pabrik modern dengan auto-scoring Kraepelin HIMPSI.',
  },
};

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EmploymentAgency',
    name: 'Recruiter Industrial',
    description:
      'Platform Rekrutmen Manufaktur, Psikotes Kraepelin HIMPSI, dan Sertifikasi K3 Kemnaker.',
    url: 'https://recruiter-industrial.id',
    areaServed: {
      '@type': 'Country',
      name: 'Indonesia',
    },
    knowsAbout: [
      'Rekrutmen Operator Pabrik',
      'Psikotes Kraepelin & Pauli HIMPSI',
      'Sertifikasi Ahli K3 Umum & SIO Forklift Kemnaker',
      'Audit 7 QC Tools & ISO 9001:2015',
      'Evaluasi Ergonomi Shift Kerja',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeView />
    </>
  );
}
