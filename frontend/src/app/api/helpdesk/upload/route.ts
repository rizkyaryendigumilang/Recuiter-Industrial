import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';
import { saveUploadedFile } from '@/lib/storage-adapter';

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting: max 10 uploads per 5 minutes per IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`helpdesk_upload:${clientIp}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak permintaan upload. Harap tunggu ${rateCheck.retryAfterSeconds} detik lagi.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string' || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file gambar yang diunggah' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Ukuran foto melebihi batas maksimal 5MB' },
        { status: 400 }
      );
    }

    const mimeType = file.type || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Harap gunakan format PNG, JPG, WEBP, atau GIF' },
        { status: 400 }
      );
    }

    const ext = EXTENSION_MAP[mimeType] || 'jpg';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const filename = `problem_${timestamp}_${randomHex}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save using decoupled Storage Adapter (S3/R2 or Local disk fallback)
    const storageResult = await saveUploadedFile(buffer, filename, mimeType, 'helpdesk');
    if (!storageResult.success) {
      throw new Error(storageResult.error || 'Gagal menyimpan foto kendala');
    }

    const relativeUrl = storageResult.url;

    // Build absolute URL using request headers
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const fullUrl = relativeUrl.startsWith('http') ? relativeUrl : `${proto}://${host}${relativeUrl}`;

    return NextResponse.json({
      success: true,
      filename,
      url: relativeUrl,
      fullUrl,
      provider: storageResult.provider,
    });
  } catch (err: any) {
    console.error('Error uploading helpdesk screenshot:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Terjadi kesalahan server saat mengunggah foto',
      },
      { status: 500 }
    );
  }
}
