"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Session, TranscriptEntry, WhatItem } from "@/lib/summary";

const CORAL = "#E07856";
const MUTED = "#6B7280";

type Props = {
  session: Session;
  characterId: string;
  onRestart: () => void;
};

export default function ConversationSummary({
  session,
  characterId,
  onRestart,
}: Props) {
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const scrollRootRef = useRef<HTMLDivElement>(null);

  function seeMoment(idx: number) {
    setTranscriptOpen(true);
    setHighlightIndex(idx);
    setTimeout(() => {
      const el = document.getElementById(`msg-${idx}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
    // Clear highlight after a few seconds (visual ping)
    setTimeout(() => setHighlightIndex(null), 3500);
  }

  return (
    <div
      ref={scrollRootRef}
      className="min-h-0 flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="space-y-8 px-5 pb-8 pt-2">
        <HeroMoment hero={session.analysis.heroMoment} />
        <InterestCurve
          transcript={session.transcript}
          summary={session.analysis.curveSummary}
        />
        <NoticeLists
          whatWorked={session.analysis.whatWorked}
          worthNoticing={session.analysis.worthNoticing}
          onSeeMoment={seeMoment}
        />
        <FullBreakdown
          transcript={session.transcript}
          annotations={session.analysis.transcriptAnnotations}
          open={transcriptOpen}
          setOpen={setTranscriptOpen}
          highlightIndex={highlightIndex}
        />
        <Footer characterId={characterId} onRestart={onRestart} />
      </div>
    </div>
  );
}

/* ───────── Block 1: Hero Moment ───────── */

function HeroMoment({ hero }: { hero: Session["analysis"]["heroMoment"] }) {
  return (
    <section>
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
        ⭐ Your moment today
      </p>
      <div className="overflow-hidden rounded-3xl border border-coral/20 bg-gradient-to-br from-coral/10 via-white/[0.03] to-white/[0.02] p-6 shadow-[0_10px_40px_-15px_rgba(224,120,86,0.35)]">
        <p className="font-serif text-[20px] leading-[1.45] text-white">
          <span className="text-coral">“</span>
          {hero.quote}
          <span className="text-coral">”</span>
        </p>
        <div className="my-4 h-px w-12 bg-coral/40" />
        <p className="text-[14px] leading-relaxed text-slate-300">
          {hero.lesson}
        </p>
      </div>
    </section>
  );
}

/* ───────── Block 2: Interest Curve ───────── */

type ChartPoint = {
  transcriptIndex: number;
  value: number;
  userLine: string | null;
};

function InterestCurve({
  transcript,
  summary,
}: {
  transcript: TranscriptEntry[];
  summary: string;
}) {
  // Plot Linda's interest level over the conversation. Tooltip shows the user
  // line that triggered each new value.
  const points = useMemo<ChartPoint[]>(() => {
    return transcript
      .map((t, i) => {
        if (t.speaker !== "linda" || t.interestLevel === undefined) return null;
        // The user line that triggered this interest level is the previous user msg
        let userLine: string | null = null;
        for (let j = i - 1; j >= 0; j--) {
          if (transcript[j].speaker === "user") {
            userLine = transcript[j].text;
            break;
          }
        }
        return {
          transcriptIndex: i,
          value: t.interestLevel,
          userLine,
        };
      })
      .filter((p): p is ChartPoint => p !== null);
  }, [transcript]);

  const W = 340;
  const H = 100;
  const PAD_X = 12;
  const PAD_Y = 14;
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_Y * 2;

  const coords = points.map((p, i) => {
    const x = points.length > 1 ? PAD_X + (i / (points.length - 1)) * innerW : W / 2;
    // Higher interest = higher on screen (smaller y)
    const y = PAD_Y + (1 - p.value / 100) * innerH;
    return { x, y };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close tooltip on outside tap
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
    <section ref={containerRef}>
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
        Interest curve
      </p>
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height={120}
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
                <stop offset="0%" stopColor={CORAL} stopOpacity="0.18" />
                <stop offset="100%" stopColor={MUTED} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Subtle baseline */}
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={H - PAD_Y}
              y2={H - PAD_Y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="2 4"
            />

            {/* Filled area under the line */}
            {coords.length > 1 && (
              <path
                d={`${pathD} L ${coords[coords.length - 1].x} ${H - PAD_Y} L ${coords[0].x} ${H - PAD_Y} Z`}
                fill="url(#curveFill)"
              />
            )}

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#curveGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {coords.map((c, i) => {
              const isPeak = points[i].value >= 55;
              const color = isPeak ? CORAL : MUTED;
              return (
                <g key={i}>
                  {/* Visible dot */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={activeIdx === i ? 6 : 4.5}
                    fill={color}
                    stroke="#0b0a14"
                    strokeWidth="2"
                    style={{ transition: "r 0.15s" }}
                  />
                  {/* Bigger invisible hit area */}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={18}
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

          {/* Tooltip */}
          {activeIdx !== null && points[activeIdx] && (
            <Tooltip
              point={points[activeIdx]}
              coord={coords[activeIdx]}
              chartW={W}
              chartH={H}
            />
          )}
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex justify-between px-2 text-[10px] uppercase tracking-widest text-slate-500">
          <span>start</span>
          <span>end</span>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-slate-300">
          {summary}
        </p>
      </div>
    </section>
  );
}

function Tooltip({
  point,
  coord,
  chartW,
  chartH,
}: {
  point: ChartPoint;
  coord: { x: number; y: number };
  chartW: number;
  chartH: number;
}) {
  // Position the tooltip near the point as a % of chart so it scales.
  const leftPct = (coord.x / chartW) * 100;
  // Show above the point if there's room
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
          <span className="text-slate-300">Linda opened the conversation.</span>
        )}
      </div>
    </div>
  );
}

/* ───────── Block 3: What worked / Worth noticing ───────── */

function NoticeLists({
  whatWorked,
  worthNoticing,
  onSeeMoment,
}: {
  whatWorked: WhatItem[];
  worthNoticing: WhatItem[];
  onSeeMoment: (idx: number) => void;
}) {
  return (
    <section className="space-y-6">
      <ListGroup
        title="What you did well"
        items={whatWorked}
        tone="coral"
        onSeeMoment={onSeeMoment}
      />
      <ListGroup
        title="Worth noticing"
        items={worthNoticing}
        tone="muted"
        onSeeMoment={onSeeMoment}
      />
    </section>
  );
}

function ListGroup({
  title,
  items,
  tone,
  onSeeMoment,
}: {
  title: string;
  items: WhatItem[];
  tone: "coral" | "muted";
  onSeeMoment: (idx: number) => void;
}) {
  const isCoral = tone === "coral";
  const badgeBg = isCoral ? "bg-coral" : "bg-muted";
  const linkColor = isCoral
    ? "text-coral hover:text-[#EA8E70]"
    : "text-slate-300 hover:text-slate-100";
  const glyph = isCoral ? "✓" : "!";
  return (
    <div>
      <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${badgeBg} text-[13px] font-semibold leading-none text-white`}
              >
                {glyph}
              </span>
              <div className="flex-1 space-y-2">
                <p className="text-[13px] leading-snug text-slate-200">
                  <span className="text-slate-400">“</span>
                  {item.line}
                  <span className="text-slate-400">”</span>
                </p>
                <p className="text-[13px] leading-relaxed text-slate-400">
                  {item.comment}
                </p>
                <button
                  onClick={() => onSeeMoment(item.transcriptIndex)}
                  className={`text-[12px] font-medium ${linkColor} transition`}
                >
                  → see the moment
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Block 4: Full breakdown ───────── */

function FullBreakdown({
  transcript,
  annotations,
  open,
  setOpen,
  highlightIndex,
}: {
  transcript: TranscriptEntry[];
  annotations: { [index: number]: string };
  open: boolean;
  setOpen: (v: boolean) => void;
  highlightIndex: number | null;
}) {
  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3.5 text-left transition hover:bg-white/[0.05]"
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Full breakdown
          </p>
          <p className="mt-1 text-[14px] text-slate-200">
            Read the conversation with coach notes
          </p>
        </div>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-slate-200 transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <svg className="h-3 w-3" viewBox="0 0 12 8" fill="none">
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {transcript.map((m, i) => {
            const isUser = m.speaker === "user";
            const annotation = isUser ? annotations[i] : undefined;
            const isHighlighted = highlightIndex === i;
            return (
              <div
                key={i}
                id={`msg-${i}`}
                className={`rounded-2xl border p-3 transition ${
                  isHighlighted
                    ? "border-coral/60 bg-coral/10 shadow-[0_0_0_4px_rgba(224,120,86,0.12)]"
                    : "border-white/8 bg-white/[0.02]"
                }`}
              >
                <p
                  className={`text-[11px] uppercase tracking-widest ${
                    isUser ? "text-accent-400" : "text-slate-400"
                  }`}
                >
                  {isUser ? "you" : "Linda"}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-100">
                  {m.text}
                </p>
                {annotation && (
                  <div className="mt-2.5 flex gap-2 rounded-lg bg-white/[0.04] px-3 py-2">
                    <span className="text-coral">↳</span>
                    <p className="text-[12px] leading-snug text-slate-300">
                      {annotation}
                    </p>
                  </div>
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
  characterId,
  onRestart,
}: {
  characterId: string;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-2 pt-2">
      <Link
        href="/"
        className="block rounded-full bg-accent-500 px-5 py-3.5 text-center text-[14px] font-semibold text-white shadow-[0_10px_30px_-12px_rgba(139,92,246,0.65)] transition active:scale-[0.98] hover:bg-accent-400"
      >
        Continue to next lesson
      </Link>
      <button
        onClick={onRestart}
        className="block w-full rounded-full border border-white/15 px-5 py-3 text-center text-[14px] font-medium text-slate-200 transition active:scale-[0.98] hover:bg-white/5"
      >
        Try this conversation again
      </button>
    </div>
  );
}
