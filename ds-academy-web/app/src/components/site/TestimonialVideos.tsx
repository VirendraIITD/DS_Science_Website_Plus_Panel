'use client';

import { useEffect, useRef, useState } from 'react';

import { youtubeThumbnailUrl } from '@/lib/youtube';

type VideoTestimonial = {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
};

function cardImage(t: VideoTestimonial): string {
  return t.thumbnailUrl || youtubeThumbnailUrl(t.youtubeId) || t.photoUrl;
}

/** Allen-style "Watch Now" testimonial cards — the video plays in an in-page popup (Plyr player), never navigates to YouTube. */
export function TestimonialVideos({ items }: { items: VideoTestimonial[] }) {
  const [playing, setPlaying] = useState<VideoTestimonial | null>(null);

  if (items.length === 0) return null;

  // Fewer than 5 cards don't leave enough room to loop convincingly (the
  // seam would show almost immediately), so those stay in the plain static
  // grid — the film-reel scroll only kicks in once there's enough content
  // to actually read as continuous, same threshold reasoning as StarsMarquee.
  const scrolling = items.length >= 5;
  const duration = Math.max(24, items.length * 6);
  const cards = scrolling ? [...items, ...items] : items;

  return (
    <>
      {scrolling ? (
        <div className="ds-tvmarquee">
          <div className="ds-tvtrack" style={{ animationDuration: `${duration}s` }}>
            {cards.map((t, i) => (
              <TvCard key={`${t.id}-${i}`} t={t} onPlay={() => setPlaying(t)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="ds-tvgrid">
          {cards.map((t) => (
            <TvCard key={t.id} t={t} onPlay={() => setPlaying(t)} />
          ))}
        </div>
      )}

      {playing ? (
        <VideoModal testimonial={playing} onClose={() => setPlaying(null)} />
      ) : null}
    </>
  );
}

function TvCard({ t, onPlay }: { t: VideoTestimonial; onPlay: () => void }) {
  const img = cardImage(t);
  return (
    <button type="button" className="ds-tvcard" onClick={onPlay}>
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={t.name} />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--ds-navy-3), var(--ds-navy))',
            color: '#fff',
            fontSize: '32px',
            fontWeight: 800,
          }}
        >
          {t.name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)}
        </div>
      )}
      <span className="play">▶ Watch Now</span>
      <span className="meta">
        <b>{t.name}</b>
        <br />
        <span>{t.role}</span>
      </span>
    </button>
  );
}

function VideoModal({ testimonial, onClose }: { testimonial: VideoTestimonial; onClose: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: { destroy: () => void } | null = null;
    let cancelled = false;

    import('plyr').then(({ default: Plyr }) => {
      if (cancelled || !mountRef.current) return;
      player = new Plyr(mountRef.current, {
        youtube: { noCookie: true, rel: 0 },
      }) as unknown as { destroy: () => void };
    });

    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [testimonial.youtubeId]);

  return (
    <div
      className="ds-modal ds-videolb"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="box">
        <button className="close" onClick={onClose} aria-label="Close" type="button">
          ✕
        </button>
        <div className="frame">
          <div ref={mountRef} data-plyr-provider="youtube" data-plyr-embed-id={testimonial.youtubeId} />
        </div>
        <div className="cap">
          <b>{testimonial.name}</b>
          <span>{testimonial.role}</span>
        </div>
      </div>
    </div>
  );
}
