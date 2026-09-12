import 'server-only';

import { db } from '@/lib/db';
import { assertModule } from '@/lib/tier';

/**
 * Rank / College Predictor (PRD §6.3).
 *
 * A college is bucketed by comparing the student's rank against the latest
 * closing rank on record for that college + category + quota:
 *
 *   Safe     — the student is comfortably inside last year's cut-off
 *   Moderate — around the cut-off, could go either way
 *   Reach    — beyond it, but close enough to be worth an attempt
 *
 * The margins are deliberately conservative; cut-offs move year to year and
 * the page says so.
 */
export type Verdict = 'SAFE' | 'MODERATE' | 'REACH';

export type Prediction = {
  college: string;
  courseName: string;
  state: string;
  quota: string;
  category: string;
  closingRank: number;
  year: number;
  verdict: Verdict;
};

export const SAFE_MARGIN = 0.8; // rank <= 80% of closing rank
export const REACH_MARGIN = 1.25; // rank <= 125% of closing rank

export function verdictFor(rank: number, closingRank: number): Verdict | null {
  if (rank <= closingRank * SAFE_MARGIN) return 'SAFE';
  if (rank <= closingRank) return 'MODERATE';
  if (rank <= closingRank * REACH_MARGIN) return 'REACH';
  return null;
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  SAFE: 'Safe',
  MODERATE: 'Moderate',
  REACH: 'Reach',
};

export async function predict(opts: {
  exam: string;
  rank: number;
  category?: string;
  quota?: string;
  state?: string;
  limit?: number;
}): Promise<Prediction[]> {
  assertModule('predictor');

  const { exam, rank, category, quota, state, limit = 40 } = opts;
  if (!Number.isFinite(rank) || rank < 1) return [];

  // Only the most recent year on file is comparable.
  const latest = await db.predictorCutoff.findFirst({
    where: { exam },
    orderBy: { year: 'desc' },
    select: { year: true },
  });
  if (!latest) return [];

  const rows = await db.predictorCutoff.findMany({
    where: {
      exam,
      year: latest.year,
      ...(category ? { category } : {}),
      ...(quota ? { quota } : {}),
      ...(state ? { state } : {}),
      closingRank: { gte: Math.floor(rank / REACH_MARGIN) },
    },
    orderBy: { closingRank: 'asc' },
    take: 400,
  });

  const out: Prediction[] = [];
  for (const r of rows) {
    const verdict = verdictFor(rank, r.closingRank);
    if (!verdict) continue;
    out.push({
      college: r.college,
      courseName: r.courseName,
      state: r.state,
      quota: r.quota,
      category: r.category,
      closingRank: r.closingRank,
      year: r.year,
      verdict,
    });
  }

  // Safest first, then by how tight the margin is.
  const rankOrder: Record<Verdict, number> = { SAFE: 0, MODERATE: 1, REACH: 2 };
  out.sort((a, b) => rankOrder[a.verdict] - rankOrder[b.verdict] || b.closingRank - a.closingRank);

  return out.slice(0, limit);
}

/** Distinct values for the public form's dropdowns. */
export async function predictorFilters() {
  const rows = await db.predictorCutoff.findMany({
    select: { exam: true, category: true, quota: true, state: true },
    distinct: ['exam', 'category', 'quota', 'state'],
    take: 500,
  });

  const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))].sort();

  return {
    exams: uniq(rows.map((r) => r.exam)),
    categories: uniq(rows.map((r) => r.category)),
    quotas: uniq(rows.map((r) => r.quota)),
    states: uniq(rows.map((r) => r.state)),
  };
}
