'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Topbar({ title, userName }: { title: string; userName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase() || 'AD';

  async function logout() {
    setBusy(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-6 py-3.5 pl-16 lg:pl-6">
      <h1 className="truncate text-[19px] font-bold">{title}</h1>

      <div className="flex items-center gap-3.5">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden text-[12.5px] font-semibold text-brand hover:underline sm:inline"
        >
          View website ↗
        </a>

        <button
          onClick={logout}
          disabled={busy}
          className="text-[12.5px] font-semibold text-mut hover:text-bad"
        >
          {busy ? 'Signing out…' : 'Sign out'}
        </button>

        <span
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gold text-[13px] font-bold text-[#3a2a00]"
          title={userName}
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
