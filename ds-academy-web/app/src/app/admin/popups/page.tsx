import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { POPUP_PAGE_OPTIONS, POPUP_TYPE_OPTIONS } from '@/lib/options';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Internal name (for your reference only — not shown on the site)', type: 'text', full: true, placeholder: 'Diwali offer — all pages' },
  { name: 'type', label: 'Popup type', type: 'select', options: POPUP_TYPE_OPTIONS },
  { name: 'pages', label: 'Show on which pages', type: 'multiselect', options: POPUP_PAGE_OPTIONS, full: true, help: 'Only one active popup shows per page — if more than one targets the same page, the lowest Priority order wins.' },
  {
    name: 'imageUrl',
    label: 'Image',
    type: 'image',
    full: true,
    help: 'Required for "Image only". Optional on "Content" popups — shown above the heading if set.',
    aspect: 1,
  },
  { name: 'imageHref', label: 'Image click-through link (Image only)', type: 'text', placeholder: '/admissions' },
  { name: 'heading', label: 'Heading (Content only)', type: 'text', full: true },
  { name: 'body', label: 'Body text (Content only)', type: 'textarea', rows: 3, full: true },
  { name: 'ctaLabel', label: 'Button text (Content only)', type: 'text', placeholder: 'Enrol Now' },
  { name: 'ctaHref', label: 'Button link (Content only)', type: 'text', placeholder: '/admissions' },
  { name: 'delaySeconds', label: 'Show after (seconds)', type: 'number', defaultValue: 2 },
  { name: 'order', label: 'Priority order', type: 'number', help: 'Lower wins when more than one active popup targets the same page' },
  { name: 'active', label: 'Active', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'title', header: 'Name' },
  { key: 'type', header: 'Type', kind: 'pill' },
  { key: 'pages', header: 'Pages', kind: 'chips' },
  { key: 'delaySeconds', header: 'Delay (s)' },
  { key: 'active', header: 'Active', kind: 'bool' },
];

export default async function PopupsPage() {
  await requirePermission('popups');
  const rows = await db.popup.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] });

  return (
    <ResourceManager
      resource="popups"
      title="Popups"
      addLabel="Popup"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add a popup and pick the pages it should show on — shown once per browser tab session per page, after the delay you set."
    />
  );
}
