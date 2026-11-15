import { NextRequest, NextResponse } from 'next/server';
import {
  type WebhookEventData,
  buildWebhookPayload,
  verifyWebhookSignature,
} from '@/lib/webhook-dispatcher';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

export { buildWebhookPayload, verifyWebhookSignature, type WebhookEventData };

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting untuk webhook endpoint (max 60 req/min per IP)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`webhook_status:${clientIp}`, 60, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan webhook. Harap tunggu sebentar.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } }
      );
    }

    const secret =
      process.env.WEBHOOK_SIGNING_SECRET ||
      (process.env.NODE_ENV !== 'production' ? 'dev_webhook_secret_local' : '');

    if (!secret) {
      return NextResponse.json(
        { error: 'Server misconfiguration: WEBHOOK_SIGNING_SECRET belum dikonfigurasi di server.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { event, data, signature } = body;

    if (!data || !signature) {
      return NextResponse.json(
        { error: 'Payload tidak lengkap: data dan signature diperlukan.' },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(data, signature, secret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Verifikasi tanda tangan webhook gagal atau kedaluwarsa.' },
        { status: 401 }
      );
    }

    // Process notification dispatch based on status change
    console.log(`[Webhook] Event diproses: ${event} untuk Kandidat ${data.candidate_name || data.candidate_email} -> ${data.new_status}`);

    return NextResponse.json({
      success: true,
      event,
      processed_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error handling notification webhook:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error processing webhook' },
      { status: 500 }
    );
  }
}
