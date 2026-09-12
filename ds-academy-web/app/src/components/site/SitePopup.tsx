'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export type SitePopupData = {
  id: string;
  type: string;
  imageUrl: string;
  imageHref: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  pages: string[];
  delaySeconds: number;
  order: number;
};

/** First path segment as a page key, matching POPUP_PAGE_OPTIONS in lib/options.ts. */
function pageKeyFromPath(pathname: string) {
  if (pathname === '/') return 'home';
  return pathname.split('/').filter(Boolean)[0] ?? 'home';
}

/**
 * Generic per-page popup, distinct from the fixed Topper/Offer popups —
 * admins attach any number of these to any site page (Admin › Popups), each
 * shown once per browser tab session per page. When more than one active
 * popup targets the same page, the lowest `order` wins; the rest stay silent
 * for that page (kept simple on purpose — see feedback discussion).
 */
export function SitePopup({ popups }: { popups: SitePopupData[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const pageKey = pageKeyFromPath(pathname || '/');
  const candidates = popups.filter((p) => p.pages.includes(pageKey)).sort((a, b) => a.order - b.order);
  const popup = candidates[0];

  const storageKey = popup ? `dsSitePopupShown:${popup.id}` : '';

  useEffect(() => {
    if (!popup) return;
    let shown = false;
    try {
      shown = sessionStorage.getItem(storageKey) === '1';
    } catch {
      // ignore
    }
    if (shown) return;

    const t = setTimeout(() => setOpen(true), Math.max(0, popup.delaySeconds) * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup?.id, storageKey]);

  if (!popup || !open) return null;

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(storageKey, '1');
    } catch {
      // ignore
    }
  };

  if (popup.type === 'IMAGE') {
    if (!popup.imageUrl) return null;
    const img = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={popup.imageUrl} alt={popup.heading || 'Offer'} style={{ display: 'block', width: '100%', borderRadius: '12px' }} />
    );
    return (
      <div
        className="ds-modal ds-sitepop ds-sitepop-image"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="box">
          <button className="close" onClick={close} aria-label="Close" type="button">
            ✕
          </button>
          {popup.imageHref ? (
            <Link href={popup.imageHref} onClick={close}>
              {img}
            </Link>
          ) : (
            img
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="ds-modal ds-sitepop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="box">
        <button className="close" onClick={close} aria-label="Close" type="button">
          ✕
        </button>

        {popup.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={popup.imageUrl} alt={popup.heading} style={{ width: '100%', borderRadius: '12px', marginBottom: '16px' }} />
        ) : null}

        {popup.heading ? <h3>{popup.heading}</h3> : null}
        {popup.body ? <p className="n">{popup.body}</p> : null}

        {popup.ctaHref ? (
          <Link href={popup.ctaHref} onClick={close} className="ds-btn gold" style={{ width: '100%', marginTop: '18px' }}>
            {popup.ctaLabel || 'Learn more'}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
