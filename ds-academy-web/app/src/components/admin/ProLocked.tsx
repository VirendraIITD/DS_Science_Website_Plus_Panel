/**
 * Shown when an Elite installation reaches a [PRO] URL directly. The module is
 * hidden from the sidebar, so this is a bookmark or a typed address rather
 * than a dead end the staff can stumble into.
 */
export function ProLocked({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="card">
      <div className="px-5 py-12 text-center text-mut">
        <div className="mb-2.5 text-[38px]">✦</div>

        <span className="inline-block rounded-full bg-gradient-to-br from-purp to-brand px-3 py-1 text-[11px] font-bold tracking-wide text-white">
          PRO MODULE
        </span>

        <h2 className="mb-2 mt-3.5 text-[17px] font-bold text-ink">{title}</h2>
        <p className="mx-auto max-w-[520px] text-[13.5px]">{blurb}</p>

        <p className="mx-auto mt-6 max-w-[520px] text-[12px] text-mut/80">
          This installation is running the Elite plan. Everything needed for this module is already
          in the code — enabling it is a plan change, not a rebuild.
        </p>
      </div>
    </div>
  );
}
