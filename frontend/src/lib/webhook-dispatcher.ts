import crypto from 'node:crypto';

export interface WebhookEventData {
  event: string;
  application_id?: string;
  job_title?: string;
  candidate_name?: string;
  candidate_email?: string;
  previous_status?: string;
  new_status?: string;
  timestamp: number;
  [key: string]: any;
}

export function buildWebhookPayload(data: WebhookEventData, secret: string) {
  const payloadString = JSON.stringify(data);
  const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
  return {
    event: data.event,
    data,
    signature,
  };
}

export function verifyWebhookSignature(
  data: Record<string, any>,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret || !data) return false;

  // Replay attack prevention: Max 5 minutes (300 seconds)
  const now = Math.floor(Date.now() / 1000);
  if (data.timestamp && Math.abs(now - Number(data.timestamp)) > 300) {
    return false;
  }

  const payloadString = JSON.stringify(data);
  const expectedSignature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');

  const bufActual = Buffer.from(signature);
  const bufExpected = Buffer.from(expectedSignature);

  if (bufActual.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufActual, bufExpected);
}
