import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { BRANCH_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { BRANCH_STATUS_OPTIONS } from '@/lib/options';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Centre name', type: 'text', placeholder: 'Main Campus' },
  { name: 'city', label: 'City', type: 'text', placeholder: 'Gangapur City' },
  { name: 'address', label: 'Address', type: 'textarea', rows: 2, full: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'email', label: 'Email', type: 'text' },
  { name: 'studentsCount', label: 'Students', type: 'number' },
  { name: 'status', label: 'Status', type: 'select', options: BRANCH_STATUS_OPTIONS },
  { name: 'imageUrl', label: 'Photo', type: 'image', full: true, aspect: 4 / 3 },
  { name: 'mapEmbed', label: 'Google Maps embed', type: 'textarea', rows: 3, full: true, help: 'Paste the <iframe> from Google Maps › Share › Embed a map.' },
  { name: 'isMain', label: 'This is the main campus', type: 'checkbox' },
  { name: 'order', label: 'Order', type: 'number' },
];

const columns: Column[] = [
  { key: 'name', header: 'Centre' },
  { key: 'city', header: 'City' },
  { key: 'studentsCount', header: 'Students', kind: 'number' },
  { key: 'isMain', header: 'Main', kind: 'bool' },
  { key: 'status', header: 'Status', kind: 'pill', map: { ACTIVE: 'Active', SETUP: 'Setup', CLOSED: 'Closed' }, tone: BRANCH_TONE },
];

export default async function BranchesPage() {
  if (!moduleEnabled('branches')) {
    return (
      <ProLocked
        title="Multi-branch manager"
        blurb="Each centre with its own address, phone, map and contact page, and leads tagged to the branch they came from."
      />
    );
  }

  await requirePermission('branches');
  const rows = await db.branch.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] });

  return (
    <ResourceManager
      resource="branches"
      title="Branches / Centres"
      addLabel="Branch"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Add each centre you run. Every one gets its own contact page."
    />
  );
}
