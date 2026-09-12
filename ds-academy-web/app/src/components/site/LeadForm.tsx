'use client';

import { useState } from 'react';

/**
 * The one enquiry form used on Home, Admissions, Contact and every course
 * page. Submits to /api/enquiries, which stores the lead and then notifies.
 */
export function LeadForm({
  courses,
  compact = false,
  heading,
  note,
}: {
  courses: string[];
  compact?: boolean;
  heading?: string;
  note?: string;
}) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    course: courses[0] ?? '',
    classOf: '',
    city: '',
    message: '',
    website: '', // honeypot
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
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!res.ok) {
        if (json.fields) setErrors(json.fields);
        else setErrors({ _: json.error || 'Could not send. Please call us instead.' });
        return;
      }

      setDone(true);
    } catch {
      setErrors({ _: 'Network error. Please check your connection or call us.' });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="ds-form text-center">
        <div className="mb-2 text-3xl">✅</div>
        <h3 style={{ color: 'var(--ds-ok)' }}>Thank you — we have your details.</h3>
        <p className="mt-1.5 text-[13.5px] text-ink/80">
          Someone from the office will call you back shortly. If it is urgent, please phone us
          directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ds-form">
      {heading ? <h3>{heading}</h3> : null}
      {note ? <div className="n">{note}</div> : null}

      <div className={compact ? '' : 'grid grid-cols-1 gap-x-4 sm:grid-cols-2'}>
        <div className="ds-fld">
          <label htmlFor="lf_name">Student name *</label>
          <input id="lf_name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          {errors.name ? <span className="err">{errors.name}</span> : null}
        </div>

        <div className="ds-fld">
          <label htmlFor="lf_phone">Mobile number *</label>
          <input
            id="lf_phone"
            type="tel"
            required
            inputMode="tel"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          {errors.phone ? <span className="err">{errors.phone}</span> : null}
        </div>

        <div className="ds-fld">
          <label htmlFor="lf_course">Interested in</label>
          <select id="lf_course" value={form.course} onChange={(e) => set('course', e.target.value)}>
            {courses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="Other">Something else</option>
          </select>
        </div>

        <div className="ds-fld">
          <label htmlFor="lf_class">Current class</label>
          <input
            id="lf_class"
            placeholder="Class 11 / 12"
            value={form.classOf}
            onChange={(e) => set('classOf', e.target.value)}
          />
        </div>

        {!compact ? (
          <>
            <div className="ds-fld">
              <label htmlFor="lf_email">Email (optional)</label>
              <input id="lf_email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
              {errors.email ? <span className="err">{errors.email}</span> : null}
            </div>

            <div className="ds-fld">
              <label htmlFor="lf_city">City</label>
              <input id="lf_city" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>

            <div className="ds-fld sm:col-span-2">
              <label htmlFor="lf_msg">Anything you want to ask?</label>
              <textarea id="lf_msg" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} />
            </div>
          </>
        ) : null}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="lf_website">Leave this empty</label>
        <input
          id="lf_website"
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
        {busy ? 'Sending…' : 'Request a callback'}
      </button>

      <div className="fine">We use your number only to call you back about admissions.</div>
    </form>
  );
}
