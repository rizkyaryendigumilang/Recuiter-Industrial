import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter';

// Verifikasi hash Telegram sesuai dokumentasi resmi Telegram Login Widget:
// https://core.telegram.org/widgets/login#checking-authorization
function verifyTelegramAuth(data: Record<string, any>, botToken: string): boolean {
  if (!botToken) return false;

  const { hash, ...dataToCheck } = data;
  if (!hash) return false;

  // Urutkan key secara alfabetis dan gabungkan dengan format key=value\n
  const checkString = Object.keys(dataToCheck)
    .sort()
    .map((k) => `${k}=${dataToCheck[k]}`)
    .join('\n');

  // Secret key = SHA256 dari BOT_TOKEN
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // Hitung HMAC-SHA256 dari checkString menggunakan secretKey
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  // Waktu auth tidak boleh lebih lama dari 24 jam (86400 detik)
  const now = Math.floor(Date.now() / 1000);
  if (data.auth_date && now - Number(data.auth_date) > 86400) {
    return false;
  }

  return calculatedHash === hash;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 10 auth requests per 5 minutes per IP
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`telegram_auth:${clientIp}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan autentikasi. Harap tunggu ${rateCheck.retryAfterSeconds} detik lagi.` },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const { id, first_name, username, photo_url, auth_date, hash } = body;

    if (!id) {
      return NextResponse.json({ error: 'Telegram ID diperlukan' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const isDevOrTest = process.env.NODE_ENV !== 'production' || !botToken;

    // Jika botToken terisi, lakukan verifikasi kriptografi HMAC-SHA256
    if (botToken) {
      const isValid = verifyTelegramAuth({ id, first_name, username, photo_url, auth_date, hash }, botToken);
      if (!isValid) {
        return NextResponse.json({ error: 'Validasi hash Telegram gagal atau kedaluwarsa' }, { status: 401 });
      }
    } else if (!isDevOrTest) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN belum dikonfigurasi di server' }, { status: 500 });
    }

    const pbUrl = process.env.PB_INTERNAL_URL || process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8093';
    const email = `tg_${id}@telegram.user`;

    // Derivasi kredensial aman dengan HMAC-SHA256 (tahan brute-force / non-predictable)
    const derivedSecret = botToken
      ? crypto.createHmac('sha256', botToken).update(`tg_user_${id}`).digest('hex').slice(0, 24)
      : 'demo1234';
    const securePassword = `Tg@${id}#${derivedSecret}`;
    const legacyPassword = `Tg@${id}#${botToken ? botToken.slice(0, 8) : 'demo1234'}`;

    // 1. Coba login dengan kredensial aman HMAC
    let authRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: email, password: securePassword }),
    });

    let isNewUser = false;

    // 2. Jika gagal login secure, coba kredensial legacy untuk akun pengguna lama
    if (!authRes.ok) {
      const legacyAuthRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: legacyPassword }),
      });

      if (legacyAuthRes.ok) {
        // Upgrade password ke secure HMAC secara seamless di background
        const legacyData = await legacyAuthRes.json();
        try {
          await fetch(`${pbUrl}/api/collections/users/records/${legacyData.record.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: legacyData.token,
            },
            body: JSON.stringify({
              password: securePassword,
              passwordConfirm: securePassword,
              oldPassword: legacyPassword,
            }),
          });
        } catch (upgradeErr) {
          console.warn('Auto-upgrade to secure Telegram password deferred:', upgradeErr);
        }

        authRes = legacyAuthRes;
      }
    }

    // 3. Jika belum pernah terdaftar sama sekali, buat user baru dengan secure password
    if (!authRes.ok) {
      const createRes = await fetch(`${pbUrl}/api/collections/users/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: securePassword,
          passwordConfirm: securePassword,
          name: [first_name, username ? `(@${username})` : ''].filter(Boolean).join(' '),
          emailVisibility: true,
          role: '', // Kosong agar memicu dialog pemilihan peran kandidat / employer
        }),
      });

      if (!createRes.ok) {
        const createErr = await createRes.text();
        console.error('Failed to create Telegram user record in PocketBase:', createErr);
        return NextResponse.json({ error: 'Gagal membuat akun PocketBase untuk pengguna Telegram' }, { status: 500 });
      }

      isNewUser = true;

      // Login setelah akun dibuat
      authRes = await fetch(`${pbUrl}/api/collections/users/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: securePassword }),
      });
    }

    if (!authRes.ok) {
      return NextResponse.json({ error: 'Autentikasi PocketBase gagal untuk pengguna Telegram' }, { status: 500 });
    }

    const authData = await authRes.json();

    return NextResponse.json({
      token: authData.token,
      record: authData.record,
      isNewUser: isNewUser || !authData.record.role,
    });
  } catch (err: any) {
    console.error('Telegram auth API error:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan pada autentikasi Telegram' }, { status: 500 });
  }
}
