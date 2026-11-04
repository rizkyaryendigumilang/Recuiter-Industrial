/**
 * Shared Social & Telegram Authentication Helper
 */

export async function triggerTelegramAuth(
  loginWithTelegram: (data: Record<string, any>) => Promise<void>,
  isEn: boolean
): Promise<void> {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  if (botName && typeof window !== 'undefined') {
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${botName}&origin=${encodeURIComponent(window.location.origin)}&request_access=write`;
    window.open(authUrl, 'telegram_auth', 'width=550,height=470');
    return;
  }

  const promptMsg = isEn
    ? 'Enter your Telegram Username or ID to test Telegram auth:'
    : 'Masukkan Username atau ID Telegram untuk pengujian autentikasi:';
  const testTgId = typeof window !== 'undefined' ? prompt(promptMsg, 'telegram_user') : null;
  if (!testTgId) return;

  await loginWithTelegram({
    id: testTgId.replace(/[^a-zA-Z0-9_]/g, '') || '12345678',
    first_name: testTgId,
    username: testTgId,
    auth_date: Math.floor(Date.now() / 1000),
  });
}
