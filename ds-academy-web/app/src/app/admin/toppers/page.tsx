import { ResourceManager } from '@/components/admin/ResourceManager';
import { ToppersImport } from '@/components/admin/ToppersImport';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Student name', type: 'text', placeholder: 'Ananya Singh' },
  { name: 'photoUrl', label: 'Photo', type: 'photo', full: true },
  { name: 'exam', label: 'Exam', type: 'text', placeholder: 'NEET / JEE Advanced' },
  { name: 'rankOrScore', label: 'Rank or score', type: 'text', placeholder: 'AIR 342 / 685 of 720' },
  { name: 'categoryRank', label: 'Category rank (optional)', type: 'text', placeholder: 'OBC AIR 512', help: 'Category-wise rank, if the student wants it shown alongside the overall rank.' },
  { name: 'year', label: 'Year', type: 'number', defaultValue: new Date().getFullYear() },
  { name: 'address', label: 'City / village', type: 'text', placeholder: 'Gangapur City' },
  { name: 'order', label: 'Display order', type: 'number', help: 'Lower shows first' },
  { name: 'storyTag', label: 'Story caption (optional)', type: 'text', placeholder: 'Self-Belief & Hardwork', help: 'Short punchy line shown on the "DS Stars" home page cards. Falls back to the exam name if left blank.' },
  { name: 'quote', label: 'Quote (optional)', type: 'textarea', full: true },
  { name: 'featured', label: 'Show on home page', type: 'checkbox', help: 'Include in the home toppers strip' },
  { name: 'active', label: 'Visible on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'photoUrl', header: 'Photo', kind: 'image' },
  { key: 'name', header: 'Name' },
  { key: 'exam', header: 'Exam', kind: 'pill' },
  { key: 'rankOrScore', header: 'Rank / Score' },
  { key: 'categoryRank', header: 'Category Rank' },
  { key: 'year', header: 'Year' },
  { key: 'address', header: 'City' },
  { key: 'featured', header: 'On home', kind: 'bool' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function ToppersPage() {
  await requirePermission('toppers');
  const rows = await db.topper.findMany({ orderBy: [{ order: 'asc' }, { year: 'desc' }] });

  return (
    <>
      <ToppersImport />

      <ResourceManager
        resource="toppers"
        title="Toppers / Results"
        addLabel="Topper"
        fields={fields}
        columns={columns}
        rows={rows as never}
        emptyHint="Add your first selection — it appears on the home page and the Results page straight away."
      />
    </>
  );
}
