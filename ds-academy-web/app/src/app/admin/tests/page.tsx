import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * PRD §13 allows this teaser tab but puts its implementation out of scope.
 * It is deliberately non-functional — no links, no forms, nothing to click.
 */
export default async function TestsTeaserPage() {
  await requireUser();

  return (
    <div className="card">
      <div className="px-5 py-12 text-center text-mut">
        <div className="mb-2.5 text-[38px]">🧪</div>

        <span className="inline-block rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-[#3a2a00]">
          COMING IN PHASE 2
        </span>

        <h2 className="mb-2 mt-3.5 text-[17px] font-bold text-ink">
          Question Bank &amp; Online Test Portal
        </h2>

        <p className="mx-auto max-w-[520px] text-[13.5px]">
          Create papers from your own question bank, run NTA-style online tests (up to 500 students
          at a time), publish results &amp; leaderboards — all from this same panel. Hindi + English
          support included.
        </p>

        <p className="mx-auto mt-6 max-w-[520px] text-[12px] text-mut/80">
          Not part of the current build. Talk to us when you are ready to add it.
        </p>
      </div>
    </div>
  );
}
