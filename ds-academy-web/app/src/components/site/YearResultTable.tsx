'use client';

import { useState } from 'react';

import { topperDisplayName } from '@/lib/format';

type Row = {
  id: string;
  name: string;
  exam: string;
  rankOrScore: string;
  categoryRank?: string;
  year: number;
  address?: string;
};

function examTagClass(exam: string) {
  const u = exam.toUpperCase();
  if (u.includes('NEET')) return 'tg-neet';
  if (u.includes('JEE')) return 'tg-jee';
  return 'tg-board';
}

/** "Complete result list" split into one tab per year, newest first. */
export function YearResultTable({ rows, years }: { rows: Row[]; years: number[] }) {
  const [year, setYear] = useState<number>(years[0]);
  const shown = rows.filter((r) => r.year === year);

  return (
    <div>
      <div className="ds-filters" style={{ marginBottom: '18px' }}>
        {years.map((y) => (
          <button key={y} type="button" className={y === year ? 'on' : ''} onClick={() => setYear(y)}>
            {y}
            <span style={{ marginLeft: '6px', opacity: 0.65 }}>({rows.filter((r) => r.year === y).length})</span>
          </button>
        ))}
      </div>

      <div className="ds-tblw">
        <table>
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>EXAM</th>
              <th>RANK / SCORE</th>
              <th>CATEGORY RANK</th>
              <th>CITY</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((t) => (
              <tr key={t.id}>
                <td>
                  <b>{topperDisplayName(t.name)}</b>
                </td>
                <td>
                  <span className={`etag ${examTagClass(t.exam)}`}>{t.exam.toUpperCase()}</span>
                </td>
                <td style={{ fontWeight: 800, color: 'var(--ds-navy)' }}>{t.rankOrScore || '—'}</td>
                <td>{t.categoryRank || '—'}</td>
                <td style={{ fontWeight: 800, color: '#000', textTransform: 'uppercase' }}>{t.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
