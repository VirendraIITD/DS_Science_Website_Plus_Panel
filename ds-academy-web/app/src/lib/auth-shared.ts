/**
 * Constants shared between the Edge middleware and the Node runtime.
 * Kept separate from `auth.ts` because that module pulls in Prisma and bcrypt,
 * neither of which can run on the Edge.
 */
export const SESSION_COOKIE = 'ds_session';
