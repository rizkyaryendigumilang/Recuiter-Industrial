import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONCAT_EXE = 'C:\\Program Files\\Concat\\concat.exe';
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const CONCAT_PROJECTS_ROOT = path.resolve(PUBLIC_DIR, 'showcase/concat-projects');

const SLIDES_META = [
  {
    id: '00-cover',
    title: '00 · Ringkasan Aplikasi Rekrutmen Pabrik',
    caption: 'Cek CV PDF Otomatis + Tes Koran Kraepelin HP + Rapor Psikogram 1 Halaman',
  },
  {
    id: '01-home',
    title: '01 · Halaman Utama (3 Jalur Akses)',
    caption: 'Pemisahan jelas untuk Pelamar, HRD Pabrik, dan Layanan Biro Psikotes',
  },
  {
    id: '02-jobs',
    title: '02 · Info Lowongan Kawasan Industri',
    caption: 'Filter Karawang, Cikarang, Jababeka, Cikande & 24+ Tag Keahlian Mesin',
  },
  {
    id: '03-services',
    title: '03 · Katalog Paket Psikotes & Konseling',
    caption: 'Jual paket tes massal perusahaan (B2B), audit shift, & bedah CV teknik',
  },
  {
    id: '04-booking',
    title: '04 · Pembayaran Transfer 3 Angka Kode Unik',
    caption: 'Verifikasi otomatis (contoh Rp 250.507) tanpa biaya potongan payment gateway',
  },
  {
    id: '05-kraepelin',
    title: '05 · Tes Hitung Cepat (Kraepelin) 60 FPS di HP',
    caption: 'Tombol angka 1-jempol responsif + kunci layar penuh anti-curang',
  },
  {
    id: '06-candidate',
    title: '06 · Portal Pelamar & Baca CV PDF Otomatis',
    caption: 'Unggah CV PDF, deteksi otomatis PLC Siemens, CNC, ISO 9001, & K3 Umum',
  },
  {
    id: '07-results',
    title: '07 · Rapor Hasil Psikotes (Psikogram) 1 Halaman',
    caption: 'Kecepatan hitung, ketelitian 97%, grafik stamina, & diagram karakter DISC',
  },
  {
    id: '08-employer',
    title: '08 · Dashboard HRD & Papan Seleksi Pelamar',
    caption: 'Geser tahapan seleksi (Kanban), panggil interview via WA, & ekspor Excel',
  },
  {
    id: '09-admin',
    title: '09 · Panel Kendali Admin 6 Modul',
    caption: 'Kelola lowongan, tarif layanan, bank soal, & cek bukti transfer tanpa kode',
  },
  {
    id: '10-help-login',
    title: '10 · Panduan Peserta & Login Demo 1-Klik',
    caption: 'Contoh rumus hitung satuan Kraepelin & tombol coba akun Admin/HRD/Pelamar',
  },
];

class ConcatMcpClient {
  constructor() {
    this.proc = spawn(CONCAT_EXE, ['--mcp', 'headless'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.nextId = 1;
    this.pending = new Map();
    this.buf = '';

    this.proc.stdout.on('data', (chunk) => {
      this.buf += chunk.toString();
      const lines = this.buf.split('\n');
      this.buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id && this.pending.has(msg.id)) {
            const { resolve, reject } = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            if (msg.error) {
              reject(new Error(JSON.stringify(msg.error)));
            } else {
              resolve(msg.result);
            }
          }
        } catch (err) {
          // ignore non-json
        }
      }
    });

    this.proc.stderr.on('data', (chunk) => {
      const s = chunk.toString().trim();
      if (s && !s.includes('INFO')) {
        console.error('[Concat stderr]', s);
      }
    });
  }

  async init() {
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'recruiter-industrial-builder', version: '1.0.0' },
    });
    this.proc.stdin.write(
      JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n'
    );
  }

  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.proc.stdin.write(
        JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'
      );
    });
  }

  async callTool(name, args = {}) {
    const res = await this.request('tools/call', {
      name,
      arguments: args,
    });
    if (res && res.isError) {
      throw new Error(`Concat tool ${name} failed: ${JSON.stringify(res.content)}`);
    }
    const textItem = res?.content?.find((c) => c.type === 'text');
    if (textItem) {
      try {
        return JSON.parse(textItem.text);
      } catch {
        return textItem.text;
      }
    }
    return res;
  }

  close() {
    this.proc.kill();
  }
}

async function buildSingleConcatProject(client, config) {
  const { projectName, width, height, clipsDir, stillsDir, stillSuffix } = config;
  const projectPath = path.join(CONCAT_PROJECTS_ROOT, projectName);

  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
  fs.mkdirSync(CONCAT_PROJECTS_ROOT, { recursive: true });

  console.log(`\n=== Membuat Proyek Concat: ${projectName} (${width}x${height} @ 30fps) ===`);
  await client.callTool('project_create', {
    location: CONCAT_PROJECTS_ROOT,
    name: projectName,
    video: {
      width,
      height,
      rateNum: 30,
      rateDen: 1,
      colorSpace: 'sdr',
    },
  });

  // 1. Import all 11 individual 4-second scene MP4 clips into Media Bin
  const sceneClipMediaIds = [];
  for (const slide of SLIDES_META) {
    const clipFile = path.join(clipsDir, `scene-${slide.id}.mp4`);
    if (fs.existsSync(clipFile)) {
      const imported = await client.callTool('media_import', {
        path: projectPath,
        file: clipFile,
      });
      if (imported?.createdId) {
        sceneClipMediaIds.push(imported.createdId);
      }
    }
  }
  console.log(`- Berhasil mengimpor ${sceneClipMediaIds.length} klip video scene MP4 ke Media Bin.`);

  // 2. Also import all 11 static PNG slides into Media Bin (for optional replacement/addition)
  for (const slide of SLIDES_META) {
    const stillFile = path.join(stillsDir, `${slide.id}-${stillSuffix}.png`);
    if (fs.existsSync(stillFile)) {
      await client.callTool('media_import', {
        path: projectPath,
        file: stillFile,
      });
    }
  }

  // 3. Also import raw Desktop Web & Mobile iPhone screenshots into Media Bin so user can add extra B-roll
  const rawDir = path.resolve(PUBLIC_DIR, 'showcase/raw');
  if (fs.existsSync(rawDir)) {
    const rawFiles = fs.readdirSync(rawDir).filter((f) => f.endsWith('.png'));
    for (const rf of rawFiles) {
      await client.callTool('media_import', {
        path: projectPath,
        file: path.join(rawDir, rf),
      });
    }
    console.log(`- Berhasil mengimpor ${rawFiles.length} tangkapan layar mentah (Web & Mobile) ke Media Bin.`);
  }

  // 4. Add all 11 scene MP4 clips in sequence on Track 1
  if (sceneClipMediaIds.length > 0) {
    await client.callTool('clips_add_sequence', {
      path: projectPath,
      mediaIds: sceneClipMediaIds,
      start: 0,
      ripple: true,
    });
  }

  // Read timeline to get clip IDs and apply smooth transitions + rename each clip clearly
  const timelineAfterClips = await client.callTool('timeline_read', {
    path: projectPath,
  });

  const videoClips = timelineAfterClips.clips || [];
  for (let i = 0; i < videoClips.length; i++) {
    const clip = videoClips[i];
    const meta = SLIDES_META[i] || { title: `Scene ${i}` };
    const patch = {
      name: meta.title,
    };
    if (i > 0) {
      patch.transitionIn = {
        id: 'concat.dissolve',
        duration: 0.35,
      };
    }
    await client.callTool('clip_update', {
      path: projectPath,
      clipId: clip.id,
      patch,
    });
  }
  console.log(`- Berhasil menyusun ${videoClips.length} klip di Track Video beserta transisi Dissolve.`);

  // 5. Add an Editable Caption Track above the video so user can click & edit text in Concat
  const captionsPayload = SLIDES_META.map((slide, idx) => ({
    start: idx * 4 + 0.15,
    end: (idx + 1) * 4 - 0.15,
    text: `${slide.title}\n${slide.caption}`,
  }));

  await client.callTool('captions_add', {
    path: projectPath,
    captions: captionsPayload,
    offsetY: 0.43,
    style: {
      fontFamily: '"Hanken Grotesk"',
      fontSize: 0.022,
      fontWeight: 700,
      color: '#FFFFFF',
      background: '#0A0A0ACC',
      backgroundPaddingX: 0.02,
      backgroundPaddingY: 0.012,
      backgroundRadius: 0.01,
      align: 'center',
      maxWidth: 0.9,
      shadow: true,
    },
  });
  console.log(`- Berhasil menambahkan Track Caption Interaktif (${captionsPayload.length} teks yang bisa diedit manual).`);

  // 6. Save and close project
  await client.callTool('project_save', {
    path: projectPath,
  });
  await client.callTool('project_close', {
    path: projectPath,
    save: true,
  });

  console.log(`✓ Proyek Concat berhasil disimpan di: ${projectPath}`);
  return projectPath;
}

async function main() {
  const client = new ConcatMcpClient();
  try {
    await client.init();

    await buildSingleConcatProject(client, {
      projectName: 'Recruiter-Industrial-Instagram-4x5',
      width: 1080,
      height: 1350,
      clipsDir: path.resolve(PUBLIC_DIR, 'showcase/clips-4x5'),
      stillsDir: path.resolve(PUBLIC_DIR, 'showcase/instagram-4x5'),
      stillSuffix: '4x5',
    });

    await buildSingleConcatProject(client, {
      projectName: 'Recruiter-Industrial-Reels-9x16',
      width: 1080,
      height: 1920,
      clipsDir: path.resolve(PUBLIC_DIR, 'showcase/clips-9x16'),
      stillsDir: path.resolve(PUBLIC_DIR, 'showcase/instagram-9x16'),
      stillSuffix: '9x16',
    });

    console.log('\nSEMUA PROYEK CONCAT SIAP DIEDIT MANUAL!');
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error('Error building Concat projects:', err);
  process.exit(1);
});
