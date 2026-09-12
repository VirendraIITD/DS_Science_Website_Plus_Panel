import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { LoginForm } from '@/components/admin/LoginForm';
import { getSessionUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { TIER } from '@/lib/tier';

export const metadata: Metadata = { title: 'Sign in — Admin Panel' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  if (await getSessionUser()) redirect(searchParams.next || '/admin');

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-6 text-center">
          <span
            className={`inline-flex h-14 w-14 items-center justify-center rounded-xl text-xl font-extrabold text-white ${
              TIER === 'pro'
                ? 'bg-gradient-to-br from-[#8b5cf6] to-[#2f4d9e]'
                : 'bg-gradient-to-br from-[#2f4d9e] to-[#1a2c66]'
            }`}
          >
            DS
          </span>
          <h1 className="mt-3 text-lg font-bold text-white">{settings.instituteName}</h1>
          <p className="mt-1 text-[11px] tracking-widest text-[#8fa0c8]">
            ADMIN PANEL · powered by Mentora
          </p>
        </div>

        <div className="rounded-card border border-line bg-white p-6">
          <LoginForm next={searchParams.next} />
        </div>

        <p className="mt-5 text-center text-[11.5px] text-[#8fa0c8]">
          {TIER === 'pro' ? 'Pro' : 'Elite'} v1.0 · Mentora
        </p>
      </div>
    </div>
  );
}
