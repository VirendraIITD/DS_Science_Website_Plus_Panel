import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'course', label: 'Position applied for', type: 'text' },
  { name: 'message', label: 'Experience / CV link', type: 'textarea', rows: 4, full: true },
];

const columns: Column[] = [
  { key: 'name', header: 'Name' },
  { key: 'course', header: 'Position' },
  { key: 'phone', header: 'Phone', kind: 'phone' },
  { key: 'email', header: 'Email' },
  { key: 'createdAt', header: 'Applied On', kind: 'date' },
];

export default async function CareerApplicationsPage() {
  await requirePermission('enquiries');
  const rows = await db.enquiry.findMany({
    where: { course: { startsWith: 'Career' } },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return (
    <ResourceManager
      resource="careerApplications"
      title="Career Applications"
      addLabel="Application"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Applications from the Careers page 'Apply now' form land here — kept separate from student enquiries."
    />
  );
}
