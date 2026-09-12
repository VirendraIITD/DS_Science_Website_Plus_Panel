import 'server-only';

import { cache } from 'react';

import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';

/**
 * Site settings are read on nearly every page — the single highest-value
 * thing to cache, since it's guaranteed to run on every request across the
 * whole site. Cached across requests for a couple of minutes via
 * cachedQuery(), then also memoised per-request with React's cache() so
 * multiple calls within one page render still only hit the cache lookup
 * once. `getOrCreate` keeps the single row (id = 1) alive even on a fresh
 * database that has not been seeded yet — kept out of the cached function
 * itself since a write shouldn't happen inside a cached read.
 */
const readSettings = cachedQuery(['site-settings'], () => db.siteSettings.findUnique({ where: { id: 1 } }));

export const getSettings = cache(async () => {
  const existing = await readSettings();
  if (existing) return existing;
  return db.siteSettings.create({ data: { id: 1 } });
});

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/** Digits-only WhatsApp number for click-to-chat links (PRD §8). */
export function whatsappLink(number: string, text?: string) {
  const digits = (number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/\D/g, '');
  if (!digits) return '';
  const q = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${q}`;
}

export function siteUrl(path = '') {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
