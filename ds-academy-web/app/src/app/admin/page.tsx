import Link from 'next/link';

import { Pill, STAGE_TONE } from '@/components/ui/Pill';
import { getSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { STAGE_LABEL, maskPhone, shortDate } from '@/lib/format';
import { isPro } from '@/lib/tier';

export const dynamic = 'force-dynamic';

/** "Ananya" from "Ananya Sharma", so the banner reads like a person said it. */
function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

/** IST calendar-date key (Railway runs UTC — a raw ms/86400000 diff undercounts whenever
 * the login and now fall on different IST dates less than 24h apart, e.g. 11:50pm → 12:05am). */
function istDateKey(d: Date) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

function welcomeSubline(previousLoginAt: Date | null) {
  if (!previousLoginAt) return "This is your first time here — welcome aboard!";
  const then = new Date(`${istDateKey(previousLoginAt)}T00:00:00Z`);
  const now = new Date(`${istDateKey(new Date())}T00:00:00Z`);
  const days = Math.round((now.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "Good to see you again today.";
  if (days === 1) return "You're back after 1 day.";
  return `You're back after ${days} days.`;
}

/** Dashboard — the prototype's stat tiles + recent enquiries + quick actions. */
export default async function AdminDashboard() {
  const monthAgo = new Date(Date.now() - 30 * 86400_000);

  const [sessionUser, students, toppers, newEnquiries, courses, demos, admitted, totalLeads, recent] =
    await Promise.all([
      getSessionUser(),
      db.statItem.findFirst({ where: { label: { contains: 'Student', mode: 'insensitive' } } }),
      db.topper.count({ where: { active: true } }),
      db.enquiry.count({ where: { createdAt: { gte: monthAgo } } }),
      db.course.count({ where: { active: true } }),
      isPro() ? db.demoBooking.count({ where: { status: 'UPCOMING' } }) : Promise.resolve(0),
      db.enquiry.count({ where: { stage: 'ADMITTED' } }),
      db.enquiry.count(),
      db.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    ]);

  const me = sessionUser
    ? await db.adminUser.findUnique({ where: { id: sessionUser.id }, select: { previousActiveAt: true } })
    : null;

  const conversion = totalLeads > 0 ? Math.round((admitted / totalLeads) * 100) : 0;

  const tiles = isPro()
    ? [
        { icon: '👨‍🎓', n: students?.value ?? '—', l: 'Active Students' },
        { icon: '📝', n: String(newEnquiries), l: 'New Enquiries (30 d)' },
        { icon: '📞', n: String(demos), l: 'Upcoming Demos' },
        { icon: '✅', n: `${conversion}%`, l: 'Lead Conversion' },
      ]
    : [
        { icon: '👨‍🎓', n: students?.value ?? '—', l: 'Active Students' },
        { icon: '🏆', n: String(toppers), l: 'Toppers Listed' },
        { icon: '📝', n: String(newEnquiries), l: 'New Enquiries (30 d)' },
        { icon: '📚', n: String(courses), l: 'Active Courses' },
      ];

  return (
    <>
      {sessionUser ? (
        <div
          className="mb-5 rounded-xl border border-line bg-white px-5 py-4"
          style={{ background: 'linear-gradient(135deg, #f3f6ff, #fff)' }}
        >
          <div className="text-[16px] font-bold text-ink">Welcome back, {firstName(sessionUser.name)} 👋</div>
          <div className="mt-0.5 text-[13px] text-mut">{welcomeSubline(me?.previousActiveAt ?? null)}</div>
        </div>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.l} className="stat-card">
            <span className="float-right text-xl">{t.icon}</span>
            <div className="stat-n">{t.n}</div>
            <div className="stat-l">{t.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="card">
          <div className="card-title">
            <span>Recent Enquiries</span>
            <Link href="/admin/enquiries" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <p className="py-10 text-center text-[13.5px] text-mut">
              No enquiries yet. They will appear here the moment someone fills the website form.
            </p>
          ) : (
            <div className="-mx-2 overflow-x-auto px-2">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Phone</th>
                    <th>Received</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td className="font-semibold">{r.name}</td>
                      <td>{r.course || '—'}</td>
                      <td className="whitespace-nowrap">{maskPhone(r.phone)}</td>
                      <td className="whitespace-nowrap">{shortDate(r.createdAt)}</td>
                      <td>
                        <Pill tone={STAGE_TONE[r.stage]}>{STAGE_LABEL[r.stage]}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">Quick Actions</div>
          <div className="space-y-2.5">
            {isPro() ? (
              <>
                <Link href="/admin/crm" className="btn w-full">
                  🧲 Open Lead CRM
                </Link>
                <Link href="/admin/broadcast" className="btn btn-purple w-full">
                  📢 Send Broadcast
                </Link>
                <Link href="/admin/packages" className="btn btn-ghost w-full">
                  📦 Edit Course Packages
                </Link>
                <Link href="/admin/toppers" className="btn btn-ghost w-full">
                  🏆 Add a Topper
                </Link>
              </>
            ) : (
              <>
                <Link href="/admin/toppers" className="btn w-full">
                  🏆 Add a Topper
                </Link>
                <Link href="/admin/news" className="btn btn-ghost w-full">
                  📰 Post News / Notice
                </Link>
                <Link href="/admin/downloads" className="btn btn-ghost w-full">
                  📥 Upload a Download
                </Link>
                <Link href="/admin/banners" className="btn btn-ghost w-full">
                  🎯 Update Home Banner
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
