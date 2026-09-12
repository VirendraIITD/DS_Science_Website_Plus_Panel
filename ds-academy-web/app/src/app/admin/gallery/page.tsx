import { GalleryManager } from '@/components/admin/GalleryManager';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  await requirePermission('gallery');

  const items = await db.galleryItem.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  const albums = [...new Set(items.map((i) => i.album).filter(Boolean))].sort();

  return <GalleryManager items={items as never} albums={albums} />;
}
