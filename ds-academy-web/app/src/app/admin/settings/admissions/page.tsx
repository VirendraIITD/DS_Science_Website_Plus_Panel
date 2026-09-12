import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Step title', type: 'text', full: true, placeholder: 'Enquire or walk in' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Admissions page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'title', header: 'Title' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function AdmissionStepsPage() {
  await requirePermission('settings');
  const rows = await db.admissionStep.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="admissionSteps"
      title="How admission works"
      addLabel="Step"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the steps a parent walks through — Enquire, Counselling, Test, Confirm seat."
    />
  );
}
