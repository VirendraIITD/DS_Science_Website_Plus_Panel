import Link from 'next/link';

import { topperDisplayName } from '@/lib/format';

type Star = {
  id: string;
  name: string;
  photoUrl: string;
  exam: string;
  rankOrScore: string;
  categoryRank?: string;
  year: number;
  storyTag: string;
};

/** Splits into up to 3 rows, round-robin, so each row gets a fair mix. */
function splitRows(items: Star[]) {
  const rows: Star[][] = [[], [], []];
  items.forEach((item, i) => rows[i % 3].push(item));
  return rows.filter((r) => r.length > 0);
}

/** Allen-style "ALLEN Stars" moving video-story marquee, 3 rows, alternating direction. */
export function StarsMarquee({
  stars,
  heading,
  subheading,
  ctaLabel,
  ctaHref,
}: {
  stars: Star[];
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  if (stars.length === 0) return null;

  const rows = splitRows(stars);

  return (
    <section className="ds-stars">
      <div className="container-ds ds-starsgrid">
        <div className="ds-starsinfo">
          <h2>{heading}</h2>
          <p>{subheading}</p>
          {ctaHref ? (
            <Link href={ctaHref} className="ds-btn lineb">
              {ctaLabel}
            </Link>
          ) : null}
        </div>

        <div className="ds-starsrows">
          {rows.map((row, i) => (
            <div key={i} className={`ds-starsrow${i % 2 === 1 ? ' rev' : ''}`}>
              <div className="ds-starstrack">
                {[...row, ...row].map((s, j) => (
                  <div key={`${s.id}-${j}`} className="ds-starcard">
                    {s.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photoUrl} alt={topperDisplayName(s.name)} />
                    ) : null}
                    <div className="tag">{s.storyTag || s.exam}</div>
                    <div className="meta">
                      <b>{topperDisplayName(s.name)}</b>
                      <span>
                        {s.exam.toUpperCase()} &rsquo;{String(s.year).slice(-2)}
                        {[s.rankOrScore, s.categoryRank].filter(Boolean).length > 0
                          ? ` · ${[s.rankOrScore, s.categoryRank].filter(Boolean).join(' · ')}`
                          : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
