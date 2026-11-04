import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:3045/recruiter';
const OUT_DIR = path.resolve(__dirname, '../public/showcase/raw');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function seedDemoState(page, role = 'candidate') {
  await page.evaluate((r) => {
    const demoUser = {
      id: `demo-${r}-01`,
      name: r === 'admin' ? 'Admin HRTech' : r === 'employer' ? 'HRD PT Astra Otoparts' : 'Budi Santoso, S.T.',
      email: r === 'admin' ? 'admin@hrtech.id' : r === 'employer' ? 'hrd@astra-otoparts.co.id' : 'budi.santoso@industrial.id',
      role: r,
      created: '2026-10-14T08:00:00.000Z',
      updated: '2026-10-14T08:00:00.000Z',
    };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    localStorage.setItem('demo_role', r);
    if (r === 'admin') {
      localStorage.setItem('admin_auth', 'true');
    } else {
      localStorage.removeItem('admin_auth');
    }

    localStorage.setItem(
      'candidate_competencies',
      JSON.stringify({
        detectedSkills: [
          'PLC Siemens S7-1200',
          'CNC Milling 3-Axis',
          'Ahli K3 Umum Kemnaker',
          'ISO 9001:2015',
          '7 QC Tools & Kaizen',
          'SIO Forklift Kelas II',
          'Hidrolik & Pneumatik',
          'AutoCAD & Mastercam',
        ],
        certifications: ['Ahli K3 Umum Kemnaker RI', 'SIO Forklift Kelas II', 'ISO 9001:2015 Internal Auditor'],
        machineryTools: ['PLC Siemens S7-1200', 'CNC Milling 3-Axis', 'Vernier Caliper & Micrometer 0.01mm'],
        experienceYears: 4,
        matchScore: 94,
        recommendedRoles: ['Teknisi Maintenance & Otomasi PLC', 'Supervisor QA/QC & Ahli K3 Umum'],
      })
    );
    localStorage.setItem(
      'candidate_skills',
      JSON.stringify([
        'PLC Siemens S7-1200',
        'CNC Milling 3-Axis',
        'Ahli K3 Umum Kemnaker',
        'ISO 9001:2015',
        '7 QC Tools & Kaizen',
        'SIO Forklift Kelas II',
        'Hidrolik & Pneumatik',
        'AutoCAD & Mastercam',
      ])
    );

    localStorage.setItem(
      'sample_applications',
      JSON.stringify([
        {
          id: 'app-01',
          status: 'interview',
          match_score: 94,
          test_score: 88,
          created: '2026-10-14T08:00:00.000Z',
          expand: {
            job_id: {
              title: 'Teknisi Maintenance & Otomasi PLC (Siemens / Omron)',
            },
          },
        },
        {
          id: 'app-02',
          status: 'testing',
          match_score: 91,
          test_score: 85,
          created: '2026-10-13T08:00:00.000Z',
          expand: {
            job_id: {
              title: 'Supervisor QA/QC & Ahli K3 Umum Kemnaker',
            },
          },
        },
      ])
    );

    localStorage.setItem(
      'candidate_latest_kraepelin',
      JSON.stringify({
        panker: 54,
        tianker: 97,
        hankerTrend: 'Tinggi & Stabil (Ascending)',
        stanker: 93,
        curve: [42, 46, 50, 53, 56, 55, 57, 56],
        testCode: 'PSI-IND-2026-0891',
        testDate: '04 November 2026',
      })
    );
  }, role);
}

const TABS = [
  {
    id: '01-home',
    name: 'Beranda & Metrik Industri',
    path: '/',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(800);
    },
  },
  {
    id: '02-jobs',
    name: 'Portal Lowongan Manufaktur',
    path: '/jobs',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(800);
    },
  },
  {
    id: '03-services',
    name: 'Katalog Layanan 3 Pilar',
    path: '/services',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(800);
    },
  },
  {
    id: '04-booking',
    name: 'Checkout & Kode Unik 3 Digit',
    path: '/booking/srv-02',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(600);
      const btn = page.locator('button', { hasText: /Konfirmasi Pemesanan|Confirm Booking|Kode Unik/i }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(700);
      }
    },
  },
  {
    id: '05-kraepelin',
    name: 'Simulasi Tes Kraepelin Active',
    path: '/candidate/practice',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(600);
      // Start the Kraepelin simulation so the active working board & keypad are visible!
      const startBtn = page.locator('button', { hasText: /Mulai Simulasi|Start Simulation/i }).first();
      if (await startBtn.isVisible().catch(() => false)) {
        await startBtn.click().catch(() => {});
        await page.waitForTimeout(700);
      }
    },
  },
  {
    id: '06-candidate',
    name: 'Portal Kandidat & OCR Parser',
    path: '/candidate',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(900);
    },
  },
  {
    id: '07-results',
    name: 'Psikogram Resmi & Radar DISC',
    path: '/candidate/results',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(900);
    },
  },
  {
    id: '08-employer',
    name: 'Dashboard ATS Kanban Perusahaan',
    path: '/employer',
    role: 'employer',
    action: async (page) => {
      await page.waitForTimeout(1000);
    },
  },
  {
    id: '09-admin',
    name: 'Admin Console & Verifikasi',
    path: '/admin',
    role: 'admin',
    action: async (page) => {
      await page.waitForTimeout(800);
      const tabBtn = page.locator('button, [role="tab"]', { hasText: /Kalender Interview|Schedules/i }).first();
      if (await tabBtn.isVisible().catch(() => false)) {
        await tabBtn.click().catch(() => {});
        await page.waitForTimeout(600);
      }
    },
  },
  {
    id: '10-help',
    name: 'Pusat Panduan Kraepelin & DISC',
    path: '/help',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(800);
    },
  },
  {
    id: '11-login',
    name: 'Autentikasi Multi-Role & OAuth2',
    path: '/login',
    role: 'candidate',
    action: async (page) => {
      await page.waitForTimeout(800);
    },
  },
];

async function run() {
  console.log('Waiting for Next.js server at', BASE_URL);
  await waitForServer(BASE_URL);

  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });

  // 1. Capture Web View (1440 x 900 @ 2x)
  const webContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const webPage = await webContext.newPage();
  await webPage.goto(BASE_URL, { waitUntil: 'networkidle' });

  for (const tab of TABS) {
    const targetUrl = tab.path === '/' ? BASE_URL : `${BASE_URL}${tab.path}`;
    console.log(`[WEB] Capturing ${tab.id} (${targetUrl})...`);
    await seedDemoState(webPage, tab.role);
    await webPage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await tab.action(webPage);
    // Hide any floating Next.js dev indicator
    await webPage.addStyleTag({
      content: `
        nextjs-portal, #__next-build-watcher, [data-nextjs-toast], [data-nextjs-dialog-overlay] {
          display: none !important;
        }
      `,
    });
    const outPath = path.join(OUT_DIR, `${tab.id}-web.png`);
    await webPage.screenshot({ path: outPath, fullPage: false });
  }

  // 2. Capture Mobile View (390 x 844 iPhone 15/16 Pro viewport @ 2x)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

  for (const tab of TABS) {
    const targetUrl = tab.path === '/' ? BASE_URL : `${BASE_URL}${tab.path}`;
    console.log(`[MOBILE] Capturing ${tab.id} (${targetUrl})...`);
    await seedDemoState(mobilePage, tab.role);
    await mobilePage.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await tab.action(mobilePage);
    await mobilePage.addStyleTag({
      content: `
        nextjs-portal, #__next-build-watcher, [data-nextjs-toast], [data-nextjs-dialog-overlay] {
          display: none !important;
        }
      `,
    });
    const outPath = path.join(OUT_DIR, `${tab.id}-mobile.png`);
    await mobilePage.screenshot({ path: outPath, fullPage: false });
  }

  await browser.close();
  console.log('All Web & Mobile screenshots captured successfully in:', OUT_DIR);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
