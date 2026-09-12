import { apiError, fail, ok } from '@/lib/api';
import { predict } from '@/lib/predictor';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!(await rateLimit('predict'))) {
      return fail('Too many predictions from this connection. Please try again shortly.', 429);
    }

    const body = await req.json();
    const rank = Number(body?.rank);

    if (!Number.isFinite(rank) || rank < 1) {
      return fail('Enter your All-India rank as a number.', 422, {
        fields: { rank: 'Enter a valid rank' },
      });
    }

    const results = await predict({
      exam: String(body?.exam || 'NEET'),
      rank,
      category: body?.category || undefined,
      quota: body?.quota || undefined,
      state: body?.state || undefined,
    });

    return ok({ results });
  } catch (err) {
    return apiError(err);
  }
}
