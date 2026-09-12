import { ok } from '@/lib/api';
import { isBotRequest } from '@/lib/bot';
import { db } from '@/lib/db';
import { isPro } from '@/lib/tier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * First-party page-view ping for the [PRO] Analytics dashboard. Stores a path
 * and a referrer host — no cookies, no IP, no cross-site identifiers, so it
 * needs no consent banner. Google Analytics remains available separately.
 */
export async function POST(req: Request) {
  if (!isPro()) return ok();
  if (isBotRequest(req.headers.get('user-agent'))) return ok();

  try {
    const { path, referrer } = await req.json();
    if (typeof path !== 'string' || path.length > 300) return ok();
    if (path.startsWith('/admin')) return ok();

    let host = '';
    if (typeof referrer === 'string' && referrer) {
      try {
        host = new URL(referrer).hostname;
      } catch {
        host = '';
      }
    }

    await db.pageView.create({ data: { path, referrer: host } });
  } catch {
    // Analytics must never break a page render.
  }

  return ok();
}
