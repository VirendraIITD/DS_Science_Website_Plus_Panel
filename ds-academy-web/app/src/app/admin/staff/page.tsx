import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { ROLE_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { ROLE_OPTIONS } from '@/lib/options';
import { defaultPermissions, roleLabel } from '@/lib/rbac';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'email', label: 'Email (used to sign in)', type: 'text' },
  { name: 'role', label: 'Role', type: 'select', options: ROLE_OPTIONS, full: true },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    full: true,
    help: 'At least 8 characters. Leave blank when editing to keep the current password.',
  },
  { name: 'active', label: 'Can sign in', type: 'checkbox', defaultValue: true },
  {
    name: 'counsellingAccess',
    label: 'Also give Mentora Counselling panel access',
    type: 'checkbox',
    help: 'Adds a "Counselling" link in the sidebar that opens the separate Mentora panel in a new tab — independent of role, on top of whatever this account already has.',
  },
];

const columns: Column[] = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  {
    key: 'role',
    header: 'Role',
    kind: 'pill',
    map: { SUPER_ADMIN: 'Super Admin', COUNSELLOR: 'Counsellor', EDITOR: 'Editor' },
    tone: ROLE_TONE,
  },
  { key: 'counsellingAccess', header: 'Counselling', kind: 'bool' },
  { key: 'active', header: 'Active', kind: 'bool' },
  { key: 'lastLoginAt', header: 'Last signed in', kind: 'datetime' },
];

export default async function StaffPage() {
  if (!moduleEnabled('staff')) {
    return (
      <ProLocked
        title="Staff accounts & roles"
        blurb="More than one login, each with its own role — Super Admin sees everything, Counsellors see leads, Editors see content."
      />
    );
  }

  await requirePermission('staff');

  const rows = await db.adminUser.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      counsellingAccess: true,
      lastLoginAt: true,
    },
  });

  return (
    <>
      <ResourceManager
        resource="staff"
        title="Staff & Roles"
        addLabel="Staff account"
        fields={fields}
        columns={columns}
        rows={rows as never}
        emptyHint="Add the people who need their own login."
      />

      <div className="card mt-4">
        <div className="card-title">What each role can open</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(['SUPER_ADMIN', 'COUNSELLOR', 'EDITOR'] as const).map((role) => (
            <div key={role}>
              <h4 className="mb-2 text-[13px] font-bold">{roleLabel(role)}</h4>
              <div className="flex flex-wrap gap-1">
                {role === 'SUPER_ADMIN' ? (
                  <span className="pill pill-p">Everything</span>
                ) : (
                  defaultPermissions(role).map((p) => (
                    <span key={p} className="pill pill-n">
                      {p}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
