import Image from 'next/image';
import Link from 'next/link';

import { CATEGORY_LABEL, CLASS_LEVEL_LABEL, HIDDEN_CLASS_LEVELS, topperDisplayName } from '@/lib/format';
import { RankStrip } from '@/components/site/RankStrip';

/** Shared building blocks for the public pages. */

export function SectionHead({
  title,
  sub,
  href,
  linkLabel,
}: {
  title: string;
  sub?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="ds-head">
      <div>
        <h2 className="t">{title}</h2>
        {sub ? <p className="st">{sub}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="ds-lnk">
          {linkLabel || 'See all'} →
        </Link>
      ) : null}
    </div>
  );
}

export function StatsStrip({ stats }: { stats: { id: string; label: string; value: string; icon: string }[] }) {
  if (stats.length === 0) return null;

  return (
    <div className="ds-stats">
      <div className="g">
        {stats.map((s) => (
          <div key={s.id} className="s">
            {s.icon ? <div className="ic3">{s.icon}</div> : null}
            <div className="n">{s.value}</div>
            <div className="l">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type CourseCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tagline: string;
  imageUrl?: string;
  classLevels?: string[];
  highlights?: string[];
  price?: { now: number; was: number; note: string } | null;
};

export function CourseCards({ courses, wide = false }: { courses: CourseCard[]; wide?: boolean }) {
  if (courses.length === 0) return null;

  return (
    <div className="ds-cgrid" style={wide ? { gridTemplateColumns: 'repeat(2, 1fr)' } : undefined}>
      {courses.map((c) => (
        <Link key={c.id} href={`/courses/${c.slug}`} className="ds-ccard">
          <div className="top" style={wide ? { height: '170px' } : undefined}>
            {c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={c.imageUrl}
                alt={c.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (CATEGORY_LABEL[c.category] ?? c.category).toUpperCase()
            )}
            <span className="tg">{CATEGORY_LABEL[c.category] ?? c.category}</span>
          </div>
          <div className="body">
            <h3>{c.name}</h3>
            <div className="meta">
              {c.classLevels && c.classLevels.filter((l) => !HIDDEN_CLASS_LEVELS.includes(l)).length > 0
                ? c.classLevels
                    .filter((l) => !HIDDEN_CLASS_LEVELS.includes(l))
                    .map((l) => CLASS_LEVEL_LABEL[l] ?? l)
                    .join(' · ')
                : c.tagline}
            </div>
            {wide && c.tagline ? (
              <p style={{ fontSize: '14px', color: 'var(--ds-mut)', marginTop: '11px', lineHeight: 1.62 }}>
                {c.tagline}
              </p>
            ) : null}
            {c.highlights && c.highlights.length > 0 ? (
              <ul>
                {c.highlights.slice(0, wide ? 4 : 3).map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
            <div className="ds-price">
              {c.price && c.price.now > 0 ? (
                <div>
                  <span className="now">₹{c.price.now.toLocaleString('en-IN')}</span>
                  {c.price.was > c.price.now ? (
                    <span className="was">₹{c.price.was.toLocaleString('en-IN')}</span>
                  ) : null}
                  {c.price.note ? <span className="off">{c.price.note}</span> : null}
                </div>
              ) : (
                <span className="ds-lnk">View course →</span>
              )}
              {c.price && c.price.now > 0 ? <span className="ds-btn navy sm">View details</span> : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ToppersStrip({
  toppers,
}: {
  toppers: {
    id: string;
    name: string;
    photoUrl: string;
    exam: string;
    rankOrScore: string;
    categoryRank?: string;
    year: number;
    address?: string;
  }[];
}) {
  if (toppers.length === 0) return null;

  return (
    <div className="ds-tgrid">
      {toppers.map((t) => {
        const name = topperDisplayName(t.name);
        return (
        <article key={t.id} className="ds-tcard">
          <span className="yr">{t.year}</span>
          {t.photoUrl ? (
            // Plain <img>, not next/image — matches the Results page, which
            // renders these same photos reliably. next/image's optimizer was
            // silently failing here on the home page while the identical
            // photo worked fine on /results, so this drops the optimizer
            // rather than debug it further for a handful of small avatars.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photoUrl} alt={name} className="av" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="av">
              {name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
          )}
          <h4>{name}</h4>
          <div className="ex">{t.exam}</div>
          <RankStrip exam={t.exam} rankOrScore={t.rankOrScore} categoryRank={t.categoryRank} />
          {t.address ? <div className="bt">{t.address}</div> : null}
        </article>
        );
      })}
    </div>
  );
}

export function WhyUs({
  points,
}: {
  points: { id: string; title: string; body: string; icon: string; imageUrl?: string }[];
}) {
  if (points.length === 0) return null;

  return (
    <div className="ds-wgrid">
      {points.map((p) =>
        p.imageUrl ? (
          <div key={p.id} className="ds-wcard photo" style={{ backgroundImage: `url(${p.imageUrl})` }}>
            <div className="txt">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          </div>
        ) : (
          <div key={p.id} className="ds-wcard">
            <div className="ic">{p.icon || '✔️'}</div>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ),
      )}
    </div>
  );
}

export function Testimonials({
  items,
}: {
  items: { id: string; name: string; role: string; quote: string; photoUrl: string; youtubeId: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="ds-qgrid">
      {items.map((t) => (
        <figure key={t.id} className="ds-qcard">
          {t.youtubeId ? (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${t.youtubeId}`}
                title={`${t.name} — testimonial`}
                loading="lazy"
                allowFullScreen
              />
            </div>
          ) : null}

          <div className="mark">&ldquo;</div>
          <p>{t.quote}</p>

          <figcaption className="who">
            {t.photoUrl ? (
              <Image src={t.photoUrl} alt="" width={42} height={42} className="av" style={{ objectFit: 'cover' }} />
            ) : (
              <span className="av">🧑</span>
            )}
            <span>
              <b>{t.name}</b>
              <span>{t.role}</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function NewsTicker({ items }: { items: { id: string; slug: string; title: string }[] }) {
  if (items.length === 0) return null;

  return (
    <div className="border-y border-line bg-[#fdf3dd]">
      <div className="container-ds flex items-center gap-3 py-2.5">
        <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-[#3a2a00]">
          NOTICE
        </span>
        <div className="flex min-w-0 flex-1 gap-6 overflow-x-auto text-[13px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((n) => (
            <Link
              key={n.id}
              href={`/news/${n.slug}`}
              className="whitespace-nowrap font-medium text-[#9a6b00] hover:underline"
            >
              {n.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-ds py-10 sm:py-14">
        <h1 className="text-[28px] font-extrabold leading-tight text-navy sm:text-[36px]">{title}</h1>
        {sub ? <p className="mt-2 max-w-2xl text-[14.5px] text-mut">{sub}</p> : null}
      </div>
    </section>
  );
}

export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white py-16 text-center">
      <div className="mb-2 text-4xl">{icon}</div>
      <p className="text-[13.5px] text-mut">{text}</p>
    </div>
  );
}
