import { BroadcastForm } from '@/components/admin/BroadcastForm';
import { ProLocked } from '@/components/admin/ProLocked';
import { Pill } from '@/components/ui/Pill';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateTime } from '@/lib/format';
import { SEGMENTS } from '@/lib/segments';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const STATUS_TONE = { SENT: 'g', SIMULATED: 'y', FAILED: 'r', QUEUED: 'b', DRAFT: 'n' } as const;

export default async function BroadcastPage() {
  if (!moduleEnabled('broadcast')) {
    return (
      <ProLocked
        title="Broadcast"
        blurb="One WhatsApp or SMS message to a whole segment of leads — every new enquiry, everyone who asked about NEET, everyone who missed their demo."
      />
    );
  }

  await requirePermission('broadcast');

  // Recipient counts, so the panel says who will actually get the message.
  const counts = await Promise.all(
    Object.entries(SEGMENTS).map(async ([key, s]) => {
      const rows = await db.enquiry.findMany({ where: s.where, select: { phone: true } });
      const unique = new Set(rows.map((r) => r.phone.replace(/\D/g, '')).filter(Boolean));
      return [key, unique.size] as const;
    }),
  );

  const history = await db.broadcast.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { createdBy: { select: { name: true } } },
  });

  const configured = process.env.BROADCAST_PROVIDER === 'http' && Boolean(process.env.BROADCAST_API_URL);

  return (
    <>
      <BroadcastForm counts={Object.fromEntries(counts)} configured={configured} />

      <div className="card mt-4">
        <div className="card-title">Recent broadcasts</div>
        {history.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-mut">Nothing sent yet.</p>
        ) : (
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="tbl">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Channel</th>
                  <th>Segment</th>
                  <th>Message</th>
                  <th>Recipients</th>
                  <th>Status</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {history.map((b) => (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap">{dateTime(b.createdAt)}</td>
                    <td>
                      <Pill tone={b.channel === 'WHATSAPP' ? 'g' : 'b'}>
                        {b.channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}
                      </Pill>
                    </td>
                    <td>{b.segment}</td>
                    <td className="max-w-[280px] truncate" title={b.message}>
                      {b.message}
                    </td>
                    <td>
                      {b.sentCount}/{b.recipients}
                    </td>
                    <td>
                      <Pill tone={STATUS_TONE[b.status] ?? 'n'}>
                        {b.status === 'SIMULATED' ? 'Dry run' : b.status.toLowerCase()}
                      </Pill>
                    </td>
                    <td>{b.createdBy?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
