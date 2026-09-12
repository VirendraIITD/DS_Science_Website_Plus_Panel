import { apiError, fail, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { csvColumnIndex, parseCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { phoneSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ROWS = 5_000;

/**
 * Bulk-loads leads that came in from outside the website (a coaching fair
 * sign-up sheet, a purchased list, an old spreadsheet, etc). Every row is
 * force-tagged `source: IMPORT` regardless of what the CSV itself says, so
 * it's never confused with a real website submission in the CRM/analytics.
 */
export async function POST(req: Request) {
  try {
    const user = await requirePermission('enquiries');

    const { csv } = await req.json();
    if (typeof csv !== 'string' || csv.trim().length < 10) {
      return fail('Paste the CSV contents first.', 422);
    }

    const rows = parseCsv(csv.trim());
    if (rows.length < 2) return fail('The file needs a header row and at least one data row.', 422);

    const header = rows[0];
    const idx = (...names: string[]) => csvColumnIndex(header, ...names);

    const cols = {
      name: idx('name', 'studentname', 'fullname'),
      phone: idx('phone', 'mobile', 'phonenumber', 'mobilenumber'),
      email: idx('email'),
      course: idx('course', 'interestedin'),
      classOf: idx('class', 'classof'),
      city: idx('city'),
      message: idx('message', 'notes', 'remark', 'remarks'),
    };

    if (cols.name === -1) return fail('The CSV is missing a "name" column.', 422);
    if (cols.phone === -1) return fail('The CSV is missing a "phone" column.', 422);

    const body = rows.slice(1, MAX_ROWS + 1);
    const parsed: { name: string; phone: string; email: string; course: string; classOf: string; city: string; message: string }[] = [];
    let skipped = 0;

    for (const r of body) {
      const at = (i: number) => (i === -1 ? '' : (r[i] ?? '').trim());
      const name = at(cols.name);
      const phone = at(cols.phone);

      if (!name || !phoneSchema.safeParse(phone).success) {
        skipped++;
        continue;
      }

      parsed.push({
        name,
        phone,
        email: at(cols.email),
        course: at(cols.course),
        classOf: at(cols.classOf),
        city: at(cols.city),
        message: at(cols.message),
      });
    }

    if (parsed.length === 0) {
      return fail('No usable rows found — check the name/phone columns and the phone values.', 422);
    }

    const created = await db.enquiry.createMany({
      data: parsed.map((p) => ({ ...p, source: 'IMPORT' as const })),
    });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'import',
        resource: 'enquiries',
        detail: `${created.count} lead(s) imported${skipped ? `, ${skipped} skipped` : ''}`,
      },
    });

    return ok({ imported: created.count, skipped });
  } catch (err) {
    return apiError(err);
  }
}
