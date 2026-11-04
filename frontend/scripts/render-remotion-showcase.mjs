import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderStill, renderMedia, selectComposition } from '@remotion/renderer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BROWSER_EXECUTABLE = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ENTRY_POINT = path.resolve(__dirname, '../src/remotion/index.ts');
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const OUT_4X5 = path.resolve(PUBLIC_DIR, 'showcase/instagram-4x5');
const OUT_1X1 = path.resolve(PUBLIC_DIR, 'showcase/instagram-1x1');
const OUT_9X16 = path.resolve(PUBLIC_DIR, 'showcase/instagram-9x16');
const OUT_VIDEOS = path.resolve(PUBLIC_DIR, 'showcase/videos');
const OUT_CLIPS_4X5 = path.resolve(PUBLIC_DIR, 'showcase/clips-4x5');
const OUT_CLIPS_9X16 = path.resolve(PUBLIC_DIR, 'showcase/clips-9x16');

fs.mkdirSync(OUT_4X5, { recursive: true });
fs.mkdirSync(OUT_1X1, { recursive: true });
fs.mkdirSync(OUT_9X16, { recursive: true });
fs.mkdirSync(OUT_VIDEOS, { recursive: true });
fs.mkdirSync(OUT_CLIPS_4X5, { recursive: true });
fs.mkdirSync(OUT_CLIPS_9X16, { recursive: true });

const SLIDE_IDS = [
  '00-cover',
  '01-home',
  '02-jobs',
  '03-services',
  '04-booking',
  '05-kraepelin',
  '06-candidate',
  '07-results',
  '08-employer',
  '09-admin',
  '10-help-login',
];

function sliceIntoSceneClips(sourceMp4, outDir) {
  for (let i = 0; i < SLIDE_IDS.length; i++) {
    const slideId = SLIDE_IDS[i];
    const startSec = i * 4;
    const clipOut = path.join(outDir, `scene-${slideId}.mp4`);
    console.log(`[Scene Clip] Slicing ${slideId} (${startSec}s -> ${startSec + 4}s) -> ${clipOut}`);
    execSync(
      `npx remotion ffmpeg -y -ss ${startSec} -t 4 -i "${sourceMp4}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p "${clipOut}"`,
      { stdio: 'ignore' }
    );
  }
}

async function main() {
  console.log('1. Bundling Remotion project from:', ENTRY_POINT);
  const bundleLocation = await bundle({
    entryPoint: ENTRY_POINT,
    publicDir: PUBLIC_DIR,
  });
  console.log('Bundle ready at:', bundleLocation);

  // 2. Render all 11 Instagram 4:5 Portrait Carousel Stills (1080x1350)
  for (const id of SLIDE_IDS) {
    const compId = `IG-4x5-${id}`;
    const outputLocation = path.join(OUT_4X5, `${id}-4x5.png`);
    console.log(`[4:5 Still] Rendering ${compId} -> ${outputLocation}`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compId,
      browserExecutable: BROWSER_EXECUTABLE,
    });
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputLocation,
      imageFormat: 'png',
      browserExecutable: BROWSER_EXECUTABLE,
    });
  }

  // 3. Render Instagram 1:1 Square Stills (1080x1080) for all 11 slides
  for (const id of SLIDE_IDS) {
    const compId = `IG-1x1-${id}`;
    const outputLocation = path.join(OUT_1X1, `${id}-1x1.png`);
    console.log(`[1:1 Still] Rendering ${compId} -> ${outputLocation}`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compId,
      browserExecutable: BROWSER_EXECUTABLE,
    });
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputLocation,
      imageFormat: 'png',
      browserExecutable: BROWSER_EXECUTABLE,
    });
  }

  // 4. Render Instagram 9:16 Story / Reels Stills (1080x1920) for all 11 slides
  for (const id of SLIDE_IDS) {
    const compId = `IG-9x16-${id}`;
    const outputLocation = path.join(OUT_9X16, `${id}-9x16.png`);
    console.log(`[9:16 Still] Rendering ${compId} -> ${outputLocation}`);
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: compId,
      browserExecutable: BROWSER_EXECUTABLE,
    });
    await renderStill({
      composition,
      serveUrl: bundleLocation,
      output: outputLocation,
      imageFormat: 'png',
      browserExecutable: BROWSER_EXECUTABLE,
    });
  }

  // 5. Render Full Video Overview MP4 (Instagram 4:5 Portrait - 1080x1350)
  const video4x5Out = path.join(OUT_VIDEOS, 'recruiter-industrial-overview-4x5.mp4');
  console.log(`[Video MP4 4:5] Rendering VideoOverview-Instagram-4x5 -> ${video4x5Out}`);
  const compVideo4x5 = await selectComposition({
    serveUrl: bundleLocation,
    id: 'VideoOverview-Instagram-4x5',
    browserExecutable: BROWSER_EXECUTABLE,
  });
  await renderMedia({
    composition: compVideo4x5,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: video4x5Out,
    browserExecutable: BROWSER_EXECUTABLE,
    concurrency: 4,
  });

  // Slice 4:5 video into 11 individual 4-second clips for Concat
  sliceIntoSceneClips(video4x5Out, OUT_CLIPS_4X5);

  // 6. Render Full Video Overview MP4 (Instagram Reels 9:16 Vertical - 1080x1920)
  const video9x16Out = path.join(OUT_VIDEOS, 'recruiter-industrial-reels-9x16.mp4');
  console.log(`[Video MP4 9:16] Rendering VideoOverview-Reels-9x16 -> ${video9x16Out}`);
  const compVideo9x16 = await selectComposition({
    serveUrl: bundleLocation,
    id: 'VideoOverview-Reels-9x16',
    browserExecutable: BROWSER_EXECUTABLE,
  });
  await renderMedia({
    composition: compVideo9x16,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: video9x16Out,
    browserExecutable: BROWSER_EXECUTABLE,
    concurrency: 4,
  });

  // Slice 9:16 video into 11 individual 4-second clips for Concat
  sliceIntoSceneClips(video9x16Out, OUT_CLIPS_9X16);

  console.log('ALL REMOTION STILLS, VIDEOS, AND SCENE CLIPS RENDERED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Remotion render error:', err);
  process.exit(1);
});
