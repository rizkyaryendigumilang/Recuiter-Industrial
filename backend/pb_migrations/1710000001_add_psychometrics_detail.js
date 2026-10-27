/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    // 1. Tambah field `psychometric_details` (JSON) ke `job_applications`
    try {
        const jobApps = app.findCollectionByNameOrId("job_applications");
        const existingFields = jobApps.fields.asMap();
        if (!existingFields["psychometric_details"]) {
            jobApps.fields.add(new JSONField({
                name: "psychometric_details",
                required: false,
            }));
            app.save(jobApps);
            console.log("[migration] job_applications.psychometric_details added");
        }
    } catch (e) {
        console.log("[migration] error adding psychometric_details to job_applications:", e);
    }

    // 2. Buat collection `candidate_assessments` untuk riwayat asesmen komprehensif
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

    if (!has("candidate_assessments")) {
        const usersId = idOf("users", "_pb_users_auth_");
        const candidatesId = idOf("candidates", null);
        const jobsId = idOf("job_postings", null);

        app.save(new Collection({
            name: "candidate_assessments",
            type: "base",
            listRule: "@request.auth.role = 'admin' || @request.auth.role = 'employer' || user_id = @request.auth.id",
            viewRule: "@request.auth.role = 'admin' || @request.auth.role = 'employer' || user_id = @request.auth.id",
            createRule: "@request.auth.id != ''",
            updateRule: "@request.auth.role = 'admin'",
            deleteRule: "@request.auth.role = 'admin'",
            fields: [
                { name: "user_id", type: "relation", required: false, collectionId: usersId, maxSelect: 1 },
                { name: "candidate_id", type: "relation", required: false, collectionId: candidatesId, maxSelect: 1 },
                { name: "job_id", type: "relation", required: false, collectionId: jobsId, maxSelect: 1 },
                { name: "candidate_name", type: "text" },
                { name: "candidate_email", type: "text" },
                { name: "test_type", type: "text", required: true },
                { name: "total_score", type: "number", required: true },
                { name: "panker", type: "number" },
                { name: "tianker", type: "number" },
                { name: "hanker", type: "text" },
                { name: "janker", type: "number" },
                { name: "column_speeds", type: "json" },
                { name: "disc_dimensions", type: "json" },
                { name: "anti_cheat_violations", type: "number" },
                { name: "recommendation", type: "text" },
                { name: "role_fit", type: "json" },
            ],
        }));
        console.log("[migration] candidate_assessments collection created");
    }
}, (app) => {
    try {
        const coll = app.findCollectionByNameOrId("candidate_assessments");
        app.delete(coll);
    } catch (e) {}

    try {
        const jobApps = app.findCollectionByNameOrId("job_applications");
        if (jobApps.fields.asMap()["psychometric_details"]) {
            jobApps.fields.removeByName("psychometric_details");
            app.save(jobApps);
        }
    } catch (e) {}
});
