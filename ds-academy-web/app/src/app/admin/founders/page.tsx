import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'D. S. Sharma' },
  { name: 'role', label: 'Role', type: 'text', placeholder: 'Founder & Director' },
  { name: 'photoUrl', label: 'Photo', type: 'photo', full: true },
  { name: 'quote', label: 'Quote', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Visible on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'photoUrl', header: '', kind: 'image' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Role' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function FoundersPage() {
  await requirePermission('settings');
  const rows = await db.founder.findMany({ orderBy: [{ order: 'asc' }] });

  return (
    <ResourceManager
      resource="founders"
      title="Founders"
      addLabel="Founder"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the people behind the institute — they appear on the Founders page."
    />
  );
}
