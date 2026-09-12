import { ProLocked } from '@/components/admin/ProLocked';
import { BarChart } from '@/components/admin/BarChart';
import { Pill } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { SOURCE_LABEL } from '@/lib/format';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const SOURCE_TONE = { WEBSITE: 'b', WHATSAPP: 'g', WALK_IN: 'y', REFERRAL: 'p', PHONE: 'b', IMPORT: 'p', OTHER: 'n' } as const;

/** [PRO] Analytics — visits, enquiries by month, lead sources, conversion. */
export default async function AnalyticsPage() {
  if (!moduleEnabled('analytics')) {
    return (
      <ProLocked
        title="Analytics dashboard"
        blurb="Website visits, enquiries by month, where your leads come from, and how many of them convert."
      />
    );
  }

  await requirePermission('analytics');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [visitsThisMonth, visitsPrevMonth, enquiriesThisMonth, enquiries, bySource, admitted, total, topPages] =
    await Promise.all([
      db.pageView.count({ where: { createdAt: { gte: monthStart } } }),
      db.pageView.count({
        where: {
          createdAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: monthStart,
          },
        },
      }),
      db.enquiry.count({ where: { createdAt: { gte: monthStart } } }),
      db.enquiry.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
      }),
      db.enquiry.groupBy({ by: ['source'], _count: { _all: true } }),
      db.enquiry.count({ where: { stage: 'ADMITTED' } }),
      db.enquiry.count(),
      db.pageView.groupBy({
        by: ['path'],
        _count: { _all: true },
        orderBy: { _count: { path: 'desc' } },
        take: 8,
        where: { createdAt: { gte: sixMonthsAgo } },
      }),
    ]);

  // Bucket the last six months, including the empty ones.
  const buckets: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    buckets.push({
      label: start.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' }),
      value: enquiries.filter((e) => e.createdAt >= start && e.createdAt < end).length,
    });
  }

  const conversion = total > 0 ? Math.round((admitted / total) * 100) : 0;
  const visitDelta =
    visitsPrevMonth > 0 ? Math.round(((visitsThisMonth - visitsPrevMonth) / visitsPrevMonth) * 100) : 0;

  const sourceTotal = bySource.reduce((n, s) => n + s._count._all, 0);

  return (
    <>
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="stat-card">
          <span className="float-right text-xl">👁️</span>
          <div className="stat-n">{visitsThisMonth.toLocaleString('en-IN')}</div>
          <div className="stat-l">
            Website visits (this month){' '}
            {visitDelta !== 0 ? (
              <span className={`text-[11px] font-bold ${visitDelta > 0 ? 'text-ok' : 'text-bad'}`}>
                {visitDelta > 0 ? '▲' : '▼'}
                {Math.abs(visitDelta)}%
              </span>
            ) : null}
          </div>
        </div>
        <div className="stat-card">
          <span className="float-right text-xl">📝</span>
          <div className="stat-n">{enquiriesThisMonth}</div>
          <div className="stat-l">Enquiries (this month)</div>
        </div>
        <div className="stat-card">
          <span className="float-right text-xl">✅</span>
          <div className="stat-n">{conversion}%</div>
          <div className="stat-l">Lead conversion</div>
        </div>
        <div className="stat-card">
          <span className="float-right text-xl">🧲</span>
          <div className="stat-n">{total.toLocaleString('en-IN')}</div>
          <div className="stat-l">Leads all-time</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <div className="card-title">Enquiries by month</div>
          <BarChart data={buckets} />
        </div>

        <div className="card">
          <div className="card-title">Lead sources</div>
          {sourceTotal === 0 ? (
            <p className="py-8 text-center text-[13px] text-mut">No leads yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {bySource
                .sort((a, b) => b._count._all - a._count._all)
                .map((s) => (
                  <li key={s.source} className="flex items-center justify-between text-[13px]">
                    <Pill tone={SOURCE_TONE[s.source] ?? 'n'}>{SOURCE_LABEL[s.source]}</Pill>
                    <span className="font-semibold">
                      {Math.round((s._count._all / sourceTotal) * 100)}%
                      <span className="ml-1.5 font-normal text-mut">({s._count._all})</span>
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-title">Most-visited pages</div>
        {topPages.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-mut">
            No page views recorded yet. They start counting as soon as the site is live.
          </p>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Page</th>
                <th className="text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.path}>
                  <td className="font-medium">{p.path}</td>
                  <td className="text-right">{p._count._all.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
