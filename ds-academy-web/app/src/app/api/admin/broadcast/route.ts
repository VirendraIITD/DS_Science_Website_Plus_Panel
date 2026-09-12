import { apiError, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendBroadcast } from '@/lib/notify';
import { SEGMENTS } from '@/lib/segments';
import { assertModule } from '@/lib/tier';
import { broadcastSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    assertModule('broadcast');
    const user = await requirePermission('broadcast');

    const data = broadcastSchema.parse(await req.json());
    const segment = SEGMENTS[data.segment];
    if (!segment) return apiError(new Error('Unknown segment'));

    const leads = await db.enquiry.findMany({
      where: segment.where,
      select: { phone: true },
    });

    // One message per number, even if a lead enquired twice.
    const numbers = [...new Set(leads.map((l) => l.phone.replace(/\D/g, '')).filter(Boolean))];

    const result = await sendBroadcast(data.channel, numbers, data.message);

    const row = await db.broadcast.create({
      data: {
        channel: data.channel,
        segment: segment.label,
        message: data.message,
        recipients: numbers.length,
        sentCount: result.sent,
        failedCount: result.failed,
        status: result.simulated ? 'SIMULATED' : result.failed > 0 && result.sent === 0 ? 'FAILED' : 'SENT',
        error: result.error ?? '',
        createdById: user.id,
        sentAt: new Date(),
      },
    });

    return ok({
      row,
      simulated: result.simulated,
      recipients: numbers.length,
      message: result.simulated
        ? `Dry run — ${numbers.length} recipient(s) matched. Configure BROADCAST_API_URL to send for real.`
        : `Sent to ${result.sent} of ${numbers.length} recipient(s).`,
    });
  } catch (err) {
    return apiError(err);
  }
}
