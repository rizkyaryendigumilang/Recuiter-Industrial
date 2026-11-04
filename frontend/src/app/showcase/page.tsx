'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { PlayerRef } from '@remotion/player';
import {
  SHOWCASE_SLIDES,
  INSTAGRAM_CAPTION_COPY,
  type ShowcaseSlideData,
} from '@/remotion/showcase-data';
import {
  FullVideoOverviewComposition,
  IPhoneNotchFrame,
  WebBrowserFrame,
} from '@/remotion/ShowcaseCompositions';
import { Button } from '@/components/ui/button';
import {
  Play,
  Download,
  Copy,
  Check,
  Smartphone,
  Monitor,
  ZoomIn,
  ZoomOut,
  Film,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

// Dynamically import @remotion/player on client only
const RemotionPlayer = dynamic(
  () => import('@remotion/player').then((mod) => mod.Player),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-lg bg-[#141417] border border-[#27272A] flex items-center justify-center text-xs text-zinc-400">
        Memuat Remotion Video Engine...
      </div>
    ),
  }
);

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';

export default function RemotionShowcasePage() {
  const playerRef = useRef<PlayerRef>(null);

  const [slides, setSlides] = useState<ShowcaseSlideData[]>(SHOWCASE_SLIDES);
  const [aspectRatio, setAspectRatio] = useState<'4x5' | '9x16' | '1x1'>('4x5');
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isWebZoomed, setIsWebZoomed] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [customCaption, setCustomCaption] = useState<string>(INSTAGRAM_CAPTION_COPY);

  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedSlideId, setCopiedSlideId] = useState<string | null>(null);
  const [copiedSingleCaptionId, setCopiedSingleCaptionId] = useState<string | null>(null);

  const safeIndex = Math.min(activeSlideIndex, Math.max(0, slides.length - 1));
  const activeSlide = slides[safeIndex] || SHOWCASE_SLIDES[0];

  const playerDimensions =
    aspectRatio === '9x16'
      ? { width: 1080, height: 1920, maxW: 'max-w-[380px]' }
      : aspectRatio === '1x1'
      ? { width: 1080, height: 1080, maxW: 'max-w-[540px]' }
      : { width: 1080, height: 1350, maxW: 'max-w-[480px]' };

  const handleJumpToScene = (index: number) => {
    setActiveSlideIndex(index);
    if (playerRef.current) {
      playerRef.current.seekTo(index * 120 + 36);
    }
  };

  const handleUpdateActiveSlide = (patch: Partial<ShowcaseSlideData>) => {
    setSlides((prev) =>
      prev.map((item, idx) => (idx === safeIndex ? { ...item, ...patch } : item))
    );
  };

  const handleUpdateBullet = (bulletIdx: number, value: string) => {
    const nextBullets = [...activeSlide.technicalBullets];
    nextBullets[bulletIdx] = value;
    handleUpdateActiveSlide({ technicalBullets: nextBullets });
  };

  const handleUpdateMetric = (
    metricIdx: number,
    field: 'value' | 'label',
    val: string
  ) => {
    const nextMetrics = activeSlide.metrics.map((m, i) =>
      i === metricIdx ? { ...m, [field]: val } : m
    );
    handleUpdateActiveSlide({ metrics: nextMetrics });
  };

  const handleRemoveSlide = (idxToRemove: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, idx) => idx !== idxToRemove);
    setSlides(next);
    if (safeIndex >= next.length) {
      setActiveSlideIndex(Math.max(0, next.length - 1));
    }
  };

  const handleDuplicateOrAddSlide = () => {
    const num = String(slides.length).padStart(2, '0');
    const newSlide: ShowcaseSlideData = {
      ...activeSlide,
      id: `custom-${Date.now()}`,
      stepNumber: num,
      tabLabel: `Slide Tambahan ${num}`,
      headline: `${activeSlide.headline}`,
    };
    const next = [...slides];
    next.splice(safeIndex + 1, 0, newSlide);
    setSlides(next);
    setActiveSlideIndex(safeIndex + 1);
  };

  const handleMoveSlide = (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    const temp = next[idx];
    next[idx] = next[target];
    next[target] = temp;
    setSlides(next);
    setActiveSlideIndex(target);
  };

  const handleResetSlides = () => {
    setSlides(SHOWCASE_SLIDES);
    setCustomCaption(INSTAGRAM_CAPTION_COPY);
    setActiveSlideIndex(0);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(customCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  const handleCopySlideCopy = (slide: ShowcaseSlideData) => {
    const text = `${slide.tabLabel}\n${slide.headline} ${slide.highlightWord}\n\n${slide.subheadline}\n\nPenjelasan Lengkap:\n${slide.elaboratedDescription}\n\nCara Pakai:\n${slide.workflowSteps
      .map((s, i) => `${i + 1}. ${s}`)
      .join('\n')}\n\nKeunggulan Utama:\n${slide.technicalBullets
      .map((b) => `• ${b}`)
      .join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedSlideId(slide.id);
    setTimeout(() => setCopiedSlideId(null), 2000);
  };

  const handleCopySingleSlideCaption = (slide: ShowcaseSlideData) => {
    navigator.clipboard.writeText(slide.slideCaption);
    setCopiedSingleCaptionId(slide.id);
    setTimeout(() => setCopiedSingleCaptionId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#FAFAFA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Halaman Utama</span>
              </Link>
              <span className="text-zinc-700">•</span>
              <span className="text-xs text-zinc-400 font-medium">
                Remotion Studio &amp; Concat Video Editor Kit
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Paket Video &amp; Gambar Promosi Siap Posting Instagram
            </h1>
            <p className="text-sm text-zinc-300 mt-2 max-w-3xl leading-relaxed">
              Menampilkan seluruh 10 tab aplikasi dengan gerakan kamera Zoom-In dan Zoom-Out pada tampilan Web, bingkai iPhone berponi (Notch) untuk tampilan HP, serta bahasa penjelasan yang lugas dan mudah dimengerti. Anda juga bisa mengedit teks atau menambah dan mengurangi slide secara manual di halaman ini maupun di aplikasi Concat Desktop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className="rounded-lg text-xs font-semibold h-10 px-4 gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>{isEditMode ? 'Tutup Editor Manual' : 'Edit Teks & Slide Manual'}</span>
            </Button>

            <a
              href={`${BASE_PATH}/showcase/videos/recruiter-industrial-overview-4x5.mp4`}
              download="recruiter-industrial-instagram-4x5.mp4"
            >
              <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold h-10 px-4 gap-2 cursor-pointer">
                <Download className="w-4 h-4" />
                <span>Unduh Video IG Feed 4:5 (.MP4)</span>
              </Button>
            </a>
            <a
              href={`${BASE_PATH}/showcase/videos/recruiter-industrial-reels-9x16.mp4`}
              download="recruiter-industrial-reels-9x16.mp4"
            >
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 rounded-lg text-xs font-semibold h-10 px-4 gap-2 cursor-pointer"
              >
                <Film className="w-4 h-4" />
                <span>Unduh Video IG Reels 9:16 (.MP4)</span>
              </Button>
            </a>
          </div>
        </div>

        {/* CONCAT DESKTOP EDITOR BANNER */}
        <section className="bg-[#121215] border border-zinc-800 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
              <Scissors className="w-4 h-4" />
              <span>Terintegrasi dengan Aplikasi Concat Video Editor Lokal</span>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Edit Durasi, Judul, atau Tambah &amp; Kurangi Klip di Aplikasi Concat
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed max-w-4xl">
              Kami telah menyiapkan 2 folder proyek asli Concat beserta 11 klip video terpisah per tab (masing-masing 4 detik), track teks judul yang bisa diklik dan diedit langsung di dalam Concat, serta efek transisi antar-scene. Proyek ini dapat langsung dibuka di aplikasi{' '}
              <code className="font-mono text-xs text-zinc-200">C:\Program Files\Concat\concat.exe</code>.
            </p>
            <div className="pt-1 flex flex-wrap gap-2 text-xs text-zinc-300">
              <code className="font-mono px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">
                frontend/public/showcase/concat-projects/Recruiter-Industrial-Instagram-4x5
              </code>
              <code className="font-mono px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800">
                frontend/public/showcase/concat-projects/Recruiter-Industrial-Reels-9x16
              </code>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setIsEditMode(true)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold h-9 px-4 gap-2 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Buka Panel Edit Manual di Web</span>
            </Button>
          </div>
        </section>

        {/* OPTIONAL MANUAL EDITOR PANEL */}
        {isEditMode && (
          <section className="bg-[#121215] border border-zinc-700 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Kustomisasi Teks, Urutan, Penambahan, &amp; Pengurangan Slide ({activeSlide.tabLabel})
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Setiap perubahan di bawah langsung memperbarui tampilan Live Video Player secara instan.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleDuplicateOrAddSlide}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah / Duplikat Slide Ini</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={slides.length <= 1}
                  onClick={() => handleRemoveSlide(safeIndex)}
                  className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Slide Ini</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResetSlides}
                  className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-lg text-xs font-semibold h-9 px-3 gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset ke Awal (11 Slide)</span>
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Editor Column: Headline, Highlight, Subheadline */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Label Tab / Nama Scene
                    </label>
                    <input
                      type="text"
                      value={activeSlide.tabLabel}
                      onChange={(e) => handleUpdateActiveSlide({ tabLabel: e.target.value })}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Kategori Fitur
                    </label>
                    <input
                      type="text"
                      value={activeSlide.kicker}
                      onChange={(e) => handleUpdateActiveSlide({ kicker: e.target.value })}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Judul Utama (Headline)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.headline}
                      onChange={(e) => handleUpdateActiveSlide({ headline: e.target.value })}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">
                      Kata Penutup Judul
                    </label>
                    <input
                      type="text"
                      value={activeSlide.highlightWord}
                      onChange={(e) => handleUpdateActiveSlide({ highlightWord: e.target.value })}
                      className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Ringkasan Singkat (Subjudul di Video)
                  </label>
                  <textarea
                    rows={2}
                    value={activeSlide.subheadline}
                    onChange={(e) => handleUpdateActiveSlide({ subheadline: e.target.value })}
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Label Fokus Kamera Zoom-In Web View
                  </label>
                  <input
                    type="text"
                    value={activeSlide.zoomTarget.focusLabel}
                    onChange={(e) =>
                      handleUpdateActiveSlide({
                        zoomTarget: {
                          ...activeSlide.zoomTarget,
                          focusLabel: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              {/* Right Editor Column: Metrics & 3 Bullets */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    3 Kotak Angka Keunggulan (Metrik)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {activeSlide.metrics.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5"
                      >
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) =>
                            handleUpdateMetric(mIdx, 'value', e.target.value)
                          }
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-2 py-1 text-xs font-bold text-white"
                        />
                        <input
                          type="text"
                          value={m.label}
                          onChange={(e) =>
                            handleUpdateMetric(mIdx, 'label', e.target.value)
                          }
                          className="w-full rounded bg-zinc-950 border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs text-zinc-400">
                    3 Poin Penjelasan Fitur di Bagian Bawah Video
                  </label>
                  {activeSlide.technicalBullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400">
                        {bIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => handleUpdateBullet(bIdx, e.target.value)}
                        className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 1: LIVE REMOTION VIDEO PLAYER + SCENE NAVIGATOR */}
        <section className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Remotion Player */}
          <div className="lg:col-span-6 flex flex-col items-center bg-[#121215] border border-zinc-800 rounded-xl p-6">
            <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm bg-zinc-200" />
                <span className="text-xs font-bold text-zinc-200">
                  Live Remotion Video · {slides.length} Scene ({slides.length * 4} Detik)
                </span>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                {(
                  [
                    { id: '4x5', label: '4:5 Feed (1080×1350)' },
                    { id: '9x16', label: '9:16 Reels (1080×1920)' },
                    { id: '1x1', label: '1:1 Square (1080×1080)' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setAspectRatio(r.id)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      aspectRatio === r.id
                        ? 'bg-[#4F46E5] text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`w-full ${playerDimensions.maxW} mx-auto rounded-lg overflow-hidden`}
            >
              <RemotionPlayer
                ref={playerRef}
                component={FullVideoOverviewComposition}
                inputProps={{
                  slides,
                  imageBaseUrl: `${BASE_PATH}/showcase/raw`,
                }}
                durationInFrames={Math.max(120, slides.length * 120)}
                compositionWidth={playerDimensions.width}
                compositionHeight={playerDimensions.height}
                fps={30}
                style={{
                  width: '100%',
                }}
                controls
                loop
                autoPlay
              />
            </div>

            <p className="text-xs text-zinc-400 mt-3 text-center">
              Total Durasi: {slides.length * 4} Detik ({slides.length * 120} Frame @ 30 FPS) · Klik tab di sebelah kanan untuk melompat ke fitur tertentu
            </p>
          </div>

          {/* Right Column: Interactive Tab / Scene Selector & Elaborated Feature Guide */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Daftar Urutan Slide &amp; Tab Fitur ({safeIndex + 1} dari {slides.length})
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Klik salah satu tab untuk melihat penjelasan lengkap atau ubah urutannya.
                  </p>
                </div>
              </div>

              {/* Scene Buttons with Move Up/Down & Delete controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
                {slides.map((s, idx) => {
                  const isSelected = idx === safeIndex;
                  return (
                    <div
                      key={s.id}
                      className={`px-3 py-2 rounded-lg border transition-colors flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-zinc-800 border-zinc-500 text-white'
                          : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/70 hover:text-white'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleJumpToScene(idx)}
                        className="text-left flex-1 truncate cursor-pointer"
                      >
                        <div className="text-[11px] text-zinc-400">
                          Scene {idx + 1} · <code className="font-mono">{s.routePath}</code>
                        </div>
                        <div className="text-xs font-semibold truncate mt-0.5">
                          {s.tabLabel}
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          title="Geser ke atas"
                          disabled={idx === 0}
                          onClick={() => handleMoveSlide(idx, -1)}
                          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          title="Geser ke bawah"
                          disabled={idx === slides.length - 1}
                          onClick={() => handleMoveSlide(idx, 1)}
                          className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        {slides.length > 1 && (
                          <button
                            type="button"
                            title="Hapus slide ini"
                            onClick={() => handleRemoveSlide(idx)}
                            className="p-1 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Scene Elaborated Explanation Card */}
            <div className="bg-[#121215] border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-zinc-400 font-medium">
                  {activeSlide.tabLabel}
                </span>
                <div className="flex items-center gap-2">
                  <Link href={activeSlide.routePath.replace(/^\/recruiter/, '') || '/'}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-[11px] border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 rounded gap-1 cursor-pointer"
                    >
                      <span>Buka Halaman Asli</span>
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopySlideCopy(activeSlide)}
                    className="h-7 px-2.5 text-[11px] border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 rounded gap-1 cursor-pointer"
                  >
                    {copiedSlideId === activeSlide.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Detail Fitur</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <h3 className="text-2xl font-extrabold tracking-tight text-white leading-snug">
                {activeSlide.headline} {activeSlide.highlightWord}
              </h3>

              <p className="text-sm text-zinc-200 leading-relaxed font-medium">
                {activeSlide.subheadline}
              </p>

              {/* Elaborated Plain-Language Explanation */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4 space-y-1.5">
                <div className="text-xs font-bold text-white">
                  Penjelasan Fitur (Bahasa Mudah Dipahami):
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeSlide.elaboratedDescription}
                </p>
              </div>

              {/* Step-by-Step Active Voice Workflow (Technical Writer Skill) */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-white">
                  Cara Penggunaan Langkah demi Langkah:
                </div>
                {activeSlide.workflowSteps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white">Langkah {i + 1}:</strong> {step}
                    </span>
                  </div>
                ))}
              </div>

              {/* 3 Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {activeSlide.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3"
                  >
                    <div className="text-lg font-extrabold text-white">
                      {m.value}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* 3 Key Highlights */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="text-xs text-zinc-400 font-semibold">
                  3 Keunggulan Utama di Slide Ini:
                </div>
                {activeSlide.technicalBullets.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-zinc-200 leading-relaxed"
                  >
                    <span className="text-xs font-bold text-zinc-400">
                      {i + 1}.
                    </span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Slide-Specific Instagram Caption */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-semibold">
                    Caption Instagram Khusus Slide Ini:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySingleSlideCaption(activeSlide)}
                    className="text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSingleCaptionId === activeSlide.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Caption Slide Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Caption Slide</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {activeSlide.slideCaption}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE DUAL-DEVICE STAGE (WEB ZOOM IN/OUT + iPHONE NOTCH MOBILE VIEW) */}
        <section className="bg-[#121215] border border-zinc-800 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Tampilan Komputer (Zoom-In / Zoom-Out) &amp; Tampilan HP iPhone Notch: {activeSlide.tabLabel}
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Uji efek perbesaran kamera pada titik fitur utama sekaligus pratinjau layar HP iPhone.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsWebZoomed(!isWebZoomed)}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold h-9 px-4 gap-2 cursor-pointer"
              >
                {isWebZoomed ? (
                  <>
                    <ZoomOut className="w-4 h-4" />
                    <span>Kembalikan Ukuran Web (100%)</span>
                  </>
                ) : (
                  <>
                    <ZoomIn className="w-4 h-4" />
                    <span>
                      Perbesar Titik Fokus ({Math.round(activeSlide.zoomTarget.maxScale * 100)}%)
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-center justify-between gap-8 py-4 overflow-x-auto">
            {/* Web Browser Frame */}
            <div className="shrink-0 mx-auto">
              <div className="flex items-center gap-2 mb-2.5 text-xs text-zinc-400">
                <Monitor className="w-4 h-4" />
                <span>
                  Tampilan Web Komputer (1440×900) · Sorotan: {activeSlide.zoomTarget.focusLabel}
                </span>
              </div>
              <div className="transition-transform duration-200 ease-out">
                <WebBrowserFrame
                  src={`${BASE_PATH}/showcase/raw/${activeSlide.webImage}`}
                  routePath={activeSlide.routePath}
                  width={760}
                  height={480}
                  zoomScale={isWebZoomed ? activeSlide.zoomTarget.maxScale : 1}
                  originX={activeSlide.zoomTarget.originX}
                  originY={activeSlide.zoomTarget.originY}
                  focusLabel={activeSlide.zoomTarget.focusLabel}
                  focusOpacity={isWebZoomed ? 1 : 0}
                  accentColor={activeSlide.accentColor}
                />
              </div>
            </div>

            {/* Authentic iPhone Notch Frame */}
            <div className="shrink-0 mx-auto flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2.5 text-xs text-zinc-400">
                <Smartphone className="w-4 h-4" />
                <span>Tampilan HP iPhone Notch (390×844)</span>
              </div>
              <IPhoneNotchFrame
                src={`${BASE_PATH}/showcase/raw/${activeSlide.mobileImage}`}
                width={265}
                height={552}
                scrollYProgress={isWebZoomed ? 0.22 : 0}
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: INSTAGRAM POST & CAROUSEL GALLERY */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                11 Slide Carousel Instagram ({aspectRatio === '4x5' ? '4:5 Portrait · 1080×1350' : aspectRatio === '9x16' ? '9:16 Story/Reels · 1080×1920' : '1:1 Square · 1080×1080'})
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Unduh sebagai gambar PNG siap posting atau unduh klip video MP4 per tab (4 detik) untuk diedit ulang di Concat.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              {(
                [
                  { id: '4x5', label: '4:5 Feed (1080×1350)' },
                  { id: '1x1', label: '1:1 Square (1080×1080)' },
                  { id: '9x16', label: '9:16 Story (1080×1920)' },
                ] as const
              ).map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setAspectRatio(r.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    aspectRatio === r.id
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SHOWCASE_SLIDES.map((slide, idx) => {
              const imgPath = `${BASE_PATH}/showcase/instagram-${aspectRatio}/${slide.id}-${aspectRatio}.png`;
              const clipPath =
                aspectRatio === '9x16'
                  ? `${BASE_PATH}/showcase/clips-9x16/scene-${slide.id}.mp4`
                  : `${BASE_PATH}/showcase/clips-4x5/scene-${slide.id}.mp4`;
              return (
                <div
                  key={slide.id}
                  className="bg-[#121215] border border-zinc-800 rounded-xl flex flex-col justify-between hover:border-zinc-600 transition-colors"
                >
                  <div>
                    <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">
                        Slide {slide.stepNumber} · {slide.tabLabel}
                      </span>
                      <code className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                        {aspectRatio === '4x5'
                          ? '1080×1350'
                          : aspectRatio === '9x16'
                          ? '1080×1920'
                          : '1080×1080'}
                      </code>
                    </div>

                    <div className="bg-zinc-950 p-3 flex items-center justify-center">
                      <img
                        src={imgPath}
                        alt={slide.tabLabel}
                        loading="lazy"
                        className="w-full h-auto rounded border border-zinc-800"
                      />
                    </div>

                    <div className="px-4 py-3 border-t border-zinc-800/60 space-y-1">
                      <div className="text-xs font-bold text-white">
                        {slide.headline} {slide.highlightWord}
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {slide.slideCaption}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleJumpToScene(idx)}
                      className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Lihat di Player</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={clipPath}
                        download={`scene-${slide.id}.mp4`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2.5 rounded border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-[11px] font-semibold gap-1 cursor-pointer"
                        >
                          <Film className="w-3 h-3" />
                          <span>Klip MP4</span>
                        </Button>
                      </a>
                      <a
                        href={imgPath}
                        download={`recruiter-industrial-${slide.id}-${aspectRatio}.png`}
                      >
                        <Button
                          size="sm"
                          className="h-8 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-semibold gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>PNG</span>
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 4: INSTAGRAM CAPTION & TECHNICAL SALES COPYWRITING (EDITABLE) */}
        <section className="bg-[#121215] border border-zinc-800 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Caption Promosi Aplikasi &amp; Penjelasan Fitur Siap Salin
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Anda dapat mengedit isi caption langsung pada kotak di bawah sebelum menyalinnya ke Instagram.
              </p>
            </div>

            <Button
              onClick={handleCopyCaption}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold h-10 px-5 gap-2 cursor-pointer"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Caption Berhasil Disalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Seluruh Caption Instagram</span>
                </>
              )}
            </Button>
          </div>

          <textarea
            rows={26}
            value={customCaption}
            onChange={(e) => setCustomCaption(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-5 text-xs sm:text-sm text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-zinc-600"
          />
        </section>
      </div>
    </div>
  );
}
