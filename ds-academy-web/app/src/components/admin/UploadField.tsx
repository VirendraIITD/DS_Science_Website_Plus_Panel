'use client';

import { useRef, useState } from 'react';

import { cropOutputSize, CropModal } from '@/components/admin/CropModal';
import { useToast } from '@/components/admin/Toast';

export function UploadField({
  value,
  onChange,
  kind,
  onMeta,
  aspect,
  outputLong,
}: {
  value: string;
  onChange: (url: string) => void;
  kind: 'image' | 'file';
  onMeta?: (meta: { sizeKb: number; name: string }) => void;
  /** width/height, e.g. 4/3 — when set on an 'image' field, a crop-preview
   * step (at this exact aspect ratio) runs before upload, so what you see
   * in the cropper is what actually shows on the site instead of a browser
   * object-fit:cover guess cutting off the wrong part. */
  aspect?: number;
  /** Longest output side in px. Defaults to 720 — raise for large full-bleed images (hero banners). */
  outputLong?: number;
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
      body.append('kind', kind);

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
      if (input.current) input.current.value = '';
    }
  }

  const cropsBeforeUpload = kind === 'image' && Boolean(aspect);

  return (
    <div className="flex items-center gap-3">
      {kind === 'image' && value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg border border-line object-cover"
        />
      ) : null}

      <div className="min-w-0 flex-1">
        <input
          ref={input}
          type="file"
          accept={kind === 'image' ? 'image/*' : 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip'}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (cropsBeforeUpload) setPending(f);
            else void upload(f);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? 'Uploading…' : value ? 'Replace' : `⬆ Upload ${kind}`}
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
          <span className="mt-1 block text-[11.5px] text-mut">No file yet</span>
        )}

        {cropsBeforeUpload ? (
          <span className="mt-0.5 block text-[11px] text-mut">
            Uploads at {cropOutputSize('rect', aspect, outputLong).w}×{cropOutputSize('rect', aspect, outputLong).h}px — you&rsquo;ll
            get a preview to position/zoom before it saves.
          </span>
        ) : null}
      </div>

      {pending ? (
        <CropModal
          file={pending}
          shape="rect"
          aspect={aspect}
          outputLong={outputLong}
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
