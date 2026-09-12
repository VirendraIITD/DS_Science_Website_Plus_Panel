'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/admin/Toast';

/**
 * Results/toppers arrive in bulk every exam season — this loads a CSV file
 * in one go instead of adding each selection through the form one by one.
 * Columns: Name, photoUrl, Rank, Year, City/Village, Display Order, Home
 * Page, Visible on website — column order doesn't matter, they're matched
 * by header name. Quote and Story caption are deliberately NOT here; those
 * get added per-student afterwards via the normal Edit form in the panel.
 * Photos can't travel inside a CSV, so photoUrl must already be a hosted
 * link (e.g. from the ImageKit bulk-upload tool) — leave it blank to add
 * the photo later via Edit instead.
 */
export function ToppersImport() {
  const router = useRouter();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!file) return;
    setBusy(true);
    try {
      const csv = await file.text();

      const res = await fetch('/api/admin/toppers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Import failed', 'bad');
        return;
      }

      toast(
        `Imported ${json.imported} topper(s)` +
          (json.duplicates ? `, ${json.duplicates} already on file skipped` : '') +
          (json.skipped ? `, ${json.skipped} invalid row(s) skipped` : ''),
      );
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
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
        <span>Bulk import results</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : '⬆ Attach CSV'}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-mut">
            Attach this year&rsquo;s selection list as a CSV file, header row required. Column order
            doesn&rsquo;t matter — matched by name. Required:{' '}
            <code className="rounded bg-canvas px-1">Name</code>,{' '}
            <code className="rounded bg-canvas px-1">Year</code>, and at least one of{' '}
            <code className="rounded bg-canvas px-1">Rank</code> /{' '}
            <code className="rounded bg-canvas px-1">Category Rank</code> — a row missing both is skipped,
            but either one alone is fine (a category rank can come in before the AIR is out, or the other
            way round). Optional:{' '}
            <code className="rounded bg-canvas px-1">Exam</code> (defaults to &ldquo;NEET-UG&rdquo; if left
            out),{' '}
            <code className="rounded bg-canvas px-1">photoUrl</code> (a hosted link, not a file),{' '}
            <code className="rounded bg-canvas px-1">City/Village</code>,{' '}
            <code className="rounded bg-canvas px-1">Display Order</code>,{' '}
            <code className="rounded bg-canvas px-1">Home Page</code> (yes/no),{' '}
            <code className="rounded bg-canvas px-1">Visible on website</code> (yes/no). Quote and
            Story caption aren&rsquo;t bulk fields — add those per student afterwards via Edit. A row
            already on the site (same Name + Rank + Year) is skipped automatically, so uploading the
            same file twice will not create duplicates.
          </p>

          <input
            ref={fileInput}
            type="file"
            accept=".csv,text/csv"
            className="inp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button className="btn" onClick={submit} disabled={busy || !file}>
            {busy ? 'Importing…' : 'Import results'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
