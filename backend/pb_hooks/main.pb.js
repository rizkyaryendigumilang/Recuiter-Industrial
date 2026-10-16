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
// 2. Smart CV OCR (mock): ekstrak skills saat kandidat upload/mengubah CV.
//    Pada implementasi nyata, ganti mock ini dengan pemanggilan OCR API eksternal.
//    CATATAN: logika di-INLINE di handler (JSVM tidak mengenali referensi
//    fungsi tingkat-file dari dalam callback hook).
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
    try {
        const resume = e.record.get("resume_url");
        if (resume) {
            const knownSkills = [
                "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
                "Tailwind CSS", "Python", "SQL", "Communication",
                "Teamwork", "Leadership", "Recruitment",
            ];
            const fileName = (typeof resume === "string" ? resume : String(resume)).toLowerCase();
            const extracted = knownSkills.filter((skill) =>
                fileName.includes(skill.toLowerCase().split(" ")[0])
            );
            e.record.set("parsed_skills", extracted.length > 0 ? extracted : ["JavaScript", "React", "Node.js", "Teamwork"]);
        }
    } catch (err) {
        console.log("[ocr] create ERROR:", err);
    }
    e.next();
}, "candidates");
onRecordUpdateRequest((e) => {
    try {
        const resume = e.record.get("resume_url");
        if (resume) {
            const knownSkills = [
                "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
                "Tailwind CSS", "Python", "SQL", "Communication",
                "Teamwork", "Leadership", "Recruitment",
            ];
            const fileName = (typeof resume === "string" ? resume : String(resume)).toLowerCase();
            const extracted = knownSkills.filter((skill) =>
                fileName.includes(skill.toLowerCase().split(" ")[0])
            );
            e.record.set("parsed_skills", extracted.length > 0 ? extracted : ["JavaScript", "React", "Node.js", "Teamwork"]);
        }
    } catch (err) {
        console.log("[ocr] update ERROR:", err);
    }
    e.next();
}, "candidates");

// ---------------------------------------------------------------------------
// 3. Psychological Test Engine: auto-scoring berdasarkan bobot psikologi.
//    POST /api/submit-test  { application_id, answers: [{question_id, selected_option}] }
// ---------------------------------------------------------------------------
routerAdd("POST", "/api/submit-test", (e) => {
    const data = e.requestInfo().body;
    const applicationId = data.application_id || "";
    const answers = data.answers || [];

    // Application boleh kosong (mode skor-saja untuk demo/tryout tanpa lamaran)
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

        // record.get() untuk field json bisa berupa byte array / string / map
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

    // Penalty jika anti-cheat terdeteksi (pindah tab > batas)
    if (data.penalty) {
        totalScore = Math.max(0, totalScore - 20);
    }

    if (application) {
        application.set("test_score", totalScore);
        application.set("status", "interview");
        $app.save(application);
    }

    return e.json(200, { success: true, test_score: totalScore });
});
