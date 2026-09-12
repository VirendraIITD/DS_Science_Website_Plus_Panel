import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'position', label: 'Position', type: 'text', placeholder: 'Physics Faculty' },
  { name: 'department', label: 'Department', type: 'text', placeholder: 'Teaching · NEET/JEE' },
  { name: 'type', label: 'Type', type: 'text', placeholder: 'Full-time' },
  { name: 'experience', label: 'Experience', type: 'text', full: true, placeholder: '3+ years, JEE/NEET level' },
  { name: 'status', label: 'Status text', type: 'text', placeholder: '2 openings' },
  {
    name: 'seatClass',
    label: 'Status colour',
    type: 'select',
    options: [
      { value: 'few', label: 'Few seats (amber)' },
      { value: 'ok', label: 'Open (green)' },
      { value: 'new', label: 'New / filled (grey)' },
    ],
    defaultValue: 'ok',
  },
  { name: 'filled', label: 'Position filled (hide from Apply dropdown)', type: 'checkbox', defaultValue: false },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Careers page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'position', header: 'Position' },
  { key: 'status', header: 'Status' },
  { key: 'filled', header: 'Filled', kind: 'bool' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function JobOpeningsPage() {
  await requirePermission('settings');
  const rows = await db.jobOpening.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="jobOpenings"
      title="Current openings (Careers page)"
      addLabel="Opening"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Rows for the 'Current openings' table on the Careers page."
    />
  );
}
