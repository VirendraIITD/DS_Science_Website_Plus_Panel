import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'role', label: 'Who they are', type: 'text', placeholder: 'NEET 2025 · AIR 342 / Parent, Class 10' },
  { name: 'photoUrl', label: 'Photo', type: 'photo', full: true },
  { name: 'quote', label: 'What they said', type: 'textarea', rows: 3, full: true },
  { name: 'youtubeId', label: 'YouTube video link (optional)', type: 'text', placeholder: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', help: 'Paste the full video link (or just the ID) — not the video’s title. A video testimonial plays instead of the quote.' },
  { name: 'thumbnailUrl', label: 'Video thumbnail (optional)', type: 'photo', full: true, help: 'Leave blank to use YouTube’s own thumbnail automatically. Only needed if that thumbnail looks wrong or you want a custom one.' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'photoUrl', header: '', kind: 'image' },
  { key: 'name', header: 'Name' },
  { key: 'role', header: 'Who' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function TestimonialsPage() {
  await requirePermission('settings');
  const rows = await db.testimonial.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="testimonials"
      title="Testimonials"
      addLabel="Testimonial"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Quotes from students and parents carry more weight than anything you write yourself."
    />
  );
}
