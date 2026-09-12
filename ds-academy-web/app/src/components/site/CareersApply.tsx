'use client';

import { useState } from 'react';

export type Opening = {
  position: string;
  department: string;
  type: string;
  experience: string;
  status: string;
  seatClass: 'few' | 'ok' | 'new';
  filled?: boolean;
};

async function submitApplication(data: {
  name: string;
  phone: string;
  email: string;
  position: string;
  experience: string;
  cv: File | null;
  website: string;
}) {
  const form = new FormData();
  form.set('name', data.name);
  form.set('phone', data.phone);
  form.set('email', data.email);
  form.set('position', data.position);
  form.set('experience', data.experience);
  form.set('website', data.website);
  if (data.cv) form.set('cv', data.cv);

  const res = await fetch('/api/careers/apply', { method: 'POST', body: form });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

/** Current-openings table with a per-role "Apply →" that opens a quick-apply modal. */
export function OpeningsTable({ openings }: { openings: Opening[] }) {
  const [modalPosition, setModalPosition] = useState<string | null>(null);

  return (
    <>
      <div className="ds-tblw">
        <table>
          <thead>
            <tr>
              <th>POSITION</th>
              <th>DEPARTMENT</th>
              <th>TYPE</th>
              <th>EXPERIENCE</th>
              <th>STATUS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {openings.map((o) => (
              <tr key={o.position}>
                <td>
                  <b>{o.position}</b>
                </td>
                <td>{o.department}</td>
                <td>{o.type}</td>
                <td>{o.experience}</td>
                <td>
                  <span className={`ds-seat ${o.seatClass}`}>{o.status}</span>
                </td>
                <td>
                  {o.filled ? (
                    <span style={{ color: 'var(--ds-mut)', fontSize: '12.5px' }}>Filled</span>
                  ) : (
                    <span className="ds-lnk" onClick={() => setModalPosition(o.position)}>
                      Apply →
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalPosition ? (
        <ApplyModal position={modalPosition} onClose={() => setModalPosition(null)} />
      ) : null}
    </>
  );
}

function ApplyModal({ position, onClose }: { position: string; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', experience: '', website: '' });
  const [cv, setCv] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter your name.');
    if (form.phone.trim().length < 10) return setError('Enter a valid 10-digit mobile number.');
    if (!cv) return setError('Please upload your CV (PDF or DOC).');

    setBusy(true);
    try {
      await submitApplication({ ...form, position, cv });
      setDone(true);
    } catch (err) {
      setError((err as { error?: string })?.error || 'Could not send. Please email us instead.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="ds-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="box">
        <button className="close" onClick={onClose} aria-label="Close" type="button">
          ✕
        </button>

        {done ? (
          <div className="ds-connect">
            <div className="ic">✓</div>
            <h3>Application received</h3>
            <p>Thanks — we&rsquo;ll call you within 3-4 days if it&rsquo;s a fit. Keep your phone reachable.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3>
              Apply for <span style={{ color: 'var(--ds-gold)' }}>{position}</span>
            </h3>
            <div className="n">Fill your details and attach your CV — we&rsquo;ll call you within 3-4 days.</div>

            <div className="ds-fld">
              <label>Your name *</label>
              <input placeholder="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} />
            </div>
            <div className="ds-fld">
              <label>Mobile number *</label>
              <input
                placeholder="10-digit mobile"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
              />
            </div>
            <div className="ds-fld">
              <label>Email</label>
              <input
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>
            <div className="ds-fld">
              <label>Experience</label>
              <input
                placeholder="e.g. 3 years teaching NEET Physics"
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
              />
            </div>
            <div className="ds-fld">
              <label>Upload CV (PDF/DOC, max 5MB) *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCv(e.target.files?.[0] ?? null)}
              />
            </div>

            {error ? (
              <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12.5px] font-semibold text-bad">
                {error}
              </p>
            ) : null}

            <button className="ds-btn gold" style={{ width: '100%', marginTop: '17px' }} disabled={busy}>
              {busy ? 'Submitting…' : 'Submit Application'}
            </button>
            <div className="fine">Or email directly: careers@dsscienceacademy.com</div>
          </form>
        )}
      </div>
    </div>
  );
}

/** The catch-all "Apply now" form at the bottom of the Careers page. */
export function CareersApplyForm({ positions }: { positions: string[] }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    position: positions[0] ?? 'Other',
    experience: '',
    website: '',
  });
  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await submitApplication({ ...form, cv });
      setDone(true);
    } catch (err) {
      const j = err as { error?: string; fields?: Record<string, string> };
      if (j.fields) setErrors(j.fields);
      else setErrors({ _: j.error || 'Could not send. Please email us instead.' });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="ds-form text-center">
        <div className="mb-2 text-3xl">✅</div>
        <h3 style={{ color: 'var(--ds-ok)' }}>Application received.</h3>
        <p className="mt-1.5 text-[13.5px] text-ink/80">
          We&rsquo;ll call you within 3-4 days if it&rsquo;s a fit. Keep your phone reachable.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="ds-form">
      <h3>Apply now</h3>
      <div className="n">We&rsquo;ll call to talk it through.</div>

      <div className="ds-fld">
        <label>Your name *</label>
        <input required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
        {errors.name ? <span className="err">{errors.name}</span> : null}
      </div>
      <div className="ds-fld">
        <label>Mobile number *</label>
        <input
          required
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="10-digit mobile"
        />
        {errors.phone ? <span className="err">{errors.phone}</span> : null}
      </div>
      <div className="ds-fld">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="ds-fld">
        <label>Position applying for</label>
        <select value={form.position} onChange={(e) => set('position', e.target.value)}>
          {positions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="ds-fld">
        <label>Experience</label>
        <input
          value={form.experience}
          onChange={(e) => set('experience', e.target.value)}
          placeholder="e.g. 3 years teaching NEET Physics"
        />
      </div>
      <div className="ds-fld">
        <label>Upload CV (PDF/DOC, max 5MB)</label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setCv(e.target.files?.[0] ?? null)} />
      </div>

      {errors._ ? (
        <p role="alert" className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-[12.5px] font-semibold text-bad">
          {errors._}
        </p>
      ) : null}

      <button type="submit" className="ds-btn gold" style={{ width: '100%', marginTop: '17px' }} disabled={busy}>
        {busy ? 'Sending…' : 'Submit application'}
      </button>
      <div className="fine">Or email your resume directly: careers@dsscienceacademy.com</div>
    </form>
  );
}
