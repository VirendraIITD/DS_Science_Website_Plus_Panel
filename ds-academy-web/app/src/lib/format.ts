const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const rupees = (n: number) => INR.format(n || 0);

// The server (Railway) runs in UTC, not IST — every one of these needs an
// explicit timeZone or `toLocaleString`/`toLocaleDateString` silently uses
// the *server's* local time, which showed dates/times 5.5 hours behind
// what actually happened (e.g. the Activity Log).
const IST = 'Asia/Kolkata';

/**
 * Toppers are sometimes named "1_Akhil Gupta" / "2. Sonam Meena" in the
 * office spreadsheet — a serial number kept in front so the sheet stays
 * sorted. Strips that prefix for display; never touches the stored name.
 */
export function topperDisplayName(name: string) {
  const stripped = name.replace(/^\d+[\s_.\-]+/, '').trim();
  return stripped || name;
}

/**
 * "AIR" reads fine next to a Category Rank column, but alone in a full-width
 * strip it looked like an abandoned corner label — spelled out and bolded
 * when it's the only number shown. Independent of how "AIR"/whatever was
 * typed in the admin form; this only looks at the exam name.
 */
export function rankLabel(exam: string, hasCategoryRank: boolean) {
  const isRankExam = exam.toUpperCase().includes('NEET') || exam.toUpperCase().includes('JEE');
  if (!isRankExam) return 'SCORE';
  return hasCategoryRank ? 'AIR' : 'ALL INDIA RANK';
}

export function shortDate(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: IST,
  });
}

export function dayMonth(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: IST });
}

export function dateTime(d: Date | string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: IST,
  });
}

export function forInput(d: Date | string | null | undefined) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function forInputDateTime(d: Date | string | null | undefined) {
  if (!d) return '';
  const dt = new Date(d);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

/** Masks a phone the way the prototype tables do: +91 9•••••210 */
export function maskPhone(phone: string) {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length < 7) return phone;
  const last = d.slice(-3);
  const first = d.slice(-10, -9) || d[0];
  return `+91 ${first}•••••${last}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export const CLASS_LEVEL_LABEL: Record<string, string> = {
  ELEMENTARY: 'Elementary',
  CLASS_6: 'Class VI',
  CLASS_7: 'Class VII',
  CLASS_8: 'Class VIII',
  CLASS_9: 'Class IX',
  CLASS_10: 'Class X',
  CLASS_11: 'Class XI',
  CLASS_12: 'Class XII',
  // Legacy values — no longer offered in the admin form, kept only so
  // courses/packages saved before this change still render a label (or,
  // for DROPPER, are hidden — see the filter used everywhere this label
  // map is read) instead of a raw enum string or a blank.
  FOUNDATION: 'Foundation 6–10',
};

/** Class-level values the site no longer shows, even if some existing course/package rows still carry them. Filter with `.filter(l => !HIDDEN_CLASS_LEVELS.includes(l))` before mapping through CLASS_LEVEL_LABEL. */
export const HIDDEN_CLASS_LEVELS = ['DROPPER'];

export const PACKAGE_TYPE_LABEL: Record<string, string> = {
  RECORDED: 'Recorded',
  LIVE: 'Live',
  TEST_SERIES: 'Test Series',
};

export const CATEGORY_LABEL: Record<string, string> = {
  NEET: 'GONEET WITH RBSE',
  JEE: 'GOJEE WITH RBSE',
  FOUNDATION: 'Nurture Your Knowledge WITH RBSE',
  BOARD: 'Board',
};

export const STAGE_LABEL: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  DEMO: 'Demo Booked',
  ADMITTED: 'Admitted',
  LOST: 'Lost',
};

export const SOURCE_LABEL: Record<string, string> = {
  WEBSITE: 'Website',
  WHATSAPP: 'WhatsApp',
  WALK_IN: 'Walk-in',
  REFERRAL: 'Referral',
  PHONE: 'Phone',
  IMPORT: 'Imported',
  OTHER: 'Other',
};
