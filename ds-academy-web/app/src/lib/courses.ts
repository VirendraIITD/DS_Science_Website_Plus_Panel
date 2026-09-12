import 'server-only';

import { db } from '@/lib/db';

/** Cheapest active package per course — used for the ccard price row on Home/Courses. */
export async function cheapestPackagesByCourse(
  courseIds: string[],
): Promise<Record<string, { now: number; was: number; note: string }>> {
  if (courseIds.length === 0) return {};

  const pkgs = await db.coursePackage.findMany({
    where: { courseId: { in: courseIds }, active: true },
    orderBy: { priceDiscounted: 'asc' },
  });

  const map: Record<string, { now: number; was: number; note: string }> = {};
  for (const p of pkgs) {
    if (map[p.courseId]) continue; // first hit per course is the cheapest, thanks to the orderBy
    const note = p.startDate
      ? `Starts ${p.startDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })}`
      : p.discountPct > 0
        ? `${p.discountPct}% OFF`
        : '';
    map[p.courseId] = { now: p.priceDiscounted, was: p.priceOriginal, note };
  }
  return map;
}
