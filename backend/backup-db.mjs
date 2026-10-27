/**
 * PocketBase Automated Database Backup & Retention Script
 * 
 * Creates timestamped backups of `data.db`, `auxiliary.db`, and `storage/`
 * Retains the latest 7 backup snapshots to prevent storage bloat.
 * 
 * Usage:
 *   node backend/backup-db.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PB_DATA_DIR = path.resolve(__dirname, 'pb_data');
const BACKUPS_DIR = path.resolve(__dirname, 'backups');
const MAX_BACKUPS_RETAINED = 7;

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function calculateDirSize(dirPath) {
  let totalBytes = 0;
  if (!fs.existsSync(dirPath)) return 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      totalBytes += calculateDirSize(fullPath);
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      totalBytes += stats.size;
    }
  }
  return totalBytes;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function performBackup() {
  console.log('====================================================');
  console.log('   POCKETBASE AUTOMATED BACKUP UTILITY');
  console.log('====================================================');

  if (!fs.existsSync(PB_DATA_DIR)) {
    console.error(`[ERROR] PocketBase data directory not found at: ${PB_DATA_DIR}`);
    process.exit(1);
  }

  // Ensure backups directory exists
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    console.log(`[INFO] Created backups directory: ${BACKUPS_DIR}`);
  }

  const timestamp = getTimestamp();
  const targetDir = path.join(BACKUPS_DIR, `backup_${timestamp}`);
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`[INFO] Created backup target: ${targetDir}`);

  // List of critical targets to copy
  const targets = ['data.db', 'auxiliary.db', 'storage'];
  let filesCopiedCount = 0;

  for (const item of targets) {
    const sourcePath = path.join(PB_DATA_DIR, item);
    const destinationPath = path.join(targetDir, item);

    if (fs.existsSync(sourcePath)) {
      const stats = fs.statSync(sourcePath);
      if (stats.isDirectory()) {
        fs.cpSync(sourcePath, destinationPath, { recursive: true });
        console.log(`  + Copied directory: ${item}/`);
      } else {
        fs.copyFileSync(sourcePath, destinationPath);
        console.log(`  + Copied file: ${item} (${formatBytes(stats.size)})`);
      }
      filesCopiedCount++;
    } else {
      console.log(`  - Skipped (not found): ${item}`);
    }
  }

  const totalBackupSize = calculateDirSize(targetDir);
  console.log(`\n[SUCCESS] Backup completed! Total snapshot size: ${formatBytes(totalBackupSize)}`);

  // Retention management: keep only the latest MAX_BACKUPS_RETAINED
  pruneOldBackups();
}

function pruneOldBackups() {
  const entries = fs.readdirSync(BACKUPS_DIR, { withFileTypes: true });
  const backupFolders = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('backup_'))
    .map((entry) => {
      const fullPath = path.join(BACKUPS_DIR, entry.name);
      const stats = fs.statSync(fullPath);
      return {
        name: entry.name,
        path: fullPath,
        createdTime: stats.ctimeMs,
      };
    })
    .sort((a, b) => b.createdTime - a.createdTime); // descending: newest first

  console.log(`\n[RETENTION] Found ${backupFolders.length} backups. Retaining latest ${MAX_BACKUPS_RETAINED}...`);

  if (backupFolders.length > MAX_BACKUPS_RETAINED) {
    const toDelete = backupFolders.slice(MAX_BACKUPS_RETAINED);
    for (const folder of toDelete) {
      fs.rmSync(folder.path, { recursive: true, force: true });
      console.log(`  x Removed expired backup: ${folder.name}`);
    }
    console.log(`[RETENTION] Pruned ${toDelete.length} older backup(s).`);
  } else {
    console.log(`[RETENTION] No backups need to be pruned.`);
  }

  console.log('====================================================\n');
}

performBackup();
