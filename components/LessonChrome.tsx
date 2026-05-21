"use client";

import Link from "next/link";
import { createContext, useContext, useState } from "react";

type Ctx = {
  isSummary: boolean;
  setSummary: (v: boolean) => void;
};

const LessonChromeContext = createContext<Ctx | null>(null);

export function useLessonChrome() {
  const ctx = useContext(LessonChromeContext);
  if (!ctx) {
    throw new Error("useLessonChrome must be used inside <LessonChrome>");
  }
  return ctx;
}

export function LessonChrome({ children }: { children: React.ReactNode }) {
  const [isSummary, setSummary] = useState(false);
  return (
    <LessonChromeContext.Provider value={{ isSummary, setSummary }}>
      <div className="rg-lesson-header">
        <span className="rg-eyebrow">Practice</span>
        <h1 className="rg-section-title">Small Talk Simulator</h1>
      </div>
      <div className="rg-tool-card">{children}</div>
      <div className="rg-lesson-cta">
        <CompleteLessonButton />
      </div>
    </LessonChromeContext.Provider>
  );
}

function CompleteLessonButton() {
  const { isSummary } = useLessonChrome();
  const base =
    "flex h-12 w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition active:scale-[0.98]";
  const primary =
    "bg-[color:var(--cta-bg)] text-[color:var(--cta-text)] shadow-[var(--shadow-action)]";
  const secondary =
    "border border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-primary)]";
  return (
    <Link
      href="/"
      className={`${base} ${isSummary ? primary : secondary}`}
    >
      Complete Lesson
    </Link>
  );
}
