import 'server-only';

import { headers } from 'next/headers';

import { db } from '@/lib/db';

const MAX = Number(process.env.RATE_LIMIT_MAX || 5);
const WINDOW_MIN = Number(process.env.RATE_LIMIT_WINDOW_MIN || 10);

/** Client IP behind Nginx/Caddy (PRD §10 puts the app behind a proxy). */
export function clientIp(): string {
  const h = headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
}

/**
 * DB-backed limiter (PRD §9). A table rather than memory so the limit still
 * holds when the app runs more than one container.
 *
 * @returns true when the request is allowed.
 */
export async function rateLimit(scope: string): Promise<boolean> {
  const ip = clientIp();
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);

  const hits = await db.rateLimitHit.count({
    where: { scope, ip, createdAt: { gte: since } },
  });

  if (hits >= MAX) return false;

  await db.rateLimitHit.create({ data: { scope, ip } });

  // Opportunistic cleanup so the table cannot grow without bound — doesn't
  // need to block the caller (this ran on the critical path of every login,
  // adding a whole extra DB round trip 1 time in 50).
  if (Math.random() < 0.02) {
    void db.rateLimitHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 3600_000) } },
    });
  }

  return true;
}
