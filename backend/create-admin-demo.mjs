#!/usr/bin/env node
/**
 * Skrip pembuatan akun admin demo via PocketBase REST API.
 * Jalankan: node create-admin-demo.mjs
 * Pastikan PocketBase sudah berjalan di http://127.0.0.1:8090
 */

const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "admin@hrtech.id";
const ADMIN_PASSWORD = "Admin@hrtech123";

async function createAdminAccount() {
  console.log("=".repeat(55));
  console.log("  HRTech — Demo Admin Account Creator");
  console.log("=".repeat(55));

  // 1. Coba buat superuser (PocketBase admin panel owner)
  console.log("\n[1/3] Membuat superuser PocketBase Admin UI...");
  const superRes = await fetch(`${PB_URL}/api/superusers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      passwordConfirm: ADMIN_PASSWORD,
    }),
  });

  if (superRes.ok || superRes.status === 400) {
    if (superRes.status === 400) {
      const err = await superRes.json();
      if (JSON.stringify(err).includes("already")) {
        console.log("   ✓ Superuser sudah ada, lanjut...");
      } else {
        console.log("   ⚠ Superuser:", JSON.stringify(err));
      }
    } else {
      console.log("   ✓ Superuser berhasil dibuat!");
    }
  } else {
    console.log("   ⚠ Status:", superRes.status, await superRes.text());
  }

  // 2. Login sebagai superuser untuk dapat token
  console.log("\n[2/3] Login sebagai superuser untuk mendapat token API...");
  const loginRes = await fetch(`${PB_URL}/api/superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    console.error("   ✗ Login superuser gagal:", err);
    console.log("\nPastikan PocketBase sudah berjalan dan akun admin PB sudah dibuat via /_/");
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log("   ✓ Login berhasil!");

  // 3. Buat user biasa dengan role=admin di koleksi users
  console.log("\n[3/3] Membuat user demo dengan role=admin di koleksi users...");

  // Cek dulu apakah sudah ada
  const checkRes = await fetch(
    `${PB_URL}/api/collections/users/records?filter=${encodeURIComponent('email="admin@hrtech.id"')}`,
    { headers: { Authorization: token } }
  );
  const checkData = await checkRes.json();

  if (checkData.totalItems > 0) {
    console.log("   ✓ User admin@hrtech.id sudah ada di koleksi users.");
  } else {
    const createRes = await fetch(`${PB_URL}/api/collections/users/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        passwordConfirm: ADMIN_PASSWORD,
        role: "admin",
        emailVisibility: true,
      }),
    });

    if (createRes.ok) {
      console.log("   ✓ User admin berhasil dibuat!");
    } else {
      const err = await createRes.json();
      console.log("   ⚠ Gagal buat user:", JSON.stringify(err));
    }
  }

  // 4. Buat sample data (opsional)
  console.log("\n[Bonus] Menambahkan sample data katalog layanan...");
  const sampleServices = [
    { category: "Psikologi Terapan", title: "Decision-Making & Life-Path Coaching", description: "Pendampingan dalam pengambilan keputusan karier dan hidup yang krusial.", price: 350000, is_active: true },
    { category: "Psikologi Terapan", title: "Emotional Regulation & Anger Management", description: "Pengelolaan emosi dan strategi meredam amarah secara efektif.", price: 300000, is_active: true },
    { category: "B2C - Klinik Karier", title: "Career Offer & Contract Review", description: "Bedah offer letter dan kontrak kerja secara privat per jam.", price: 250000, is_active: true },
    { category: "B2C - Klinik Karier", title: "Corporate Test Simulation & Coaching", description: "Latihan dan bedah soal psikotes korporat (Tes Pauli, Logika, Wartegg).", price: 200000, is_active: true },
    { category: "Psikologi Terapan", title: "Pre-Marital & Relationship Counseling", description: "Konseling relasi dan persiapan pra-nikah bersama psikolog profesional.", price: 400000, is_active: true },
    { category: "Psikologi Terapan", title: "Academic & Stress Management", description: "Manajemen stres akademik untuk pelajar, mahasiswa, dan remaja.", price: 250000, is_active: true },
    { category: "Psikologi Terapan", title: "Public Speaking & Social Anxiety Coaching", description: "Mengatasi kecemasan sosial dan grogi saat berbicara di depan umum.", price: 300000, is_active: true },
    { category: "Psikologi Terapan", title: "Trauma-Informed & Adjustment Coaching", description: "Pendampingan pemulihan trauma dan penyesuaian diri pascakejadian berat.", price: 450000, is_active: true },
  ];

  for (const svc of sampleServices) {
    const r = await fetch(`${PB_URL}/api/collections/services_catalog/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(svc),
    });
    if (r.ok) console.log(`   ✓ Katalog: "${svc.title}"`);
    else {
      const e = await r.json();
      if (JSON.stringify(e).includes("already")) console.log(`   - Skip: "${svc.title}" (sudah ada)`);
      else console.log(`   ⚠ Gagal: "${svc.title}"`, JSON.stringify(e));
    }
  }

  // 5. Sample test questions
  console.log("\n[Bonus] Menambahkan sample soal psikotes...");
  const sampleQuestions = [
    {
      test_type: "kepribadian",
      question_text: "Ketika menghadapi masalah besar di tempat kerja, Anda cenderung:",
      options: { "A": "Langsung mencari solusi sendiri tanpa bertanya", "B": "Berdiskusi dengan tim untuk mencari solusi bersama", "C": "Menunggu instruksi dari atasan", "D": "Menghindar dari masalah tersebut" },
      scoring_weight: { "A": 3, "B": 5, "C": 2, "D": 0 }
    },
    {
      test_type: "kepribadian",
      question_text: "Dalam sebuah proyek tim, peran Anda biasanya:",
      options: { "A": "Pemimpin yang mengarahkan strategi", "B": "Eksekutor yang menjalankan rencana", "C": "Penghubung yang menjaga komunikasi tim", "D": "Analis yang mengevaluasi data dan hasil" },
      scoring_weight: { "A": 5, "B": 4, "C": 4, "D": 4 }
    },
    {
      test_type: "logika",
      question_text: "Jika A > B dan B > C, maka hubungan antara A dan C adalah:",
      options: { "A": "A < C", "B": "A = C", "C": "A > C", "D": "Tidak dapat ditentukan" },
      scoring_weight: { "A": 0, "B": 0, "C": 5, "D": 0 }
    },
  ];

  for (const q of sampleQuestions) {
    const r = await fetch(`${PB_URL}/api/collections/test_questions/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(q),
    });
    if (r.ok) console.log(`   ✓ Soal: "${q.question_text.substring(0, 50)}..."`);
    else console.log(`   ⚠ Gagal menyimpan soal`);
  }

  console.log("\n" + "=".repeat(55));
  console.log("  SELESAI! Kredensial Admin:");
  console.log("=".repeat(55));
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log(`  Login di : http://localhost:3000/login`);
  console.log(`  PB Admin : http://127.0.0.1:8090/_/`);
  console.log("=".repeat(55));
}

createAdminAccount().catch(err => {
  console.error("\n✗ Error:", err.message);
  console.log("\nPastikan PocketBase berjalan: jalankan 'pocketbase.exe serve' di folder backend/pb_migrations/");
  process.exit(1);
});
