/// <reference path="../pb_data/types.d.ts" />

// ---------------------------------------------------------------------------
// 1. Hybrid Payment: generate kode unik 3 digit + set default status pending
//    untuk setiap konsultasi booking baru.
//    CATATAN PocketBase 0.40: handler hook HARUS memanggil e.next() agar
//    rantai eksekusi berlanjut (tanpa itu request dihentikan tanpa efek).
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
    if (!e.record.get("unique_code")) {
        const uniqueCode = Math.floor(Math.random() * 900) + 100; // 100-999
        e.record.set("unique_code", uniqueCode);
    }
    if (!e.record.get("payment_status")) {
        e.record.set("payment_status", "pending");
    }
    e.next();
}, "consultation_bookings");

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
    const data = e.requestInfo().body;
    const applicationId = data.application_id || "";
    const answers = data.answers || [];
    const psychDetails = data.psychometric_details || null;

    let application = null;
    if (applicationId) {
        try {
            application = $app.findRecordById("job_applications", applicationId);
        } catch (err) {
            application = null;
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
            if (data.user_id) newAssessment.set("user_id", data.user_id);
            if (data.candidate_id) newAssessment.set("candidate_id", data.candidate_id);
            if (data.job_id) newAssessment.set("job_id", data.job_id);
            if (data.candidate_name) newAssessment.set("candidate_name", data.candidate_name);
            if (data.candidate_email) newAssessment.set("candidate_email", data.candidate_email);
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
