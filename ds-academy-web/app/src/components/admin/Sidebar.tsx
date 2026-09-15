'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { MENTORA_PANEL_URL } from '@/lib/mentoraPanel';
import type { NavGroup } from '@/lib/nav';

/**
 * Navy sidebar from the prototype. On mobile it collapses behind a hamburger
 * in the topbar; the markup and colours are otherwise unchanged.
 */
export function Sidebar({
  groups,
  instituteName,
  tier,
  logoUrl,
  showCounsellingLink,
}: {
  groups: NavGroup[];
  instituteName: string;
  tier: 'elite' | 'pro';
  logoUrl: string;
  /** Super Admin, or the dedicated Mentora Counselling role — opens the separate Mentora panel in a new tab. No credentials are shared or stored here, just a link. */
  showCounsellingLink?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      <button
        className="fixed left-3 top-3 z-30 rounded-lg border border-line bg-white px-3 py-2 text-lg leading-none shadow-card lg:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        ☰
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-30 bg-navy/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[256px] shrink-0 flex-col bg-navy text-[#cdd6ea] transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="border-b border-navy-600 px-[18px] py-5">
          <div className="flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-[38px] w-[38px] rounded-[9px] object-cover" />
            ) : (
              <span
                className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-[9px] text-base font-extrabold text-white ${
                  tier === 'pro'
                    ? 'bg-gradient-to-br from-[#8b5cf6] to-[#2f4d9e]'
                    : 'bg-gradient-to-br from-[#2f4d9e] to-[#1a2c66]'
                }`}
              >
                DS
              </span>
            )}
            <b className="text-[15px] text-white">{instituteName}</b>
          </div>

          <small className="mt-1.5 block text-[10.5px] tracking-wide text-[#8fa0c8]">
            ADMIN PANEL · powered by DS Science Team
          </small>

          <span
            className={`mt-2.5 inline-block rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-widest ${
              tier === 'pro'
                ? 'bg-gradient-to-br from-purp to-brand text-white'
                : 'bg-navy-700 text-[#9fd0ff]'
            }`}
          >
            {tier === 'pro' ? '✦ PRO PLAN' : 'ELITE PLAN'}
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-2">
          {groups.map((group) => (
            <div key={group.section}>
              <div className="px-3 pb-1.5 pt-3 text-[9.5px] tracking-[1.5px] text-navy-400">
                {group.section}
              </div>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`mb-px flex items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-[13px] no-underline transition ${
                    isActive(item.href)
                      ? 'bg-brand font-semibold text-white'
                      : 'text-[#c2cce4] hover:bg-navy-700 hover:text-white'
                  }`}
                >
                  <span className="w-[19px] text-center text-[15px]">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                  {item.module ? (
                    <span className="ml-auto rounded-md bg-[#3a2a66] px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wide text-[#c9b6ff]">
                      PRO
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          ))}

          {showCounsellingLink ? (
            <div>
              <div className="px-3 pb-1.5 pt-3 text-[9.5px] tracking-[1.5px] text-navy-400">MORE</div>
              <button
                type="button"
                onClick={() => window.open(MENTORA_PANEL_URL, '_blank', 'noopener,noreferrer')}
                className="mb-px flex w-full items-center gap-2.5 rounded-[9px] px-3 py-[9px] text-left text-[13px] text-[#c2cce4] transition hover:bg-navy-700 hover:text-white"
              >
                <span className="w-[19px] text-center text-[15px]">🎓</span>
                <span className="truncate">Counselling</span>
                <span className="ml-auto text-[11px] opacity-60">↗</span>
              </button>
            </div>
          ) : null}
        </nav>

        <div className="border-t border-navy-600 px-4 py-3 text-[11px] text-[#8fa0c8]">
          {tier === 'pro' ? 'Pro' : 'Elite'} v1.0 · DS Science Team
        </div>
      </aside>
    </>
  );
}
