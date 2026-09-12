'use client';

import { useMemo, useState } from 'react';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export function FaqSearch({ faqs, categories }: { faqs: FaqItem[]; categories: string[] }) {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return faqs.filter((f) => {
      if (cat !== 'all' && f.category !== cat) return false;
      if (term && !f.question.toLowerCase().includes(term) && !f.answer.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [faqs, cat, q]);

  const groups = categories.filter((c) => shown.some((f) => f.category === c));

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto' }}>
      <input
        className="ds-search"
        style={{ maxWidth: 'none' }}
        placeholder='Search — try "fees", "hostel", "dropper", "refund"…'
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {categories.length > 1 ? (
        <div className="ds-filters">
          <button type="button" className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>
            ALL
          </button>
          {categories.map((c) => (
            <button key={c} type="button" className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <div className="ds-count">
        Showing <b>{shown.length}</b> questions
      </div>

      {shown.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--ds-mut)', fontSize: '14.5px', padding: '40px 0' }}>
          Couldn&apos;t find an answer to that question here. Call the office.
        </p>
      ) : (
        groups.map((c) => (
          <div key={c} style={{ marginBottom: '22px' }}>
            {categories.length > 1 ? (
              <h3 style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--ds-mut)', letterSpacing: '1px', marginBottom: '11px' }}>
                {c.toUpperCase()}
              </h3>
            ) : null}
            <div className="ds-faq" style={{ margin: 0 }}>
              {shown
                .filter((f) => f.category === c)
                .map((f) => (
                  <details key={f.id} className="ds-fq">
                    <summary>{f.question}</summary>
                    <div className="a">{f.answer}</div>
                  </details>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
