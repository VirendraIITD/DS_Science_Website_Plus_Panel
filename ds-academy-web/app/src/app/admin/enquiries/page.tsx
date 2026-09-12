import { EnquiryImport } from '@/components/admin/EnquiryImport';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { STAGE_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { SOURCE_LABEL, STAGE_LABEL } from '@/lib/format';
import { LEAD_SOURCE_OPTIONS, LEAD_STAGE_OPTIONS } from '@/lib/options';
import { isPro } from '@/lib/tier';

export const dynamic = 'force-dynamic';

export default async function EnquiriesPage() {
  await requirePermission('enquiries');

  const [rows, staff, branches] = await Promise.all([
    db.enquiry.findMany({
      where: { NOT: { course: { startsWith: 'Career' } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
    isPro()
      ? db.adminUser.findMany({ where: { active: true }, select: { id: true, name: true } })
      : Promise.resolve([]),
    isPro() ? db.branch.findMany({ select: { id: true, name: true } }) : Promise.resolve([]),
  ]);

  const fields: Field[] = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'course', label: 'Course', type: 'text' },
    { name: 'classOf', label: 'Class', type: 'text' },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'source', label: 'Source', type: 'select', options: LEAD_SOURCE_OPTIONS },
    { name: 'stage', label: 'Status', type: 'select', options: LEAD_STAGE_OPTIONS },
    // CRM-only fields (PRD §5 "Lead extras").
    ...(isPro()
      ? ([
          {
            name: 'assignedToId',
            label: 'Assigned to',
            type: 'select',
            placeholder: 'Nobody yet',
            options: staff.map((s) => ({ value: s.id, label: s.name })),
          },
          { name: 'followUpDate', label: 'Follow-up on', type: 'date' },
          {
            name: 'branchId',
            label: 'Branch',
            type: 'select',
            placeholder: 'Not set',
            options: branches.map((b) => ({ value: b.id, label: b.name })),
          },
        ] as Field[])
      : []),
    { name: 'message', label: 'Message', type: 'textarea', rows: 3, full: true },
  ];

  const columns: Column[] = [
    { key: 'name', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'phone', header: 'Phone', kind: 'phone' },
    { key: 'city', header: 'City' },
    { key: 'source', header: 'Source', kind: 'pill', map: SOURCE_LABEL, tone: { WEBSITE: 'b', WHATSAPP: 'g', WALK_IN: 'y', REFERRAL: 'p', PHONE: 'b', IMPORT: 'p', OTHER: 'n' } },
    { key: 'createdAt', header: 'Received', kind: 'date' },
    { key: 'stage', header: 'Status', kind: 'pill', map: STAGE_LABEL, tone: STAGE_TONE },
  ];

  return (
    <>
      <EnquiryImport />

      <ResourceManager
        resource="enquiries"
        title="Admissions / Enquiries"
        addLabel="Enquiry"
        fields={fields}
        columns={columns}
        rows={rows as never}
        emptyHint="No enquiries yet. Every submission from the website form lands here — or paste a CSV above for leads from outside the website."
        toolbar={
          <a className="btn btn-ghost" href="/api/admin/enquiries/export">
            ⬇ Export CSV
          </a>
        }
      />
    </>
  );
}
