import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { can } from '@/lib/rbac';
import { db } from '@/lib/db';
import { PAGE_EDITOR } from '@/lib/pageEditor';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

/** Step 2 of the drill-down: one page's name was clicked, show its content links here. */
export default async function PageEditorDetailPage({ params }: { params: { slug: string } }) {
  const group = PAGE_EDITOR.find((g) => g.slug === params.slug);
  if (!group) notFound();

  const user = await requireUser();
  const role = await db.staffRole.findUnique({ where: { role: user.role } });

  const links = group.links.filter(
    (link) =>
      moduleEnabled(link.module ?? '') &&
      (user.role === 'SUPER_ADMIN' || can(user.role, link.permission, role?.permissions)),
  );

  if (links.length === 0) notFound();

  return (
    <div className="space-y-4">
      <Link href="/admin/page-editor" className="text-[13px] font-semibold text-brand hover:underline">
        ← All pages
      </Link>

      <div className="card">
        <div className="card-title">{group.page}</div>
        {group.note ? <p className="mb-3 -mt-1 text-[12.5px] text-mut">{group.note}</p> : null}

        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between rounded-lg border border-line px-4 py-3 text-[13.5px] font-semibold text-ink transition hover:border-brand hover:bg-canvas"
            >
              {link.label}
              <span className="text-mut">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
