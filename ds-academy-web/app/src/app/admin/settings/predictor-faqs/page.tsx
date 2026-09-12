import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'question', label: 'Question', type: 'text', full: true, placeholder: 'How accurate is this predictor?' },
  { name: 'answer', label: 'Answer', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on Predictor page', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'order', header: '#' },
  { key: 'question', header: 'Question' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function PredictorFaqsPage() {
  await requirePermission('settings');
  const rows = await db.predictorFaq.findMany({ orderBy: { order: 'asc' } });

  return (
    <ResourceManager
      resource="predictorFaqs"
      title="Rank predictor questions (Predictor page)"
      addLabel="Question"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="FAQs shown at the bottom of the Rank & College Predictor page."
    />
  );
}
