'use client';

import Link from 'next/link';
import { useState } from 'react';

export type NewsItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  body: string;
  date: string;
};

function fmt(date: string) {
  const d = new Date(date);
  return { day: d.getDate().toString().padStart(2, '0'), mon: d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase() };
}

export function NewsFilters({ items }: { items: NewsItem[] }) {
  const [type, setType] = useState('all');
  const shown = type === 'all' ? items : items.filter((n) => n.type === type);

  return (
    <>
      <div className="ds-filters">
        <button type="button" className={type === 'all' ? 'on' : ''} onClick={() => setType('all')}>
          ALL
        </button>
        <button type="button" className={type === 'NOTICE' ? 'on' : ''} onClick={() => setType('NOTICE')}>
          Notices
        </button>
        <button type="button" className={type === 'EVENT' ? 'on' : ''} onClick={() => setType('EVENT')}>
          Events
        </button>
      </div>

      <div className="ds-count">
        Showing <b>{shown.length}</b> updates
      </div>

      <div>
        {shown.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--ds-mut)', fontSize: '14px', padding: '34px 0' }}>
            No updates in this category yet.
          </p>
        ) : (
          shown.map((n) => {
            const d = fmt(n.date);
            return (
              <Link key={n.id} href={`/news/${n.slug}`} className="ds-ncard">
                <div className="dt2">
                  <b>{d.day}</b>
                  <span>{d.mon}</span>
                </div>
                <div className="c2">
                  <span className={`tagn ${n.type === 'EVENT' ? 'tn-event' : 'tn-notice'}`}>
                    {n.type === 'EVENT' ? 'EVENT' : 'NOTICE'}
                  </span>
                  <h4>{n.title}</h4>
                  {n.body ? <p>{n.body}</p> : null}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
