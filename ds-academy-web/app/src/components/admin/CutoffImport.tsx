'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/admin/Toast';

const SAMPLE = `exam,year,college,courseName,state,category,quota,closingRank
NEET,2025,SMS Medical College Jaipur,MBBS,Rajasthan,General,All India,9800
NEET,2025,Govt. Medical College Kota,MBBS,Rajasthan,General,All India,16500`;

/**
 * Cut-off data arrives as a spreadsheet every year, so typing it row by row is
 * not realistic. This takes a pasted CSV and loads the lot in one go.
 */
export function CutoffImport() {
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [replace, setReplace] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/cutoffs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, replace }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Import failed', 'bad');
        return;
      }

      toast(`Imported ${json.imported} row(s)${json.skipped ? `, skipped ${json.skipped}` : ''}`);
      setCsv('');
      setOpen(false);
      router.refresh();
    } catch {
      toast('Network error', 'bad');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>Bulk import</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : '⬆ Paste CSV'}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-mut">
            Paste the cut-off sheet with a header row. Required columns:{' '}
            <code className="rounded bg-canvas px-1">exam</code>,{' '}
            <code className="rounded bg-canvas px-1">year</code>,{' '}
            <code className="rounded bg-canvas px-1">college</code>,{' '}
            <code className="rounded bg-canvas px-1">closingRank</code>. Optional:{' '}
            <code className="rounded bg-canvas px-1">courseName</code>,{' '}
            <code className="rounded bg-canvas px-1">state</code>,{' '}
            <code className="rounded bg-canvas px-1">category</code>,{' '}
            <code className="rounded bg-canvas px-1">quota</code>.
          </p>

          <textarea
            className="inp font-mono text-[12px]"
            rows={10}
            placeholder={SAMPLE}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />

          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#2563eb]"
              checked={replace}
              onChange={(e) => setReplace(e.target.checked)}
            />
            <span className="text-mut">
              Replace the existing rows for each exam + year in this file
            </span>
          </label>

          <button className="btn" onClick={submit} disabled={busy || csv.trim().length < 20}>
            {busy ? 'Importing…' : 'Import rows'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
