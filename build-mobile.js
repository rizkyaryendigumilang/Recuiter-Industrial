const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, 'dist');
const frontendPublic = path.join(rootDir, 'frontend', 'public');

console.log('🚀 [Build-Mobile] Starting mobile web bundle build...');

// 1. Ensure dist folder exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Helper to copy folder recursively
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 3. Copy public assets if available
if (fs.existsSync(frontendPublic)) {
  console.log('📦 [Build-Mobile] Copying assets from frontend/public to dist...');
  copyDirRecursive(frontendPublic, distDir);
}

// 4. Generate dist/index.html tailored for Mobile App (Android APK & iOS IPA)
const indexHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
  <title>Recruiter Industrial</title>
  <link rel="icon" href="./favicon.png" />
  <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
  <link rel="manifest" href="./manifest.json" />
  <meta name="theme-color" content="#4F46E5" />
  <style>
    :root {
      --primary: #4F46E5;
      --primary-hover: #4338CA;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text: #0F172A;
      --muted: #64748B;
      --border: #E2E8F0;
      --safe-top: env(safe-area-inset-top, 0px);
      --safe-bottom: env(safe-area-inset-bottom, 0px);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding-top: var(--safe-top);
      padding-bottom: calc(var(--safe-bottom) + 70px);
      min-height: 100vh;
      overflow-x: hidden;
    }
    header {
      background: #FFFFFF;
      border-bottom: 1px solid var(--border);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand img {
      width: 32px;
      height: 32px;
      border-radius: 8px;
    }
    .brand-title {
      font-size: 17px;
      font-weight: 700;
      color: #1E293B;
      letter-spacing: -0.3px;
    }
    .brand-sub {
      font-size: 11px;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 16px 20px;
    }
    .hero {
      background: linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%);
      color: #FFFFFF;
      border-radius: 18px;
      padding: 24px 20px;
      margin-bottom: 20px;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
    }
    .hero h1 {
      font-size: 21px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 8px;
    }
    .hero p {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .vps-status-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }
    .dot-live {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #10B981;
      border-radius: 50%;
      margin-right: 6px;
      box-shadow: 0 0 8px #10B981;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1E293B;
      margin: 20px 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 16px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
      transition: transform 0.15s ease;
    }
    .card:active {
      transform: scale(0.98);
    }
    .card-tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      background: #EEF2FF;
      padding: 3px 8px;
      border-radius: 6px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #1E293B;
      margin-bottom: 4px;
    }
    .card-desc {
      font-size: 13px;
      color: var(--muted);
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid #F1F5F9;
      padding-top: 10px;
      font-size: 12px;
    }
    .btn-apply {
      background: var(--primary);
      color: #FFFFFF;
      border: none;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      padding: 8px 0 calc(var(--safe-bottom) + 8px);
      z-index: 100;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      font-size: 10px;
      color: var(--muted);
      cursor: pointer;
      font-weight: 500;
      text-decoration: none;
      flex: 1;
    }
    .nav-item.active {
      color: var(--primary);
      font-weight: 700;
    }
    .nav-item svg {
      width: 20px;
      height: 20px;
    }
    .pill-badge {
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <img src="./icons/icon-96x96.png" onerror="this.src='./favicon.png'" alt="Logo" />
      <div>
        <div class="brand-title">Recruiter Industrial</div>
        <div class="brand-sub">AI Recruitment Platform</div>
      </div>
    </div>
    <span class="pill-badge" id="appVersion">v1.0.0 Mobile</span>
  </header>

  <div class="container">
    <div class="hero">
      <h1>Asesmen Pintar & Rekrutmen Industri</h1>
      <p>Platform terintegrasi psikotes Kraepelin, DISC, bedah kompetensi industri, dan pencocokan kandidat presisi.</p>
      <div class="vps-status-card">
        <div><span class="dot-live"></span><strong>Capacitor Native Engine</strong></div>
        <span id="platformName">Android / iOS App</span>
      </div>
    </div>

    <div class="section-title">
      <span>Lowongan Unggulan (Jobs)</span>
      <span class="pill-badge">Terbaru</span>
    </div>

    <div class="card-list" id="jobList">
      <div class="card">
        <span class="card-tag">Engineering</span>
        <h3 class="card-title">Senior Frontend Engineer (React/Next.js)</h3>
        <p class="card-desc">Mengembangkan arsitektur aplikasi web modern dengan standar performa tinggi dan desain presisi.</p>
        <div class="card-footer">
          <span style="color: #64748B;">PT Digital Solusindo</span>
          <button class="btn-apply" onclick="alert('Lamaran berhasil dicatat!')">Lamar Cepat</button>
        </div>
      </div>

      <div class="card">
        <span class="card-tag">People Ops</span>
        <h3 class="card-title">People Operations & HR Generalist</h3>
        <p class="card-desc">Mengelola siklus rekrutmen mandiri UMKM, administrasi ketenagakerjaan, dan evaluasi tim kerja.</p>
        <div class="card-footer">
          <span style="color: #64748B;">CV Prima Logistik</span>
          <button class="btn-apply" onclick="alert('Lamaran berhasil dicatat!')">Lamar Cepat</button>
        </div>
      </div>

      <div class="card">
        <span class="card-tag">Riset & Psikologi</span>
        <h3 class="card-title">Consumer Behavior Research Specialist</h3>
        <p class="card-desc">Melakukan riset psikologi perilaku konsumen untuk optimalisasi produk UMKM dan strategi pasar.</p>
        <div class="card-footer">
          <span style="color: #64748B;">Karya Nusantara Labs</span>
          <button class="btn-apply" onclick="alert('Lamaran berhasil dicatat!')">Lamar Cepat</button>
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>Layanan Psikologi & Klinik Karier</span>
    </div>

    <div class="card-list">
      <div class="card">
        <span class="card-tag">Pilar C: Psikologi Terapan</span>
        <h3 class="card-title">Decision-Making & Life-Path Coaching</h3>
        <p class="card-desc">Pendampingan terarah untuk evaluasi dilema karier krusial dan penetapan target hidup jangka panjang.</p>
        <div class="card-footer">
          <strong style="color: #4F46E5;">Rp 350.000 / sesi</strong>
          <button class="btn-apply" onclick="alert('Booking sesi konsultasi dibuka!')">Booking</button>
        </div>
      </div>
      <div class="card">
        <span class="card-tag">Pilar B: Klinik Karier</span>
        <h3 class="card-title">Corporate Test Simulation (Kraepelin/Pauli)</h3>
        <p class="card-desc">Simulasi dan bedah strategi pengerjaan tes psikotes korporat dan asesmen kecepatan hitung.</p>
        <div class="card-footer">
          <strong style="color: #4F46E5;">Rp 200.000 / modul</strong>
          <button class="btn-apply" onclick="alert('Mulai modul asesmen!')">Mulai Tes</button>
        </div>
      </div>
    </div>
  </div>

  <nav class="bottom-nav">
    <div class="nav-item active">
      <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
      <span>Beranda</span>
    </div>
    <div class="nav-item" onclick="alert('Fitur Lowongan Kerja lengkap')">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
      <span>Lowongan</span>
    </div>
    <div class="nav-item" onclick="alert('Fitur Simulasi Psikotes & Asesmen')">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
      <span>Psikotes</span>
    </div>
    <div class="nav-item" onclick="alert('Fitur Profil Pengguna')">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
      <span>Akun</span>
    </div>
  </nav>

  <script>
    // Detect Capacitor native platform
    if (window.Capacitor) {
      document.getElementById('platformName').innerText = 'Capacitor ' + (window.Capacitor.getPlatform() || 'Native');
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtmlContent, 'utf-8');
console.log('✅ [Build-Mobile] dist/index.html created successfully!');
console.log('🎉 [Build-Mobile] Mobile build completed successfully.');
