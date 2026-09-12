import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

import { Sidebar } from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/Toast';
import { Topbar } from '@/components/admin/Topbar';
import { getSessionUser, permissionsFor } from '@/lib/auth';
import { db } from '@/lib/db';
import { NAV, PAGE_TITLES } from '@/lib/nav';
import { getSettings } from '@/lib/settings';
import { TIER, moduleEnabled } from '@/lib/tier';

/**
 * Rotates lastActiveAt → previousActiveAt once per IST calendar day of real
 * usage — a single conditional UPDATE so every admin page load doesn't cost
 * an extra read first. No-ops (0 rows touched) on every request within the
 * same IST day, which is the common case.
 */
function markDailyActive(userId: string) {
  void db.$executeRaw`
    UPDATE admin_users
    SET "previousActiveAt" = "lastActiveAt", "lastActiveAt" = now()
    WHERE id = ${userId}
      AND ("lastActiveAt" IS NULL
        OR ("lastActiveAt" AT TIME ZONE 'Asia/Kolkata')::date <> (now() AT TIME ZONE 'Asia/Kolkata')::date)
  `;
}

export const metadata: Metadata = {
  title: 'Admin Panel',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = headers().get('x-pathname') || '/admin';

  // The login page renders outside the shell.
  if (pathname.startsWith('/admin/login')) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  const user = await getSessionUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent(pathname)}`);

  markDailyActive(user.id);

  const [settings, permissions] = await Promise.all([getSettings(), permissionsFor(user.role)]);

  // Hide anything this tier does not sell or this role may not open.
  const groups = NAV.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        moduleEnabled(item.module ?? '') &&
        (user.role === 'SUPER_ADMIN' || permissions.includes(item.permission)),
    ),
  })).filter((group) => group.items.length > 0);

  const title =
    PAGE_TITLES[pathname] ??
    PAGE_TITLES[`/${pathname.split('/').slice(1, 3).join('/')}`] ??
    'Dashboard';

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-canvas">
        <Sidebar
          groups={groups}
          instituteName={settings.instituteName}
          tier={TIER}
          logoUrl={settings.logoUrl}
          showCounsellingLink={user.role === 'SUPER_ADMIN' || user.counsellingAccess}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar title={title} userName={user.name} />
          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
