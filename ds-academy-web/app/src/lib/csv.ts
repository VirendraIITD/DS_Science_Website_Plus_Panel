import 'server-only';

/** RFC-4180 escaping; a leading ' + - = is neutralised so Excel cannot treat
 *  a lead's name as a formula. */
function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s = value instanceof Date ? value.toISOString() : String(value);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[], columns: { key: string; header: string }[]) {
  const head = columns.map((c) => cell(c.header)).join(',');
  const body = rows.map((r) => columns.map((c) => cell(r[c.key])).join(',')).join('\r\n');
  // BOM so Excel opens UTF-8 (Hindi names) correctly.
  return `﻿${head}\r\n${body}\r\n`;
}

export function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Minimal CSV reader — handles quoted fields and embedded commas. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
      continue;
    }

    if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (c !== '\r') cell += c;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

/** Case/space/underscore-insensitive column lookup against a header row. */
export function csvColumnIndex(header: string[], ...names: string[]) {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[\s_]/g, '');
  const normalizedHeader = header.map(norm);
  for (const n of names) {
    const at = normalizedHeader.indexOf(norm(n));
    if (at !== -1) return at;
  }
  return -1;
}
