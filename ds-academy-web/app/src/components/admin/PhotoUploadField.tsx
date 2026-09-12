'use client';

import { useRef, useState } from 'react';

import { cropOutputSize, CropModal } from '@/components/admin/CropModal';
import { useToast } from '@/components/admin/Toast';

const TARGET = cropOutputSize('circle');

/** Same as UploadField, but for avatar-style photos: a crop step (circular
 * guide, drag + zoom) runs before the upload, so faculty/topper/testimonial
 * photos and the site logo always land square and well-framed regardless of
 * what the admin originally had on hand. */
export function PhotoUploadField({
  value,
  onChange,
  onMeta,
}: {
  value: string;
  onChange: (url: string) => void;
  onMeta?: (meta: { sizeKb: number; name: string }) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<File | null>(null);
  const toast = useToast();

  async function upload(file: File) {
    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('kind', 'image');

      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Upload failed');

      onChange(json.url);
      onMeta?.({ sizeKb: json.sizeKb, name: json.name });
      toast('Uploaded');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'bad');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full border border-line object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPending(f);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? 'Uploading…' : value ? 'Replace' : '⬆ Upload photo'}
          </button>

          {value ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              Remove
            </button>
          ) : null}
        </div>

        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block truncate text-[11.5px] text-brand underline"
          >
            {value}
          </a>
        ) : (
          <span className="mt-1 block text-[11.5px] text-mut">No photo yet</span>
        )}

        <span className="mt-0.5 block text-[11px] text-mut">
          Uploads at {TARGET.w}×{TARGET.h}px, square — you&rsquo;ll get a preview to position/zoom before it
          saves.
        </span>
      </div>

      {pending ? (
        <CropModal
          file={pending}
          onCancel={() => {
            setPending(null);
            if (input.current) input.current.value = '';
          }}
          onCropped={(cropped) => {
            setPending(null);
            if (input.current) input.current.value = '';
            void upload(cropped);
          }}
        />
      ) : null}
    </div>
  );
}
