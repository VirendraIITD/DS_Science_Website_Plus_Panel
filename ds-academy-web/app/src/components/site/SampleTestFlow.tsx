'use client';

import { useEffect, useMemo, useState } from 'react';

type ExamKey = 'jeemain' | 'jeeadv' | 'neet';

const EXAMS: Record<ExamKey, { label: string; subjects: { name: string; topics: string[] }[] }> = {
  jeemain: {
    label: 'JEE Main',
    subjects: [
      { name: 'PHYSICS', topics: ['Mechanics', 'Electrodynamics', 'Optics & Waves', 'Modern Physics', 'Thermodynamics'] },
      { name: 'CHEMISTRY', topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
      { name: 'MATHEMATICS', topics: ['Algebra', 'Calculus', 'Coordinate Geometry', 'Trigonometry'] },
    ],
  },
  jeeadv: {
    label: 'JEE Advanced',
    subjects: [
      { name: 'PHYSICS', topics: ['Mechanics', 'Electrodynamics', 'Modern Physics', 'Heat & Thermodynamics'] },
      { name: 'CHEMISTRY', topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
      { name: 'MATHEMATICS', topics: ['Algebra', 'Calculus', 'Vectors & 3D', 'Probability'] },
    ],
  },
  neet: {
    label: 'NEET-UG',
    subjects: [
      { name: 'PHYSICS', topics: ['Mechanics', 'Electrodynamics', 'Optics', 'Modern Physics'] },
      { name: 'CHEMISTRY', topics: ['Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry'] },
      { name: 'BIOLOGY', topics: ['Botany — Diversity', 'Botany — Physiology', 'Zoology — Human Physiology', 'Genetics & Evolution', 'Ecology'] },
    ],
  },
};

const ST_KEY = 'dsSampleTestVerified';

export function SampleTestFlow() {
  const [exam, setExam] = useState<ExamKey>('jeemain');
  const [testType, setTestType] = useState<'subject' | 'mock'>('subject');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [verified, setVerified] = useState<{ name: string; mobile: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ST_KEY);
      if (raw) setVerified(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const topicCount = useMemo(
    () => [...selected].filter((k) => k.startsWith(`${exam}|`)).length,
    [selected, exam],
  );

  const toggleTopic = (topic: string) => {
    const key = `${exam}|${topic}`;
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <>
      <section className="ds-sec">
        <div className="container-ds">
          <div className="ds-head">
            <div>
              <h2 className="t">Step 1 — Exam &amp; test type</h2>
              <p className="st">Pick your exam, then choose subject-wise topics or a full syllabus mock test.</p>
            </div>
          </div>

          <div className="ds-tabs">
            {(Object.keys(EXAMS) as ExamKey[]).map((k) => (
              <button key={k} type="button" className={exam === k ? 'on' : ''} onClick={() => setExam(k)}>
                {EXAMS[k].label}
              </button>
            ))}
          </div>

          <div className="ds-ttype">
            <button type="button" className={`ds-ttopt${testType === 'subject' ? ' on' : ''}`} onClick={() => setTestType('subject')}>
              <b>📚 Subject-wise</b>
              <span>Pick your own topics, any mix</span>
            </button>
            <button type="button" className={`ds-ttopt${testType === 'mock' ? ' on' : ''}`} onClick={() => setTestType('mock')}>
              <b>📝 Full Mock Test</b>
              <span>Complete syllabus, real exam pattern</span>
            </button>
          </div>

          {testType === 'subject' ? (
            <div className="ds-ccard" style={{ padding: '25px' }}>
              {EXAMS[exam].subjects.map((s) => (
                <div key={s.name} className="ds-tsubject">
                  <span className="tlabel">{s.name}</span>
                  <div className="ds-tchips">
                    {s.topics.map((t) => {
                      const on = selected.has(`${exam}|${t}`);
                      return (
                        <button key={t} type="button" className={`ds-tchip${on ? ' on' : ''}`} onClick={() => toggleTopic(t)}>
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="ds-tcount">
                <span>
                  <b>{topicCount}</b> topics selected
                </span>
              </div>
            </div>
          ) : (
            <div className="ds-ccard" style={{ padding: '25px', maxWidth: '640px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '6px' }}>Full Mock Test</h3>
              <p style={{ fontSize: '13.5px', color: 'var(--ds-mut)', marginBottom: '16px' }}>
                Complete syllabus, official time limit — no topic picking needed.
              </p>
              <div className="ds-dlist">
                <div>
                  <i>✓</i> Full syllabus, exam-pattern questions
                </div>
                <div>
                  <i>✓</i> Official time limit — up to 3 hours
                </div>
                <div>
                  <i>✓</i> Negative marking, same as the real exam
                </div>
                <div>
                  <i>✓</i> Full scorecard the moment you finish
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="ds-sec alt">
        <div className="container-ds" style={{ maxWidth: '720px' }}>
          <div className="ds-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <h2 className="t">Step 2 — Start your test</h2>
              <p className="st">Click below — we&apos;ll just confirm your name, location and mobile number, then take you to the test.</p>
            </div>
          </div>
          <div className="ds-startcta">
            <button type="button" className="ds-btn gold" onClick={() => setModalOpen(true)}>
              Start Test →
            </button>
            <div className="ds-apibadge">🔌 Opens DS&apos;s official test portal — API integration pending</div>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <StartTestModal
          verified={verified}
          onVerified={(v) => {
            setVerified(v);
            try {
              localStorage.setItem(ST_KEY, JSON.stringify(v));
            } catch {
              // ignore
            }
          }}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}

function StartTestModal({
  verified,
  onVerified,
  onClose,
}: {
  verified: { name: string; mobile: string } | null;
  onVerified: (v: { name: string; mobile: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [done, setDone] = useState(false);

  const canSendOtp = name.trim().length > 1 && mobile.trim().length >= 10;

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

        {done || (verified && !otpSent) ? (
          <div className="ds-connect">
            <div className="ic">✓</div>
            <h3>{verified ? `Welcome back, ${verified.name}` : 'Number verified'}</h3>
            <p>Your test is ready. This opens DS Science Academy&apos;s official test portal in a new tab.</p>
            <div className="ds-apibadge" style={{ marginTop: '16px' }}>
              🔌 Test portal integration pending — the office will WhatsApp you the link shortly
            </div>
          </div>
        ) : (
          <>
            <h3>Start your test</h3>
            <div className="n">We just need your name, city and mobile number to send the link.</div>

            <div className="ds-fld">
              <label>Your name *</label>
              <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} disabled={otpSent} />
            </div>
            <div className="ds-fld">
              <label>City</label>
              <input placeholder="Your city" value={city} onChange={(e) => setCity(e.target.value)} disabled={otpSent} />
            </div>
            <div className="ds-fld" style={{ display: 'flex', gap: '9px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Mobile number *</label>
                <input placeholder="10-digit mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} disabled={otpSent} />
              </div>
              {!otpSent ? (
                <button
                  type="button"
                  className="ds-btn lineb sm"
                  disabled={!canSendOtp}
                  onClick={() => setOtpSent(true)}
                >
                  Send OTP
                </button>
              ) : null}
            </div>

            {otpSent ? (
              <div className="ds-fld">
                <label>Enter OTP *</label>
                <input placeholder="4-digit code sent to your phone" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <span className="ds-vtag pending" style={{ marginTop: '8px' }}>
                  ⏳ Code sent to {mobile}
                </span>
              </div>
            ) : null}

            <button
              type="button"
              className="ds-btn gold"
              style={{ width: '100%', marginTop: '17px' }}
              disabled={otpSent ? otp.trim().length < 4 : !canSendOtp}
              onClick={() => {
                if (!otpSent) return;
                onVerified({ name: name.trim(), mobile: mobile.trim() });
                setDone(true);
              }}
            >
              {otpSent ? 'Verify & Start Test' : 'Send OTP to continue'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
