'use client';

import { useState } from 'react';

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  caption: string;
  album: string;
};

export function GalleryGrid({ items, albums }: { items: GalleryPhoto[]; albums: string[] }) {
  const [active, setActive] = useState('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = active === 'all' ? items : items.filter((i) => i.album === active);
  const openIndex = shown.findIndex((i) => i.id === openId);
  const open = openIndex >= 0 ? shown[openIndex] : null;

  return (
    <>
      <div className="ds-filters">
        <button type="button" className={active === 'all' ? 'on' : ''} onClick={() => setActive('all')}>
          ALL
        </button>
        {albums.map((a) => (
          <button key={a} type="button" className={active === a ? 'on' : ''} onClick={() => setActive(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="ds-count">
        Showing <b>{shown.length}</b> photos
      </div>

      <div className="ds-ggrid">
        {shown.map((item, i) => (
          <div
            key={item.id}
            className={`ds-gitem${i % 5 === 0 ? ' w2' : ''}`}
            onClick={() => setOpenId(item.id)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.caption || item.album} loading="lazy" />
            <span className="galb">{item.album.toUpperCase()}</span>
            <span className="zoom">⤢</span>
            {item.caption ? (
              <span className="cap">
                <b>{item.caption}</b>
                <span>{item.album}</span>
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {open ? (
        <div
          className="ds-lb"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenId(null);
          }}
        >
          <div className="box">
            <button className="x" onClick={() => setOpenId(null)} aria-label="Close" type="button">
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="im" src={open.imageUrl} alt={open.caption || open.album} />
            <div className="cap2">
              {open.caption ? <b>{open.caption}</b> : null}
              <span>{open.album}</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
