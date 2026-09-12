import { CrmBoard } from '@/components/admin/CrmBoard';
import { ProLocked } from '@/components/admin/ProLocked';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

export default async function CrmPage() {
  if (!moduleEnabled('crm')) {
    return (
      <ProLocked
        title="Lead CRM"
        blurb="A pipeline from New to Admitted, with leads assigned to counsellors, notes on every call, and follow-up dates that flag when they slip."
      />
    );
  }

  await requirePermission('crm');

  const [leads, staff] = await Promise.all([
    db.enquiry.findMany({
      where: { NOT: { course: { startsWith: 'Career' } } },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: {
        assignedTo: { select: { name: true } },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { name: true } } },
        },
      },
    }),
    db.adminUser.findMany({ where: { active: true }, select: { id: true, name: true } }),
  ]);

  return <CrmBoard leads={JSON.parse(JSON.stringify(leads))} staff={staff} />;
}
