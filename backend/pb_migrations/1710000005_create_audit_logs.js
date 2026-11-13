/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 1710000005: Enterprise Audit Trail & Financial Tamper-Proof Ledger.
 * 
 * Enforces:
 * - Append-only immutable collection `audit_logs`
 * - updateRule = null (updates strictly forbidden)
 * - deleteRule = null (deletions strictly forbidden)
 * - Indexes on actor_id, target_id, and action_type
 */
migrate((app) => {
    const has = (name) => {
        try {
            app.findCollectionByNameOrId(name);
            return true;
        } catch (e) {
            return false;
        }
    };

    if (!has("audit_logs")) {
        const auditCollection = new Collection({
            name: "audit_logs",
            type: "base",
            listRule: "@request.auth.role = 'admin'",
            viewRule: "@request.auth.role = 'admin'",
            createRule: "@request.auth.role = 'admin'",
            updateRule: null, // Strictly immutable - no one can alter audit history
            deleteRule: null, // Strictly immutable - no one can erase audit history
            fields: [
                { name: "actor_id", type: "text", required: true },
                { name: "actor_role", type: "text" },
                { name: "action_type", type: "text", required: true },
                { name: "target_collection", type: "text", required: true },
                { name: "target_id", type: "text", required: true },
                { name: "previous_state", type: "json" },
                { name: "new_state", type: "json" },
                { name: "ip_address", type: "text" },
                { name: "metadata", type: "json" },
            ],
        });
        app.save(auditCollection);
        console.log("[migration-1710000005] audit_logs collection created (Append-Only mode)");
    }

    try {
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs (target_id)").execute();
        app.db().newQuery("CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action_type)").execute();
        console.log("[migration-1710000005] audit_logs performance indexes created");
    } catch (err) {
        console.log("[migration-1710000005] audit indexes notice:", err);
    }
}, (app) => {
    try {
        app.db().newQuery("DROP INDEX IF EXISTS idx_audit_actor").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_audit_target").execute();
        app.db().newQuery("DROP INDEX IF EXISTS idx_audit_action").execute();
        const collection = app.findCollectionByNameOrId("audit_logs");
        if (collection) {
            app.delete(collection);
            console.log("[migration-1710000005] Rollback: audit_logs deleted");
        }
    } catch (err) {
        console.log("[migration-1710000005] Rollback notice:", err);
    }
});
