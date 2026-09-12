import { apiError, fail, ok } from '@/lib/api';
import { isBotRequest } from '@/lib/bot';
import { db } from '@/lib/db';
import { sendEnquiryMail } from '@/lib/notify';
import { rateLimit } from '@/lib/ratelimit';
import { assertModule } from '@/lib/tier';
import { demoPublicSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** [PRO] Public "Book a Demo" form (PRD §6.3). */
export async function POST(req: Request) {
  try {
    assertModule('demos');

    if (isBotRequest(req.headers.get('user-agent'))) return ok({ ok: true });

    if (!(await rateLimit('demo'))) {
      return fail('You have already booked a slot. Please call us to change it.', 429);
    }

    const data = demoPublicSchema.parse(await req.json());
    if (data.website) return ok({ ok: true });

    const booking = await db.demoBooking.create({
      data: {
        studentName: data.studentName,
        phone: data.phone,
        email: data.email,
        course: data.course,
        date: new Date(data.date),
        mode: data.mode,
        notes: data.notes,
        branchId: data.branchId || null,
      },
    });

    // A demo request is also a lead — it should show up in the CRM pipeline.
    await db.enquiry.create({
      data: {
        name: data.studentName,
        phone: data.phone,
        email: data.email,
        course: data.course,
        message: `Demo requested for ${booking.date.toDateString()} (${data.mode}).`,
        source: 'WEBSITE',
        stage: 'DEMO',
        branchId: data.branchId || null,
      },
    });

    void sendEnquiryMail({
      subject: `Demo booking — ${booking.studentName}`,
      text: [
        `Student: ${booking.studentName}`,
        `Phone:   ${booking.phone}`,
        `Course:  ${booking.course || '—'}`,
        `When:    ${booking.date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
        `Mode:    ${booking.mode}`,
        booking.notes ? `\n${booking.notes}` : '',
      ].join('\n'),
    });

    return ok({ ok: true, id: booking.id });
  } catch (err) {
    return apiError(err);
  }
}
