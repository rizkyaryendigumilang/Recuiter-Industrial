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
      padding-bottom: calc(var(--safe-bottom) + 75px);
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
      font-size: 16px;
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
      padding: 22px 20px;
      margin-bottom: 20px;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.3);
    }
    .hero h1 {
      font-size: 20px;
      font-weight: 800;
      line-height: 1.3;
      margin-bottom: 6px;
    }
    .hero p {
      font-size: 12px;
      opacity: 0.9;
      line-height: 1.5;
      margin-bottom: 14px;
    }
    .btn-portal-launch {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      width: 100%;
      background: #FFFFFF;
      color: #4F46E5;
      border: none;
      font-size: 13px;
      font-weight: 700;
      padding: 11px 16px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 10px;
    }
    .btn-portal-launch:active {
      transform: scale(0.98);
      background: #F1F5F9;
    }
    .vps-status-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
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
      font-size: 15px;
      font-weight: 700;
      color: #1E293B;
      margin: 18px 0 10px;
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
      margin-bottom: 6px;
    }
    .card-desc {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    .btn-apply:active {
      transform: scale(0.96);
    }
    .pill-badge {
      background: #F1F5F9;
      color: #475569;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 500;
    }
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #FFFFFF;
      border-top: 1px solid var(--border);
      display: flex;
      padding-bottom: var(--safe-bottom);
      z-index: 50;
    }
    .nav-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 9px 0 7px;
      color: #94A3B8;
      font-size: 10px;
      font-weight: 500;
      cursor: pointer;
    }
    .nav-item.active {
      color: var(--primary);
      font-weight: 700;
    }
    .nav-item svg {
      width: 20px;
      height: 20px;
      margin-bottom: 2px;
    }

    /* Modal Sheet for Kraepelin Native Test */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .modal-sheet {
      background: #FFFFFF;
      border-radius: 20px;
      width: 100%;
      max-width: 440px;
      padding: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    .kraepelin-display {
      background: #F8FAFC;
      border: 2px solid #E2E8F0;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 16px 0;
    }
    .digit-pair {
      font-size: 38px;
      font-weight: 800;
      line-height: 1.1;
      color: #1E293B;
      letter-spacing: 2px;
    }
    .digit-divider {
      width: 60px;
      height: 2px;
      background: #CBD5E1;
      margin: 6px auto;
    }
    .keypad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 14px;
    }
    .key-btn {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 14px;
      font-size: 20px;
      font-weight: 700;
      color: #1E293B;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .key-btn:active {
      background: #EEF2FF;
      border-color: #4F46E5;
      transform: scale(0.95);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <img src="./icons/icon-96x96.png" onerror="this.src='./favicon.png'" alt="Logo" />
      <div>
        <div class="brand-title">Recruiter Industrial</div>
        <div class="brand-sub">Native Mobile Shell</div>
      </div>
    </div>
    <span class="pill-badge" id="appVersion">v1.2.0 Hybrid</span>
  </header>

  <div class="container">
    <div class="hero">
      <h1>Asesmen Pintar & Rekrutmen Industri</h1>
      <p>Simulasi Kraepelin, pemetaan kompetensi teknis, dan asesmen psikometri pabrik terstandarisasi HIMPSI.</p>
      
      <button class="btn-portal-launch" onclick="openFullWebPortal()">
        🌐 Buka Portal Web Lengkap (Next.js)
      </button>

      <div class="vps-status-card">
        <div><span class="dot-live"></span><strong>Capacitor Native Engine</strong></div>
        <span id="platformName">Android / iOS Active</span>
      </div>
    </div>

    <div class="section-title">
      <span>Simulasi Asesmen Mandiri</span>
      <span class="pill-badge">Offline Ready</span>
    </div>

    <div class="card-list">
      <div class="card">
        <span class="card-tag">Modul C: Psikometri Kraepelin</span>
        <h3 class="card-title">Tes Kraepelin / Pauli Industri</h3>
        <p class="card-desc">Ukur kecepatan kerja (Panker), akurasi (Tianker), dan stabilitas ritme hitung angka di lantai produksi.</p>
        <div class="card-footer">
          <span style="color: #64748B;">Durasi Cepat: 30 Detik</span>
          <button class="btn-apply" onclick="startOfflineKraepelin()">Mulai Simulasi</button>
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>Lowongan Industri Tersedia</span>
      <span class="pill-badge">5 Posisi</span>
    </div>

    <div class="card-list" id="jobList">
      <div class="card">
        <span class="card-tag">Engineering</span>
        <h3 class="card-title">Teknisi Maintenance & Otomasi PLC</h3>
        <p class="card-desc">Troubleshooting PLC Siemens S7-1200, wiring panel 3-phase, dan perawatan hidrolik mesin stamping.</p>
        <div class="card-footer">
          <span style="color: #64748B;">PT Tri Mitra Industri</span>
          <button class="btn-apply" onclick="openApplySheet('Teknisi Maintenance & Otomasi PLC')">Lamar Cepat</button>
        </div>
      </div>

      <div class="card">
        <span class="card-tag">Quality Assurance</span>
        <h3 class="card-title">QC Inspector Presisi (7 QC Tools)</h3>
        <p class="card-desc">Inspeksi toleransi dimensi dengan micrometer/caliper, verifikasi sertifikat mutu ISO 9001:2015.</p>
        <div class="card-footer">
          <span style="color: #64748B;">PT Indo Presisi Teknik</span>
          <button class="btn-apply" onclick="openApplySheet('QC Inspector Presisi')">Lamar Cepat</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Kraepelin Offline Test Modal -->
  <div class="modal-overlay" id="kraepelinModal">
    <div class="modal-sheet">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:15px; font-weight:700;">Simulasi Kraepelin Native</h3>
        <span class="pill-badge" id="timerBadge" style="background:#EEF2FF; color:#4F46E5; font-weight:700;">30s</span>
      </div>

      <div class="kraepelin-display">
        <div class="digit-pair" id="topDigit">7</div>
        <div class="digit-divider"></div>
        <div class="digit-pair" id="bottomDigit">5</div>
      </div>

      <p style="text-align:center; font-size:11px; color:#64748B; margin-bottom:10px;">
        Jumlahkan kedua angka, ambil <strong>satuan terakhir</strong> (cth: 7+5=12 &rarr; tekan 2).
      </p>

      <div class="keypad-grid">
        <button class="key-btn" onclick="submitAnswer(1)">1</button>
        <button class="key-btn" onclick="submitAnswer(2)">2</button>
        <button class="key-btn" onclick="submitAnswer(3)">3</button>
        <button class="key-btn" onclick="submitAnswer(4)">4</button>
        <button class="key-btn" onclick="submitAnswer(5)">5</button>
        <button class="key-btn" onclick="submitAnswer(6)">6</button>
        <button class="key-btn" onclick="submitAnswer(7)">7</button>
        <button class="key-btn" onclick="submitAnswer(8)">8</button>
        <button class="key-btn" onclick="submitAnswer(9)">9</button>
        <button class="key-btn" style="grid-column: span 3;" onclick="submitAnswer(0)">0</button>
      </div>

      <button style="width:100%; margin-top:14px; background:#F1F5F9; border:none; padding:10px; border-radius:8px; font-size:12px; color:#64748B; cursor:pointer;" onclick="closeModal()">
        Batalkan Tes
      </button>
    </div>
  </div>

  <nav class="bottom-nav">
    <div class="nav-item active" onclick="location.reload()">
      <svg fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
      <span>Beranda</span>
    </div>
    <div class="nav-item" onclick="startOfflineKraepelin()">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
      <span>Kraepelin</span>
    </div>
    <div class="nav-item" onclick="openFullWebPortal()">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
      <span>Web PWA</span>
    </div>
  </nav>

  <script>
    if (window.Capacitor) {
      document.getElementById('platformName').innerText = 'Capacitor ' + (window.Capacitor.getPlatform() || 'Native');
    }

    function openFullWebPortal() {
      // Prioritas: URL VPS / domain terkonfigurasi, atau web fallback
      const targetUrl = window.CAPACITOR_WEB_URL || window.location.origin.replace('http://localhost', 'http://localhost:3000');
      window.location.href = targetUrl;
    }

    function openApplySheet(jobTitle) {
      const name = prompt('Masukkan Nama Lengkap Anda untuk posisi ' + jobTitle + ':');
      if (name) {
        alert('Terima kasih ' + name + '! Lamaran Anda dicatat dan akan diproses.');
      }
    }

    // Kraepelin Native Logic
    let numTop = 5, numBottom = 4, correctCount = 0, totalAttempts = 0, timeLeft = 30, timerInterval = null;

    function triggerHaptic(duration = 20) {
      if (navigator.vibrate) navigator.vibrate(duration);
    }

    function generatePair() {
      numTop = Math.floor(Math.random() * 9) + 1;
      numBottom = Math.floor(Math.random() * 9) + 1;
      document.getElementById('topDigit').innerText = numTop;
      document.getElementById('bottomDigit').innerText = numBottom;
    }

    function startOfflineKraepelin() {
      correctCount = 0;
      totalAttempts = 0;
      timeLeft = 30;
      generatePair();
      document.getElementById('timerBadge').innerText = timeLeft + 's';
      document.getElementById('kraepelinModal').style.display = 'flex';

      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timerBadge').innerText = timeLeft + 's';
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          finishKraepelin();
        }
      }, 1000);
    }

    function submitAnswer(digit) {
      triggerHaptic(15);
      totalAttempts++;
      const expected = (numTop + numBottom) % 10;
      if (digit === expected) {
        correctCount++;
      }
      generatePair();
    }

    function finishKraepelin() {
      triggerHaptic(100);
      document.getElementById('kraepelinModal').style.display = 'none';
      const panker = Math.round((totalAttempts / 30) * 60);
      const tianker = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
      
      const result = { panker, tianker, totalAttempts, completedAt: new Date().toISOString() };
      localStorage.setItem('mobile_kraepelin_result', JSON.stringify(result));

      alert('Tes Selesai!\\n\\nKecepatan (Panker): ' + panker + ' angka/menit\\nKetelitian (Tianker): ' + tianker + '%\\n\\nHasil tes tersimpan aman di perangkat.');
    }

    function closeModal() {
      if (timerInterval) clearInterval(timerInterval);
      document.getElementById('kraepelinModal').style.display = 'none';
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(distDir, 'index.html'), indexHtmlContent, 'utf-8');
console.log('✅ [Build-Mobile] dist/index.html created successfully!');
console.log('🎉 [Build-Mobile] Mobile build completed successfully.');
