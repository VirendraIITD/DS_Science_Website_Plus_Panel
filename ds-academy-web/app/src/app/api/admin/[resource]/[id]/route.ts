import { revalidateTag } from 'next/cache';

import { apiError, fail, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { CONTENT_TAG } from '@/lib/cache';
import { db } from '@/lib/db';
import { delegate, ensureSlug, getResource, type ResourceDef } from '@/lib/resources';
import { assertModule } from '@/lib/tier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { resource: string; id: string } };

async function guard(name: string): Promise<{ def: ResourceDef; userId: string } | Response> {
  const def = getResource(name);
  if (!def) return fail(`Unknown resource "${name}".`, 404);

  if (def.module) assertModule(def.module);
  const user = await requirePermission(def.permission);

  return { def, userId: user.id };
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const g = await guard(params.resource);
    if (g instanceof Response) return g;

    const row = await delegate(g.def).findUnique({ where: { id: params.id } });
    if (!row) return fail('Not found.', 404);

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const g = await guard(params.resource);
    if (g instanceof Response) return g;

    const parsed = g.def.schema.parse(await req.json()) as Record<string, unknown>;
    const data = await ensureSlug(g.def, parsed, params.id);

    const row = await delegate(g.def).update({ where: { id: params.id }, data });

    await db.auditLog.create({
      data: {
        userId: g.userId,
        action: 'update',
        resource: params.resource,
        recordId: params.id,
        detail: g.def.label,
      },
    });

    revalidateTag(CONTENT_TAG);

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const g = await guard(params.resource);
    if (g instanceof Response) return g;

    await delegate(g.def).delete({ where: { id: params.id } });

    await db.auditLog.create({
      data: {
        userId: g.userId,
        action: 'delete',
        resource: params.resource,
        recordId: params.id,
        detail: g.def.label,
      },
    });

    revalidateTag(CONTENT_TAG);

    return ok();
  } catch (err) {
    return apiError(err);
  }
}
