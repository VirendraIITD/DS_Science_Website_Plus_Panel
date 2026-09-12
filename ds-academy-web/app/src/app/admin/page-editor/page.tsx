import Link from 'next/link';

import { requireUser } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { db } from '@/lib/db';
import { PAGE_EDITOR } from '@/lib/pageEditor';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

/** Step 1 of the drill-down: page names only. Click one to see its content. */
export default async function PageEditorPage() {
  const user = await requireUser();
  const role = await db.staffRole.findUnique({ where: { role: user.role } });

  const pages = PAGE_EDITOR.map((group) => ({
    ...group,
    links: group.links.filter(
      (link) =>
        moduleEnabled(link.module ?? '') &&
        (user.role === 'SUPER_ADMIN' || can(user.role, link.permission, role?.permissions)),
    ),
  })).filter((group) => group.links.length > 0);

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-title">Page Editor</div>
        <p className="-mt-1 text-[13px] text-mut">
          Every public page on the site, in one place. Pick a page to see everywhere its content is
          edited.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((group) => (
          <Link
            key={group.slug}
            href={`/admin/page-editor/${group.slug}`}
            className="card flex items-center justify-between transition hover:border-brand hover:shadow-card"
          >
            <div>
              <div className="text-[14.5px] font-bold text-ink">{group.page}</div>
              <div className="mt-0.5 text-[12px] text-mut">
                {group.links.length} {group.links.length === 1 ? 'thing' : 'things'} to edit
              </div>
            </div>
            <span className="text-mut">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
