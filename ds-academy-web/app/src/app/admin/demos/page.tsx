import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import type { Column, Field } from '@/components/admin/types';
import { DEMO_TONE } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEMO_MODE_OPTIONS, DEMO_STATUS_OPTIONS } from '@/lib/options';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

export default async function DemosPage() {
  if (!moduleEnabled('demos')) {
    return (
      <ProLocked
        title="Demo Bookings"
        blurb="A public Book-a-Demo form on the website, and a list here of who booked what, online or at the centre."
      />
    );
  }

  await requirePermission('demos');

  const [rows, branches] = await Promise.all([
    db.demoBooking.findMany({ orderBy: { date: 'desc' }, take: 400 }),
    db.branch.findMany({ select: { id: true, name: true } }),
  ]);

  const fields: Field[] = [
    { name: 'studentName', label: 'Student name', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'course', label: 'Course', type: 'text' },
    { name: 'date', label: 'Date & time', type: 'datetime' },
    { name: 'mode', label: 'Mode', type: 'select', options: DEMO_MODE_OPTIONS },
    { name: 'status', label: 'Status', type: 'select', options: DEMO_STATUS_OPTIONS },
    {
      name: 'branchId',
      label: 'Branch',
      type: 'select',
      placeholder: 'Not set',
      options: branches.map((b) => ({ value: b.id, label: b.name })),
    },
    { name: 'notes', label: 'Notes', type: 'textarea', rows: 2, full: true },
  ];

  const columns: Column[] = [
    { key: 'studentName', header: 'Student' },
    { key: 'course', header: 'Course' },
    { key: 'phone', header: 'Phone', kind: 'phone' },
    { key: 'date', header: 'Date', kind: 'datetime' },
    { key: 'mode', header: 'Mode', kind: 'pill', map: { ONLINE: 'Online', CENTRE: 'Centre' }, tone: { ONLINE: 'b', CENTRE: 'p' } },
    {
      key: 'status',
      header: 'Status',
      kind: 'pill',
      map: { UPCOMING: 'Upcoming', DONE: 'Done', NO_SHOW: 'No-show', CANCELLED: 'Cancelled' },
      tone: DEMO_TONE,
    },
  ];

  return (
    <ResourceManager
      resource="demos"
      title="Demo Bookings"
      addLabel="Booking"
      fields={fields}
      columns={columns}
      rows={rows as never}
      emptyHint="Bookings from the website's Book-a-Demo form land here."
    />
  );
}
