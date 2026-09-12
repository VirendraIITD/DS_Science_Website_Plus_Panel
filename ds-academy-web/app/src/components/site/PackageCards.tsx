'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { CLASS_LEVEL_LABEL, HIDDEN_CLASS_LEVELS, PACKAGE_TYPE_LABEL, rupees, shortDate } from '@/lib/format';

type Pkg = {
  id: string;
  title: string;
  type: string;
  classLevel: string;
  startDate: string | null;
  durationLabel: string;
  features: string[];
  priceOriginal: number;
  priceDiscounted: number;
  discountPct: number;
  highlight: boolean;
};

const BADGE: Record<string, string> = {
  RECORDED: 'bg-[#eef2ff] text-brand',
  LIVE: 'bg-[#fdeceb] text-bad',
  TEST_SERIES: 'bg-[#e6f6ed] text-ok',
};

/** [PRO] Public pricing cards with class-level tabs, per the prototype. */
export function PackageCards({ packages: allPackages }: { packages: Pkg[] }) {
  const packages = useMemo(
    () => allPackages.filter((p) => !HIDDEN_CLASS_LEVELS.includes(p.classLevel)),
    [allPackages],
  );
  const levels = useMemo(
    () => [...new Set(packages.map((p) => p.classLevel))],
    [packages],
  );
  const [tab, setTab] = useState(levels[0] ?? 'CLASS_11');

  const shown = packages.filter((p) => p.classLevel === tab);

  return (
    <>
      {levels.length > 1 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setTab(l)}
              aria-pressed={tab === l}
              className={`rounded-full border px-4 py-[7px] text-[12.5px] font-semibold transition ${
                tab === l
                  ? 'border-navy bg-navy text-white'
                  : 'border-line bg-white text-mut hover:border-brand hover:text-brand'
              }`}
            >
              {CLASS_LEVEL_LABEL[l] ?? l}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((p) => (
          <div
            key={p.id}
            className={`relative flex flex-col rounded-card border bg-white p-5 ${
              p.highlight ? 'border-purp ring-1 ring-purp/30' : 'border-line'
            }`}
          >
            {p.highlight ? (
              <span className="absolute -top-2.5 right-5 rounded-full bg-purp px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                MOST POPULAR
              </span>
            ) : null}

            <span
              className={`w-fit rounded-md px-[9px] py-[3px] text-[10px] font-extrabold tracking-wide ${BADGE[p.type]}`}
            >
              {(PACKAGE_TYPE_LABEL[p.type] ?? p.type).toUpperCase()}
            </span>

            <h3 className="mb-[3px] mt-3 text-[17px] font-bold text-navy">{p.title}</h3>
            <p className="text-[12px] text-mut">
              {p.durationLabel || (p.startDate ? `Starts ${shortDate(p.startDate)}` : 'Rolling admission')}
            </p>

            <ul className="my-4 flex-1 space-y-1.5 text-[13.5px]">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="font-extrabold text-ok">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="text-[22px] font-extrabold text-navy">
              {p.priceOriginal > p.priceDiscounted ? (
                <s className="mr-2 text-[14px] font-normal text-mut">{rupees(p.priceOriginal)}</s>
              ) : null}
              {rupees(p.priceDiscounted || p.priceOriginal)}
            </div>
            {p.discountPct > 0 ? (
              <span className="text-[12px] font-bold text-ok">{p.discountPct}% OFF</span>
            ) : null}

            <Link href="/admissions" className="btn mt-4 w-full py-2.5">
              Enquire about this
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
