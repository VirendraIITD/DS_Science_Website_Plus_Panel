import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { BANNER_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { BANNER_STATUS_OPTIONS } from '@/lib/options';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  {
    name: 'title',
    label: 'Headline (for your reference only — not shown on the site)',
    type: 'text',
    full: true,
    placeholder: 'Admissions Open 2026-27',
  },
  { name: 'subtitle', label: 'Sub-line (for your reference only — not shown on the site)', type: 'text', full: true },
  {
    name: 'imageUrl',
    label: 'Banner image',
    type: 'image',
    full: true,
    help: 'This whole image IS the banner — headline, photos and any text should already be designed into it. Recommended size 1600×650px (~2.46:1). JPG, PNG or WebP.',
    aspect: 1600 / 650,
    // The crop-preview step re-exports every upload at a fixed size — the
    // site-wide default (720px long side) made banners visibly blurry once
    // stretched across the full-width hero. Bumped to the banner's actual
    // target width so what gets saved matches what's designed.
    cropMaxPx: 1600,
  },
  { name: 'link', label: 'Click-through link (optional)', type: 'text', placeholder: '/admissions' },
  { name: 'ctaLabel', label: 'Button text (unused once an image is set)', type: 'text', placeholder: 'Apply now' },
  { name: 'order', label: 'Slide order', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: BANNER_STATUS_OPTIONS },
];

const columns: Column[] = [
  { key: 'order', header: 'Order' },
  { key: 'imageUrl', header: '', kind: 'image' },
  { key: 'title', header: 'Title' },
  { key: 'status', header: 'Status', kind: 'pill', map: { LIVE: 'Live', HIDDEN: 'Hidden' }, tone: BANNER_TONE },
];

export default async function BannersPage() {
  await requirePermission('banners');
  const rows = await db.banner.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="banners"
      title="Home Hero Banners"
      addLabel="Banner"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add a hero slide for the top of the home page."
    />
  );
}
