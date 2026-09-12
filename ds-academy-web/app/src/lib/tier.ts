/**
 * Tier gating (PRD §3).
 *
 * Elite and Pro are one codebase. `SITE_TIER` decides whether the [PRO]
 * modules are reachable — from the admin nav, the public routes and the API.
 * Nothing Pro-only is imported conditionally, so an Elite install upgrades by
 * flipping the env var and restarting; no rewrite, no migration.
 */

export type Tier = 'elite' | 'pro';

export const TIER: Tier =
  (process.env.SITE_TIER || '').toLowerCase() === 'pro' ? 'pro' : 'elite';

export const isPro = () => TIER === 'pro';

/** Every module the panel can show, and the tier that unlocks it. */
export const PRO_MODULES = [
  'analytics',
  'predictor',
  'packages',
  'crm',
  'demos',
  'broadcast',
  'blog',
  'faq',
  'branches',
  'staff',
] as const;

export type ProModule = (typeof PRO_MODULES)[number];

export function moduleEnabled(mod: string): boolean {
  return isPro() || !PRO_MODULES.includes(mod as ProModule);
}

/** Throw from a server action / route handler when a Pro module is hit on Elite. */
export class TierError extends Error {
  constructor(mod: string) {
    super(`"${mod}" is a Pro module; this installation runs the Elite tier.`);
    this.name = 'TierError';
  }
}

export function assertModule(mod: string) {
  if (!moduleEnabled(mod)) throw new TierError(mod);
}
