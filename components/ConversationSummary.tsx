"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Session, TranscriptEntry, WhatItem } from "@/lib/summary";

const CORAL = "#E07856";
const MUTED = "#6B7280";

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
      <div className="px-6 pb-10 pt-6">
        <HeroPoster
          hero={session.analysis.heroMoment}
          characterName={characterName}
        />

        <div className="mt-10 space-y-7">
          <CurveSection
            transcript={session.transcript}
            summary={session.analysis.curveSummary}
            characterName={characterName}
          />

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
      <p className="text-[10px] uppercase tracking-[0.4em] text-coral">
        {characterName}'s takeaway
      </p>
      <blockquote className="mt-5 font-serif text-[22px] leading-[1.42] text-white">
        <span className="text-coral">“</span>
        {hero.quote}
        <span className="text-coral">”</span>
      </blockquote>
      <div className="mt-6 h-px w-10 bg-coral/40" />
      <p className="mt-5 font-serif text-[14px] italic leading-relaxed text-slate-400">
        {hero.lesson}
      </p>
    </section>
  );
}

/* ───────── Curve ───────── */

type ChartPoint = {
  transcriptIndex: number;
  value: number;
  userLine: string | null;
};

function CurveSection({
  transcript,
  summary,
  characterName,
}: {
  transcript: TranscriptEntry[];
  summary: string;
  characterName: string;
}) {
  const points = useMemo<ChartPoint[]>(() => {
    return transcript
      .map((t, i) => {
        if (t.speaker !== "model" || t.interestLevel === undefined) return null;
        let userLine: string | null = null;
        for (let j = i - 1; j >= 0; j--) {
          if (transcript[j].speaker === "user") {
            userLine = transcript[j].text;
            break;
          }
        }
        return { transcriptIndex: i, value: t.interestLevel, userLine };
      })
      .filter((p): p is ChartPoint => p !== null);
  }, [transcript]);

  const W = 340;
  const H = 70;
  const PAD_X = 6;
  const PAD_Y = 12;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  const coords = points.map((p, i) => ({
    x: points.length > 1 ? PAD_X + (i / (points.length - 1)) * innerW : W / 2,
    y: PAD_Y + (1 - p.value / 100) * innerH,
  }));

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (activeIdx === null) return;
      const el = containerRef.current;
      if (el && !el.contains(e.target as Node)) setActiveIdx(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [activeIdx]);

  return (
    <section
      ref={containerRef}
      className="animate-block-in"
      style={{ animationDelay: "160ms" }}
    >
      <p className="font-serif text-[14px] italic leading-relaxed text-slate-400">
        {summary}
      </p>

      <div className="relative mt-3">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          preserveAspectRatio="none"
          className="block"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL} />
              <stop offset="55%" stopColor="#B98F6F" />
              <stop offset="100%" stopColor={MUTED} />
            </linearGradient>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CORAL} stopOpacity="0.16" />
              <stop offset="100%" stopColor={MUTED} stopOpacity="0" />
            </linearGradient>
          </defs>

          {coords.length > 1 && (
            <path
              d={`${pathD} L ${coords[coords.length - 1].x} ${H - PAD_Y} L ${coords[0].x} ${H - PAD_Y} Z`}
              fill="url(#curveFill)"
            />
          )}

          <path
            d={pathD}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {coords.map((c, i) => {
            const isPeak = points[i].value >= 55;
            const color = isPeak ? CORAL : MUTED;
            return (
              <g key={i}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={activeIdx === i ? 4.5 : 3}
                  fill={color}
                  stroke="#0a0a14"
                  strokeWidth="1.5"
                  style={{ transition: "r 0.15s" }}
                />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={16}
                  fill="transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIdx((p) => (p === i ? null : i));
                  }}
                  style={{ cursor: "pointer" }}
                />
              </g>
            );
          })}
        </svg>

        {activeIdx !== null && points[activeIdx] && (
          <CurveTooltip
            point={points[activeIdx]}
            coord={coords[activeIdx]}
            chartW={W}
            chartH={H}
            characterName={characterName}
          />
        )}

        <div className="mt-1.5 flex justify-between px-1 text-[9px] uppercase tracking-[0.25em] text-slate-600">
          <span>start</span>
          <span>end</span>
        </div>
      </div>
    </section>
  );
}

function CurveTooltip({
  point,
  coord,
  chartW,
  chartH,
  characterName,
}: {
  point: ChartPoint;
  coord: { x: number; y: number };
  chartW: number;
  chartH: number;
  characterName: string;
}) {
  const leftPct = (coord.x / chartW) * 100;
  const above = coord.y > chartH * 0.45;
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 transition"
      style={{
        left: `${Math.max(10, Math.min(90, leftPct))}%`,
        top: above ? "auto" : "calc(50% + 12px)",
        bottom: above ? "calc(50% + 12px)" : "auto",
      }}
    >
      <div className="max-w-[240px] rounded-xl border border-white/10 bg-slate-900/95 px-3 py-2 text-[12px] leading-snug text-slate-100 shadow-xl backdrop-blur">
        {point.userLine ? (
          <>
            <span className="mr-1 text-[10px] uppercase tracking-widest text-slate-500">
              you said
            </span>
            <br />“{point.userLine}”
          </>
        ) : (
          <span className="text-slate-300">
            {characterName} opened the conversation.
          </span>
        )}
      </div>
    </div>
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
      className="group -mx-2 flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/[0.04]"
    >
      <span
        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold leading-none ${badge}`}
      >
        {glyph}
      </span>
      <p className="flex-1 text-[14px] leading-snug text-slate-200">
        {firstSentence(item.comment)}
      </p>
      <span className="mt-0.5 text-[16px] leading-none text-slate-600 transition group-hover:text-slate-300">
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
      className="mt-9 animate-block-in"
      style={{ animationDelay: "440ms" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[13px] font-medium text-slate-400 transition hover:text-slate-200"
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
                    : "before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[2px] before:rounded-full before:bg-white/10"
                }`}
              >
                <p
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    isUser ? "text-accent-400" : "text-slate-500"
                  }`}
                >
                  {isUser ? "You" : characterName}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-slate-100">
                  {m.text}
                </p>
                {annotation && (
                  <p className="mt-2 text-[12.5px] italic leading-snug text-coral/90">
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
      className="mt-10 space-y-2 animate-block-in"
      style={{ animationDelay: "580ms" }}
    >
      <Link
        href="/"
        className="block rounded-full bg-accent-500 px-5 py-3.5 text-center text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.65)] transition active:scale-[0.98] hover:bg-accent-400"
      >
        Continue to next lesson
      </Link>
      <button
        onClick={onRestart}
        className="block w-full rounded-full border border-white/10 px-5 py-3 text-center text-[13px] font-medium text-slate-300 transition active:scale-[0.98] hover:bg-white/5 hover:text-white"
      >
        Try this conversation again
      </button>
    </div>
  );
}
