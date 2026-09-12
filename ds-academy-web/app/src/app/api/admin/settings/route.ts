import { revalidateTag } from 'next/cache';

import { apiError, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { CONTENT_TAG } from '@/lib/cache';
import { db } from '@/lib/db';
import { settingsSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const user = await requirePermission('settings');
    const data = settingsSchema.parse(await req.json());

    const row = await db.siteSettings.upsert({
      where: { id: 1 },
      create: { id: 1, ...data },
      update: data,
    });

    await db.auditLog.create({
      data: { userId: user.id, action: 'update', resource: 'settings', detail: 'Site settings' },
    });

    revalidateTag(CONTENT_TAG);

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}
