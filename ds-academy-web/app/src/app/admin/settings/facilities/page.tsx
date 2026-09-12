import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Facility', type: 'text', full: true, placeholder: 'Library & reading room' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 2, full: true },
  { name: 'imageUrl', label: 'Photo', type: 'image', full: true, aspect: 4 / 3 },
  { name: 'icon', label: 'Emoji', type: 'text', placeholder: '📖' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'icon', header: '' },
  { key: 'title', header: 'Facility' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function FacilitiesPage() {
  await requirePermission('settings');
  const rows = await db.facility.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="facilities"
      title="Facilities"
      addLabel="Facility"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="List what the campus offers — classrooms, library, lab, doubt counter."
    />
  );
}
