'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { topperDisplayName } from '@/lib/format';
import { RankStrip } from '@/components/site/RankStrip';

type Topper = { id: string; name: string; photoUrl: string; exam: string; rankOrScore: string; categoryRank?: string; year: number };

/** Allen-style auto-popup — shown once per browser tab session per page. */
export function TopperPopup({
  toppers,
  storageKey,
  kicker,
  heading,
  note,
}: {
  toppers: Topper[];
  storageKey: string;
  kicker: string;
  heading: string;
  note: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (toppers.length === 0) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(storageKey) === '1';
    } catch {
      // ignore
    }
    if (shown) return;

    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [toppers.length, storageKey]);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
  };

  if (!open || toppers.length === 0) return null;

  const pair = toppers.slice(0, 2);

  return (
    <div
      className="ds-modal ds-topmodal"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="box">
        <button className="close" onClick={close} aria-label="Close" type="button">
          ✕
        </button>

        <span className="kick2">{kicker}</span>
        <h3>{heading}</h3>
        <p className="n">{note}</p>

        <div className="ds-toppair">
          {pair.map((t) => {
            const name = topperDisplayName(t.name);
            return (
            <div key={t.id} className="tp">
              {t.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={t.photoUrl} alt={name} className="av" />
              ) : (
                <div className="av">
                  {name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)}
                </div>
              )}
              <b>{name}</b>
              <span>
                {t.exam} {t.year}
              </span>
              <RankStrip exam={t.exam} rankOrScore={t.rankOrScore} categoryRank={t.categoryRank} categoryLabel="CAT. RANK" />
            </div>
            );
          })}
        </div>

        <Link href="/results" onClick={close} className="ds-btn navy" style={{ width: '100%', marginTop: '22px' }}>
          See all results →
        </Link>
      </div>
    </div>
  );
}
