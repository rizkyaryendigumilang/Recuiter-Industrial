import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

export interface StorageUploadResult {
  success: boolean;
  provider: 'local' | 's3';
  filename: string;
  url: string;
  path: string;
  error?: string;
}

export function isS3Configured(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY
  );
}

/**
 * Sanitasi nama file dan folder untuk mencegah path traversal (OWASP A01 / A04)
 */
function sanitizePathSegment(segment: string, fallback: string): string {
  if (!segment || typeof segment !== 'string') return fallback;
  const base = path.basename(segment);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned.replace(/^\.+/, '') || fallback;
}

/**
 * Helper native AWS SigV4 signer (zero external dependencies)
 */
function createSigV4Headers(
  method: string,
  urlStr: string,
  headers: Record<string, string>,
  payload: Buffer,
  region: string = 'auto',
  service: string = 's3'
): Record<string, string> {
  const url = new URL(urlStr);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);

  const accessKey = process.env.S3_ACCESS_KEY_ID || '';
  const secretKey = process.env.S3_SECRET_ACCESS_KEY || '';

  const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

  const reqHeaders: Record<string, string> = {
    ...headers,
    host: url.host,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  };

  const sortedKeys = Object.keys(reqHeaders).sort();
  const canonicalHeaders = sortedKeys.map((k) => `${k.toLowerCase()}:${reqHeaders[k].trim()}\n`).join('');
  const signedHeaders = sortedKeys.map((k) => k.toLowerCase()).join(';');

  const canonicalRequest = [
    method,
    url.pathname,
    url.search ? url.search.slice(1) : '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  const hmac = (key: crypto.BinaryLike | Buffer, data: string) =>
    crypto.createHmac('sha256', key).update(data).digest();

  const kDate = hmac(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');

  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  reqHeaders['authorization'] =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return reqHeaders;
}

/**
 * Enterprise storage adapter with seamless Cloudflare R2 / S3 support
 * and zero-dependency local disk fallback with path-traversal hardening.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  mimeType: string = 'application/octet-stream',
  folder: string = 'general'
): Promise<StorageUploadResult> {
  const safeFilename = sanitizePathSegment(filename, `file_${Date.now()}`);
  const safeFolder = sanitizePathSegment(folder, 'general');

  // 1. Cloudflare R2 / S3 Storage Engine (when credentials configured)
  if (isS3Configured()) {
    try {
      const bucket = process.env.S3_BUCKET!;
      const endpoint = process.env.S3_ENDPOINT!.replace(/\/+$/, '');
      const s3Path = `${safeFolder}/${safeFilename}`;
      const region = process.env.S3_REGION || 'auto';

      const publicBaseUrl = process.env.S3_PUBLIC_URL || `${endpoint}/${bucket}`;
      const fileUrl = `${publicBaseUrl}/${s3Path}`;
      const targetUploadUrl = `${endpoint}/${bucket}/${s3Path}`;

      const rawHeaders: Record<string, string> = {
        'content-type': mimeType,
        'content-length': String(buffer.length),
      };

      const signedHeaders = createSigV4Headers(
        'PUT',
        targetUploadUrl,
        rawHeaders,
        buffer,
        region,
        's3'
      );

      const s3Response = await fetch(targetUploadUrl, {
        method: 'PUT',
        headers: signedHeaders,
        body: new Uint8Array(buffer),
      });

      if (s3Response.ok) {
        return {
          success: true,
          provider: 's3',
          filename: safeFilename,
          url: fileUrl,
          path: s3Path,
        };
      } else {
        console.warn(`[Storage] S3 upload returned HTTP ${s3Response.status}, falling back to local disk:`, await s3Response.text().catch(() => ''));
      }
    } catch (err: any) {
      console.warn('[Storage] S3 upload failed, falling back to local disk storage:', err);
    }
  }

  // 2. Local Disk Storage Fallback
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', safeFolder);
    await mkdir(uploadDir, { recursive: true });

    const localFilePath = path.join(uploadDir, safeFilename);
    await writeFile(localFilePath, buffer);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';
    const cleanBasePath = basePath === '' ? '' : (basePath.startsWith('/') ? basePath : `/${basePath}`);
    const relativeUrl = `${cleanBasePath}/uploads/${safeFolder}/${safeFilename}`.replace(/\/+/g, '/');

    return {
      success: true,
      provider: 'local',
      filename: safeFilename,
      url: relativeUrl,
      path: localFilePath,
    };
  } catch (err: any) {
    console.error('[Storage] Local file save failed:', err);
    return {
      success: false,
      provider: 'local',
      filename: safeFilename,
      url: '',
      path: '',
      error: err?.message || 'Gagal menyimpan file',
    };
  }
}
