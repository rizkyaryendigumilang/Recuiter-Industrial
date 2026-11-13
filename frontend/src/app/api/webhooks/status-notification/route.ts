import { NextRequest, NextResponse } from 'next/server';
import {
  type WebhookEventData,
  buildWebhookPayload,
  verifyWebhookSignature,
} from '@/lib/webhook-dispatcher';

export { buildWebhookPayload, verifyWebhookSignature, type WebhookEventData };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data, signature } = body;

    const secret = process.env.WEBHOOK_SIGNING_SECRET || 'recruiter_industrial_webhook_default_secret';

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
