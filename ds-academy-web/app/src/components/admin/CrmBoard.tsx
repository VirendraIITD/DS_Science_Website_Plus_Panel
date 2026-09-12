'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Modal } from '@/components/admin/Modal';
import { useToast } from '@/components/admin/Toast';
import { Pill, STAGE_TONE } from '@/components/ui/Pill';
import { STAGE_LABEL, maskPhone, shortDate } from '@/lib/format';

type Note = { id: string; body: string; createdAt: string; author?: { name: string } | null };

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  course: string;
  city: string;
  stage: string;
  source: string;
  message: string;
  followUpDate: string | null;
  createdAt: string;
  assignedToId: string | null;
  assignedTo?: { name: string } | null;
  notes: Note[];
};

const STAGES = ['NEW', 'CONTACTED', 'DEMO', 'ADMITTED'] as const;

/** [PRO] Lead pipeline — the prototype's four-column kanban, made real. */
export function CrmBoard({ leads, staff }: { leads: Lead[]; staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const toast = useToast();

  const [open, setOpen] = useState<Lead | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  async function patch(id: string, data: Record<string, unknown>) {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // The API validates the whole record, so send it complete.
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          course: lead.course,
          city: lead.city,
          source: lead.source,
          message: lead.message,
          stage: lead.stage,
          assignedToId: lead.assignedToId,
          followUpDate: lead.followUpDate,
          ...data,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Could not update');
      toast('Updated');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update', 'bad');
    } finally {
      setBusy(false);
    }
  }

  async function addNote() {
    if (!open || !note.trim()) return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/lead-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: open.id, body: note.trim() }),
      });
      if (!res.ok) throw new Error('Could not save the note');
      setNote('');
      setOpen(null);
      toast('Note added');
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not save', 'bad');
    } finally {
      setBusy(false);
    }
  }

  const overdue = (l: Lead) =>
    l.followUpDate && new Date(l.followUpDate) < new Date() && l.stage !== 'ADMITTED';

  return (
    <>
      <div className="mb-3.5 flex items-center justify-between">
        <b className="text-sm">Lead Pipeline</b>
        <span className="text-[12px] text-mut">Drag a card to move it, or open it for details.</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((stage) => {
          const column = leads.filter((l) => l.stage === stage);
          return (
            <div
              key={stage}
              className="rounded-xl bg-canvas p-2.5"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) void patch(dragId, { stage });
                setDragId(null);
              }}
            >
              <h4 className="mb-2.5 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-mut">
                <span>{STAGE_LABEL[stage]}</span>
                <span>{column.length}</span>
              </h4>

              {column.length === 0 ? (
                <p className="px-1 py-6 text-center text-[12px] text-mut/70">Empty</p>
              ) : (
                column.map((lead) => (
                  <article
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => setOpen(lead)}
                    className={`mb-2 cursor-pointer rounded-[9px] border bg-white p-2.5 text-[12.5px] transition hover:border-brand ${
                      overdue(lead) ? 'border-bad/50' : 'border-line'
                    } ${dragId === lead.id ? 'opacity-50' : ''}`}
                  >
                    <b className="text-[13px]">{lead.name}</b>
                    <small className="mt-0.5 block text-mut">
                      {lead.course || 'General'} · {maskPhone(lead.phone)}
                    </small>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {lead.assignedTo ? (
                        <span className="pill pill-n">{lead.assignedTo.name}</span>
                      ) : null}
                      {lead.followUpDate ? (
                        <span className={`pill ${overdue(lead) ? 'pill-r' : 'pill-y'}`}>
                          ⏰ {shortDate(lead.followUpDate)}
                        </span>
                      ) : null}
                      {lead.notes.length > 0 ? (
                        <span className="pill pill-n">💬 {lead.notes.length}</span>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          );
        })}
      </div>

      {leads.some((l) => l.stage === 'LOST') ? (
        <div className="card mt-4">
          <div className="card-title">Lost leads</div>
          <div className="flex flex-wrap gap-2">
            {leads
              .filter((l) => l.stage === 'LOST')
              .map((l) => (
                <button key={l.id} className="chip" onClick={() => setOpen(l)}>
                  {l.name} · {l.course || 'General'}
                </button>
              ))}
          </div>
        </div>
      ) : null}

      <Modal
        open={Boolean(open)}
        title={open?.name ?? ''}
        onClose={() => setOpen(null)}
        wide
        footer={
          <>
            <a className="btn btn-ghost" href={`tel:${open?.phone ?? ''}`}>
              📞 Call
            </a>
            <a
              className="btn btn-ghost"
              href={`https://wa.me/${(open?.phone ?? '').replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              💬 WhatsApp
            </a>
            <button className="btn" onClick={() => setOpen(null)}>
              Close
            </button>
          </>
        }
      >
        {open ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <dl className="space-y-2 text-[13px]">
                <Row label="Phone" value={open.phone} />
                <Row label="Email" value={open.email || '—'} />
                <Row label="Course" value={open.course || '—'} />
                <Row label="City" value={open.city || '—'} />
                <Row label="Received" value={shortDate(open.createdAt)} />
                <div className="flex gap-3">
                  <dt className="w-24 shrink-0 text-mut">Status</dt>
                  <dd>
                    <Pill tone={STAGE_TONE[open.stage]}>{STAGE_LABEL[open.stage]}</Pill>
                  </dd>
                </div>
              </dl>

              {open.message ? (
                <div className="rounded-lg bg-canvas p-3 text-[12.5px] text-ink/80">
                  {open.message}
                </div>
              ) : null}

              <div className="space-y-3 border-t border-line pt-3">
                <div>
                  <label className="lbl" htmlFor="crm_stage">
                    Move to
                  </label>
                  <select
                    id="crm_stage"
                    className="inp"
                    value={open.stage}
                    disabled={busy}
                    onChange={(e) => void patch(open.id, { stage: e.target.value })}
                  >
                    {[...STAGES, 'LOST'].map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="lbl" htmlFor="crm_assign">
                    Assign to
                  </label>
                  <select
                    id="crm_assign"
                    className="inp"
                    value={open.assignedToId ?? ''}
                    disabled={busy}
                    onChange={(e) => void patch(open.id, { assignedToId: e.target.value || null })}
                  >
                    <option value="">Nobody yet</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="lbl" htmlFor="crm_follow">
                    Follow up on
                  </label>
                  <input
                    id="crm_follow"
                    type="date"
                    className="inp"
                    disabled={busy}
                    defaultValue={open.followUpDate ? open.followUpDate.slice(0, 10) : ''}
                    onChange={(e) => void patch(open.id, { followUpDate: e.target.value || null })}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-[13px] font-bold">Notes</h3>

              <div className="mb-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                {open.notes.length === 0 ? (
                  <p className="text-[12.5px] text-mut">No notes yet.</p>
                ) : (
                  open.notes.map((n) => (
                    <div key={n.id} className="rounded-lg border border-line p-2.5 text-[12.5px]">
                      <p>{n.body}</p>
                      <small className="mt-1 block text-mut">
                        {n.author?.name ?? 'Staff'} · {shortDate(n.createdAt)}
                      </small>
                    </div>
                  ))
                )}
              </div>

              <textarea
                className="inp"
                rows={3}
                placeholder="Called, asked for a callback on Sunday…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button className="btn btn-sm mt-2" onClick={addNote} disabled={busy || !note.trim()}>
                Add note
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-mut">{label}</dt>
      <dd className="min-w-0 break-words font-medium">{value}</dd>
    </div>
  );
}
