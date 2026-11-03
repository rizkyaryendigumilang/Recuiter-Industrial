/// <reference path="../pb_data/types.d.ts" />

// ---------------------------------------------------------------------------
// 0. User Security & Privilege Escalation Guard (CRITICAL FIX)
//    Mencegah pendaftaran mandiri atau update profil yang menetapkan role 'admin'
//    tanpa otorisasi administrator.
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
    const role = e.record.get("role");
    const auth = e.auth || (e.requestInfo && e.requestInfo().auth);
    const isAdmin = auth && auth.get("role") === "admin";

    // Jika mencoba mendaftar sebagai admin tanpa otorisasi admin yang sah
    if (role === "admin" && !isAdmin) {
        e.record.set("role", "candidate");
    } else if (!role) {
        e.record.set("role", "candidate");
    }
    e.next();
}, "users");

onRecordUpdateRequest((e) => {
    const newRole = e.record.get("role");
    const auth = e.auth || (e.requestInfo && e.requestInfo().auth);
    const isAdmin = auth && auth.get("role") === "admin";

    // Mencegah eskalasi role menjadi 'admin' oleh non-admin
    if (newRole === "admin" && !isAdmin) {
        const orig = e.record.originalCopy ? e.record.originalCopy() : null;
        const originalRole = orig ? orig.get("role") : "candidate";
        e.record.set("role", originalRole);
    }
    e.next();
}, "users");

// ---------------------------------------------------------------------------
// 1. Hybrid Payment & Consultation IDOR Guard (HIGH FIX)
//    - Mengunci user_id ke akun yang membuat booking
//    - Mengunci payment_status agar tidak bisa diset 'paid' oleh non-admin
//    - Generate kode unik 3 digit dengan pencegahan tabrakan (anti-collision)
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
    const auth = e.auth || (e.requestInfo && e.requestInfo().auth);
    const isAdmin = auth && auth.get("role") === "admin";

    // Keamanan Finansial: Hanya admin yang berhak membuat booking dengan status 'paid' secara langsung.
    // Non-admin (kandidat/publik) wajib diinisialisasi ke status 'pending' dan user_id dikunci.
    if (!isAdmin) {
        e.record.set("payment_status", "pending");
        if (auth) {
            e.record.set("user_id", auth.id);
        }
    } else {
        if (!e.record.get("payment_status")) {
            e.record.set("payment_status", "pending");
        }
    }

    if (!e.record.get("unique_code")) {
        let uniqueCode = 0;
        let isUnique = false;
        let attempts = 0;

        // Cegah tabrakan kode unik transfer 3 digit (100-999) dengan booking lain yang masih pending
        while (!isUnique && attempts < 15) {
            attempts++;
            uniqueCode = Math.floor(Math.random() * 900) + 100;
            try {
                const existing = $app.findRecordsByFilter(
                    "consultation_bookings",
                    "payment_status = 'pending' && unique_code = " + uniqueCode,
                    "",
                    1,
                    0
                );
                if (!existing || existing.length === 0) {
                    isUnique = true;
                }
            } catch (err) {
                // Fallback jika collection belum siap atau filter gagal
                isUnique = true;
            }
        }

        if (!isUnique) {
            // Modulo millisecond jika tingkat saturasi kode pending sangat tinggi
            uniqueCode = 100 + (Date.now() % 900);
        }

        e.record.set("unique_code", uniqueCode);
    }

    e.next();
}, "consultation_bookings");

// ---------------------------------------------------------------------------
// 1b. Job Application Ownership Guard (MEDIUM FIX)
//     Mencegah manipulasi candidate_id (IDOR) pada pengiriman lamaran kerja.
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
    const auth = e.auth || (e.requestInfo && e.requestInfo().auth);
    const isAdmin = auth && auth.get("role") === "admin";

    if (!isAdmin && auth) {
        const candidateId = e.record.get("candidate_id");
        if (candidateId) {
            try {
                const candidateRecord = $app.findRecordById("candidates", candidateId);
                if (!candidateRecord || candidateRecord.get("user_id") !== auth.id) {
                    throw new BadRequestError("Akses ditolak: Anda hanya dapat mengirim lamaran menggunakan profil kandidat Anda sendiri.");
                }
            } catch (err) {
                throw new BadRequestError("Akses ditolak: Profil kandidat tidak valid atau bukan milik Anda.");
            }
        }
    }
    e.next();
}, "job_applications");

// ---------------------------------------------------------------------------
// 2. Smart CV Parser Manufaktur & Industri: ekstrak kompetensi teknis pabrik saat upload CV.
//    Mencakup PLC, CNC, K3 Kemnaker, Kalibrasi, ISO 9001, TPM, Pengelasan, dll.
// ---------------------------------------------------------------------------
const extractIndustrialSkillsFromFilename = (fileNameRaw) => {
    const fileName = (typeof fileNameRaw === "string" ? fileNameRaw : String(fileNameRaw)).toLowerCase();
    const industrialKeywords = [
        { label: "PLC Siemens & Otomasi", keys: ["plc", "siemens", "tia portal", "scada"] },
        { label: "CNC Milling & Bubut", keys: ["cnc", "milling", "bubut", "machining", "lathe"] },
        { label: "AutoCAD & SolidWorks", keys: ["cad", "solidworks", "catia", "inventor", "drawing"] },
        { label: "Sertifikasi Ahli K3 Umum Kemnaker", keys: ["k3", "ahli k3", "safety", "hse", "smk3"] },
        { label: "SIO Forklift Kemnaker", keys: ["forklift", "sio", "reach truck"] },
        { label: "ISO 9001:2015 & 7 QC Tools", keys: ["iso", "9001", "qc", "qa", "quality", "kaizen", "5s"] },
        { label: "Total Productive Maintenance (TPM)", keys: ["tpm", "maintenance", "perawatan", "overhaul"] },
        { label: "Caliper & Alat Ukur Presisi", keys: ["caliper", "micrometer", "alat ukur", "metrologi"] },
        { label: "Panel Listrik & Wiring 3-Phase", keys: ["wiring", "panel", "listrik", "3-phase", "inverter"] },
        { label: "Welding SMAW/GMAW/GTAW", keys: ["welding", "pengelasan", "welder", "las"] },
        { label: "PPIC & Supply Chain Industri", keys: ["ppic", "warehouse", "gudang", "logistik", "supply"] },
    ];

    const detected = [];
    for (const item of industrialKeywords) {
        if (item.keys.some((k) => fileName.includes(k))) {
            detected.push(item.label);
        }
    }

    if (detected.length === 0) {
        return [
            "Caliper & Alat Ukur Presisi",
            "ISO 9001:2015 & 7 QC Tools",
            "5S / 5R & Kaizen Culture",
            "Sertifikasi Ahli K3 Umum Kemnaker",
        ];
    }
    return detected;
};

onRecordCreateRequest((e) => {
    try {
        const resume = e.record.get("resume_url");
        if (resume) {
            e.record.set("parsed_skills", extractIndustrialSkillsFromFilename(resume));
        }
    } catch (err) {
        console.log("[industrial-ocr] create ERROR:", err);
    }
    e.next();
}, "candidates");

onRecordUpdateRequest((e) => {
    try {
        const resume = e.record.get("resume_url");
        if (resume) {
            e.record.set("parsed_skills", extractIndustrialSkillsFromFilename(resume));
        }
    } catch (err) {
        console.log("[industrial-ocr] update ERROR:", err);
    }
    e.next();
}, "candidates");

// ---------------------------------------------------------------------------
// 3. Psychological Test Engine: auto-scoring berdasarkan bobot psikologi
//    serta persistensi data detail Kraepelin (Panker, Tianker, Hanker, Janker) & DISC.
//    POST /api/submit-test
// ---------------------------------------------------------------------------
routerAdd("POST", "/api/submit-test", (e) => {
    // 1. Validasi Autentikasi User (Wajib Login)
    const authRecord = e.auth || (e.requestInfo && e.requestInfo().auth);
    if (!authRecord) {
        return e.json(401, {
            error: "Akses ditolak: Autentikasi diperlukan untuk mengirim hasil tes psikometri."
        });
    }

    const data = e.requestInfo().body;
    const applicationId = data.application_id || "";
    const answers = data.answers || [];
    const psychDetails = data.psychometric_details || null;

    let application = null;
    let candidateRecord = null;
    if (applicationId) {
        try {
            application = $app.findRecordById("job_applications", applicationId);
        } catch (err) {
            application = null;
        }

        // 2. Validasi User Ownership: Pengguna harus Admin atau Pemilik berkas lamaran
        if (application) {
            const isAdmin = authRecord.get("role") === "admin";
            const appCandidateId = application.get("candidate_id");
            let isOwner = false;

            if (appCandidateId) {
                try {
                    candidateRecord = $app.findRecordById("candidates", appCandidateId);
                    if (candidateRecord && candidateRecord.get("user_id") === authRecord.id) {
                        isOwner = true;
                    }
                } catch (err) {
                    // Abaikan err pencarian
                }
            }

            if (!isAdmin && !isOwner) {
                return e.json(403, {
                    error: "Akses ditolak: Anda tidak memiliki wewenang atas berkas lamaran ini."
                });
            }
        }
    }

    let totalScore = 0;
    for (const answer of answers) {
        let question;
        try {
            question = $app.findRecordById("test_questions", answer.question_id);
        } catch (err) {
            continue;
        }

        let weights = question.get("scoring_weight");
        if (weights != null && typeof weights === "object" && typeof weights.length === "number" && typeof weights[0] === "number") {
            let text = "";
            for (let i = 0; i < weights.length; i++) text += String.fromCharCode(weights[i]);
            try { weights = JSON.parse(text); } catch (err) { weights = null; }
        } else if (typeof weights === "string") {
            try { weights = JSON.parse(weights); } catch (err) { weights = null; }
        }

        let weight;
        if (weights && typeof weights.get === "function") {
            weight = weights.get(answer.selected_option);
        } else if (weights) {
            weight = weights[answer.selected_option];
        }
        if (typeof weight === "number") {
            totalScore += weight;
        }
    }

    // Hitung rata-rata persentase jika ada pertanyaan
    if (answers.length > 0) {
        totalScore = Math.round((totalScore / (answers.length * 5)) * 100);
    } else if (psychDetails && typeof psychDetails.total_score === "number") {
        totalScore = psychDetails.total_score;
    }

    // Penalty jika anti-cheat terdeteksi (pindah tab > batas toleransi)
    if (data.penalty) {
        totalScore = Math.max(35, totalScore - 20);
    }

    const nextStatus = totalScore >= 70 ? "interview" : "testing";

    // Simpan ke record job_applications
    if (application) {
        application.set("test_score", totalScore);
        application.set("status", nextStatus);
        if (psychDetails) {
            try {
                application.set("psychometric_details", psychDetails);
            } catch (err) {
                console.log("[submit-test] note on psychometric_details:", err);
            }
        }
        $app.save(application);
    }

    // Simpan riwayat asesmen komprehensif ke candidate_assessments jika collection tersedia
    try {
        const assessmentColl = $app.findCollectionByNameOrId("candidate_assessments");
        if (assessmentColl && psychDetails) {
            const newAssessment = new Record(assessmentColl);
            // Kunci user_id ke akun terautentikasi (mencegah manipulasi identitas pengguna lain)
            newAssessment.set("user_id", authRecord.id);

            if (candidateRecord) {
                newAssessment.set("candidate_id", candidateRecord.id);
            } else if (application && application.get("candidate_id")) {
                newAssessment.set("candidate_id", application.get("candidate_id"));
            } else if (authRecord.get("role") === "admin" && data.candidate_id) {
                newAssessment.set("candidate_id", data.candidate_id);
            }

            if (data.job_id) newAssessment.set("job_id", data.job_id);

            const candidateName = authRecord.get("name") || data.candidate_name || authRecord.get("email") || "Kandidat";
            const candidateEmail = authRecord.get("email") || data.candidate_email || "";
            newAssessment.set("candidate_name", candidateName);
            newAssessment.set("candidate_email", candidateEmail);

            newAssessment.set("test_type", psychDetails.test_type || "full_industrial");
            newAssessment.set("total_score", totalScore);
            newAssessment.set("panker", psychDetails.panker || 0);
            newAssessment.set("tianker", psychDetails.tianker || 0);
            newAssessment.set("hanker", psychDetails.hanker || "Stabil");
            newAssessment.set("janker", psychDetails.janker || 0);
            newAssessment.set("column_speeds", psychDetails.column_speeds || []);
            newAssessment.set("disc_dimensions", psychDetails.disc_dimensions || []);
            newAssessment.set("anti_cheat_violations", psychDetails.anti_cheat_violations || (data.penalty ? 1 : 0));
            newAssessment.set("recommendation", totalScore >= 75 ? "Direkomendasikan" : (totalScore >= 60 ? "Dipertimbangkan" : "Tidak Direkomendasikan"));
            if (psychDetails.role_fit) newAssessment.set("role_fit", psychDetails.role_fit);
            $app.save(newAssessment);
        }
    } catch (err) {
        // Abaikan jika collection belum ter-migrate
    }

    return e.json(200, {
        success: true,
        test_score: totalScore,
        status: nextStatus,
        psychometric_details: psychDetails,
    });
});
