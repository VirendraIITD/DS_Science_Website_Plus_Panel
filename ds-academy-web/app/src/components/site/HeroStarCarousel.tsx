'use client';

import { useEffect, useState } from 'react';

import { topperDisplayName } from '@/lib/format';
import { RankStrip } from '@/components/site/RankStrip';

type Star = {
  id: string;
  name: string;
  photoUrl: string;
  exam: string;
  year: number;
  rankOrScore: string;
  categoryRank?: string;
  address?: string;
};

/**
 * Hero "best result" card on the Results page. Filtered to one exam it just
 * shows that topper; with "All" selected it gets handed the top NEET + top
 * JEE topper and auto-rotates between the two every few seconds so both get
 * seen without needing their own space.
 */
export function HeroStarCarousel({ stars }: { stars: Star[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    setI(0);
  }, [stars.map((s) => s.id).join(',')]);

  useEffect(() => {
    if (stars.length < 2) return;
    const t = setInterval(() => setI((n) => (n + 1) % stars.length), 4500);
    return () => clearInterval(t);
  }, [stars.length]);

  if (stars.length === 0) return null;
  const star = stars[i % stars.length];
  const name = topperDisplayName(star.name);

  return (
    <div className="star" key={star.id}>
      {star.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={star.photoUrl} alt={name} className="av" style={{ objectFit: 'cover' }} />
      ) : (
        <div className="av">
          {name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
      )}
      <div className="nm">{name}</div>
      <div className="ex">
        {star.exam} {star.year}
      </div>
      <RankStrip exam={star.exam} rankOrScore={star.rankOrScore} categoryRank={star.categoryRank} />
      {star.address ? <div className="note2">{star.address}</div> : null}

      {stars.length > 1 ? (
        <div className="ds-herodots">
          {stars.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Show ${s.exam} topper`}
              className={idx === i ? 'on' : ''}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
