'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Modal } from '@/components/admin/Modal';
import { useToast } from '@/components/admin/Toast';
import { CHANNEL_OPTIONS } from '@/lib/options';
import { SEGMENT_OPTIONS } from '@/lib/segments';

export function BroadcastForm({
  counts,
  configured,
}: {
  counts: Record<string, number>;
  configured: boolean;
}) {
  const router = useRouter();
  const toast = useToast();

  const [channel, setChannel] = useState('WHATSAPP');
  const [segment, setSegment] = useState(SEGMENT_OPTIONS[0]?.value ?? 'ALL_NEW');
  const [message, setMessage] = useState(
    'Admissions for 2026-27 are open at DS Science Academy, Gangapur City. Reply YES for a callback.',
  );
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const recipients = counts[segment] ?? 0;

  async function send() {
    setBusy(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, segment, message }),
      });
      const json = await res.json();

      if (!res.ok) {
        toast(json.error || 'Could not send', 'bad');
        return;
      }

      setConfirm(false);
      toast(json.message);
      router.refresh();
    } catch {
      toast('Network error', 'bad');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-title">Broadcast — WhatsApp / SMS</div>

      {!configured ? (
        <p className="mb-4 rounded-lg bg-[#fdf3dd] px-3 py-2.5 text-[12.5px] text-[#9a6b00]">
          <b>Dry-run mode.</b> No gateway is configured, so nothing is actually sent — the panel
          records the broadcast and shows you exactly who would have received it. Set{' '}
          <code>BROADCAST_API_URL</code> and <code>BROADCAST_API_KEY</code> to go live.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="lbl" htmlFor="b_segment">
            Send to
          </label>
          <select
            id="b_segment"
            className="inp"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
          >
            {SEGMENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label} ({counts[o.value] ?? 0})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl" htmlFor="b_channel">
            Channel
          </label>
          <select
            id="b_channel"
            className="inp"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="lbl" htmlFor="b_msg">
            Message
          </label>
          <textarea
            id="b_msg"
            className="inp"
            rows={4}
            maxLength={1000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <span className="mt-1 block text-[11.5px] text-mut">
            {message.length}/1000 characters
            {channel === 'SMS' ? ` · about ${Math.ceil(message.length / 160) || 1} SMS` : ''}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="btn btn-purple"
          disabled={message.trim().length < 5 || recipients === 0}
          onClick={() => setConfirm(true)}
        >
          📢 Send Broadcast
        </button>
        <span className="text-[12.5px] text-mut">
          {recipients === 0
            ? 'No leads match this segment yet.'
            : `${recipients} unique number${recipients === 1 ? '' : 's'} in this segment.`}
        </span>
      </div>

      <Modal
        open={confirm}
        title="Send this broadcast?"
        onClose={() => setConfirm(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={busy}>
              Cancel
            </button>
            <button className="btn btn-purple" onClick={send} disabled={busy}>
              {busy ? 'Sending…' : configured ? `Yes, send to ${recipients}` : 'Run the dry run'}
            </button>
          </>
        }
      >
        <p className="mb-3 text-[13.5px]">
          {configured ? (
            <>
              This goes out over <b>{channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}</b> to{' '}
              <b>{recipients}</b> number{recipients === 1 ? '' : 's'}. It cannot be recalled.
            </>
          ) : (
            <>
              No gateway is configured, so this is recorded but not sent. {recipients} number
              {recipients === 1 ? '' : 's'} matched.
            </>
          )}
        </p>
        <div className="rounded-lg bg-canvas p-3 text-[12.5px] text-ink/80">{message}</div>
      </Modal>
    </div>
  );
}
