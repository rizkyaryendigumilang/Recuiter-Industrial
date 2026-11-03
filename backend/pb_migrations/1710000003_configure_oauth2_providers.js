/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
    try {
        const users = app.findCollectionByNameOrId("users");
        if (!users) return;

        users.oauth2.enabled = true;

        const getEnvVal = (key) => {
            try {
                if (typeof $os !== "undefined" && $os.getenv) {
                    const val = $os.getenv(key);
                    if (val) return val;
                }
            } catch (_) {}
            try {
                if (typeof process !== "undefined" && process.env && process.env[key]) {
                    return process.env[key];
                }
            } catch (_) {}
            return "";
        };

        const googleClientId = getEnvVal("GOOGLE_CLIENT_ID");
        const googleClientSecret = getEnvVal("GOOGLE_CLIENT_SECRET");
        const githubClientId = getEnvVal("GITHUB_CLIENT_ID");
        const githubClientSecret = getEnvVal("GITHUB_CLIENT_SECRET");

        const providers = users.oauth2.providers || [];

        // 1. Google Provider Config
        if (googleClientId && googleClientSecret) {
            const gIdx = providers.findIndex((p) => p && p.name === "google");
            const gConfig = {
                name: "google",
                clientId: googleClientId,
                clientSecret: googleClientSecret,
                displayName: "Google",
            };
            if (gIdx >= 0) {
                providers[gIdx] = Object.assign(providers[gIdx], gConfig);
            } else {
                providers.push(gConfig);
            }
        }

        // 2. GitHub Provider Config
        if (githubClientId && githubClientSecret) {
            const ghIdx = providers.findIndex((p) => p && p.name === "github");
            const ghConfig = {
                name: "github",
                clientId: githubClientId,
                clientSecret: githubClientSecret,
                displayName: "GitHub",
            };
            if (ghIdx >= 0) {
                providers[ghIdx] = Object.assign(providers[ghIdx], ghConfig);
            } else {
                providers.push(ghConfig);
            }
        }

        users.oauth2.providers = providers;
        app.save(users);
        console.log("[migration] users OAuth2 providers checked and saved successfully");
    } catch (e) {
        console.log("[migration] users OAuth2 config warning:", e);
    }
});
