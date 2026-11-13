import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt a buffer with AES-256-GCM using a password.
 * Format: [16 bytes salt][16 bytes IV][16 bytes Auth Tag][Ciphertext]
 */
export function encryptBackupBuffer(buffer, passphrase) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive 32-byte key using scrypt
  const key = crypto.scryptSync(passphrase, salt, 32);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, ciphertext]);
}

/**
 * Decrypt a buffer previously encrypted with encryptBackupBuffer.
 */
export function decryptBackupBuffer(encryptedBuffer, passphrase) {
  if (encryptedBuffer.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH) {
    throw new Error('Encrypted buffer is too short to be valid.');
  }

  const salt = encryptedBuffer.subarray(0, SALT_LENGTH);
  const iv = encryptedBuffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedBuffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = crypto.scryptSync(passphrase, salt, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/**
 * Generate cryptographic manifest for backup snapshot.
 */
export function generateBackupManifest(backupId, buffer, isEncrypted = false) {
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  return {
    backup_id: backupId,
    timestamp: new Date().toISOString(),
    is_encrypted: isEncrypted,
    cipher: isEncrypted ? ALGORITHM : 'none',
    size_bytes: buffer.length,
    sha256_checksum: hash,
  };
}
