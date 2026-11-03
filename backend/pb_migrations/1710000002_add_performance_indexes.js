/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 1710000002: Add performance indexes for foreign keys & payment queries,
 * and enforce strict createRule for candidate_assessments.
 */
migrate((app) => {
    // 1. Indeks performa untuk foreign key & filter umum job_applications
    try {
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_job_app_job_id ON job_applications (job_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_job_app_candidate_id ON job_applications (candidate_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_job_app_status ON job_applications (status)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_job_app_composite ON job_applications (job_id, status)").execute();
        console.log("[migration-1710000002] job_applications indexes created");
    } catch (err) {
        console.log("[migration-1710000002] job_applications indexes notice:", err);
    }

    // 2. Indeks performa untuk consultation_bookings & validasi kode unik pembayaran
    try {
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON consultation_bookings (user_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON consultation_bookings (service_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_bookings_pay_status ON consultation_bookings (payment_status)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_bookings_unique_code ON consultation_bookings (unique_code, payment_status)").execute();
        console.log("[migration-1710000002] consultation_bookings indexes created");
    } catch (err) {
        console.log("[migration-1710000002] consultation_bookings indexes notice:", err);
    }

    // 3. Indeks performa untuk candidate_assessments
    try {
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON candidate_assessments (user_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_assessments_candidate_id ON candidate_assessments (candidate_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_assessments_job_id ON candidate_assessments (job_id)").execute();
        console.log("[migration-1710000002] candidate_assessments indexes created");
    } catch (err) {
        console.log("[migration-1710000002] candidate_assessments indexes notice:", err);
    }

    // 4. Pastikan createRule diperketat untuk mencegah IDOR dan eskalasi hak akses
    try {
        const assessmentColl = app.findCollectionByNameOrId("candidate_assessments");
        if (assessmentColl) {
            assessmentColl.createRule = "@request.auth.role = 'admin'";
            app.save(assessmentColl);
            console.log("[migration-1710000002] candidate_assessments createRule locked to admin");
        }
    } catch (err) {
        console.log("[migration-1710000002] candidate_assessments collection not yet present, will be set on creation");
    }

    try {
        const bookingsColl = app.findCollectionByNameOrId("consultation_bookings");
        if (bookingsColl) {
            bookingsColl.createRule = "@request.auth.role = 'admin' || (@request.auth.id != '' && @request.auth.id = user_id)";
            app.save(bookingsColl);
            console.log("[migration-1710000002] consultation_bookings createRule locked to owner/admin");
        }
    } catch (err) {
        console.log("[migration-1710000002] consultation_bookings collection note:", err);
    }

    try {
        const appsColl = app.findCollectionByNameOrId("job_applications");
        if (appsColl) {
            appsColl.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'candidate' && candidate_id.user_id = @request.auth.id)";
            app.save(appsColl);
            console.log("[migration-1710000002] job_applications createRule locked to owner/admin");
        }
    } catch (err) {
        console.log("[migration-1710000002] job_applications collection note:", err);
    }

    try {
        const jobsColl = app.findCollectionByNameOrId("job_postings");
        if (jobsColl) {
            jobsColl.createRule = "@request.auth.role = 'admin' || (@request.auth.role = 'employer' && employer_id.user_id = @request.auth.id)";
            app.save(jobsColl);
            console.log("[migration-1710000002] job_postings createRule locked to owner/admin");
        }
    } catch (err) {
        console.log("[migration-1710000002] job_postings collection note:", err);
    }
}, (app) => {
    try {
        app.db().newQuery("DROP INDEX IF EXISTS idx_job_app_job_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_job_app_candidate_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_job_app_status").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_job_app_composite").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_bookings_user_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_bookings_service_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_bookings_pay_status").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_bookings_unique_code").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_assessments_user_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_assessments_candidate_id").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_assessments_job_id").execute();
    } catch (err) {
        console.log("[migration-1710000002] rollback notice:", err);
    }
});
