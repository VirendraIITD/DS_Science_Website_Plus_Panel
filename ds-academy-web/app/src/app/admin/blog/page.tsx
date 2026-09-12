import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { PUBLISH_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { PUBLISH_OPTIONS } from '@/lib/options';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'title', label: 'Title', type: 'text', full: true },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'NEET / JEE / Foundation' },
  { name: 'status', label: 'Status', type: 'select', options: PUBLISH_OPTIONS },
  { name: 'publishedAt', label: 'Publish date', type: 'date', help: 'Leave blank to use today when you publish' },
  { name: 'coverUrl', label: 'Cover image', type: 'image', full: true, aspect: 16 / 9 },
  { name: 'excerpt', label: 'Short summary', type: 'textarea', rows: 2, full: true, help: 'Shown on the blog list and when shared' },
  { name: 'body', label: 'Article', type: 'richtext', full: true, help: 'Plain text. A blank line starts a new paragraph.' },
  { name: 'seoTitle', label: 'SEO title', type: 'text', full: true, help: 'Leave blank to use the article title' },
  { name: 'seoDescription', label: 'SEO description', type: 'textarea', rows: 2, full: true },
  { name: 'slug', label: 'URL slug', type: 'text', full: true, help: 'Leave blank to build it from the title' },
];

const columns: Column[] = [
  { key: 'title', header: 'Title' },
  { key: 'category', header: 'Category', kind: 'pill' },
  { key: 'publishedAt', header: 'Published', kind: 'date' },
  { key: 'status', header: 'Status', kind: 'pill', map: { DRAFT: 'Draft', PUBLISHED: 'Published' }, tone: PUBLISH_TONE },
];

export default async function BlogPage() {
  if (!moduleEnabled('blog')) {
    return (
      <ProLocked
        title="Blog / Articles"
        blurb="SEO articles with their own titles, descriptions and URLs — the pages that bring students to the site from Google."
      />
    );
  }

  await requirePermission('blog');
  const rows = await db.blogPost.findMany({ orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }] });

  return (
    <ResourceManager
      resource="blog"
      title="Blog / Articles"
      addLabel="Article"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Write about what students ask you. Those are the pages Google sends traffic to."
    />
  );
}
