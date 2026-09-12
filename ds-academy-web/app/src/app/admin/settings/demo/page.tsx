import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'text', label: 'Line', type: 'text', full: true, placeholder: 'Bring a notebook. You will want to write things down.' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Demo page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'text', header: 'Line' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function DemoHighlightsPage() {
  await requirePermission('settings');
  const rows = await db.demoHighlight.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="demoHighlights"
      title="What to expect (Demo page)"
      addLabel="Line"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the checklist items shown under 'What to expect' on the Book-a-Demo page."
    />
  );
}
