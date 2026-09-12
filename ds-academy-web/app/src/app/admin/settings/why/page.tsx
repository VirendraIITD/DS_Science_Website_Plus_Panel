import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Batches capped at 40' },
  { name: 'body', label: 'One-line explanation', type: 'textarea', rows: 2, full: true },
  { name: 'imageUrl', label: 'Card background photo', type: 'image', full: true, aspect: 4 / 3, help: 'Fills the whole card on the home page, with the title and text over a dark gradient. Leave blank to keep the plain card with just the emoji.' },
  { name: 'icon', label: 'Emoji (used only where the card has no photo)', type: 'text', placeholder: '👥' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on home page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'imageUrl', header: '', kind: 'image' },
  { key: 'title', header: 'Title' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function WhyPage() {
  await requirePermission('settings');
  const rows = await db.whyPoint.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="why"
      title="Why choose us"
      addLabel="Point"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the reasons a parent should pick you. Six works well."
    />
  );
}
