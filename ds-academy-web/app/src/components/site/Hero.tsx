'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type Slide = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  ctaLabel: string;
};

/** Home hero carousel, fed by Admin › Hero Banners (PRD §6.1). */
export function Hero({
  slides,
  fallbackTagline,
  demoHref = '/admissions',
}: {
  slides: Slide[];
  fallbackTagline: string;
  /** '/demo' on Pro (the page exists there); '/admissions' on Elite. */
  demoHref?: string;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[0] ?? null;
  const active = slides[i] ?? slide;
  const hasImage = Boolean(active?.imageUrl);

  const dots = slides.length > 1 && (
    <div className="ds-dots">
      {slides.map((s, n) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setI(n)}
          aria-label={`Show slide ${n + 1}: ${s.title}`}
          aria-current={n === i}
          className={n === i ? 'on' : ''}
        />
      ))}
    </div>
  );

  // Once an admin uploads a real banner image, the whole hero becomes that
  // one image edge-to-edge (headline, photos, CTA — all baked into the
  // image itself, like an Allen-style promo banner) — no text/button
  // overlay is rendered on top of it. Before any banner exists, fall back
  // to the text + decorative illustration layout below.
  if (hasImage) {
    return (
      <div className="ds-hero ds-hero-imgonly">
        <Link href={active!.link || demoHref} className="ds-herofull">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={active!.imageUrl} alt={active!.title} />
        </Link>
        {dots ? <div className="ds-wrap" style={{ display: 'flex', justifyContent: 'center', padding: '16px 20px' }}>{dots}</div> : null}
      </div>
    );
  }

  return (
    <div className="ds-hero">
      <div className="ds-bgimg" />

      <div className="ds-wrap ds-wrap-media">
        <div>
          <span className="kicker">🏆 Admissions open</span>
          <h1>{active?.title || fallbackTagline}</h1>
          {active?.subtitle ? <p className="ds-sub">{active.subtitle}</p> : null}

          <div className="ds-cta">
            <Link href={active?.link || demoHref} className="ds-btn gold">
              {active?.ctaLabel || 'Book a free demo class'}
            </Link>
            <Link href="/courses" className="ds-btn line">
              See our courses →
            </Link>
          </div>
        </div>

        <div>
          <HeroDecoration />
        </div>
      </div>
    </div>
  );
}

/** Decorative filler for the hero's right column until a real banner photo is uploaded — blends into the navy background rather than sitting in an empty box. */
function HeroDecoration() {
  return (
    <svg viewBox="0 0 380 380" className="ds-herodeco" aria-hidden="true">
      <circle cx="190" cy="190" r="150" stroke="rgba(255,255,255,.14)" strokeWidth="1" fill="none" />
      <circle cx="190" cy="190" r="110" stroke="rgba(224,161,26,.28)" strokeWidth="1" fill="none" />
      <ellipse cx="190" cy="190" rx="150" ry="60" stroke="rgba(224,161,26,.35)" strokeWidth="1.5" fill="none" transform="rotate(-18 190 190)" />
      <ellipse cx="190" cy="190" rx="150" ry="60" stroke="rgba(255,255,255,.16)" strokeWidth="1" fill="none" transform="rotate(35 190 190)" />
      <circle cx="190" cy="190" r="7" fill="var(--ds-gold)" />

      {/* graduation cap */}
      <g transform="translate(115,150)">
        <polygon points="75,0 150,28 75,56 0,28" fill="rgba(255,255,255,.92)" />
        <polygon points="75,0 150,28 75,56 0,28" fill="none" stroke="var(--ds-gold)" strokeWidth="2" />
        <rect x="55" y="52" width="40" height="34" rx="4" fill="rgba(255,255,255,.85)" />
        <line x1="140" y1="30" x2="140" y2="70" stroke="var(--ds-gold)" strokeWidth="2" />
        <circle cx="140" cy="74" r="4" fill="var(--ds-gold)" />
      </g>

      <g fill="var(--ds-gold)">
        <circle cx="60" cy="70" r="3" opacity=".8" />
        <circle cx="320" cy="95" r="2.5" opacity=".7" />
        <circle cx="300" cy="290" r="3" opacity=".8" />
        <circle cx="55" cy="300" r="2.5" opacity=".7" />
        <circle cx="330" cy="200" r="2" opacity=".6" />
      </g>
    </svg>
  );
}
