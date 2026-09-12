import 'server-only';

import { unstable_cache } from 'next/cache';

/**
 * The site's root layout forces `dynamic = 'force-dynamic'` on every page
 * (a real Railway constraint — the Docker build stage has no DATABASE_URL,
 * so any attempt at static/ISR page generation crashes the build, see
 * ds-academy-web-deploy memory). That means every single visit re-runs a
 * page's DB queries from scratch — there was previously zero caching
 * anywhere, which is the main reason the site felt slow under any real
 * traffic.
 *
 * This does NOT touch route-level rendering (still SSR'd per request, so
 * the build stays safe) — it caches the *query results* themselves, at
 * request time, using Next's data cache. All cached content shares one tag
 * so any admin panel write anywhere invalidates it immediately, rather than
 * maintaining a fragile per-resource tag map across ~25 admin resources.
 */
export const CONTENT_TAG = 'site-content';

/** Default revalidation window, in seconds, for cachedQuery() calls that don't override it. */
export const DEFAULT_REVALIDATE = 120;

/**
 * Wraps a data-fetching function so its result is reused across requests
 * for `revalidateSeconds`, instead of hitting the database on every visit.
 * `key` must be unique per distinct query (e.g. include any arguments that
 * change the result, like a slug or search params).
 */
export function cachedQuery<T>(
  key: string[],
  fn: () => Promise<T>,
  revalidateSeconds = DEFAULT_REVALIDATE,
): () => Promise<T> {
  return unstable_cache(fn, key, { revalidate: revalidateSeconds, tags: [CONTENT_TAG] });
}
