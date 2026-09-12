import type { ReactNode } from 'react';

export type PillTone = 'g' | 'b' | 'y' | 'r' | 'p' | 'n';

export function Pill({ tone = 'b', children }: { tone?: PillTone; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

/** Shared tone lookups so a status renders the same colour everywhere. */
export const STAGE_TONE: Record<string, PillTone> = {
  NEW: 'y',
  CONTACTED: 'b',
  DEMO: 'p',
  ADMITTED: 'g',
  LOST: 'r',
};

export const PUBLISH_TONE: Record<string, PillTone> = {
  PUBLISHED: 'g',
  DRAFT: 'y',
};

export const BANNER_TONE: Record<string, PillTone> = {
  LIVE: 'g',
  HIDDEN: 'y',
};

export const DEMO_TONE: Record<string, PillTone> = {
  UPCOMING: 'y',
  DONE: 'g',
  NO_SHOW: 'r',
  CANCELLED: 'n',
};

export const BRANCH_TONE: Record<string, PillTone> = {
  ACTIVE: 'g',
  SETUP: 'y',
  CLOSED: 'n',
};

export const PACKAGE_TONE: Record<string, PillTone> = {
  RECORDED: 'b',
  LIVE: 'r',
  TEST_SERIES: 'g',
};

export const ROLE_TONE: Record<string, PillTone> = {
  SUPER_ADMIN: 'p',
  COUNSELLOR: 'b',
  EDITOR: 'b',
};
