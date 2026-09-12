'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Could not sign in.');
        return;
      }

      // Only follow same-origin paths — never an attacker-supplied URL.
      const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/admin';
      router.replace(target);
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="lbl" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="inp"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label className="lbl" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          className="inp"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-[#fdeceb] px-3 py-2 text-[12.5px] font-semibold text-bad">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn w-full" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
