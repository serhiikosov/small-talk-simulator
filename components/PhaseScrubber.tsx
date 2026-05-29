"use client";

import { useRouter } from "next/navigation";
import { characters } from "@/lib/characters";
import { PHASE_LABEL, PHASE_ORDER, useSceneController } from "./SceneController";

export function PhaseScrubber() {
  const { active, phase, setPhase, characterId } = useSceneController();
  const router = useRouter();
  return (
    <aside className="absolute left-4 top-4 z-20 flex max-h-[88vh] w-[180px] flex-col gap-2 overflow-y-auto rounded-2xl border border-[color:var(--border-subtle)] bg-white/80 px-2.5 py-2.5 text-[12px] shadow-[var(--shadow-elev)] backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-quaternary)]">
          Character
        </p>
        <div className="flex flex-col gap-0.5">
          {characters.map((c) => {
            const isCurrent = c.id === characterId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/simulation/${c.id}/interactive`)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[12px] transition active:scale-[0.98] ${
                  isCurrent
                    ? "bg-[color:var(--surface-accent-solid)] text-white shadow-sm"
                    : "text-[color:var(--text-secondary)] hover:bg-black/5"
                }`}
              >
                <span className="font-medium">{c.name}</span>
                <span
                  className={`ml-3 font-mono text-[10px] ${
                    isCurrent ? "text-white/70" : "text-[color:var(--text-quaternary)]"
                  }`}
                >
                  {c.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {active && (
        <div className="mt-1 flex flex-col gap-1 border-t border-black/10 pt-2">
          <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-quaternary)]">
            Jump to phase
          </p>
          <div className="flex flex-col gap-0.5">
            {PHASE_ORDER.map((p) => {
              const isActive = p === phase;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPhase(p)}
                  className={`flex items-center rounded-lg px-2.5 py-1.5 text-left text-[12px] transition active:scale-[0.98] ${
                    isActive
                      ? "bg-[color:var(--surface-accent-solid)] text-white shadow-sm"
                      : "text-[color:var(--text-secondary)] hover:bg-black/5"
                  }`}
                >
                  <span className="font-medium">{PHASE_LABEL[p]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
