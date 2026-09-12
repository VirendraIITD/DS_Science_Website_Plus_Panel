'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useToast } from '@/components/admin/Toast';

const SAMPLE = `name,phone,email,course,classOf,city,message
Ritika Sharma,9876543210,,NEET-UG,Class 11,Gangapur City,Met at the school fair
Aman Verma,9123456780,aman@example.com,IIT-JEE,Class 12,Gangapur City,`;

/**
 * Leads that come in from outside the website — a coaching fair sign-up
 * sheet, a purchased list, an old spreadsheet — land here instead of being
 * typed one by one. Every imported row is tagged source = Imported so it's
 * never confused with a real website submission (see Admin > Enquiries'
 * Source column / Admin > Analytics' Lead sources chart).
 */
export function EnquiryImport() {
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/enquiries/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Import failed', 'bad');
        return;
      }

      toast(`Imported ${json.imported} lead(s)${json.skipped ? `, skipped ${json.skipped}` : ''}`);
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
        <span>Bulk import leads (from outside the website)</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setOpen((o) => !o)}>
          {open ? 'Hide' : '⬆ Paste CSV'}
        </button>
      </div>

      {open ? (
        <div className="space-y-3">
          <p className="text-[12.5px] text-mut">
            Paste leads from a sign-up sheet, an old spreadsheet, or a purchased list — with a header
            row. Required columns: <code className="rounded bg-canvas px-1">name</code>,{' '}
            <code className="rounded bg-canvas px-1">phone</code>. Optional:{' '}
            <code className="rounded bg-canvas px-1">email</code>,{' '}
            <code className="rounded bg-canvas px-1">course</code>,{' '}
            <code className="rounded bg-canvas px-1">classOf</code>,{' '}
            <code className="rounded bg-canvas px-1">city</code>,{' '}
            <code className="rounded bg-canvas px-1">message</code>. Every imported row is tagged
            &ldquo;Imported&rdquo; as its source, so it&rsquo;s never mixed up with a real website
            submission.
          </p>

          <textarea
            className="inp font-mono text-[12px]"
            rows={8}
            placeholder={SAMPLE}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />

          <button className="btn" onClick={submit} disabled={busy || csv.trim().length < 10}>
            {busy ? 'Importing…' : 'Import leads'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
