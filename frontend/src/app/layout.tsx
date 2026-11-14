import type { Metadata, Viewport } from "next";
import { Noto_Sans, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/lib/auth-context";
import { LanguageProvider } from "@/lib/language-context";
import { HelpdeskProvider } from "@/components/helpdesk/helpdesk-provider";
import { SiteFooter } from "@/components/site-footer";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { PwaInstallBanner } from "@/components/pwa-install-banner";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Recruiter Industrial — Rekrutmen Pabrik & Tes Kraepelin",
  description: "Platform rekrutmen tenaga kerja pabrik terintegrasi dengan latihan tes ketelitian Kraepelin, kesiapan kerja shift, dan sertifikasi K3 resmi.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Recruiter Industrial",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${notoSans.variable} ${robotoMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-clip selection:bg-amber-100 selection:text-amber-900">
        <LanguageProvider>
          <AuthProvider>
            <HelpdeskProvider>
              <PwaRegistrar />
              <PwaInstallBanner />
              <Navbar />
              <main className="flex-1 pb-16 sm:pb-0">{children}</main>
              <SiteFooter />
              <MobileBottomNav />
            </HelpdeskProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
