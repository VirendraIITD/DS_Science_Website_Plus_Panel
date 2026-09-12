'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { Modal } from '@/components/admin/Modal';
import { useToast } from '@/components/admin/Toast';
import { UploadField } from '@/components/admin/UploadField';

type Item = {
  id: string;
  imageUrl: string;
  caption: string;
  album: string;
  youtubeId: string;
  order: number;
  active: boolean;
};

const BLANK = { imageUrl: '', caption: '', album: 'General', youtubeId: '', order: 0, active: true };

/** The prototype's 4-across image grid, with inline upload and edit. */
export function GalleryManager({ items, albums }: { items: Item[]; albums: string[] }) {
  const router = useRouter();
  const toast = useToast();

  const [album, setAlbum] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Item>>(BLANK);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const shown = useMemo(
    () => (album === 'All' ? items : items.filter((i) => i.album === album)),
    [items, album],
  );

  async function save() {
    if (!form.imageUrl && !form.youtubeId) {
      toast('Upload an image or paste a YouTube ID first', 'bad');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(form.id ? `/api/admin/gallery/${form.id}` : '/api/admin/gallery', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || 'youtube' }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Could not save');
      setOpen(false);
      toast(form.id ? 'Saved' : 'Added');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save', 'bad');
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    setConfirmId(null);
    if (res.ok) {
      toast('Deleted');
      router.refresh();
    } else {
      toast('Could not delete', 'bad');
    }
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>Gallery</span>
        <button
          className="btn"
          onClick={() => {
            setForm(BLANK);
            setOpen(true);
          }}
        >
          ⬆ Upload Image
        </button>
      </div>

      {albums.length > 1 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {['All', ...albums].map((a) => (
            <button
              key={a}
              onClick={() => setAlbum(a)}
              className={`rounded-full border px-4 py-1.5 text-[12.5px] font-semibold transition ${
                album === a
                  ? 'border-navy bg-navy text-white'
                  : 'border-line bg-white text-mut hover:border-brand hover:text-brand'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      ) : null}

      {shown.length === 0 ? (
        <p className="py-12 text-center text-[13.5px] text-mut">
          Nothing in the gallery yet. Upload photos of the campus, classrooms and events.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((item) => (
            <figure key={item.id} className="group relative overflow-hidden rounded-[10px] border border-line">
              {item.youtubeId ? (
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#e7ecf7] to-[#d3ddf0] text-3xl">
                  ▶️
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.caption} className="aspect-[4/3] w-full object-cover" />
              )}

              {!item.active ? (
                <span className="absolute left-2 top-2 pill pill-y">Hidden</span>
              ) : null}

              <figcaption className="truncate px-2 py-1.5 text-[11.5px] text-mut">
                {item.caption || item.album}
              </figcaption>

              <div className="absolute inset-x-0 bottom-8 flex justify-center gap-1.5 opacity-0 transition group-hover:opacity-100">
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setForm(item);
                    setOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(item.id)}>
                  Delete
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={form.id ? 'Edit image' : 'Add to gallery'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-ok" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="lbl">Image</label>
            <UploadField
              kind="image"
              value={form.imageUrl === 'youtube' ? '' : form.imageUrl || ''}
              onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="lbl" htmlFor="g_caption">
                Caption
              </label>
              <input
                id="g_caption"
                className="inp"
                value={form.caption ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              />
            </div>
            <div>
              <label className="lbl" htmlFor="g_album">
                Album
              </label>
              <input
                id="g_album"
                className="inp"
                list="albums"
                value={form.album ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, album: e.target.value }))}
              />
              <datalist id="albums">
                {albums.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="lbl" htmlFor="g_yt">
                YouTube video link (optional)
              </label>
              <input
                id="g_yt"
                className="inp"
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={form.youtubeId ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, youtubeId: e.target.value }))}
              />
              <span className="mt-1 block text-[11.5px] text-mut">
                Paste the full video link (or just the ID) — not the video&rsquo;s title.
              </span>
            </div>
            <div>
              <label className="lbl" htmlFor="g_order">
                Order
              </label>
              <input
                id="g_order"
                type="number"
                className="inp"
                value={form.order ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#2563eb]"
              checked={form.active ?? true}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <span className="text-mut">Show on the website</span>
          </label>
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmId)}
        title="Delete this image?"
        onClose={() => setConfirmId(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmId(null)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={() => confirmId && remove(confirmId)}>
              Yes, delete
            </button>
          </>
        }
      >
        <p className="text-[13.5px] text-mut">It will disappear from the website immediately.</p>
      </Modal>
    </div>
  );
}
