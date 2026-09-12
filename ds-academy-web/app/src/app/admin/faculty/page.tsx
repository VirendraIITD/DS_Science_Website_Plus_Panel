import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Dr. R. Sharma' },
  { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Physics' },
  { name: 'photoUrl', label: 'Photo', type: 'photo', full: true },
  { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'M.Sc., Ph.D.' },
  { name: 'experienceYears', label: 'Experience (years)', type: 'number' },
  { name: 'bio', label: 'Short bio', type: 'textarea', rows: 3, full: true },
  { name: 'order', label: 'Display order', type: 'number' },
  { name: 'active', label: 'Visible on website', type: 'checkbox', defaultValue: true },
];

const columns: Column[] = [
  { key: 'photoUrl', header: '', kind: 'image' },
  { key: 'name', header: 'Name' },
  { key: 'subject', header: 'Subject', kind: 'pill' },
  { key: 'qualification', header: 'Qualification' },
  { key: 'experienceYears', header: 'Years' },
  { key: 'active', header: 'Live', kind: 'bool' },
];

export default async function FacultyPage() {
  await requirePermission('faculty');
  const rows = await db.faculty.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });

  return (
    <ResourceManager
      resource="faculty"
      title="Faculty"
      addLabel="Faculty member"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add your teaching staff — they appear on the Faculty page."
    />
  );
}
