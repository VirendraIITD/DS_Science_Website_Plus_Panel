/**
 * The prototype's CSS bar chart. Pure markup — no charting library, which
 * keeps the admin bundle small and the page fast on a slow connection.
 */
export function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex h-[170px] items-end gap-3 pb-6 pt-5">
      {data.map((d) => (
        <div key={d.label} className="relative flex-1">
          <div
            className="relative w-full rounded-t-md bg-gradient-to-b from-[#4f7bf0] to-brand"
            style={{ height: `${Math.max(6, (d.value / max) * 120)}px` }}
          >
            <b className="absolute -top-[18px] left-0 right-0 text-center text-[10.5px] font-semibold text-navy">
              {d.value}
            </b>
          </div>
          <span className="absolute -bottom-[20px] left-0 right-0 text-center text-[10.5px] text-mut">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}
