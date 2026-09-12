import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { DOWNLOAD_CATEGORY_OPTIONS } from '@/lib/options';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true, placeholder: 'Prospectus / Brochure 2026-27' },
  { name: 'category', label: 'Category', type: 'select', options: DOWNLOAD_CATEGORY_OPTIONS },
  { name: 'active', label: 'Available on website', type: 'checkbox', defaultValue: true },
  { name: 'fileUrl', label: 'File', type: 'file', full: true, help: 'PDF, Word, Excel or an image — up to 8 MB' },
];

const columns: Column[] = [
  { key: 'title', header: 'File' },
  {
    key: 'category',
    header: 'Category',
    kind: 'pill',
    map: { BROCHURE: 'Brochure', SYLLABUS: 'Syllabus', PYQ: 'PYQ', OTHER: 'Other' },
    tone: { BROCHURE: 'b', SYLLABUS: 'b', PYQ: 'y', OTHER: 'n' },
  },
  { key: 'downloadsCount', header: 'Downloads', kind: 'number' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function DownloadsPage() {
  await requirePermission('downloads');
  const rows = await db.download.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <ResourceManager
      resource="downloads"
      title="Downloads Center"
      addLabel="Download"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Upload the brochure, syllabus and previous-year papers students ask for."
    />
  );
}
