'use client';

import { useEffect, useRef, useState } from 'react';

const VIEW_W = 320; // crop frame width, in CSS px
const STAGE_PAD = 34; // margin of image shown *outside* the frame, so it's clear what gets cut
const DEFAULT_OUTPUT_LONG = 720; // longest output side, in px — the other side follows the aspect ratio

/** The exact pixel size a crop will export at, so callers can show it as a hint before a file is even picked. */
export function cropOutputSize(shape: 'circle' | 'rect', aspect = 4 / 3, outputLong = DEFAULT_OUTPUT_LONG) {
  if (shape === 'circle') return { w: outputLong, h: outputLong };
  return aspect >= 1
    ? { w: outputLong, h: Math.round(outputLong / aspect) }
    : { w: Math.round(outputLong * aspect), h: outputLong };
}

type Props = {
  file: File;
  onCancel: () => void;
  onCropped: (file: File) => void;
  /** 'circle' for avatar-style photos, 'rect' for banners/cards/covers. Defaults to 'circle'. */
  shape?: 'circle' | 'rect';
  /** width/height, e.g. 4/3 or 16/9 — only used when shape is 'rect'. Defaults to 4/3. */
  aspect?: number;
  /** Longest output side in px. Defaults to 720 — raise for large full-bleed images (hero banners) where that looks soft at full width. */
  outputLong?: number;
};

/**
 * A minimal drag-to-position + zoom-to-scale cropper. No canvas library —
 * just an absolutely-positioned <img>, a CSS-clipped viewport for the live
 * preview (circular or rectangular), and a canvas draw at export time.
 *
 * 'circle' mode: Faculty/Topper/Testimonial photos, the site logo —
 * anything displayed as a round avatar.
 * 'rect' mode: banners, course/branch/news images, blog covers — anywhere
 * a preview at the *actual* on-site aspect ratio avoids the "image looked
 * fine, then object-fit:cover cropped the important part off" surprise
 * that prompted this (see the DS-logo-in-the-hero bug report).
 */
export function CropModal({ file, onCancel, onCropped, shape = 'circle', aspect = 4 / 3, outputLong = DEFAULT_OUTPUT_LONG }: Props) {
  const viewW = VIEW_W;
  const viewH = shape === 'circle' ? VIEW_W : Math.round(VIEW_W / aspect);
  const stageW = viewW + STAGE_PAD * 2;
  const stageH = viewH + STAGE_PAD * 2;
  const { w: outputW, h: outputH } = cropOutputSize(shape, aspect, outputLong);

  const [imgUrl, setImgUrl] = useState('');
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    // "cover" fit (zoom 1, the default) exactly fills the frame with no
    // gaps. Zooming out below that shows the whole image — "contain" fit —
    // with the leftover strip filled in save() rather than left cropped.
    const cover = Math.max(viewW / w, viewH / h);
    const contain = Math.min(viewW / w, viewH / h);
    setNatural({ w, h });
    setBaseScale(cover);
    setMinZoom(contain / cover);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  const displayedW = natural.w * baseScale * zoom;
  const displayedH = natural.h * baseScale * zoom;

  function clamp(x: number, y: number, dW = displayedW, dH = displayedH) {
    // Image top-left, in viewport-centered coordinates. Once the image is
    // zoomed out past "cover" on an axis, it's smaller than the frame there
    // — center it on that axis (letterboxed) instead of forcing it to keep
    // covering, which is what a min zoom of exactly 1 used to do.
    const maxX = Math.max(0, (dW - viewW) / 2);
    const maxY = Math.max(0, (dH - viewH) / 2);
    return {
      x: dW <= viewW ? 0 : Math.min(maxX, Math.max(-maxX, x)),
      y: dH <= viewH ? 0 : Math.min(maxY, Math.max(-maxY, y)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: offset.x, origY: offset.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy));
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function onZoomChange(next: number) {
    const dW = natural.w * baseScale * next;
    const dH = natural.h * baseScale * next;
    setZoom(next);
    setOffset((o) => clamp(o.x, o.y, dW, dH));
  }

  async function save() {
    if (!natural.w) return;
    setBusy(true);
    try {
      const displayScale = baseScale * zoom;
      // Image top-left in display space, viewport-relative (viewport is [0,viewW]x[0,viewH]).
      const topLeftX = viewW / 2 + offset.x - displayedW / 2;
      const topLeftY = viewH / 2 + offset.y - displayedH / 2;
      const sx = -topLeftX / displayScale;
      const sy = -topLeftY / displayScale;
      const sw = viewW / displayScale;
      const sh = viewH / displayScale;

      const canvas = document.createElement('canvas');
      canvas.width = outputW;
      canvas.height = outputH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Zoomed out past "cover", the source rect no longer fully covers the
      // frame — drawImage leaves those pixels untouched (transparent, which
      // JPEG turns black) unless something is painted first.
      if (shape === 'rect') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, outputW, outputH);
      }

      const source = await loadImage(imgUrl);
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, outputW, outputH);

      // Rect crops (banners, cards, covers) never need transparency and can
      // get large at higher outputLong sizes — JPEG keeps the file small at
      // effectively the same visual quality. Circle crops (logo, avatars)
      // stay PNG so a transparent background is preserved.
      const mime = shape === 'rect' ? 'image/jpeg' : 'image/png';
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), mime, 0.92),
      );
      const cropped = new File([blob], renameToOutput(file.name, mime), { type: mime });
      onCropped(cropped);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6,12,26,.6)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="card" style={{ width: Math.max(360, stageW + 40), maxWidth: '100%' }}>
        <div className="card-title">
          <span>Crop {shape === 'circle' ? 'photo' : 'image'}</span>
        </div>

        <p className="mb-2 text-[11.5px] text-mut">
          {natural.w ? (
            <>
              Your file: <b className="text-ink">{natural.w}×{natural.h}px</b>, {formatBytes(file.size)} — will
              save as <b className="text-ink">{outputW}×{outputH}px</b>.
            </>
          ) : (
            'Loading image…'
          )}
        </p>

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: 'relative',
            width: stageW,
            height: stageH,
            margin: '0 auto',
            overflow: 'hidden',
            borderRadius: 10,
            cursor: 'grab',
            touchAction: 'none',
            background: '#e6eaf2',
          }}
        >
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              draggable={false}
              onLoad={onImgLoad}
              style={{
                position: 'absolute',
                left: stageW / 2 + offset.x - displayedW / 2,
                top: stageH / 2 + offset.y - displayedH / 2,
                width: displayedW || undefined,
                height: displayedH || undefined,
                userSelect: 'none',
                pointerEvents: 'none',
                opacity: 0.45,
              }}
            />
          ) : null}

          {/* The crop frame — everything inside this box is what gets saved;
              the dimmed image outside it (STAGE_PAD of margin) is what gets
              cut off, shown at full brightness only inside the frame. */}
          {imgUrl ? (
            <div
              style={{
                position: 'absolute',
                left: STAGE_PAD,
                top: STAGE_PAD,
                width: viewW,
                height: viewH,
                overflow: 'hidden',
                borderRadius: shape === 'circle' ? '50%' : 6,
                pointerEvents: 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt=""
                draggable={false}
                style={{
                  position: 'absolute',
                  left: viewW / 2 + offset.x - displayedW / 2,
                  top: viewH / 2 + offset.y - displayedH / 2,
                  width: displayedW || undefined,
                  height: displayedH || undefined,
                  userSelect: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
          ) : null}

          <div
            style={{
              position: 'absolute',
              left: STAGE_PAD,
              top: STAGE_PAD,
              width: viewW,
              height: viewH,
              borderRadius: shape === 'circle' ? '50%' : 6,
              border: '2px solid #fff',
              boxShadow: '0 0 0 2000px rgba(15,33,73,.5), 0 0 0 1px rgba(0,0,0,.25)',
              pointerEvents: 'none',
            }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-[11px] text-mut">Zoom</span>
          <input
            type="range"
            min={minZoom}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        <p className="mt-2 text-[11.5px] text-mut">
          Drag to reposition, use the slider to zoom. The bright area inside the frame is exactly what
          will show on the site — the dimmed margin around it gets cut off.
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={save} disabled={busy || !natural.w}>
            {busy ? 'Saving…' : 'Save crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renameToOutput(name: string, mime: string) {
  const base = name.replace(/\.[^.]+$/, '');
  const ext = mime === 'image/jpeg' ? '.jpg' : '.png';
  return `${base || 'image'}${ext}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
