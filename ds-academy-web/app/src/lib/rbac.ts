import type { StaffRoleName } from '@prisma/client';

/**
 * Role-based access control (PRD §7.2 "RBAC").
 *
 * Elite runs with a single SUPER_ADMIN account, so these checks are always
 * true there. Pro adds Counsellor and Editor, whose reach is limited to the
 * modules the prototype lists next to each role.
 */

export const ALL_PERMISSIONS = [
  'dashboard',
  'analytics',
  'toppers',
  'popups',
  'predictor',
  'courses',
  'packages',
  'faculty',
  'crm',
  'enquiries',
  'demos',
  'broadcast',
  'news',
  'blog',
  'gallery',
  'downloads',
  'faq',
  'banners',
  'branches',
  'staff',
  'settings',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const DEFAULTS: Record<StaffRoleName, readonly Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  // "Leads + Enquiries" in the prototype.
  COUNSELLOR: ['dashboard', 'crm', 'enquiries', 'demos', 'broadcast', 'predictor'],
  // "News, Blog, Gallery" in the prototype — expanded to every page-content
  // surface (2026-08-16, user asked for "complete page editor access"), but
  // deliberately still excludes 'crm', 'enquiries', 'demos', 'broadcast',
  // 'staff', 'packages', 'predictor', 'analytics' — those stay Counsellor/
  // Super Admin territory, not content-editor territory.
  EDITOR: [
    'dashboard',
    'news',
    'blog',
    'gallery',
    'downloads',
    'banners',
    'faq',
    'toppers',
    'popups',
    'faculty',
    'courses',
    'branches',
    'settings',
  ],
};

export function defaultPermissions(role: StaffRoleName): Permission[] {
  return [...DEFAULTS[role]];
}

export function roleLabel(role: StaffRoleName): string {
  return { SUPER_ADMIN: 'Super Admin', COUNSELLOR: 'Counsellor', EDITOR: 'Editor' }[role];
}

/**
 * @param overrides permissions stored on the StaffRole row, if the institute
 *                  has customised them; empty means "use the defaults".
 */
export function can(
  role: StaffRoleName,
  permission: Permission,
  overrides?: string[] | null,
): boolean {
  if (role === 'SUPER_ADMIN') return true;
  const granted = overrides && overrides.length > 0 ? overrides : DEFAULTS[role];
  return granted.includes(permission);
}

export class ForbiddenError extends Error {
  constructor(permission: string) {
    super(`Your role does not have access to "${permission}".`);
    this.name = 'ForbiddenError';
  }
}
