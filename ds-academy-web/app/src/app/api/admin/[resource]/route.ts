import { revalidateTag } from 'next/cache';

import { apiError, fail, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { CONTENT_TAG } from '@/lib/cache';
import { db } from '@/lib/db';
import {
  delegate,
  ensureSlug,
  getResource,
  searchWhere,
  type ResourceDef,
} from '@/lib/resources';
import { assertModule } from '@/lib/tier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { resource: string } };

/** Resolves the resource, then enforces tier + role in that order. */
async function guard(name: string): Promise<{ def: ResourceDef; userId: string } | Response> {
  const def = getResource(name);
  if (!def) return fail(`Unknown resource "${name}".`, 404);

  if (def.module) assertModule(def.module);
  const user = await requirePermission(def.permission);

  return { def, userId: user.id };
}

export async function GET(req: Request, { params }: Ctx) {
  try {
    const g = await guard(params.resource);
    if (g instanceof Response) return g;

    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const take = Math.min(Number(url.searchParams.get('take') || 200), 500);

    const rows = await delegate(g.def).findMany({
      where: g.def.where ? { AND: [g.def.where, searchWhere(g.def, q)] } : searchWhere(g.def, q),
      orderBy: g.def.orderBy,
      take,
    });

    return ok({ rows });
  } catch (err) {
    return apiError(err);
  }
}

export async function POST(req: Request, { params }: Ctx) {
  try {
    const g = await guard(params.resource);
    if (g instanceof Response) return g;

    const parsed = g.def.schema.parse(await req.json()) as Record<string, unknown>;
    const data = await ensureSlug(g.def, parsed);

    const row = await delegate(g.def).create({ data });

    await db.auditLog.create({
      data: {
        userId: g.userId,
        action: 'create',
        resource: params.resource,
        recordId: String(row.id),
        detail: g.def.label,
      },
    });

    revalidateTag(CONTENT_TAG);

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}
