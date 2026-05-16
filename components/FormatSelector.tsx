"use client";

import { useRouter } from "next/navigation";

type Props = {
  characterId: string;
  selected: "interactive" | "text-voice";
};

const FORMATS: { key: "interactive" | "text-voice"; label: string; icon: string }[] = [
  { key: "interactive", label: "Відео", icon: "🎬" },
  { key: "text-voice", label: "Текст / Голос", icon: "💬" },
];

export default function FormatSelector({ characterId, selected }: Props) {
  const router = useRouter();

  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/5 p-1">
      {FORMATS.map((f) => {
        const active = f.key === selected;
        return (
          <button
            key={f.key}
            onClick={() => router.replace(`/character/${characterId}?format=${f.key}`)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium transition ${
              active
                ? "bg-accent-500 text-white shadow-[0_6px_20px_-8px_rgba(139,92,246,0.8)]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
