/// <reference path="../pb_data/types.d.ts" />

// PocketBase 0.40.x migration API:
// - migrate((app) => {...}) menerima app (CoreApp), bukan Dao.
// - Definisi collection memakai `fields: [...]`, bukan `schema: [...]`.
// - Definisi field FLAT: properti relasi/select/file menempel langsung di
//   object field (collectionId, values, mimeTypes, dst.) tanpa bungkus `options`.
// - fields.add() butuh instance class (mis. new SelectField({...})).

migrate((app) => {
    const has = (name) => {
        try {
            app.findCollectionByNameOrId(name);
            return true;
        } catch (e) {
            return false;
        }
    };

    const idOf = (name, fallback) => {
        try {
            return app.findCollectionByNameOrId(name).id;
        } catch (e) {
            return fallback;
        }
    };

    // -----------------------------------------------------------------------
    // 1. users: tambah field kustom "role" (admin | employer | candidate)
    // -----------------------------------------------------------------------
    try {
        const users = app.findCollectionByNameOrId("users");
        const existingFields = users.fields.asMap();
        if (!existingFields["role"]) {
            users.fields.add(new SelectField({
                name: "role",
                type: "select",
                required: false,
                maxSelect: 1,
                values: ["admin", "employer", "candidate"],
            }));
            app.save(users);
            console.log("[migration] users.role added");
        }
    } catch (e) {
        console.log("[migration] users role field:", e);
    }

    const usersId = idOf("users", "_pb_users_auth_");

    // -----------------------------------------------------------------------
    // 2. services_catalog: katalog dinamis layanan (managed via admin panel)
    // -----------------------------------------------------------------------
    if (!has("services_catalog")) {
        app.save(new Collection({
            name: "services_catalog",
            type: "base",
            listRule: "",
            viewRule: "",
            createRule: "@request.auth.role = 'admin'",
            updateRule: "@request.auth.role = 'admin'",
            deleteRule: "@request.auth.role = 'admin'",
            fields: [
                { name: "category", type: "text", required: true },
                { name: "title", type: "text", required: true },
                { name: "description", type: "text" },
                { name: "price", type: "number", required: true },
                { name: "is_active", type: "bool" },
            ],
        }));
        console.log("[migration] services_catalog created");
    }

    // -----------------------------------------------------------------------
    // 3. employers
    // -----------------------------------------------------------------------
    if (!has("employers")) {
        app.save(new Collection({
            name: "employers",
            type: "base",
            listRule: "@request.auth.role = 'admin' || @request.auth.id = user_id",
            viewRule: "@request.auth.role = 'admin' || @request.auth.id = user_id",
            createRule: "@request.auth.id != '' && @request.auth.role = 'employer'",
            updateRule: "@request.auth.id = user_id",
            fields: [
                { name: "user_id", type: "relation", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: true },
                { name: "company_name", type: "text", required: true },
                { name: "business_sector", type: "text" },
                { name: "retainer_active", type: "bool" },
                { name: "credit_balance", type: "number" },
            ],
        }));
        console.log("[migration] employers created");
    }

    const employersId = idOf("employers", null);

    // -----------------------------------------------------------------------
    // 4. candidates (CV + hasil OCR skills)
    // -----------------------------------------------------------------------
    if (!has("candidates")) {
        app.save(new Collection({
            name: "candidates",
            type: "base",
            listRule: "@request.auth.role = 'admin' || @request.auth.id = user_id",
            viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'employer' || @request.auth.id = user_id",
            createRule: "@request.auth.id != '' && @request.auth.role = 'candidate'",
            updateRule: "@request.auth.id = user_id",
            fields: [
                { name: "user_id", type: "relation", required: true, collectionId: usersId, maxSelect: 1, cascadeDelete: true },
                { name: "phone", type: "text" },
                { name: "resume_url", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf"] },
                { name: "parsed_skills", type: "json" },
            ],
        }));
        console.log("[migration] candidates created");
    }

    const candidatesId = idOf("candidates", null);

    // -----------------------------------------------------------------------
    // 5. job_postings (lowongan)
    // -----------------------------------------------------------------------
    if (!has("job_postings") && employersId) {
        app.save(new Collection({
            name: "job_postings",
            type: "base",
            listRule: "",
            viewRule: "",
            createRule: "@request.auth.role = 'admin' || @request.auth.role = 'employer'",
            updateRule: "@request.auth.role = 'admin' || (@request.auth.role = 'employer' && employer_id.user_id = @request.auth.id)",
            fields: [
                { name: "employer_id", type: "relation", required: true, collectionId: employersId, maxSelect: 1 },
                { name: "title", type: "text", required: true },
                { name: "description", type: "text", required: true },
                { name: "requirements_keywords", type: "json" },
                { name: "is_featured", type: "bool" },
                { name: "flyer_url", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png"] },
                { name: "status", type: "select", maxSelect: 1, values: ["draft", "open", "closed"] },
            ],
        }));
        console.log("[migration] job_postings created");
    }

    const jobsId = idOf("job_postings", null);

    // -----------------------------------------------------------------------
    // 6. job_applications (lamaran + auto match/test score)
    // -----------------------------------------------------------------------
    if (!has("job_applications") && jobsId && candidatesId) {
        app.save(new Collection({
            name: "job_applications",
            type: "base",
            listRule: "@request.auth.role = 'admin' || candidate_id.user_id = @request.auth.id || job_id.employer_id.user_id = @request.auth.id",
            viewRule: "@request.auth.role = 'admin' || candidate_id.user_id = @request.auth.id || job_id.employer_id.user_id = @request.auth.id",
            createRule: "@request.auth.role = 'candidate'",
            updateRule: "@request.auth.role = 'admin' || job_id.employer_id.user_id = @request.auth.id",
            fields: [
                { name: "job_id", type: "relation", required: true, collectionId: jobsId, maxSelect: 1 },
                { name: "candidate_id", type: "relation", required: true, collectionId: candidatesId, maxSelect: 1 },
                { name: "match_score", type: "number" },
                { name: "test_score", type: "number" },
                { name: "status", type: "select", maxSelect: 1, values: ["applied", "testing", "interview", "rejected", "hired"] },
                { name: "consent_given", type: "bool", required: true },
            ],
        }));
        console.log("[migration] job_applications created");
    }

    // -----------------------------------------------------------------------
    // 7. test_questions (modul tes psikometri open-source)
    // -----------------------------------------------------------------------
    if (!has("test_questions")) {
        app.save(new Collection({
            name: "test_questions",
            type: "base",
            listRule: "",
            viewRule: "",
            createRule: "@request.auth.role = 'admin'",
            updateRule: "@request.auth.role = 'admin'",
            fields: [
                { name: "test_type", type: "text", required: true },
                { name: "question_text", type: "text", required: true },
                { name: "options", type: "json", required: true },
                { name: "scoring_weight", type: "json", required: true },
            ],
        }));
        console.log("[migration] test_questions created");
    }

    // -----------------------------------------------------------------------
    // 8. consultation_bookings (booking + hybrid payment)
    // -----------------------------------------------------------------------
    if (!has("consultation_bookings")) {
        const servicesId = idOf("services_catalog", "");
        if (servicesId) {
            app.save(new Collection({
                name: "consultation_bookings",
                type: "base",
                listRule: "@request.auth.role = 'admin' || @request.auth.id = user_id",
                viewRule: "@request.auth.role = 'admin' || @request.auth.id = user_id",
                createRule: "@request.auth.id != ''",
                updateRule: "@request.auth.role = 'admin'",
                fields: [
                    { name: "user_id", type: "relation", required: true, collectionId: usersId, maxSelect: 1 },
                    { name: "service_id", type: "relation", required: true, collectionId: servicesId, maxSelect: 1 },
                    { name: "topic", type: "text" },
                    { name: "scheduled_time", type: "date" },
                    { name: "document_url", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["application/pdf"] },
                    { name: "payment_proof_url", type: "file", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png"] },
                    { name: "payment_status", type: "select", maxSelect: 1, values: ["pending", "paid"] },
                    { name: "unique_code", type: "number" },
                ],
            }));
            console.log("[migration] consultation_bookings created");
        }
    }
}, (app) => {
    // Down: hapus collection yang dibuat migration ini (urut terbalik).
    const collections = [
        "consultation_bookings",
        "test_questions",
        "job_applications",
        "job_postings",
        "candidates",
        "employers",
        "services_catalog",
    ];
    for (const name of collections) {
        try {
            const collection = app.findCollectionByNameOrId(name);
            app.delete(collection);
        } catch (e) {
            // collection mungkin sudah tidak ada
        }
    }

    // Kembalikan users: hapus field role
    try {
        const users = app.findCollectionByNameOrId("users");
        if (users.fields.asMap()["role"]) {
            users.fields.removeByName("role");
            app.save(users);
        }
    } catch (e) {
        // ignore
    }
});
