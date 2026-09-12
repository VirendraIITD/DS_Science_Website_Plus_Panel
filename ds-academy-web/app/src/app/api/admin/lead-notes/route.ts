import { apiError, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertModule } from '@/lib/tier';
import { leadNoteSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    assertModule('crm');
    const user = await requirePermission('crm');

    const data = leadNoteSchema.parse(await req.json());

    const row = await db.leadNote.create({
      data: { enquiryId: data.enquiryId, body: data.body, authorId: user.id },
      include: { author: { select: { name: true } } },
    });

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}
