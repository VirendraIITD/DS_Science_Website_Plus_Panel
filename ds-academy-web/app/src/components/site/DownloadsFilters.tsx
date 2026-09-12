'use client';

import { useMemo, useState } from 'react';

export type DownloadFile = {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  fileSizeKb: number;
  downloadsCount: number;
};

const GROUPS = [
  { key: 'all', label: 'All files' },
  { key: 'BROCHURE', label: 'Brochure & fees' },
  { key: 'SYLLABUS', label: 'Syllabus' },
  { key: 'PYQ', label: 'Past papers & keys' },
  { key: 'OTHER', label: 'Other' },
] as const;

function sizeLabel(kb: number) {
  if (!kb) return '';
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

export function DownloadsFilters({ files }: { files: DownloadFile[] }) {
  const [cat, setCat] = useState<string>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return files.filter((f) => {
      if (cat !== 'all' && f.category !== cat) return false;
      if (term && !f.title.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [files, cat, q]);

  const availableGroups = GROUPS.filter((g) => g.key === 'all' || files.some((f) => f.category === g.key));

  return (
    <>
      <div className="ds-tabs">
        {availableGroups.map((g) => (
          <button key={g.key} type="button" className={cat === g.key ? 'on' : ''} onClick={() => setCat(g.key)}>
            {g.label}
          </button>
        ))}
      </div>

      <input
        className="ds-search"
        placeholder='Search — try "NEET", "syllabus", "2025"…'
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="ds-count">
        Showing <b>{shown.length}</b> of {files.length} files
      </div>

      {shown.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--ds-mut)', fontSize: '14px', padding: '34px 0' }}>
          No file found with that name. Try a different search term.
        </p>
      ) : (
        shown.map((f) => (
          <a key={f.id} href={`/api/download/${f.id}`} className="ds-drow">
            <span className="ic4">PDF</span>
            <span className="t2">
              <b>{f.title}</b>
              <span>
                {f.downloadsCount.toLocaleString('en-IN')} downloads
                {f.fileSizeKb ? ` · ${sizeLabel(f.fileSizeKb)}` : ''}
              </span>
            </span>
            <span className="ds-btn lineb sm">Download</span>
          </a>
        ))
      )}
    </>
  );
}
