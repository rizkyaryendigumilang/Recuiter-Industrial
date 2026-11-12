import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SHOWCASE_SLIDES, ShowcaseSlideData } from './showcase-data';

export interface SlideCompositionProps {
  slide?: ShowcaseSlideData;
  slideIndex?: number;
  stillMode?: boolean;
  hideTextOverlays?: boolean;
  imageBaseUrl?: string;
}

export interface VideoOverviewProps {
  slides?: ShowcaseSlideData[];
  hideTextOverlays?: boolean;
  imageBaseUrl?: string;
}

function getImgSrc(filename: string, imageBaseUrl?: string): string {
  if (imageBaseUrl) {
    return `${imageBaseUrl.replace(/\/$/, '')}/${filename}`;
  }
  return staticFile(`showcase/raw/${filename}`);
}

/**
 * Authentic iPhone 15/16 Pro Frame with Signature Notch, Earpiece Speaker,
 * TrueDepth Camera Lens, iOS Status Bar, Side Titanium Buttons, and Home Indicator.
 */
export const IPhoneNotchFrame: React.FC<{
  src: string;
  width: number;
  height: number;
  scrollYProgress?: number;
  style?: React.CSSProperties;
}> = ({ src, width, height, scrollYProgress = 0, style }) => {
  const bezelRadius = Math.round(width * 0.145);
  const screenRadius = Math.round(width * 0.125);
  const notchWidth = Math.round(width * 0.42);
  const notchHeight = Math.round(width * 0.068);

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: bezelRadius,
        padding: Math.max(6, Math.round(width * 0.028)),
        background: 'linear-gradient(145deg, #52525B 0%, #27272A 35%, #18181B 75%, #3F3F46 100%)',
        boxShadow:
          '0 32px 70px -12px rgba(0, 0, 0, 0.55), 0 12px 28px -8px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Left Titanium Buttons: Action + Volume Up + Volume Down */}
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: Math.round(height * 0.16),
          width: 3,
          height: Math.round(height * 0.045),
          background: '#52525B',
          borderRadius: '3px 0 0 3px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: Math.round(height * 0.23),
          width: 3,
          height: Math.round(height * 0.075),
          background: '#52525B',
          borderRadius: '3px 0 0 3px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -3,
          top: Math.round(height * 0.32),
          width: 3,
          height: Math.round(height * 0.075),
          background: '#52525B',
          borderRadius: '3px 0 0 3px',
        }}
      />
      {/* Right Titanium Power Button */}
      <div
        style={{
          position: 'absolute',
          right: -3,
          top: Math.round(height * 0.25),
          width: 3,
          height: Math.round(height * 0.1),
          background: '#52525B',
          borderRadius: '0 3px 3px 0',
        }}
      />

      {/* Inner Black OLED Bezel */}
      <div
        style={{
          flex: 1,
          background: '#09090B',
          borderRadius: screenRadius,
          padding: Math.max(4, Math.round(width * 0.018)),
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {/* Screen Viewport */}
        <div
          style={{
            flex: 1,
            background: '#FFFFFF',
            borderRadius: Math.max(12, screenRadius - 4),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top iOS Status Bar + Signature iPhone Notch */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: notchHeight + 6,
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: Math.round(width * 0.065),
              paddingRight: Math.round(width * 0.055),
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid rgba(232, 232, 236, 0.7)',
              fontSize: Math.max(9, Math.round(width * 0.034)),
              fontWeight: 700,
              color: '#0A0A0A',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <span style={{ letterSpacing: '-0.02em' }}>9:41</span>

            {/* Signature Sculpted iPhone Notch */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: notchWidth,
                height: notchHeight,
                background: '#09090B',
                borderBottomLeftRadius: Math.round(notchHeight * 0.65),
                borderBottomRightRadius: Math.round(notchHeight * 0.65),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Math.max(6, Math.round(width * 0.025)),
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              }}
            >
              {/* Speaker Grille */}
              <div
                style={{
                  width: Math.round(notchWidth * 0.34),
                  height: Math.max(3, Math.round(notchHeight * 0.16)),
                  borderRadius: 99,
                  background: '#27272A',
                  boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
                }}
              />
              {/* Front TrueDepth Camera Lens */}
              <div
                style={{
                  width: Math.max(6, Math.round(notchHeight * 0.36)),
                  height: Math.max(6, Math.round(notchHeight * 0.36)),
                  borderRadius: '50%',
                  background: '#1E1B4B',
                  border: '1px solid #27272A',
                }}
              />
            </div>

            {/* Right Status Icons: Signal + 5G + Battery */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: Math.max(8, Math.round(width * 0.028)), fontWeight: 700 }}>5G</span>
              <div
                style={{
                  width: Math.max(14, Math.round(width * 0.055)),
                  height: Math.max(7, Math.round(width * 0.028)),
                  borderRadius: 3,
                  border: '1.2px solid #0A0A0A',
                  padding: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: '82%',
                    height: '100%',
                    background: '#10B981',
                    borderRadius: 1.5,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Mobile App Screenshot Content */}
          <div
            style={{
              position: 'absolute',
              top: notchHeight + 4,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
            }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                transform: `translateY(${-scrollYProgress * 12}%)`,
              }}
            />
          </div>

          {/* Subtle Glass Specular Reflection */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 32%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 35,
            }}
          />

          {/* Bottom iOS Home Indicator Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36%',
              height: 4,
              borderRadius: 999,
              background: 'rgba(10, 10, 10, 0.35)',
              zIndex: 40,
            }}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Desktop Web Browser Frame with animated Camera Zoom-In & Zoom-Out + Focal Callout
 */
export const WebBrowserFrame: React.FC<{
  src: string;
  routePath: string;
  width: number;
  height: number;
  zoomScale: number;
  originX: number;
  originY: number;
  focusLabel?: string;
  focusOpacity?: number;
  accentColor?: string;
  style?: React.CSSProperties;
}> = ({
  src,
  routePath,
  width,
  height,
  zoomScale,
  originX,
  originY,
  focusLabel,
  focusOpacity = 0,
  accentColor = '#D97706',
  style,
}) => {
  const headerHeight = Math.max(26, Math.round(height * 0.068));

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 18,
        background: '#18181B',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 28px 65px -15px rgba(0, 0, 0, 0.45), 0 10px 25px -10px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        ...style,
      }}
    >
      {/* Top Browser Chrome Bar */}
      <div
        style={{
          height: headerHeight,
          background: '#1D1D1F',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* macOS Traffic Lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#27C93F' }} />
        </div>

        {/* URL Address Bar */}
        <div
          style={{
            padding: '3px 14px',
            borderRadius: 999,
            background: 'rgba(255, 255, 255, 0.07)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#E4E4E7',
            fontSize: 11,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ color: '#10B981', fontSize: 10 }}>●</span>
          <span>recruiter-industrial.id{routePath}</span>
        </div>

        {/* Live Zoom Badge */}
        <div
          style={{
            fontSize: 10,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontWeight: 600,
            color: '#A1A1AA',
            padding: '2px 8px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          WEB {(zoomScale * 100).toFixed(0)}%
        </div>
      </div>

      {/* Browser Viewport with Smooth Zoom-In & Zoom-Out */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoomScale})`,
            transformOrigin: `${originX}% ${originY}%`,
            willChange: 'transform',
          }}
        >
          <img
            src={src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              display: 'block',
            }}
          />
        </div>

        {/* Floating Zoom Focus Callout Pill */}
        {focusLabel && focusOpacity > 0.02 && (
          <div
            style={{
              position: 'absolute',
              left: 16,
              bottom: 14,
              opacity: focusOpacity,
              transform: `translateY(${(1 - focusOpacity) * 8}px)`,
              background: 'rgba(10, 10, 10, 0.88)',
              backdropFilter: 'blur(10px)',
              color: '#FFFFFF',
              padding: '7px 13px',
              borderRadius: 10,
              border: `1px solid ${accentColor}`,
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
              maxWidth: '72%',
              zIndex: 25,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: accentColor,
                flexShrink: 0,
              }}
            />
            <span>{focusLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Single Scene / Slide Renderer supporting 3 Instagram Aspect Ratios:
 * - 4:5 Portrait Feed (1080 x 1350)
 * - 1:1 Square Feed (1080 x 1080)
 * - 9:16 Vertical Reels/Story (1080 x 1920)
 */
export const ShowcaseSlideScene: React.FC<{
  slide: ShowcaseSlideData;
  stillMode?: boolean;
  hideTextOverlays?: boolean;
  imageBaseUrl?: string;
}> = ({ slide, stillMode = false, hideTextOverlays = false, imageBaseUrl }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isDark = slide.theme === 'dark';
  const bgColor = isDark ? '#0A0A0A' : '#FAFAFA';
  const textPrimary = isDark ? '#FFFFFF' : '#0A0A0A';
  const textSecondary = isDark ? '#A1A1AA' : '#52525B';
  const cardBg = isDark ? '#141417' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#E4E4E7';

  // Aspect ratio detection
  const is9x16 = height / width > 1.5;
  const is1x1 = Math.abs(height / width - 1) < 0.08;

  // In stillMode (for static PNG export), lock at peak frame 48 so everything is crisp and mid-zoom
  const activeFrame = stillMode ? 48 : frame;

  // Entrance animations (spring)
  const headerEnter = spring({
    frame: activeFrame,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.8 },
  });

  const webEnter = spring({
    frame: Math.max(0, activeFrame - 5),
    fps,
    config: { damping: 18, stiffness: 110, mass: 0.9 },
  });

  const mobileEnter = spring({
    frame: Math.max(0, activeFrame - 12),
    fps,
    config: { damping: 16, stiffness: 115, mass: 0.85 },
  });

  // Web View Zoom-In & Zoom-Out camera curve across 120 frames (4 seconds per scene)
  // 0 -> 22: 1.0x
  // 22 -> 52: Zoom-In to maxScale
  // 52 -> 82: Hold at maxScale
  // 82 -> 112: Zoom-Out back to 1.02x
  const zoomScale = stillMode
    ? slide.zoomTarget.maxScale * 0.92
    : interpolate(
        activeFrame,
        [0, 18, 48, 82, 112],
        [1, 1.02, slide.zoomTarget.maxScale, slide.zoomTarget.maxScale, 1.02],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );

  const focusOpacity = stillMode
    ? 1
    : interpolate(activeFrame, [22, 34, 80, 96], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const mobileScrollProgress = stillMode
    ? 0.25
    : interpolate(activeFrame, [15, 95], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  // Scene exit transition (frames 108 -> 120)
  const exitProgress = stillMode
    ? 0
    : interpolate(activeFrame, [108, 120], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  const sceneOpacity = 1 - exitProgress * 0.85;
  const sceneScale = 1 - exitProgress * 0.03;

  // Device sizes responsive to canvas aspect ratio (4:5 vs 1:1 vs 9:16)
  const webWidth = is9x16 ? 880 : is1x1 ? 760 : 840;
  const webHeight = is9x16 ? 560 : is1x1 ? 430 : 515;
  const iphoneWidth = is9x16 ? 310 : is1x1 ? 235 : 275;
  const iphoneHeight = Math.round(iphoneWidth * 2.08);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgColor,
        color: textPrimary,
        fontFamily: '"Noto Sans", Geist, Inter, system-ui, -apple-system, sans-serif',
        padding: is9x16 ? '56px 52px' : is1x1 ? '36px 46px' : '46px 52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        opacity: sceneOpacity,
        transform: `scale(${sceneScale})`,
      }}
    >
      {/* Subtle Swiss Architectural Frame Hairline */}
      <div
        style={{
          position: 'absolute',
          inset: 20,
          border: isDark
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(10,10,10,0.06)',
          borderRadius: 12,
          pointerEvents: 'none',
        }}
      />

      {/* 1. TOP BRAND & TECHNICAL KICKER BAR */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          transform: `translateY(${(1 - headerEnter) * 18}px)`,
          opacity: headerEnter,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: is1x1 ? 12 : 16,
          }}
        >
          {/* Brand Lockup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: isDark ? '#FFFFFF' : '#0A0A0A',
                color: isDark ? '#0A0A0A' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 14,
                letterSpacing: '0.04em',
              }}
            >
              HR
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
                Recruiter<span style={{ color: slide.accentColor }}>Industrial</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: textSecondary,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {slide.kicker}
              </div>
            </div>
          </div>

          {/* Step / Tab Counter Badge */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              color: textPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: slide.accentColor,
              }}
            />
            <span>{slide.tabLabel}</span>
          </div>
        </div>

        {/* Headline & Subheadline (No-AI-Slop + Technical Writer Hierarchy) */}
        {!hideTextOverlays && (
          <>
            <h1
              style={{
                fontSize: is9x16 ? 46 : is1x1 ? 33 : 40,
                fontWeight: 800,
                letterSpacing: '-0.035em',
                lineHeight: 1.08,
                margin: '0 0 10px 0',
                color: textPrimary,
              }}
            >
              {slide.headline}{' '}
              <span style={{ color: slide.accentColor }}>{slide.highlightWord}</span>
            </h1>

            <p
              style={{
                fontSize: is9x16 ? 18.5 : is1x1 ? 14 : 16,
                lineHeight: 1.42,
                color: textSecondary,
                margin: 0,
                maxWidth: '95%',
                fontWeight: 500,
              }}
            >
              {slide.subheadline}
            </p>
          </>
        )}
      </div>

      {/* 2. CENTER STAGE: WEB VIEW (WITH ZOOM IN/OUT) + MOBILE iPHONE NOTCH FRAME */}
      <div
        style={{
          position: 'relative',
          height: is9x16 ? 760 : is1x1 ? 470 : 565,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          zIndex: 15,
          marginTop: is1x1 ? 6 : 10,
          marginBottom: is1x1 ? 6 : 10,
        }}
      >
        {/* Desktop Web Browser Frame (Left / Center Stage) */}
        <div
          style={{
            transform: `translateY(${(1 - webEnter) * 28}px) scale(${0.94 + webEnter * 0.06})`,
            opacity: webEnter,
          }}
        >
          <WebBrowserFrame
            src={getImgSrc(slide.webImage, imageBaseUrl)}
            routePath={slide.routePath}
            width={webWidth}
            height={webHeight}
            zoomScale={zoomScale}
            originX={slide.zoomTarget.originX}
            originY={slide.zoomTarget.originY}
            focusLabel={slide.zoomTarget.focusLabel}
            focusOpacity={focusOpacity}
            accentColor={slide.accentColor}
          />
        </div>

        {/* Mobile iPhone Notch Frame (Overlapping Right Foreground) */}
        <div
          style={{
            position: 'absolute',
            right: is9x16 ? 0 : 4,
            bottom: is9x16 ? 8 : -6,
            transform: `translateY(${(1 - mobileEnter) * 40}px) scale(${0.92 + mobileEnter * 0.08})`,
            opacity: mobileEnter,
            zIndex: 30,
          }}
        >
          {/* Floating iPhone Label */}
          <div
            style={{
              position: 'absolute',
              top: -28,
              right: 12,
              background: slide.accentColor,
              color: '#FFFFFF',
              fontSize: 10.5,
              fontWeight: 700,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              padding: '4px 10px',
              borderRadius: 999,
              letterSpacing: '0.03em',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            iPHONE MOBILE VIEW · PWA/APK
          </div>
          <IPhoneNotchFrame
            src={getImgSrc(slide.mobileImage, imageBaseUrl)}
            width={iphoneWidth}
            height={iphoneHeight}
            scrollYProgress={mobileScrollProgress}
          />
        </div>
      </div>

      {/* 3. BOTTOM TECHNICAL METRICS & SPEC BULLETS */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: is1x1 ? 10 : 14,
          minHeight: hideTextOverlays ? 120 : undefined,
        }}
      >
        {/* 3 Concrete Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
          }}
        >
          {slide.metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                borderRadius: 14,
                padding: is1x1 ? '10px 14px' : '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span
                style={{
                  fontSize: is9x16 ? 26 : is1x1 ? 20 : 23,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: idx === 0 ? slide.accentColor : textPrimary,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
              >
                {m.value}
              </span>
              <span
                style={{
                  fontSize: is9x16 ? 13 : 11.5,
                  fontWeight: 600,
                  color: textSecondary,
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Technical Writer Spec Box */}
        {!hideTextOverlays && (
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 14,
              padding: is1x1 ? '10px 16px' : '14px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: is1x1 ? 5 : 7,
            }}
          >
            {slide.technicalBullets.slice(0, is1x1 ? 2 : 3).map((bullet, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: is9x16 ? 15 : is1x1 ? 12.5 : 13.5,
                  lineHeight: 1.38,
                  color: textPrimary,
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    color: slide.accentColor,
                    fontWeight: 800,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 12,
                    marginTop: 1,
                  }}
                >
                  0{idx + 1}
                </span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/**
 * Single Slide Wrapper for Remotion Still / Individual Slide Preview
 */
export const SingleSlideComposition: React.FC<SlideCompositionProps> = ({
  slide,
  slideIndex = 0,
  stillMode = true,
  hideTextOverlays = false,
  imageBaseUrl,
}) => {
  const activeSlide = slide || SHOWCASE_SLIDES[slideIndex] || SHOWCASE_SLIDES[0];
  return (
    <ShowcaseSlideScene
      slide={activeSlide}
      stillMode={stillMode}
      hideTextOverlays={hideTextOverlays}
      imageBaseUrl={imageBaseUrl}
    />
  );
};

/**
 * Full Multi-Tab Video Overview Composition (11 Scenes x 120 frames = 1320 frames / 44s @ 30fps)
 * Explores every single tab with Web View Zoom-In/Zoom-Out + iPhone Notch Mobile View
 */
export const FullVideoOverviewComposition: React.FC<VideoOverviewProps> = ({
  slides,
  hideTextOverlays = false,
  imageBaseUrl,
}) => {
  const activeSlides = slides && slides.length > 0 ? slides : SHOWCASE_SLIDES;
  const FRAMES_PER_SCENE = 120; // 4 seconds per tab at 30fps
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();

  const progress = Math.min(1, Math.max(0, frame / durationInFrames));

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0A0A' }}>
      {activeSlides.map((slide, index) => (
        <Sequence
          key={slide.id}
          from={index * FRAMES_PER_SCENE}
          durationInFrames={FRAMES_PER_SCENE}
        >
          <ShowcaseSlideScene
            slide={slide}
            stillMode={false}
            hideTextOverlays={hideTextOverlays}
            imageBaseUrl={imageBaseUrl}
          />
        </Sequence>
      ))}

      {/* Top Timeline Progress Indicator Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width * progress,
          height: 5,
          background: '#D97706',
          zIndex: 100,
        }}
      />
    </AbsoluteFill>
  );
};
