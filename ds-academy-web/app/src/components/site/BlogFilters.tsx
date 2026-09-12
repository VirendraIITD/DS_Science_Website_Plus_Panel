'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export type BlogCard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  coverUrl: string;
  dateLabel: string;
};

export function BlogFilters({ posts, categories }: { posts: BlogCard[]; categories: string[] }) {
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (term && !p.title.toLowerCase().includes(term) && !p.excerpt.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [posts, cat, q]);

  return (
    <>
      <div className="ds-bfrow">
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
        ) : (
          <div />
        )}
        <div className="ds-bsearch">
          <span style={{ color: 'var(--ds-mut)', fontSize: '13px' }}>🔍</span>
          <input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="ds-count">
        Showing <b>{shown.length}</b> of {posts.length} articles
      </div>

      {shown.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--ds-mut)', fontSize: '14px', padding: '34px 0' }}>
          No articles found. Try a different search or category.
        </p>
      ) : (
        <div className="ds-bgrid">
          {shown.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="ds-bcard">
              <div className="top">
                {p.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.coverUrl} alt="" />
                ) : null}
                <span className="tg">{p.category.toUpperCase()}</span>
              </div>
              <div className="body">
                <h3>{p.title}</h3>
                <div className="meta">{p.dateLabel}</div>
                {p.excerpt ? <p>{p.excerpt}</p> : null}
                <span className="rd">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
