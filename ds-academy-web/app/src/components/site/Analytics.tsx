'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Google Analytics (PRD §8) plus the first-party page-view ping that feeds the
 * [PRO] Analytics dashboard. The ping stores a path and a referrer host —
 * nothing that identifies a visitor — so no consent banner is required.
 */
export function Analytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const controller = new AbortController();
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // A failed ping must never surface to the visitor.
    });

    return () => controller.abort();
  }, [pathname]);

  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  );
}
