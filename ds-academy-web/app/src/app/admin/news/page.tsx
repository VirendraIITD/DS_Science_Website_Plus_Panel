import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { PUBLISH_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { NEWS_TYPE_OPTIONS, PUBLISH_OPTIONS } from '@/lib/options';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Admissions Open 2026-27' },
  { name: 'type', label: 'Type', type: 'select', options: NEWS_TYPE_OPTIONS },
  { name: 'status', label: 'Status', type: 'select', options: PUBLISH_OPTIONS },
  { name: 'date', label: 'Date', type: 'date' },
  { name: 'pinned', label: 'Pin to top', type: 'checkbox', help: 'Keeps it first in the ticker' },
  { name: 'imageUrl', label: 'Image (optional)', type: 'image', full: true, aspect: 16 / 9 },
  { name: 'body', label: 'Notice text', type: 'textarea', rows: 8, full: true },
  { name: 'slug', label: 'URL slug', type: 'text', help: 'Leave blank to build it from the title', full: true },
];

const columns: Column[] = [
  { key: 'title', header: 'Title' },
  { key: 'type', header: 'Type', kind: 'pill', map: { NOTICE: 'Notice', EVENT: 'Event' }, tone: { NOTICE: 'b', EVENT: 'y' } },
  { key: 'date', header: 'Date', kind: 'date' },
  { key: 'status', header: 'Status', kind: 'pill', map: { DRAFT: 'Draft', PUBLISHED: 'Published' }, tone: PUBLISH_TONE },
  { key: 'pinned', header: 'Pinned', kind: 'bool' },
];

export default async function NewsPage() {
  await requirePermission('news');
  const rows = await db.news.findMany({ orderBy: [{ pinned: 'desc' }, { date: 'desc' }] });

  return (
    <ResourceManager
      resource="news"
      title="News & Events"
      addLabel="Notice"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Post a notice or an event. Published items show in the home-page ticker."
    />
  );
}
