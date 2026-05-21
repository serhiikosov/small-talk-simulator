"use client";

export default function InterestBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 65
      ? { bar: "from-emerald-400 to-emerald-500", label: "Engaged" }
      : clamped >= 35
      ? { bar: "from-amber-400 to-amber-500", label: "Neutral" }
      : { bar: "from-rose-400 to-rose-500", label: "Slipping" };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
          Interest
        </span>
        <span className="font-mono text-[12px] font-semibold text-[color:var(--text-secondary)]">
          {clamped}
          <span className="text-[color:var(--text-quaternary)]">/100</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-[width] duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
