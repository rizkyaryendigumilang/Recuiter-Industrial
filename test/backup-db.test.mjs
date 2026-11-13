import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Disaster Recovery & Encrypted Remote Backup Test Suite', () => {
  it('encryptBackupBuffer and decryptBackupBuffer round-trip with AES-256-GCM', async () => {
    const { encryptBackupBuffer, decryptBackupBuffer } = await import('../backend/backup-crypto.mjs');

    const originalData = Buffer.from('PocketBase industrial SQLite database binary content mock 1234567890');
    const passphrase = 'SuperSecureIndustrialSecretKey2026!';

    const encrypted = encryptBackupBuffer(originalData, passphrase);
    assert.ok(Buffer.isBuffer(encrypted));
    assert.notDeepEqual(encrypted, originalData, 'Encrypted buffer must differ from plaintext');

    const decrypted = decryptBackupBuffer(encrypted, passphrase);
    assert.deepEqual(decrypted, originalData, 'Decrypted buffer must match original plaintext exactly');
  });

  it('decryptBackupBuffer throws on wrong passphrase or tampered ciphertext', async () => {
    const { encryptBackupBuffer, decryptBackupBuffer } = await import('../backend/backup-crypto.mjs');

    const originalData = Buffer.from('Financial and recruitment sensitive data');
    const passphrase = 'CorrectPassword123';
    const wrongPassphrase = 'WrongPassword456';

    const encrypted = encryptBackupBuffer(originalData, passphrase);

    assert.throws(
      () => decryptBackupBuffer(encrypted, wrongPassphrase),
      /auth|tag|failed|cipher/i,
      'Must reject wrong password'
    );

    // Tamper with payload
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 5] ^= 0xff;

    assert.throws(
      () => decryptBackupBuffer(tampered, passphrase),
      /auth|tag|failed|cipher/i,
      'Must reject tampered ciphertext'
    );
  });

  it('generateBackupManifest computes valid SHA-256 checksum and metadata', async () => {
    const { generateBackupManifest } = await import('../backend/backup-crypto.mjs');

    const sampleBuffer = Buffer.from('Database snapshot content');
    const manifest = generateBackupManifest('backup_20261113_120000', sampleBuffer, true);

    assert.equal(manifest.backup_id, 'backup_20261113_120000');
    assert.equal(manifest.is_encrypted, true);
    assert.equal(typeof manifest.sha256_checksum, 'string');
    assert.equal(manifest.sha256_checksum.length, 64);
    assert.equal(manifest.size_bytes, sampleBuffer.length);
  });
});
