'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export type NavLink = { href: string; label: string };

export function Header({
  primaryLinks,
  moreLinks,
  instituteName,
  logoUrl,
  phone,
  whatsapp,
  demoHref = '/admissions',
}: {
  primaryLinks: NavLink[];
  moreLinks: NavLink[];
  instituteName: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  demoHref?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Closing on the button's onBlur (a common shortcut for this) races with
  // a click on a link inside the dropdown: blur fires on mousedown, before
  // the click that navigates ever completes, so the menu vanished out from
  // under a normal click and only a harder/faster click actually landed.
  // A document-level "was the click outside the menu" check has no such
  // race — the link's own click always gets to fire first.
  useEffect(() => {
    if (!moreOpen) return;
    function onDocClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [moreOpen]);

  const links = [...primaryLinks, ...moreLinks];
  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);
  const moreActive = moreLinks.some((l) => active(l.href));

  return (
    <>
      <div className="bg-navy text-[#c9d6f2]" style={{ fontSize: '12.5px' }}>
        <div className="container-ds flex h-[38px] items-center justify-between gap-4 overflow-hidden">
          <span className="flex items-center gap-[8px] whitespace-nowrap">
            {[
              { href: demoHref, label: 'Book Demo' },
              { href: '/admissions', label: 'Admissions' },
              { href: '/sample-test', label: 'Free Test' },
              { href: '/downloads', label: 'PYQ' },
            ].map((l, i) => (
              <Link
                key={l.label}
                href={l.href}
                className="ds-topbar-bulb"
                style={{ animationDelay: `${i * 1.2}s` }}
              >
                {l.label}
              </Link>
            ))}
          </span>
          <span className="flex items-center gap-[18px] whitespace-nowrap">
            {phone ? (
              <a href={`tel:${phone}`} className="hover:text-white">
                📞 {phone}
              </a>
            ) : null}
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noreferrer" className="hover:text-white">
                💬 WhatsApp
              </a>
            ) : null}
            <Link href="/admin" className="hover:text-white">
              👤 Staff Login
            </Link>
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-line bg-white">
        <div className="container-ds flex h-[76px] items-center gap-[22px]">
          <Link href="/" className="flex flex-shrink-0 items-center gap-[12px]">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-14 w-14 rounded-full object-contain" />
            ) : (
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#2f4d9e] to-[#1a2c66] text-lg font-extrabold text-white">
                DS
              </span>
            )}
            <span className="text-[19px] font-extrabold leading-tight text-navy">
              {instituteName}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-0.5 lg:flex">
            {primaryLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active(l.href) ? 'page' : undefined}
                className={`rounded-lg px-[12px] py-[9px] text-[15px] font-semibold transition ${
                  active(l.href) ? 'bg-navy text-white' : 'hover:bg-canvas hover:text-navy'
                }`}
              >
                {l.label}
              </Link>
            ))}

            {moreLinks.length > 0 ? (
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`rounded-lg px-[12px] py-[9px] text-[15px] font-semibold transition ${
                    moreActive ? 'bg-navy text-white' : 'hover:bg-canvas hover:text-navy'
                  }`}
                  aria-expanded={moreOpen}
                >
                  More ▾
                </button>
                {moreOpen ? (
                  <div className="absolute right-0 top-full z-40 mt-1 min-w-[170px] rounded-lg border border-line bg-white p-1.5 shadow-pop">
                    {moreLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setMoreOpen(false)}
                        aria-current={active(l.href) ? 'page' : undefined}
                        className={`block rounded-lg px-3 py-2 text-[13.5px] font-semibold whitespace-nowrap ${
                          active(l.href) ? 'bg-canvas text-navy' : 'text-ink/80 hover:bg-canvas hover:text-navy'
                        }`}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <Link href="/admissions" className="ds-btn gold ml-2 sm">
              Apply now
            </Link>
          </nav>

          <button
            className="ml-auto rounded-lg border border-line px-3 py-2 text-lg leading-none lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {open ? (
          <nav className="border-t border-line bg-white lg:hidden">
            <div className="container-ds py-2.5">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-line px-1 py-[11px] text-[15px] font-semibold ${
                    active(l.href) ? 'text-navy' : 'text-ink/80'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex gap-[9px]">
                <Link
                  href="/admissions"
                  onClick={() => setOpen(false)}
                  className="ds-btn gold flex-1"
                >
                  Apply now
                </Link>
              </div>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}
