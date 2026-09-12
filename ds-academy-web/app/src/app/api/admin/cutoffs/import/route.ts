import { apiError, fail, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { csvColumnIndex, parseCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { assertModule } from '@/lib/tier';
import { cutoffSchema } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ROWS = 20_000;

export async function POST(req: Request) {
  try {
    assertModule('predictor');
    const user = await requirePermission('predictor');

    const { csv, replace } = await req.json();
    if (typeof csv !== 'string' || csv.trim().length < 10) {
      return fail('Paste the CSV contents first.', 422);
    }

    const rows = parseCsv(csv.trim());
    if (rows.length < 2) return fail('The file needs a header row and at least one data row.', 422);

    const header = rows[0];
    const idx = (...names: string[]) => csvColumnIndex(header, ...names);

    const cols = {
      exam: idx('exam'),
      year: idx('year'),
      college: idx('college', 'institute', 'collegename'),
      courseName: idx('coursename', 'course', 'branch'),
      state: idx('state'),
      category: idx('category', 'cat'),
      quota: idx('quota'),
      closingRank: idx('closingrank', 'closing', 'rank', 'cutoff'),
    };

    for (const key of ['exam', 'year', 'college', 'closingRank'] as const) {
      if (cols[key] === -1) return fail(`The CSV is missing a "${key}" column.`, 422);
    }

    const body = rows.slice(1, MAX_ROWS + 1);
    const parsed: Record<string, unknown>[] = [];
    let skipped = 0;

    for (const r of body) {
      const at = (i: number) => (i === -1 ? '' : (r[i] ?? '').trim());
      const candidate = {
        exam: at(cols.exam).toUpperCase(),
        year: at(cols.year),
        college: at(cols.college),
        courseName: at(cols.courseName) || 'MBBS',
        state: at(cols.state),
        category: at(cols.category) || 'General',
        quota: at(cols.quota) || 'All India',
        closingRank: at(cols.closingRank).replace(/[^\d]/g, ''),
      };

      const result = cutoffSchema.safeParse(candidate);
      if (result.success) parsed.push(result.data);
      else skipped++;
    }

    if (parsed.length === 0) {
      return fail('No usable rows found — check the column names and the rank values.', 422);
    }

    // Replacing is scoped to the exam+year pairs present in the file, so a
    // NEET upload never wipes the JEE data.
    if (replace) {
      const pairs = [...new Set(parsed.map((p) => `${p.exam}|${p.year}`))];
      await db.predictorCutoff.deleteMany({
        where: {
          OR: pairs.map((p) => {
            const [exam, year] = p.split('|');
            return { exam, year: Number(year) };
          }),
        },
      });
    }

    const created = await db.predictorCutoff.createMany({ data: parsed as never });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'import',
        resource: 'cutoffs',
        detail: `${created.count} rows${replace ? ' (replaced)' : ''}`,
      },
    });

    return ok({ imported: created.count, skipped });
  } catch (err) {
    return apiError(err);
  }
}
