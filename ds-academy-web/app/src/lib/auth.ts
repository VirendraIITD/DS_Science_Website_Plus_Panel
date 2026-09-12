import 'server-only';

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';

import { SESSION_COOKIE } from '@/lib/auth-shared';
import { db } from '@/lib/db';
import { can, defaultPermissions, type Permission, ForbiddenError } from '@/lib/rbac';
import type { StaffRoleName } from '@prisma/client';

export { SESSION_COOKIE };

const SESSION_HOURS = Number(process.env.AUTH_SESSION_HOURS || 12);

function secret() {
  const raw = process.env.AUTH_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error('AUTH_SECRET is missing or too short — see .env.example.');
  }
  return new TextEncoder().encode(raw);
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRoleName;
  counsellingAccess: boolean;
};

/**
 * Signs in a user. The JWT carries identity; a matching `Session` row lets an
 * admin revoke access immediately (deactivating a staff member should not wait
 * for the token to expire).
 */
export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);

  await db.session.create({ data: { userId, token, expiresAt } });

  return await new SignJWT({ sid: token, uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret());
}

export async function destroySession(jwt: string | undefined) {
  if (!jwt) return;
  try {
    const { payload } = await jwtVerify(jwt, secret());
    await db.session.deleteMany({ where: { token: String(payload.sid) } });
  } catch {
    // Already invalid — nothing to revoke.
  }
}

/** Reads the current user, or null. Safe to call from any server component. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const jwt = cookies().get(SESSION_COOKIE)?.value;
  if (!jwt) return null;

  let sid: string;
  try {
    const { payload } = await jwtVerify(jwt, secret());
    sid = String(payload.sid);
  } catch {
    return null;
  }

  const session = await db.session.findUnique({
    where: { token: sid },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) return null;

  const { id, name, email, role, counsellingAccess } = session.user;
  return { id, name, email, role, counsellingAccess };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

/** Loads any stored per-role permission overrides (Pro › Staff & Roles). */
export async function permissionsFor(role: StaffRoleName): Promise<Permission[]> {
  const row = await db.staffRole.findUnique({ where: { role } });
  if (row && row.permissions.length > 0) return row.permissions as Permission[];
  return defaultPermissions(role);
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  const row = await db.staffRole.findUnique({ where: { role: user.role } });
  if (!can(user.role, permission, row?.permissions)) throw new ForbiddenError(permission);
  return user;
}

/** Housekeeping — called opportunistically on login. */
export async function pruneExpiredSessions() {
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}
