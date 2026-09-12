import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { ForbiddenError } from '@/lib/rbac';
import { TierError } from '@/lib/tier';
import { UploadError } from '@/lib/upload';
import { fieldErrors } from '@/lib/validation';

export const ok = (data: unknown = { ok: true }) => NextResponse.json(data);

export const fail = (error: string, status = 400, extra?: Record<string, unknown>) =>
  NextResponse.json({ error, ...extra }, { status });

/**
 * Turns the handful of error types the app throws into the right status code,
 * so every route handler can just `try { … } catch (err) { return apiError(err) }`.
 */
export function apiError(err: unknown) {
  if (err instanceof ZodError) {
    return fail('Please check the highlighted fields.', 422, { fields: fieldErrors(err) });
  }
  if (err instanceof ForbiddenError) return fail(err.message, 403);
  if (err instanceof TierError) return fail(err.message, 402);
  if (err instanceof UploadError) return fail(err.message, 400);

  if (err instanceof Error) {
    if (err.message === 'UNAUTHENTICATED') return fail('Please sign in again.', 401);

    // Prisma unique-constraint violation.
    if ('code' in err && (err as { code?: string }).code === 'P2002') {
      return fail('Another record already uses that value.', 409);
    }
    if ('code' in err && (err as { code?: string }).code === 'P2025') {
      return fail('That record no longer exists.', 404);
    }

    console.error('[api]', err);
  } else {
    console.error('[api] unknown error', err);
  }

  return fail('Something went wrong. Please try again.', 500);
}
