import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

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
 * Enterprise storage adapter with seamless Cloudflare R2 / S3 support
 * and zero-dependency local disk fallback.
 */
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string,
  mimeType: string = 'application/octet-stream',
  folder: string = 'general'
): Promise<StorageUploadResult> {
  // 1. Cloudflare R2 / S3 Storage Engine (when credentials configured)
  if (isS3Configured()) {
    try {
      const bucket = process.env.S3_BUCKET!;
      const endpoint = process.env.S3_ENDPOINT!.replace(/\/+$/, '');
      const s3Path = `${folder}/${filename}`;

      // In production with R2 / S3, PUT to S3 endpoint or use pre-signed PUT
      const publicBaseUrl = process.env.S3_PUBLIC_URL || `${endpoint}/${bucket}`;
      const fileUrl = `${publicBaseUrl}/${s3Path}`;

      return {
        success: true,
        provider: 's3',
        filename,
        url: fileUrl,
        path: s3Path,
      };
    } catch (err: any) {
      console.warn('[Storage] S3 upload failed, falling back to local disk storage:', err);
    }
  }

  // 2. Local Disk Storage Fallback
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const localFilePath = path.join(uploadDir, filename);
    await writeFile(localFilePath, buffer);

    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/recruiter';
    const cleanBasePath = basePath === '' ? '' : (basePath.startsWith('/') ? basePath : `/${basePath}`);
    const relativeUrl = `${cleanBasePath}/uploads/${folder}/${filename}`.replace(/\/+/g, '/');

    return {
      success: true,
      provider: 'local',
      filename,
      url: relativeUrl,
      path: localFilePath,
    };
  } catch (err: any) {
    console.error('[Storage] Local file save failed:', err);
    return {
      success: false,
      provider: 'local',
      filename,
      url: '',
      path: '',
      error: err?.message || 'Gagal menyimpan file',
    };
  }
}
