'use client';

import Link from 'next/link';
import { useState } from 'react';

type Prediction = {
  college: string;
  courseName: string;
  state: string;
  quota: string;
  category: string;
  closingRank: number;
  year: number;
  verdict: 'SAFE' | 'MODERATE' | 'REACH';
};

const VERDICT: Record<string, { label: string; pill: string }> = {
  SAFE: { label: 'Safe', pill: 'ds-seat ok' },
  MODERATE: { label: 'Moderate', pill: 'ds-seat new' },
  REACH: { label: 'Reach', pill: 'ds-seat few' },
};

export function PredictorWidget({
  filters,
}: {
  filters: { exams: string[]; categories: string[]; quotas: string[]; states: string[] };
}) {
  const [exam, setExam] = useState(filters.exams[0] ?? 'NEET');
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState(filters.categories[0] ?? 'General');
  const [quota, setQuota] = useState('');
  const [state, setState] = useState('');

  const [results, setResults] = useState<Prediction[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, rank: Number(rank), category, quota, state }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Could not run the prediction.');
        setResults(null);
        return;
      }

      setResults(json.results);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form
        onSubmit={submit}
        className="rounded-card bg-gradient-to-br from-navy to-[#25306b] p-6 text-white"
      >
        <h2 className="text-[18px] font-bold">🎯 Find your colleges</h2>
        <p className="mt-1 text-[12.5px] text-[#b9c6e8]">
          Enter your All-India rank. Nothing is stored — this is only a lookup.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#c9d5f0]" htmlFor="p_exam">
              Exam
            </label>
            <select id="p_exam" className="inp" value={exam} onChange={(e) => setExam(e.target.value)}>
              {filters.exams.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#c9d5f0]" htmlFor="p_rank">
              Your rank *
            </label>
            <input
              id="p_rank"
              className="inp"
              type="number"
              inputMode="numeric"
              min={1}
              required
              placeholder="12500"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#c9d5f0]" htmlFor="p_cat">
              Category
            </label>
            <select
              id="p_cat"
              className="inp"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {filters.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[12px] font-semibold text-[#c9d5f0]" htmlFor="p_quota">
              Quota
            </label>
            <select id="p_quota" className="inp" value={quota} onChange={(e) => setQuota(e.target.value)}>
              <option value="">Any</option>
              {filters.quotas.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          {filters.states.length > 0 ? (
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[12px] font-semibold text-[#c9d5f0]" htmlFor="p_state">
                State (optional)
              </label>
              <select
                id="p_state"
                className="inp"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">All states</option>
                {filters.states.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        <button type="submit" className="ds-btn gold mt-5" disabled={busy || !rank}>
          {busy ? 'Checking…' : 'Predict My Rank →'}
        </button>

        {error ? (
          <p role="alert" className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-[12.5px] font-semibold">
            {error}
          </p>
        ) : null}
      </form>

      {results ? (
        <div className="ds-wcard mt-6" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ds-navy)', marginBottom: '13px' }}>
            {results.length === 0
              ? 'No matches at that rank'
              : `${results.length} college${results.length === 1 ? '' : 's'} at rank ${Number(rank).toLocaleString('en-IN')}`}
          </h3>

          {results.length === 0 ? (
            <p className="text-[13.5px] text-mut">
              Nothing in our data falls near that rank for the filters you picked. Try widening the
              quota or state, or{' '}
              <Link href="/contact" className="text-brand underline">
                talk to a counsellor
              </Link>
              .
            </p>
          ) : (
            <div className="ds-tblw">
              <table>
                <thead>
                  <tr>
                    <th>COLLEGE</th>
                    <th>COURSE</th>
                    <th>QUOTA</th>
                    <th>CLOSING RANK</th>
                    <th>CHANCE</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={`${r.college}-${r.courseName}-${i}`}>
                      <td>
                        <b>{r.college}</b>
                        {r.state ? <span className="block text-[11.5px] font-normal text-mut">{r.state}</span> : null}
                      </td>
                      <td>{r.courseName}</td>
                      <td className="whitespace-nowrap text-[12px]">{r.quota}</td>
                      <td className="whitespace-nowrap">
                        {r.closingRank.toLocaleString('en-IN')}
                        <span className="block text-[11px] text-mut">{r.year}</span>
                      </td>
                      <td>
                        <span className={VERDICT[r.verdict].pill}>{VERDICT[r.verdict].label}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="ds-note mt-5" style={{ textAlign: 'center' }}>
            <p style={{ color: '#7a5800', margin: 0 }}>Want help filling your choices?</p>
            <Link href="/contact" className="ds-btn gold sm mt-2" style={{ display: 'inline-flex' }}>
              Talk to our counsellor
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
