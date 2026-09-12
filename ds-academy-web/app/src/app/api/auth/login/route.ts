import { cookies } from 'next/headers';

import { apiError, fail, ok } from '@/lib/api';
import { SESSION_COOKIE, createSession, pruneExpiredSessions, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { clientIp, rateLimit } from '@/lib/ratelimit';
import { loginSchema } from '@/lib/validation';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    // Brute-force guard (PRD §9).
    if (!(await rateLimit('login'))) {
      return fail('Too many attempts. Please wait a few minutes and try again.', 429);
    }

    const { email, password } = loginSchema.parse(await req.json());

    const user = await db.adminUser.findUnique({ where: { email: email.toLowerCase() } });

    // Same message either way — never reveal which accounts exist.
    if (!user || !user.active || !(await verifyPassword(password, user.passwordHash))) {
      return fail('Incorrect email or password.', 401);
    }

    const jwt = await createSession(user.id);

    // None of this needs to finish before the user gets their cookie — was
    // previously 3 more sequential awaits on the critical path (session
    // pruning, lastLoginAt, audit log), each a full round trip to the DB,
    // which is what made login feel slow. Fire them and move on.
    void pruneExpiredSessions();
    // previousLoginAt keeps the login before this one, so the "welcome
    // back, it's been N days" banner on the dashboard has something to
    // compare against — lastLoginAt itself is about to become "now".
    void db.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), previousLoginAt: user.lastLoginAt },
    });
    // Permanent login history (Session rows get pruned after they expire,
    // so lastLoginAt alone can't answer "who logged in when" over time).
    void db.auditLog.create({
      data: { userId: user.id, action: 'login', resource: 'auth', detail: `Signed in from ${clientIp()}` },
    });

    cookies().set(SESSION_COOKIE, jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Number(process.env.AUTH_SESSION_HOURS || 12) * 3600,
    });

    return ok({ ok: true, name: user.name });
  } catch (err) {
    return apiError(err);
  }
}
