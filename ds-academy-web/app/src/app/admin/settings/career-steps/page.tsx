import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Send your resume' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Careers page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'title', header: 'Title' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function CareerStepsPage() {
  await requirePermission('settings');
  const rows = await db.careerStep.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="careerSteps"
      title="How to apply (Careers page)"
      addLabel="Step"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Steps shown under 'How to apply' on the Careers page."
    />
  );
}
