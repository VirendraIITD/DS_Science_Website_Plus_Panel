import { apiError, fail, ok } from '@/lib/api';
import { isBotRequest } from '@/lib/bot';
import { db } from '@/lib/db';
import { sendEnquiryMail } from '@/lib/notify';
import { rateLimit } from '@/lib/ratelimit';
import { saveUpload } from '@/lib/upload';
import { careerApplyPublicSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Public Careers "Apply now" form — records a lead and, if attached, the CV. */
export async function POST(req: Request) {
  try {
    if (isBotRequest(req.headers.get('user-agent'))) return ok({ ok: true });

    if (!(await rateLimit('career-apply'))) {
      return fail('You have already applied recently. We will call you back — no need to resend.', 429);
    }

    const form = await req.formData();
    const data = careerApplyPublicSchema.parse({
      name: form.get('name'),
      phone: form.get('phone'),
      email: form.get('email'),
      position: form.get('position'),
      experience: form.get('experience'),
      website: form.get('website'),
    });

    if (data.website) return ok({ ok: true });

    let cvLine = '';
    const cv = form.get('cv');
    if (cv instanceof File && cv.size > 0) {
      const saved = await saveUpload(cv, 'file');
      cvLine = `\nCV: ${saved.url}`;
    }

    const lead = await db.enquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        course: data.position ? `Career: ${data.position}` : 'Career application',
        message: [data.experience ? `Experience: ${data.experience}` : '', cvLine].filter(Boolean).join('\n'),
        source: 'WEBSITE',
      },
    });

    void sendEnquiryMail({
      subject: `Job application — ${lead.name} (${data.position || 'General'})`,
      text: [
        `Name:       ${lead.name}`,
        `Phone:      ${lead.phone}`,
        `Email:      ${lead.email || '—'}`,
        `Position:   ${data.position || '—'}`,
        `Experience: ${data.experience || '—'}`,
        cvLine ? cvLine.trim() : 'CV: not attached',
      ].join('\n'),
    });

    return ok({ ok: true, id: lead.id });
  } catch (err) {
    return apiError(err);
  }
}
