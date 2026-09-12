import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Right in your own city' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, full: true },
  { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '🏠' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Careers page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'icon', header: 'Icon' },
  { key: 'title', header: 'Title' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function CareerReasonsPage() {
  await requirePermission('settings');
  const rows = await db.careerReason.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="careerReasons"
      title="Why work with us (Careers page)"
      addLabel="Card"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Cards shown under 'Why work with us' on the Careers page."
    />
  );
}
