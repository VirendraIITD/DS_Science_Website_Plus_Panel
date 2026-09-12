import { ProLocked } from '@/components/admin/ProLocked';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { CutoffImport } from '@/components/admin/CutoffImport';
import type { Column, Field } from '@/components/admin/types';
import { requirePermission } from '@/lib/auth';
import { db } from '@/lib/db';
import { moduleEnabled } from '@/lib/tier';

export const dynamic = 'force-dynamic';

const fields: Field[] = [
  { name: 'exam', label: 'Exam', type: 'text', placeholder: 'NEET / JEE' },
  { name: 'year', label: 'Year', type: 'number', defaultValue: new Date().getFullYear() - 1 },
  { name: 'college', label: 'College', type: 'text', full: true },
  { name: 'courseName', label: 'Course / branch', type: 'text', placeholder: 'MBBS / Computer Science' },
  { name: 'state', label: 'State', type: 'text' },
  { name: 'category', label: 'Category', type: 'text', placeholder: 'General / OBC / SC / ST / EWS' },
  { name: 'quota', label: 'Quota', type: 'text', placeholder: 'All India / State' },
  { name: 'closingRank', label: 'Closing rank', type: 'number' },
];

const columns: Column[] = [
  { key: 'exam', header: 'Exam', kind: 'pill' },
  { key: 'college', header: 'College' },
  { key: 'courseName', header: 'Course' },
  { key: 'category', header: 'Category' },
  { key: 'quota', header: 'Quota' },
  { key: 'closingRank', header: 'Closing rank', kind: 'number' },
  { key: 'year', header: 'Year' },
];

export default async function PredictorAdminPage() {
  if (!moduleEnabled('predictor')) {
    return (
      <ProLocked
        title="Rank / College Predictor"
        blurb="Students enter their rank and see which colleges are Safe, Moderate or a Reach — driven by cut-off data you manage here."
      />
    );
  }

  await requirePermission('predictor');

  const [rows, years] = await Promise.all([
    db.predictorCutoff.findMany({
      orderBy: [{ year: 'desc' }, { closingRank: 'asc' }],
      take: 500,
    }),
    db.predictorCutoff.groupBy({ by: ['exam', 'year'], _count: { _all: true } }),
  ]);

  return (
    <>
      <div className="card mb-4">
        <div className="card-title">What is loaded</div>
        {years.length === 0 ? (
          <p className="text-[13px] text-mut">
            No cut-off data yet. The public predictor stays hidden until at least one row exists.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {years
              .sort((a, b) => b.year - a.year)
              .map((y) => (
                <span key={`${y.exam}-${y.year}`} className="chip">
                  {y.exam} {y.year} · {y._count._all.toLocaleString('en-IN')} rows
                </span>
              ))}
          </div>
        )}
        <p className="mt-3 text-[12px] text-mut">
          Predictions use the most recent year on file for each exam. Older years stay stored for
          reference but are not used in the calculation.
        </p>
      </div>

      <CutoffImport />

      <div className="mt-4">
        <ResourceManager
          resource="cutoffs"
          title="Cut-off data"
          addLabel="Cutoff row"
          fields={fields}
          columns={columns}
          rows={rows as never}
          emptyHint="Add cut-off rows, or paste a whole year's CSV above."
        />
      </div>
    </>
  );
}
