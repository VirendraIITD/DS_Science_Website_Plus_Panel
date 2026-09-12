import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'batch', label: 'Batch', type: 'text', placeholder: 'NEET / JEE Achiever 11' },
  { name: 'who', label: 'You should be', type: 'text', full: true, placeholder: 'Passed Class 10, entering Class 11' },
  { name: 'timing', label: 'Timing', type: 'text', placeholder: '7:30 am – 12:30 pm' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Admissions page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'batch', header: 'Batch' },
  { key: 'who', header: 'You should be' },
  { key: 'timing', header: 'Timing' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function EligibilityRowsPage() {
  await requirePermission('settings');
  const rows = await db.eligibilityRow.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="eligibilityRows"
      title="Who can join which batch (Admissions page)"
      addLabel="Row"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Rows for the eligibility table on the Admissions page. Update timings each intake."
    />
  );
}
