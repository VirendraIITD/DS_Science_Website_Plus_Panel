import { apiError, fail, ok } from '@/lib/api';
import { hashPassword, requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertModule } from '@/lib/tier';
import { staffSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    assertModule('staff');
    const actor = await requirePermission('staff');

    const data = staffSchema.parse(await req.json());

    // Never let the last active Super Admin lock everyone out.
    if (data.role !== 'SUPER_ADMIN' || !data.active) {
      const others = await db.adminUser.count({
        where: { role: 'SUPER_ADMIN', active: true, id: { not: params.id } },
      });
      if (others === 0) {
        return fail('This is the last active Super Admin — keep the role and access enabled.', 409);
      }
    }

    // Only one account may hold Counselling access at a time.
    if (data.counsellingAccess) {
      const holder = await db.adminUser.findFirst({
        where: { counsellingAccess: true, id: { not: params.id } },
      });
      if (holder) {
        return fail(
          `Only one account can have Counselling access — remove it from ${holder.name} first, then assign this one.`,
          409,
        );
      }
    }

    const row = await db.adminUser.update({
      where: { id: params.id },
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        active: data.active,
        counsellingAccess: data.counsellingAccess,
        // Blank password on edit = leave the current one alone.
        ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
      },
      select: { id: true, name: true, email: true, role: true, active: true, counsellingAccess: true },
    });

    // Deactivating someone should sign them out immediately.
    if (!data.active) await db.session.deleteMany({ where: { userId: params.id } });

    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: 'update',
        resource: 'staff',
        recordId: row.id,
        detail: `${row.name} (${row.role})`,
      },
    });

    return ok({ row });
  } catch (err) {
    return apiError(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    assertModule('staff');
    const actor = await requirePermission('staff');

    if (actor.id === params.id) return fail('You cannot delete your own account.', 409);

    const target = await db.adminUser.findUnique({ where: { id: params.id } });
    if (!target) return fail('That account no longer exists.', 404);

    if (target.role === 'SUPER_ADMIN') {
      const others = await db.adminUser.count({
        where: { role: 'SUPER_ADMIN', active: true, id: { not: params.id } },
      });
      if (others === 0) return fail('This is the last Super Admin and cannot be deleted.', 409);
    }

    await db.adminUser.delete({ where: { id: params.id } });

    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: 'delete',
        resource: 'staff',
        recordId: params.id,
        detail: target.name,
      },
    });

    return ok();
  } catch (err) {
    return apiError(err);
  }
}
