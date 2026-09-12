import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'question', label: 'Question', type: 'text', full: true, placeholder: 'Is the sample test really free?' },
  { name: 'answer', label: 'Answer', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Sample Test page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'question', header: 'Question' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function SampleTestFaqsPage() {
  await requirePermission('settings');
  const rows = await db.sampleTestFaq.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="sampleTestFaqs"
      title="Sample test questions (Sample Test page)"
      addLabel="Question"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="FAQs shown at the bottom of the Free Sample Test page."
    />
  );
}
