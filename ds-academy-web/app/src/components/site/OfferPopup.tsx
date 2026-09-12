'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const ST_KEY = 'dsOfferPopupShown';

export function OfferPopup({
  kicker,
  headline,
  discount,
  note,
  ctaLabel,
  ctaHref,
  daysLeft,
}: {
  kicker: string;
  headline: string;
  discount: string;
  note: string;
  ctaLabel: string;
  ctaHref: string;
  /** Days until offerPopupExpiry, or null if no expiry was set. */
  daysLeft: number | null;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(ST_KEY) === '1';
    } catch {
      // ignore
    }
    if (shown) return;

    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(ST_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (!open) return null;

  return (
    <div
      className="ds-modal ds-offerpop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="box">
        <button className="close" onClick={close} aria-label="Close" type="button">
          ✕
        </button>

        {kicker ? <span className="kick2">{kicker}</span> : null}

        {daysLeft !== null && daysLeft >= 0 ? (
          <div className="countdown">
            <b>{daysLeft}</b>
            <span>days left on {headline || 'this offer'}</span>
          </div>
        ) : null}

        {headline ? <h3>{headline}</h3> : null}

        {discount ? (
          <div className="discountbox">
            <div className="off">{discount}</div>
            {note ? <p>{note}</p> : null}
          </div>
        ) : note ? (
          <p className="fine2">{note}</p>
        ) : null}

        <Link href={ctaHref || '/admissions'} onClick={close} className="ds-btn gold" style={{ width: '100%', marginTop: '20px' }}>
          {ctaLabel || 'Enrol Now'}
        </Link>
      </div>
    </div>
  );
}
