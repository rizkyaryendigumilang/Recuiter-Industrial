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

/**
 * Validasi biner magic bytes citra untuk mencegah upload malware terselubung / polyglot
 */
function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (buffer.length < 12) return { valid: false };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38 &&
    (buffer[4] === 0x37 || buffer[4] === 0x39) &&
    buffer[5] === 0x61
  ) {
    return { valid: true, detectedMime: 'image/gif' };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { valid: true, detectedMime: 'image/webp' };
  }

  return { valid: false };
}

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

    const claimedMime = file.type || 'image/jpeg';
    if (!ALLOWED_MIME_TYPES.has(claimedMime)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Harap gunakan format PNG, JPG, WEBP, atau GIF' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Keamanan Biner: Validasi Magic Bytes citra asli (tidak percaya pada header Content-Type klien)
    const magicResult = validateImageMagicBytes(buffer);
    if (!magicResult.valid || !magicResult.detectedMime) {
      return NextResponse.json(
        { success: false, error: 'Format berkas tidak valid: Berkas bukan dokumen gambar asli (Magic bytes tidak cocok).' },
        { status: 400 }
      );
    }

    const finalMime = magicResult.detectedMime;
    const ext = EXTENSION_MAP[finalMime] || 'jpg';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 9);
    const filename = `problem_${timestamp}_${randomHex}.${ext}`;

    // Save using decoupled Storage Adapter (S3/R2 or Local disk fallback)
    const storageResult = await saveUploadedFile(buffer, filename, finalMime, 'helpdesk');
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
