"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Session, TranscriptEntry, WhatItem } from "@/lib/summary";
import { useLessonChrome } from "@/components/LessonChrome";

type Props = {
  session: Session;
  characterId: string;
  characterName: string;
  onRestart: () => void;
};

export default function ConversationSummary({
  session,
  characterId,
  characterName,
  onRestart,
}: Props) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const { setSummary } = useLessonChrome();

  useEffect(() => {
    setSummary(true);
    return () => setSummary(false);
  }, [setSummary]);

  function seeMoment(idx: number) {
    setTranscriptOpen(true);
    setHighlightIndex(idx);
    setTimeout(() => {
      document.getElementById(`msg-${idx}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 80);
    setTimeout(() => setHighlightIndex(null), 3500);
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
      <div className="px-5 pb-6 pt-3">
        <HeroPoster
          hero={session.analysis.heroMoment}
          characterName={characterName}
        />

        <div className="mt-7">
          <InsightsSection
            whatWorked={session.analysis.whatWorked}
            worthNoticing={session.analysis.worthNoticing}
            onSeeMoment={seeMoment}
          />
        </div>

        <TranscriptSection
          transcript={session.transcript}
          annotations={session.analysis.transcriptAnnotations}
          open={transcriptOpen}
          setOpen={setTranscriptOpen}
          highlightIndex={highlightIndex}
          characterName={characterName}
        />

        <Footer characterId={characterId} onRestart={onRestart} />
      </div>
    </div>
  );
}

/* ───────── Hero poster ───────── */

function HeroPoster({
  hero,
  characterName,
}: {
  hero: Session["analysis"]["heroMoment"];
  characterName: string;
}) {
  return (
    <section className="animate-block-in" style={{ animationDelay: "0ms" }}>
      <p className="text-[12px] uppercase tracking-[0.4em] text-coral">
        {characterName}'s takeaway
      </p>
      <blockquote className="mt-4 text-[19px] leading-[1.42] text-[color:var(--text-primary)]">
        <span className="text-coral">“</span>
        {hero.quote}
        <span className="text-coral">”</span>
      </blockquote>
      <div className="mt-5 h-px w-10 bg-coral/40" />
      <p className="mt-4 text-[15px] italic leading-[1.55] text-[color:var(--text-secondary)]">
        {hero.lesson}
      </p>
    </section>
  );
}

/* ───────── Insights ───────── */

function InsightsSection({
  whatWorked,
  worthNoticing,
  onSeeMoment,
}: {
  whatWorked: WhatItem[];
  worthNoticing: WhatItem[];
  onSeeMoment: (idx: number) => void;
}) {
  return (
    <section
      className="space-y-1 animate-block-in"
      style={{ animationDelay: "300ms" }}
    >
      {whatWorked.map((item, i) => (
        <InsightRow
          key={`good-${i}`}
          tone="coral"
          item={item}
          onSeeMoment={onSeeMoment}
        />
      ))}
      {worthNoticing.map((item, i) => (
        <InsightRow
          key={`watch-${i}`}
          tone="muted"
          item={item}
          onSeeMoment={onSeeMoment}
        />
      ))}
    </section>
  );
}

function firstSentence(text: string): string {
  const m = text.match(/^[^.!?]+[.!?]/);
  return m ? m[0].trim() : text;
}

function InsightRow({
  tone,
  item,
  onSeeMoment,
}: {
  tone: "coral" | "muted";
  item: WhatItem;
  onSeeMoment: (idx: number) => void;
}) {
  const isCoral = tone === "coral";
  const badge = isCoral ? "bg-coral text-white" : "bg-muted text-white";
  const glyph = isCoral ? "✓" : "!";
  return (
    <button
      onClick={() => onSeeMoment(item.transcriptIndex)}
      className="group -mx-2 flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[color:var(--surface-soft)]"
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[14px] font-semibold leading-none ${badge}`}
      >
        {glyph}
      </span>
      <p className="flex-1 text-[15px] leading-snug text-[color:var(--text-primary)]">
        {firstSentence(item.comment)}
      </p>
      <span className="mt-0.5 text-[16px] leading-none text-[color:var(--text-quaternary)] transition group-hover:text-[color:var(--text-secondary)]">
        →
      </span>
    </button>
  );
}

/* ───────── Transcript ───────── */

function TranscriptSection({
  transcript,
  annotations,
  open,
  setOpen,
  highlightIndex,
  characterName,
}: {
  transcript: TranscriptEntry[];
  annotations: { [index: number]: string };
  open: boolean;
  setOpen: (v: boolean) => void;
  highlightIndex: number | null;
  characterName: string;
}) {
  return (
    <section
      className="mt-7 animate-block-in"
      style={{ animationDelay: "440ms" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[14px] font-medium text-[color:var(--text-secondary)] transition hover:text-[color:var(--text-primary)]"
      >
        <span>{open ? "Hide" : "Read"} the full conversation</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 12 8"
          fill="none"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {transcript.map((m, i) => {
            const isUser = m.speaker === "user";
            const annotation = isUser ? annotations[i] : undefined;
            const isHighlighted = highlightIndex === i;
            return (
              <div
                key={i}
                id={`msg-${i}`}
                className={`relative pl-4 transition ${
                  isHighlighted
                    ? "before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[2px] before:rounded-full before:bg-coral"
                    : "before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[2px] before:rounded-full before:bg-[color:var(--border-subtle)]"
                }`}
              >
                <p
                  className={`text-[12px] uppercase tracking-[0.2em] ${
                    isUser
                      ? "text-[color:var(--text-accent)]"
                      : "text-[color:var(--text-quaternary)]"
                  }`}
                >
                  {isUser ? "You" : characterName}
                </p>
                <p className="mt-1 text-[15px] leading-relaxed text-[color:var(--text-primary)]">
                  {m.text}
                </p>
                {annotation && (
                  <p className="mt-2 text-[14px] italic leading-snug text-coral">
                    <span className="mr-1.5">↳</span>
                    {annotation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ───────── Footer ───────── */

function Footer({
  characterId: _characterId,
  onRestart,
}: {
  characterId: string;
  onRestart: () => void;
}) {
  return (
    <div
      className="mt-8 space-y-2 animate-block-in border-t border-[color:var(--border-subtle)] pt-6"
      style={{ animationDelay: "580ms" }}
    >
      <Link
        href="/character/mark"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--surface-accent-tonal)] px-5 py-3 text-center text-[14px] font-semibold text-[color:var(--text-accent)] transition active:scale-[0.98] hover:bg-[color:var(--surface-accent-tonal)]/80"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <polyline points="3 4 3 9 8 9" />
        </svg>
        Try a different scenario
      </Link>
      <button
        onClick={onRestart}
        className="block w-full rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] px-5 py-3 text-center text-[14px] font-medium text-[color:var(--text-secondary)] transition active:scale-[0.98] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-primary)]"
      >
        Replay this conversation
      </button>
    </div>
  );
}
