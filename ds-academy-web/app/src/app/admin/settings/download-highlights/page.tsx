import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Answer key the same evening' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 3, full: true },
  { name: 'icon', label: 'Icon (emoji)', type: 'text', placeholder: '⚡' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Downloads page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'icon', header: 'Icon' },
  { key: 'title', header: 'Title' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function DownloadHighlightsPage() {
  await requirePermission('settings');
  const rows = await db.downloadHighlight.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="downloadHighlights"
      title="How we do this (Downloads page)"
      addLabel="Card"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Cards shown under 'How we do this' on the Downloads page."
    />
  );
}
