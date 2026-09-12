'use client';

import { useState } from 'react';

/** [PRO] Public Book-a-Demo form — posts to /api/demo. */
export function DemoForm({
  courses,
  branches,
}: {
  courses: string[];
  branches: { id: string; name: string }[];
}) {
  const tomorrow = new Date(Date.now() + 86400_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const defaultSlot = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate(),
  )}T17:00`;

  const [form, setForm] = useState({
    studentName: '',
    phone: '',
    email: '',
    course: courses[0] ?? '',
    date: defaultSlot,
    mode: 'ONLINE',
    branchId: branches[0]?.id ?? '',
    notes: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: '' } : e));
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        else setErrors({ _: json.error || 'Could not book. Please call us instead.' });
        return;
      }

      setDone(true);
    } catch {
      setErrors({ _: 'Network error. Please try again or call us.' });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="ds-form text-center">
        <div className="mb-2 text-4xl">📅</div>
        <h3 style={{ color: 'var(--ds-ok)' }}>Your demo slot is requested.</h3>
        <p className="mt-2 text-[13.5px] leading-6 text-ink/80">
          We will call to confirm the exact time before the day. If you need to change it, just
          reply to that call — no forms.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ds-form">
      <h3>Book your demo class</h3>
      <div className="n">We will call to confirm the day and time.</div>

      <div className="ds-fld">
        <label htmlFor="d_name">Student name *</label>
        <input id="d_name" required value={form.studentName} onChange={(e) => set('studentName', e.target.value)} />
        {errors.studentName ? <span className="err">{errors.studentName}</span> : null}
      </div>

      <div className="ds-fld">
        <label htmlFor="d_phone">Mobile number *</label>
        <input
          id="d_phone"
          type="tel"
          inputMode="tel"
          required
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        {errors.phone ? <span className="err">{errors.phone}</span> : null}
      </div>

      <div className="ds-fld">
        <label htmlFor="d_mode">Demo mode *</label>
        <select id="d_mode" value={form.mode} onChange={(e) => set('mode', e.target.value)}>
          <option value="ONLINE">💻 Live Demo — online</option>
          <option value="CENTRE">🏫 Offline Demo — at campus</option>
        </select>
      </div>

      <div className="ds-fld">
        <label htmlFor="d_course">Batch you are considering</label>
        <select id="d_course" value={form.course} onChange={(e) => set('course', e.target.value)}>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="ds-fld">
        <label htmlFor="d_date">Preferred date &amp; time *</label>
        <input
          id="d_date"
          type="datetime-local"
          required
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
        {errors.date ? <span className="err">{errors.date}</span> : null}
      </div>

      {branches.length > 1 && form.mode === 'CENTRE' ? (
        <div className="ds-fld">
          <label htmlFor="d_branch">Centre</label>
          <select id="d_branch" value={form.branchId} onChange={(e) => set('branchId', e.target.value)}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="ds-fld">
        <label htmlFor="d_notes">Anything we should know?</label>
        <textarea id="d_notes" rows={3} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="d_website">Leave this empty</label>
        <input
          id="d_website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set('website', e.target.value)}
        />
      </div>

      {errors._ ? (
        <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12.5px] font-semibold text-bad">
          {errors._}
        </p>
      ) : null}

      <button type="submit" className="ds-btn gold" style={{ width: '100%', marginTop: '17px' }} disabled={busy}>
        {busy ? 'Booking…' : 'Book the demo'}
      </button>
      <div className="fine">We use your number only to call you back about the demo.</div>
    </form>
  );
}
