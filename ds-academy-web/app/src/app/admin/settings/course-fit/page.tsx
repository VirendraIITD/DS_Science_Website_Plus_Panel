import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'who', label: 'If you are…', type: 'text', full: true, placeholder: 'In Class 11, want to be a doctor' },
  { name: 'take', label: 'Take', type: 'text', placeholder: 'NEET-UG · Achiever 11' },
  { name: 'starts', label: 'Starts', type: 'text', placeholder: '1 Aug 2026' },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: '2 years' },
  { name: 'fee', label: 'Fee from', type: 'text', placeholder: '₹19,999' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Courses page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'who', header: 'If you are…' },
  { key: 'take', header: 'Take' },
  { key: 'fee', header: 'Fee' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function CourseFitRowsPage() {
  await requirePermission('settings');
  const rows = await db.courseFitRow.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="courseFitRows"
      title="Which course is for you? (Courses page)"
      addLabel="Row"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Rows for the comparison table that helps families pick a batch. Update the dates each intake."
    />
  );
}
