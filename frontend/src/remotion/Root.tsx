import React from 'react';
import { Composition, Still } from 'remotion';
import {
  FullVideoOverviewComposition,
  SingleSlideComposition,
} from './ShowcaseCompositions';
import { SHOWCASE_SLIDES } from './showcase-data';

export const RemotionRoot: React.FC = () => {
  const totalFrames = SHOWCASE_SLIDES.length * 120; // 11 scenes * 120 frames = 1320 frames (44s @ 30fps)

  return (
    <>
      {/* 1. Instagram Feed / Sales Video Overview (4:5 Portrait - 1080x1350) */}
      <Composition
        id="VideoOverview-Instagram-4x5"
        component={FullVideoOverviewComposition}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1350}
        defaultProps={{}}
      />

      {/* 2. Instagram Reels / Story Video Overview (9:16 Vertical - 1080x1920) */}
      <Composition
        id="VideoOverview-Reels-9x16"
        component={FullVideoOverviewComposition}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />

      {/* 3. Instagram Square Video Overview (1:1 Square - 1080x1080) */}
      <Composition
        id="VideoOverview-Square-1x1"
        component={FullVideoOverviewComposition}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{}}
      />

      {/* 4. All 11 Instagram 4:5 Portrait Carousel Stills (1080x1350) */}
      {SHOWCASE_SLIDES.map((slide, idx) => (
        <Still
          key={`4x5-${slide.id}`}
          id={`IG-4x5-${slide.id}`}
          component={SingleSlideComposition}
          width={1080}
          height={1350}
          defaultProps={{
            slideIndex: idx,
            stillMode: true,
          }}
        />
      ))}

      {/* 5. Instagram 1:1 Square Stills (1080x1080) */}
      {SHOWCASE_SLIDES.map((slide, idx) => (
        <Still
          key={`1x1-${slide.id}`}
          id={`IG-1x1-${slide.id}`}
          component={SingleSlideComposition}
          width={1080}
          height={1080}
          defaultProps={{
            slideIndex: idx,
            stillMode: true,
          }}
        />
      ))}

      {/* 6. Instagram 9:16 Story / Reels Cover Stills (1080x1920) */}
      {SHOWCASE_SLIDES.map((slide, idx) => (
        <Still
          key={`9x16-${slide.id}`}
          id={`IG-9x16-${slide.id}`}
          component={SingleSlideComposition}
          width={1080}
          height={1920}
          defaultProps={{
            slideIndex: idx,
            stillMode: true,
          }}
        />
      ))}
    </>
  );
};
