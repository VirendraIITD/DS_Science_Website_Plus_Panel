import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'question', label: 'Question', type: 'text', full: true },
  { name: 'answer', label: 'Answer', type: 'textarea', rows: 4, full: true },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'Admissions / Fees / Batches' },
  { name: 'order', label: 'Order', type: 'number' },
  { name: 'active', label: 'Show on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'question', header: 'Question' },
  { key: 'category', header: 'Category', kind: 'pill' },
  { key: 'order', header: 'Order' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function FaqPage() {
  if (!moduleEnabled('faq')) {
    return (
      <ProLocked
        title="FAQ manager"
        blurb="The questions the front office answers on the phone twenty times a day, published as an accordion on the website."
      />
    );
  }

  await requirePermission('faq');
  const rows = await db.faq.findMany({ orderBy: [{ category: 'asc' }, { order: 'asc' }] });

  return (
    <ResourceManager
      resource="faqs"
      title="FAQ"
      addLabel="Q&A"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add the questions parents actually ask. Answered here, they stop reaching the phone."
    />
  );
}
