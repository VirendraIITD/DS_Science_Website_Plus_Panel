import 'server-only';

/**
 * Outbound notifications (PRD §8).
 *
 * Email goes through nodemailer, which is an *optional* dependency: if it is
 * not installed, or SMTP_HOST is blank, the call is a no-op and the enquiry is
 * still saved. The institute never loses a lead because mail is misconfigured.
 */

type Mail = { subject: string; text: string; to?: string };

export async function sendEnquiryMail({ subject, text, to }: Mail): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const recipient = to || process.env.ENQUIRY_NOTIFY_TO;
  if (!host || !recipient) return false;

  try {
    const nodemailer = await loadNodemailer();
    if (!nodemailer) return false;

    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    await transport.sendMail({
      from: process.env.SMTP_FROM || 'DS Science Academy <no-reply@localhost>',
      to: recipient,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.error('[notify] email failed:', err);
    return false;
  }
}

/**
 * nodemailer is optional. `npm i nodemailer` turns email on; without it the
 * app runs fine and this resolves to null.
 */
async function loadNodemailer(): Promise<any | null> {
  try {
    // Indirect specifier so the bundler does not try to resolve it at build time.
    const id = 'nodemailer';
    return await import(/* webpackIgnore: true */ id);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// [PRO] Broadcast gateway
// ---------------------------------------------------------------------------

export type BroadcastResult = { sent: number; failed: number; simulated: boolean; error?: string };

/**
 * Sends one message to many numbers through a generic HTTP gateway. With no
 * provider configured it returns `simulated: true` — the panel records the
 * broadcast and shows what *would* have gone out, which is what the institute
 * needs before their WhatsApp Business account is approved.
 */
export async function sendBroadcast(
  channel: 'WHATSAPP' | 'SMS',
  numbers: string[],
  message: string,
): Promise<BroadcastResult> {
  const url = process.env.BROADCAST_API_URL;
  const key = process.env.BROADCAST_API_KEY;

  if (process.env.BROADCAST_PROVIDER !== 'http' || !url || !key) {
    return { sent: 0, failed: 0, simulated: true };
  }

  let sent = 0;
  let failed = 0;
  let error: string | undefined;

  for (const to of numbers) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          channel: channel.toLowerCase(),
          to,
          sender: process.env.BROADCAST_SENDER_ID || undefined,
          message,
        }),
      });
      if (res.ok) sent++;
      else {
        failed++;
        error ||= `Gateway returned ${res.status}`;
      }
    } catch (err) {
      failed++;
      error ||= err instanceof Error ? err.message : 'Network error';
    }
  }

  return { sent, failed, simulated: false, error };
}
