/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration 1710000004: SQLite Enterprise Concurrency & Write-Ahead Logging (WAL) Tuning.
 * 
 * Configures:
 * 1. PRAGMA journal_mode = WAL (enables simultaneous reads and writes without lock contention)
 * 2. PRAGMA busy_timeout = 5000 (waits up to 5 seconds before throwing 'database is locked')
 * 3. PRAGMA synchronous = NORMAL (guarantees durability with significantly reduced disk I/O latency)
 * 4. PRAGMA cache_size = -64000 (allocates 64MB memory page cache for high-frequency candidate queries)
 * 5. PRAGMA temp_store = MEMORY (keeps temporary tables and sorting buffers in RAM)
 */
migrate((app) => {
    try {
        app.db().newQuery("PRAGMA journal_mode = WAL;").execute();
        app.db().newQuery("PRAGMA busy_timeout = 5000;").execute();
        app.db().newQuery("PRAGMA synchronous = NORMAL;").execute();
        app.db().newQuery("PRAGMA cache_size = -64000;").execute();
        app.db().newQuery("PRAGMA temp_store = MEMORY;").execute();
        console.log("[migration-1710000004] SQLite WAL mode and concurrency PRAGMAs successfully applied");
    } catch (err) {
        console.log("[migration-1710000004] SQLite concurrency PRAGMA notice:", err);
    }
}, (app) => {
    try {
        app.db().newQuery("PRAGMA journal_mode = DELETE;").execute();
        app.db().newQuery("PRAGMA synchronous = FULL;").execute();
        console.log("[migration-1710000004] Rollback: restored journal_mode = DELETE");
    } catch (err) {
        console.log("[migration-1710000004] Rollback notice:", err);
    }
});
