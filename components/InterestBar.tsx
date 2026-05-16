"use client";

export default function InterestBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 65
      ? { bar: "from-emerald-400 to-emerald-500", emoji: "😊", label: "Цікаво" }
      : clamped >= 35
      ? { bar: "from-amber-400 to-amber-500", emoji: "🙂", label: "Нейтрально" }
      : { bar: "from-rose-400 to-rose-500", emoji: "😐", label: "Втрачається" };

  return (
    <div className="px-5 pb-3">
      <div className="flex items-center justify-between text-[11px]">
        <span className="flex items-center gap-1.5 uppercase tracking-widest text-slate-400">
          <span className="text-base">{tone.emoji}</span>
          <span>Зацікавленість</span>
        </span>
        <span className="font-mono text-slate-200">{clamped}<span className="text-slate-500">/100</span></span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone.bar} transition-[width] duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
