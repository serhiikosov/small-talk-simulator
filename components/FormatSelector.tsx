"use client";

import { useRouter } from "next/navigation";

type Props = {
  characterId: string;
  selected: "interactive" | "text-voice";
};

const FORMATS: { key: "interactive" | "text-voice"; label: string; icon: string }[] = [
  { key: "interactive", label: "Video", icon: "🎬" },
  { key: "text-voice", label: "Text / Voice", icon: "💬" },
];

export default function FormatSelector({ characterId, selected }: Props) {
  const router = useRouter();

  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] p-1 shadow-[var(--shadow-elev)]">
      {FORMATS.map((f) => {
        const active = f.key === selected;
        return (
          <button
            key={f.key}
            onClick={() => router.replace(`/character/${characterId}?format=${f.key}`)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[14px] font-medium transition ${
              active
                ? "bg-[color:var(--cta-bg)] text-[color:var(--cta-text)]"
                : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
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
