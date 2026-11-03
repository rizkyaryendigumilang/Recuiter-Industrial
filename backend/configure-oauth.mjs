#!/usr/bin/env node
/**
 * Script to automatically configure Google & GitHub OAuth2 providers in PocketBase.
 * Usage:
 *   node backend/configure-oauth.mjs [PB_URL]
 * Example:
 *   node backend/configure-oauth.mjs http://127.0.0.1:8090
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load .env if present
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '.env'),
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, 'pb_migrations', '.env'),
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [k, ...vParts] = trimmed.split('=');
        if (k && vParts.length > 0) {
          const key = k.trim();
          const val = vParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const PB_URL = process.env.PB_URL || process.argv[2] || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@hrtech.id';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@hrtech123';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

async function configureOAuth() {
  console.log('='.repeat(60));
  console.log('  HRTech Recruiter Industrial — OAuth2 Provider Setup');
  console.log(`  Target PocketBase: ${PB_URL}`);
  console.log('='.repeat(60));

  // 1. Login superuser
  console.log('\n[1/3] Login as PocketBase superuser...');
  let loginRes;
  try {
    loginRes = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });

    if (!loginRes.ok) {
      loginRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
      });
    }
  } catch (netErr) {
    console.error(`\n   ✗ Tidak dapat terhubung ke PocketBase di ${PB_URL}`);
    console.error(`     Pastikan PocketBase sudah menyala sebelum menjalankan skrip ini.`);
    console.error(`     Contoh jika di VPS: node backend/configure-oauth.mjs http://127.0.0.1:8090`);
    process.exit(1);
  }

  if (!loginRes.ok) {
    console.error('   ✗ Superuser login failed. Status:', loginRes.status, await loginRes.text());
    console.log('   Pastikan PocketBase berjalan dan kredensial admin valid.');
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log('   ✓ Superuser authenticated!');

  // 2. Fetch users collection
  console.log('\n[2/3] Fetching users collection schema...');
  const collRes = await fetch(`${PB_URL}/api/collections/users`, {
    headers: { Authorization: token },
  });

  if (!collRes.ok) {
    console.error('   ✗ Failed to fetch users collection:', collRes.status, await collRes.text());
    process.exit(1);
  }

  const collection = await collRes.json();
  const oauth2 = collection.oauth2 || { enabled: true, providers: [] };
  oauth2.enabled = true;
  const providers = oauth2.providers || [];

  // Update or insert Google
  const gIdx = providers.findIndex((p) => p && p.name === 'google');
  const googleConfig = {
    name: 'google',
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    displayName: 'Google',
  };
  if (gIdx >= 0) {
    providers[gIdx] = { ...providers[gIdx], ...googleConfig };
  } else {
    providers.push(googleConfig);
  }

  // Update or insert GitHub
  const ghIdx = providers.findIndex((p) => p && p.name === 'github');
  const ghConfig = {
    name: 'github',
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    displayName: 'GitHub',
  };
  if (ghIdx >= 0) {
    providers[ghIdx] = { ...providers[ghIdx], ...ghConfig };
  } else {
    providers.push(ghConfig);
  }

  oauth2.providers = providers;

  // 3. Save updated collection
  console.log('\n[3/3] Saving OAuth2 provider configuration to PocketBase...');
  const patchRes = await fetch(`${PB_URL}/api/collections/users`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ oauth2 }),
  });

  if (!patchRes.ok) {
    console.error('   ✗ Failed to update users collection:', patchRes.status, await patchRes.text());
    process.exit(1);
  }

  console.log('   ✓ Google & GitHub OAuth2 providers successfully enabled and configured!');
  console.log('\nProviders aktif di users collection:');
  providers.forEach((p) => console.log(`   - ${p.displayName || p.name} (Client ID: ${p.clientId.slice(0, 15)}...)`));
  console.log('\n🎉 Selesai! Login Google dan GitHub siap digunakan.');
}

configureOAuth().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
