import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'label', label: 'Label', type: 'text', placeholder: 'Active Students' },
  { name: 'value', label: 'Number', type: 'text', placeholder: '2,500' },
  { name: 'icon', label: 'Emoji', type: 'text', placeholder: '👨‍🎓' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on home page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'icon', header: '' },
  { key: 'value', header: 'Number' },
  { key: 'label', header: 'Label' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function StatsPage() {
  await requirePermission('settings');
  const rows = await db.statItem.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="stats"
      title="Home stats strip"
      addLabel="Stat"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the numbers you want across the top of the home page."
    />
  );
}
