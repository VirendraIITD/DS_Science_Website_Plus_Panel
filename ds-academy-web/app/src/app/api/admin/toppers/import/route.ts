import { revalidateTag } from 'next/cache';

import { apiError, fail, ok } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { CONTENT_TAG } from '@/lib/cache';
import { csvColumnIndex, parseCsv } from '@/lib/csv';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ROWS = 2_000;

function isYes(v: string) {
  const s = v.trim().toLowerCase();
  return s === 'yes' || s === 'true' || s === '1';
}

/**
 * Results/toppers arrive in bulk after every exam season — this loads a CSV
 * in one go instead of adding each selection one by one through the form.
 * Columns match the spreadsheet the office already works from: Name, Exam,
 * photoUrl, Rank, Category Rank, Year, City/Village, Display Order, Home
 * Page, Visible on website. Column order doesn't matter (matched by header
 * name). Exam is optional — defaults to "NEET-UG" when the sheet doesn't
 * have it. Rank and Category Rank: a row needs at least one of the two
 * filled in (a student can have a category rank with the AIR still pending,
 * or vice versa) — only a row with neither gets skipped. Quote
 * and Story caption are deliberately NOT columns here — those get added per
 * student afterwards through the normal Edit form in the panel, not bulk.
 * Photos can't travel inside a CSV cell, so photoUrl must already be a
 * hosted link (e.g. from the ImageKit bulk-upload tool) — leave it blank to
 * add the photo later via Edit instead.
 */
export async function POST(req: Request) {
  try {
    const user = await requirePermission('toppers');

    const { csv } = await req.json();
    if (typeof csv !== 'string' || csv.trim().length < 10) {
      return fail('Attach a CSV file first.', 422);
    }

    const rows = parseCsv(csv.trim());
    if (rows.length < 2) return fail('The file needs a header row and at least one data row.', 422);

    const header = rows[0];
    const idx = (...names: string[]) => csvColumnIndex(header, ...names);

    const cols = {
      name: idx('name', 'studentname'),
      exam: idx('exam'),
      rankOrScore: idx('rank', 'rankorscore', 'score'),
      categoryRank: idx('categoryrank', 'category rank', 'category'),
      year: idx('year'),
      address: idx('city/village', 'cityvillage', 'city', 'village', 'address'),
      photoUrl: idx('photourl', 'photo'),
      order: idx('displayorder', 'order'),
      featured: idx('homepage', 'featured', 'showonhome'),
      active: idx('visibleonwebsite', 'visible', 'active'),
    };

    for (const key of ['name', 'year'] as const) {
      if (cols[key] === -1) return fail(`The CSV is missing a "${key}" column.`, 422);
    }
    if (cols.rankOrScore === -1 && cols.categoryRank === -1) {
      return fail('The CSV needs a "Rank" column, a "Category Rank" column, or both.', 422);
    }

    // Same student + same rank/score + category rank + same year already on
    // file (from an earlier import, the manual form, or an earlier row in
    // this very CSV) counts as the same result re-arriving — skip it instead
    // of creating a duplicate card. Re-running the same CSV twice is a no-op.
    const sig = (name: string, rankOrScore: string, categoryRank: string, year: number) =>
      `${name.trim().toLowerCase()}|${rankOrScore.trim().toLowerCase()}|${categoryRank.trim().toLowerCase()}|${year}`;
    const existing = await db.topper.findMany({ select: { name: true, rankOrScore: true, categoryRank: true, year: true } });
    const seen = new Set(existing.map((t) => sig(t.name, t.rankOrScore, t.categoryRank, t.year)));

    const body = rows.slice(1, MAX_ROWS + 1);
    const parsed: {
      name: string;
      exam: string;
      rankOrScore: string;
      categoryRank: string;
      year: number;
      address: string;
      photoUrl: string;
      order: number;
      featured: boolean;
      active: boolean;
    }[] = [];
    let skipped = 0;
    let duplicates = 0;

    body.forEach((r, i) => {
      const at = (colIdx: number) => (colIdx === -1 ? '' : (r[colIdx] ?? '').trim());
      const name = at(cols.name);
      const rankOrScore = at(cols.rankOrScore);
      const categoryRank = at(cols.categoryRank);
      const year = Number(at(cols.year));

      if (!name || (!rankOrScore && !categoryRank) || !Number.isInteger(year) || year < 1990 || year > 2100) {
        skipped++;
        return;
      }

      const key = sig(name, rankOrScore, categoryRank, year);
      if (seen.has(key)) {
        duplicates++;
        return;
      }
      seen.add(key);

      const orderRaw = at(cols.order);
      const activeRaw = at(cols.active);

      parsed.push({
        name,
        exam: at(cols.exam) || 'NEET-UG',
        rankOrScore,
        categoryRank,
        year,
        address: at(cols.address),
        photoUrl: at(cols.photoUrl),
        order: orderRaw && Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : i,
        featured: isYes(at(cols.featured)),
        // Column defaults to visible if left blank, matching the manual
        // Add-Topper form's own "Visible on website" default of on.
        active: activeRaw ? isYes(activeRaw) : true,
      });
    });

    if (parsed.length === 0) {
      return fail(
        duplicates > 0
          ? 'Every row here is already on the site — nothing new to import.'
          : 'No usable rows found — check the Name/Rank/Year columns.',
        422,
      );
    }

    const created = await db.topper.createMany({ data: parsed });

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'import',
        resource: 'toppers',
        detail: `${created.count} topper(s) imported${skipped ? `, ${skipped} skipped` : ''}${duplicates ? `, ${duplicates} duplicate` : ''}`,
      },
    });

    revalidateTag(CONTENT_TAG);

    return ok({ imported: created.count, skipped, duplicates });
  } catch (err) {
    return apiError(err);
  }
}
