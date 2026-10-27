#!/usr/bin/env node
/**
 * Skrip pembuatan akun demo lengkap (Admin, Employer, Candidate) via PocketBase REST API.
 * Jalankan: node create-admin-demo.mjs [PB_URL]
 */

const PB_URL = process.env.PB_URL || process.argv[2] || "http://127.0.0.1:8093";
const ADMIN_EMAIL = "admin@hrtech.id";
const ADMIN_PASSWORD = "Admin@hrtech123";

const EMPLOYER_EMAIL = "employer@demo.com";
const EMPLOYER_PASSWORD = "Employer@123";

const CANDIDATE_EMAIL = "kandidat@demo.com";
const CANDIDATE_PASSWORD = "Kandidat@123";

async function createAdminAccount() {
  console.log("=".repeat(60));
  console.log("  HRTech Recruiter Industrial — Master Account Initializer");
  console.log(`  Target PocketBase: ${PB_URL}`);
  console.log("=".repeat(60));

  // 1. Coba buat superuser (PocketBase admin panel owner)
  console.log("\n[1/5] Membuat superuser PocketBase Admin UI...");
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
        console.log("   ✓ Superuser admin@hrtech.id sudah ada, lanjut...");
      } else {
        console.log("   ⚠ Superuser status:", JSON.stringify(err));
      }
    } else {
      console.log("   ✓ Superuser berhasil dibuat!");
    }
  } else {
    console.log("   ⚠ Status:", superRes.status, await superRes.text());
  }

  // 2. Login sebagai superuser untuk dapat token
  console.log("\n[2/5] Login sebagai superuser untuk mendapat token API...");
  const loginRes = await fetch(`${PB_URL}/api/superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  if (!loginRes.ok) {
    const err = await loginRes.text();
    console.error("   ✗ Login superuser gagal:", err);
    console.log("\nPastikan PocketBase sudah berjalan di", PB_URL);
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log("   ✓ Login superuser berhasil!");

  // Helper function: get or create user
  async function ensureUser(email, password, role) {
    const checkRes = await fetch(
      `${PB_URL}/api/collections/users/records?filter=${encodeURIComponent(`email="${email}"`)}`,
      { headers: { Authorization: token } }
    );
    const checkData = await checkRes.json();
    if (checkData.totalItems > 0) {
      console.log(`   ✓ User ${email} (${role}) sudah ada.`);
      return checkData.items[0];
    }

    const createRes = await fetch(`${PB_URL}/api/collections/users/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify({
        email,
        password,
        passwordConfirm: password,
        role,
        emailVisibility: true,
      }),
    });

    if (createRes.ok) {
      const u = await createRes.json();
      console.log(`   ✓ User ${email} (${role}) berhasil dibuat!`);
      return u;
    } else {
      const err = await createRes.json();
      console.log(`   ⚠ Gagal buat user ${email}:`, JSON.stringify(err));
      return null;
    }
  }

  // 3. Buat ketiga user demo
  console.log("\n[3/5] Memastikan akun User (Admin, Employer, Candidate) tersedia...");
  const adminUser = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, "admin");
  const employerUser = await ensureUser(EMPLOYER_EMAIL, EMPLOYER_PASSWORD, "employer");
  const candidateUser = await ensureUser(CANDIDATE_EMAIL, CANDIDATE_PASSWORD, "candidate");

  // Pastikan profile employer di koleksi employers
  let employerRecordId = null;
  if (employerUser) {
    const empCheck = await fetch(
      `${PB_URL}/api/collections/employers/records?filter=${encodeURIComponent(`user_id="${employerUser.id}"`)}`,
      { headers: { Authorization: token } }
    );
    const empData = await empCheck.json();
    if (empData.totalItems > 0) {
      employerRecordId = empData.items[0].id;
      console.log("   ✓ Profil employer PT Tri Mitra Industri sudah ada.");
    } else {
      const empRes = await fetch(`${PB_URL}/api/collections/employers/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          user_id: employerUser.id,
          company_name: "PT Tri Mitra Industri",
          business_sector: "Manufaktur & Rekayasa Otomasi",
          retainer_active: true,
          credit_balance: 50,
        }),
      });
      if (empRes.ok) {
        const empRec = await empRes.json();
        employerRecordId = empRec.id;
        console.log("   ✓ Profil employer PT Tri Mitra Industri berhasil dibuat!");
      }
    }
  }

  // Pastikan profile candidate di koleksi candidates
  if (candidateUser) {
    const candCheck = await fetch(
      `${PB_URL}/api/collections/candidates/records?filter=${encodeURIComponent(`user_id="${candidateUser.id}"`)}`,
      { headers: { Authorization: token } }
    );
    const candData = await candCheck.json();
    if (candData.totalItems > 0) {
      console.log("   ✓ Profil kandidat Budi Santoso sudah ada.");
    } else {
      const candRes = await fetch(`${PB_URL}/api/collections/candidates/records`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          user_id: candidateUser.id,
          phone: "081234567890",
          parsed_skills: ["PLC Siemens & Otomasi", "CNC Milling & Bubut", "Sertifikasi Ahli K3 Umum Kemnaker", "ISO 9001:2015 & 7 QC Tools"],
        }),
      });
      if (candRes.ok) {
        console.log("   ✓ Profil kandidat Budi Santoso berhasil dibuat!");
      }
    }
  }

  // 4. Sample data: catalog & test questions & jobs
  console.log("\n[4/5] Memastikan sample katalog layanan & soal tes...");
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
  }

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
  }

  // 5. Sample jobs jika employer tersedia dan lowongan kosong
  if (employerRecordId) {
    console.log("\n[5/5] Memastikan lowongan kerja industri aktif...");
    const jobCheck = await fetch(`${PB_URL}/api/collections/job_postings/records`, {
      headers: { Authorization: token },
    });
    const jobData = await jobCheck.json();
    if (jobData.totalItems === 0) {
      const sampleJobs = [
        {
          employer_id: employerRecordId,
          title: "Teknisi Maintenance & Otomasi PLC",
          description: "Bertanggung jawab atas troubleshooting PLC Siemens S7-1200, wiring panel 3-phase, dan pemeliharaan mesin presisi lantai produksi.",
          requirements_keywords: ["PLC", "Siemens", "Wiring", "Maintenance", "3-Phase"],
          is_featured: true,
          status: "open",
        },
        {
          employer_id: employerRecordId,
          title: "QC Inspector Presisi (7 QC Tools)",
          description: "Melakukan verifikasi dimensi toleransi dengan caliper/micrometer dan audit standar mutu ISO 9001:2015.",
          requirements_keywords: ["QC", "Caliper", "ISO 9001", "7 QC Tools", "Metrologi"],
          is_featured: true,
          status: "open",
        },
      ];

      for (const j of sampleJobs) {
        const jr = await fetch(`${PB_URL}/api/collections/job_postings/records`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify(j),
        });
        if (jr.ok) console.log(`   ✓ Lowongan: "${j.title}"`);
      }
    } else {
      console.log(`   ✓ Sudah terdapat ${jobData.totalItems} lowongan aktif.`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("  SELESAI! Seluruh Kredensial Akun Telah Tersedia:");
  console.log("=".repeat(60));
  console.log("  1. ADMINISTRATOR:");
  console.log(`     Email    : ${ADMIN_EMAIL}`);
  console.log(`     Password : ${ADMIN_PASSWORD}`);
  console.log("  2. EMPLOYER (UMKM / Perusahaan):");
  console.log(`     Email    : ${EMPLOYER_EMAIL}`);
  console.log(`     Password : ${EMPLOYER_PASSWORD}`);
  console.log("  3. CANDIDATE (Pelamar Kerja):");
  console.log(`     Email    : ${CANDIDATE_EMAIL}`);
  console.log(`     Password : ${CANDIDATE_PASSWORD}`);
  console.log("-".repeat(60));
  console.log("  Akses Web Portal :");
  console.log("     Home / Candidate : /recruiter");
  console.log("     Login            : /recruiter/login");
  console.log("     Admin Portal     : /recruiter/admin");
  console.log("     PocketBase Admin : /recruiter-pb/_/");
  console.log("=".repeat(60));
}

createAdminAccount().catch(err => {
  console.error("\n✗ Error:", err.message);
  process.exit(1);
});
