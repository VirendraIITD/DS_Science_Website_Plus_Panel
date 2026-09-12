import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Book a slot' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Demo page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'title', header: 'Title' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function DemoStepsPage() {
  await requirePermission('settings');
  const rows = await db.demoStep.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="demoSteps"
      title="How it works (Demo page)"
      addLabel="Step"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Steps shown under 'How it works' on the Book-a-Demo page."
    />
  );
}
