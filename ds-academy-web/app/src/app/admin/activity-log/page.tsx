import Link from 'next/link';

import { Pill, type PillTone } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const ACTION_LABEL: Record<string, string> = {
  login: 'Signed in',
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  import: 'Bulk imported',
};

const ACTION_TONE: Record<string, PillTone> = {
  login: 'b',
  create: 'g',
  update: 'y',
  delete: 'r',
  import: 'p',
};

const ACTIONS = ['login', 'create', 'update', 'delete', 'import'];

/**
 * "Who logged in when, and who changed what" — reads the AuditLog table that
 * every panel write (via the generic /api/admin/[resource] CRUD route, the
 * bulk importers, and now login itself) already writes to. This page is the
 * first place any of it was actually made visible.
 */
export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: { action?: string; user?: string };
}) {
  await requirePermission('staff');

  const action = ACTIONS.includes(searchParams.action ?? '') ? searchParams.action : undefined;

  const [logs, staff] = await Promise.all([
    db.auditLog.findMany({
      where: {
        ...(action ? { action } : {}),
        ...(searchParams.user ? { userId: searchParams.user } : {}),
      },
      orderBy: { at: 'desc' },
      take: 300,
      include: { user: { select: { name: true, email: true, role: true } } },
    }),
    db.adminUser.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { action: searchParams.action, user: searchParams.user, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/admin/activity-log?${s}` : '/admin/activity-log';
  };

  return (
    <div className="card">
      <div className="card-title">Activity Log</div>
      <p className="-mt-1 mb-4 text-[12.5px] text-mut">
        Every sign-in and every change made through the panel — most recent first, last 300 entries.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href={qs({ action: undefined })}
          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${
            !action ? 'border-navy bg-navy text-white' : 'border-line bg-white text-mut'
          }`}
        >
          All
        </Link>
        {ACTIONS.map((a) => (
          <Link
            key={a}
            href={qs({ action: a })}
            className={`rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold ${
              action === a ? 'border-navy bg-navy text-white' : 'border-line bg-white text-mut'
            }`}
          >
            {ACTION_LABEL[a]}
          </Link>
        ))}
      </div>

      {staff.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <Link
            href={qs({ user: undefined })}
            className={`rounded-full px-2.5 py-1 text-[11.5px] ${!searchParams.user ? 'bg-canvas font-semibold text-navy' : 'text-mut hover:text-navy'}`}
          >
            Everyone
          </Link>
          {staff.map((s) => (
            <Link
              key={s.id}
              href={qs({ user: s.id })}
              className={`rounded-full px-2.5 py-1 text-[11.5px] ${searchParams.user === s.id ? 'bg-canvas font-semibold text-navy' : 'text-mut hover:text-navy'}`}
            >
              {s.name}
            </Link>
          ))}
        </div>
      ) : null}

      {logs.length === 0 ? (
        <p className="py-8 text-center text-[13px] text-mut">No activity matches this filter yet.</p>
      ) : (
        <table className="tbl">
          <thead>
            <tr>
              <th>When</th>
              <th>Who</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap">
                  {l.at.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
                </td>
                <td>
                  {l.user ? (
                    <>
                      {l.user.name}
                      <span className="ml-1.5 text-[11px] text-mut">{l.user.email}</span>
                    </>
                  ) : (
                    <span className="text-mut">System</span>
                  )}
                </td>
                <td>
                  <Pill tone={ACTION_TONE[l.action] ?? 'n'}>{ACTION_LABEL[l.action] ?? l.action}</Pill>
                </td>
                <td className="capitalize">{l.resource}</td>
                <td className="max-w-[360px] truncate text-mut" title={l.detail}>
                  {l.detail || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
