import { apiError } from '@/lib/api';
import { requirePermission } from '@/lib/auth';
import { csvResponse, toCsv } from '@/lib/csv';
import { db } from '@/lib/db';
import { SOURCE_LABEL, STAGE_LABEL, shortDate } from '@/lib/format';
import { isPro } from '@/lib/tier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** PRD §12: "leads exportable to CSV". */
export async function GET(req: Request) {
  try {
    await requirePermission('enquiries');

    const url = new URL(req.url);
    const stage = url.searchParams.get('stage');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    const rows = await db.enquiry.findMany({
      where: {
        NOT: { course: { startsWith: 'Career' } },
        ...(stage ? { stage: stage as never } : {}),
        ...(from || to
          ? {
              createdAt: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(`${to}T23:59:59`) } : {}),
              },
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: { select: { name: true } }, branch: { select: { name: true } } },
    });

    const flat = rows.map((r) => ({
      name: r.name,
      phone: r.phone,
      email: r.email,
      course: r.course,
      classOf: r.classOf,
      city: r.city,
      source: SOURCE_LABEL[r.source] ?? r.source,
      stage: STAGE_LABEL[r.stage] ?? r.stage,
      assignedTo: r.assignedTo?.name ?? '',
      branch: r.branch?.name ?? '',
      followUpDate: r.followUpDate ? shortDate(r.followUpDate) : '',
      message: r.message,
      createdAt: shortDate(r.createdAt),
    }));

    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'course', header: 'Course' },
      { key: 'classOf', header: 'Class' },
      { key: 'city', header: 'City' },
      { key: 'source', header: 'Source' },
      { key: 'stage', header: 'Status' },
      // CRM columns are meaningless on Elite, so they are left out there.
      ...(isPro()
        ? [
            { key: 'assignedTo', header: 'Assigned To' },
            { key: 'branch', header: 'Branch' },
            { key: 'followUpDate', header: 'Follow-up' },
          ]
        : []),
      { key: 'message', header: 'Message' },
      { key: 'createdAt', header: 'Received On' },
    ];

    const stamp = new Date().toISOString().slice(0, 10);
    return csvResponse(toCsv(flat, columns), `ds-enquiries-${stamp}.csv`);
  } catch (err) {
    return apiError(err);
  }
}
