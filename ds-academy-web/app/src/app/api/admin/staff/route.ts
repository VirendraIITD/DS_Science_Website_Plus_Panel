import { apiError, fail, ok } from '@/lib/api';
import { hashPassword, requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { assertModule } from '@/lib/tier';
import { staffSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Staff accounts are not part of the generic resource route: passwords must be
 * hashed, never returned, and a blank password on edit means "keep the
 * existing one" (PRD §7.2 RBAC).
 */
export async function POST(req: Request) {
  try {
    assertModule('staff');
    const actor = await requirePermission('staff');

    const data = staffSchema.parse(await req.json());
    if (!data.password) return fail('A password is required for a new staff account.', 422, {
      fields: { password: 'Set an initial password' },
    });

    // Only one account may hold Counselling access at a time.
    if (data.counsellingAccess) {
      const holder = await db.adminUser.findFirst({ where: { counsellingAccess: true } });
      if (holder) {
        return fail(
          `Only one account can have Counselling access — remove it from ${holder.name} first, then assign this one.`,
          409,
        );
      }
    }

    const row = await db.adminUser.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        role: data.role,
        active: data.active,
        counsellingAccess: data.counsellingAccess,
        passwordHash: await hashPassword(data.password),
      },
      select: { id: true, name: true, email: true, role: true, active: true, counsellingAccess: true },
    });

    await db.auditLog.create({
      data: {
        userId: actor.id,
        action: 'create',
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
