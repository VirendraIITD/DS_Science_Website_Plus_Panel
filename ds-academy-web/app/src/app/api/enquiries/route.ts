import { apiError, fail, ok } from '@/lib/api';
import { isBotRequest } from '@/lib/bot';
import { db } from '@/lib/db';
import { sendEnquiryMail } from '@/lib/notify';
import { rateLimit } from '@/lib/ratelimit';
import { enquiryPublicSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public enquiry form (PRD §8, §12).
 * The lead is stored first and notified second — a mail outage must never cost
 * the institute an admission.
 */
export async function POST(req: Request) {
  try {
    // A real parent always submits from a browser — scripted clients never
    // legitimately hit this endpoint, so this is safe on top of the honeypot.
    if (isBotRequest(req.headers.get('user-agent'))) return ok({ ok: true });

    if (!(await rateLimit('enquiry'))) {
      return fail('You have sent several enquiries already. Please call us instead.', 429);
    }

    const body = await req.json();
    const data = enquiryPublicSchema.parse(body);

    // Honeypot: only a bot fills a field that is visually hidden.
    if (data.website) return ok({ ok: true });

    const source = body?.source === 'WHATSAPP' ? 'WHATSAPP' : 'WEBSITE';

    const lead = await db.enquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        course: data.course,
        classOf: data.classOf,
        city: data.city,
        message: data.message,
        source,
      },
    });

    void sendEnquiryMail({
      subject: `New enquiry — ${lead.name} (${lead.course || 'General'})`,
      text: [
        `Name:    ${lead.name}`,
        `Phone:   ${lead.phone}`,
        `Email:   ${lead.email || '—'}`,
        `Course:  ${lead.course || '—'}`,
        `Class:   ${lead.classOf || '—'}`,
        `City:    ${lead.city || '—'}`,
        '',
        lead.message || '(no message)',
      ].join('\n'),
    });

    return ok({ ok: true, id: lead.id });
  } catch (err) {
    return apiError(err);
  }
}
