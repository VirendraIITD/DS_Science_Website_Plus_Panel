import type { Prisma } from '@prisma/client';

/** Lead segments offered in Broadcast's "Send to" dropdown (PRD §7.2). */
export const SEGMENTS: Record<string, { label: string; where: Prisma.EnquiryWhereInput }> = {
  ALL_NEW: { label: 'All New Leads', where: { stage: 'NEW' } },
  ALL_LEADS: { label: 'Every Lead', where: {} },
  NEET: { label: 'NEET Enquiries', where: { course: { contains: 'NEET', mode: 'insensitive' } } },
  JEE: { label: 'JEE Enquiries', where: { course: { contains: 'JEE', mode: 'insensitive' } } },
  FOUNDATION: {
    label: 'Foundation Enquiries',
    where: { course: { contains: 'Foundation', mode: 'insensitive' } },
  },
  CONTACTED: { label: 'Contacted (not yet admitted)', where: { stage: 'CONTACTED' } },
  DEMO: { label: 'Demo Booked', where: { stage: 'DEMO' } },
  NOT_ADMITTED: {
    label: 'Everyone except Admitted',
    where: { stage: { notIn: ['ADMITTED', 'LOST'] } },
  },
};

export const SEGMENT_OPTIONS = Object.entries(SEGMENTS).map(([value, s]) => ({
  value,
  label: s.label,
}));
