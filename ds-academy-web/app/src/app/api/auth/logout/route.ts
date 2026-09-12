import { cookies } from 'next/headers';

import { ok } from '@/lib/api';
import { SESSION_COOKIE, destroySession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  const jar = cookies();
  await destroySession(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  return ok();
}
