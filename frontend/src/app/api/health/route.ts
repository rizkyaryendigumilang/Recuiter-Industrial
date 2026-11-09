import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8093';
  let pbStatus = 'unknown';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const pbRes = await fetch(`${pbUrl}/api/health`, {
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (pbRes && pbRes.ok) {
      pbStatus = 'healthy';
    } else {
      pbStatus = 'unreachable_or_offline';
    }
  } catch {
    pbStatus = 'check_error';
  }

  const payload = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      web: 'healthy',
      pocketbase: pbStatus,
    },
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
    },
  });
}
