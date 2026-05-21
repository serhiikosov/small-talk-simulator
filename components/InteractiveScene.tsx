"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/characters";
import { useUIPrefs } from "./UIPrefs";

type Phase =
  | "intro"
  | "choice-1"
  | "branch-positive"
  | "branch-negative"
  | "positive-followup"
  | "choice-2"
  | "branch-l2-positive"
  | "branch-l2-negative"
  | "negative-followup"
  | "end";

type LastChoice = { level: 1 | 2; branch: "positive" | "negative" };

function videoSrc(characterId: string, scene: string) {
  return `/videos/${characterId}/${scene}.mp4`;
}

function isVideoPhase(p: Phase): boolean {
  return (
    p === "intro" ||
    p === "branch-positive" ||
    p === "branch-negative" ||
    p === "positive-followup" ||
    p === "branch-l2-positive" ||
    p === "branch-l2-negative" ||
    p === "negative-followup"
  );
}

function isChoicePhase(p: Phase): boolean {
  return p === "choice-1" || p === "choice-2";
}

function phaseToScene(phase: Phase, c: Character): string | null {
  switch (phase) {
    case "intro":
      return "intro";
    case "branch-positive":
      return "positive";
    case "branch-negative":
      return "negative";
    case "positive-followup":
      return c.level2?.connectorVideo ?? null;
    case "branch-l2-positive":
      return c.level2?.videos.positive ?? null;
    case "branch-l2-negative":
      return c.level2?.videos.negative ?? null;
    case "negative-followup":
      return c.negativeFollowup?.video ?? null;
    default:
      return null;
  }
}

function phaseToFallbackText(phase: Phase, c: Character): string {
  switch (phase) {
    case "intro":
      return c.firstLine;
    case "branch-positive":
      return c.positiveReply;
    case "branch-negative":
      return c.negativeReply;
    case "positive-followup":
      return "Do you have anything like that — something you do with your hands?";
    case "branch-l2-positive":
      return c.level2?.replies.positive ?? "";
    case "branch-l2-negative":
      return c.level2?.replies.negative ?? "";
    case "negative-followup":
      return c.negativeFollowup?.reply ?? "";
    default:
      return "";
  }
}

export default function InteractiveScene({ character }: { character: Character }) {
  const [phase, setPhase] = useState<Phase>("intro");
  // Tracks the last video phase whose frame should remain visible behind
  // choice/end overlays. Only updated when entering a video phase, so during
  // `choice-*` / `end` the previous video stays mounted on its final frame.
  const [displayPhase, setDisplayPhase] = useState<Phase>("intro");
  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [audioEverActivated, setAudioEverActivated] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [lastChoice, setLastChoice] = useState<LastChoice | null>(null);
  const [pendingChoice, setPendingChoice] = useState<"positive" | "negative" | null>(null);
  const { chatEnabled } = useUIPrefs();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isVideoPhase(phase)) setDisplayPhase(phase);
  }, [phase]);

  const displayScene = phaseToScene(displayPhase, character);
  const displayText = phaseToFallbackText(displayPhase, character);
  const subtitleText =
    displayScene && character.subtitles
      ? character.subtitles[displayScene] ?? displayText
      : displayText;

  // Auto-play when entering a new video phase. Try with sound first, fall back to muted.
  useEffect(() => {
    if (videoFailed) return;
    if (!isVideoPhase(phase)) return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    setNeedsTap(false);
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        if (!v.muted) setAudioEverActivated(true);
      }).catch(() => {
        v.muted = true;
        setMuted(true);
        if (!audioEverActivated) setNeedsTap(true);
        v.play().catch(() => {});
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayScene, phase, videoFailed]);

  // Fallback timers when no video files (text overlay).
  useEffect(() => {
    if (!videoFailed) return;
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("choice-1"), 4500);
      return () => clearTimeout(t);
    }
    if (phase === "branch-positive") {
      const t = setTimeout(() => advanceFromBranchPositive(), 5500);
      return () => clearTimeout(t);
    }
    if (phase === "branch-negative") {
      const t = setTimeout(() => advanceFromBranchNegative(), 5500);
      return () => clearTimeout(t);
    }
    if (phase === "positive-followup") {
      const t = setTimeout(() => setPhase("choice-2"), 5500);
      return () => clearTimeout(t);
    }
    if (
      phase === "branch-l2-positive" ||
      phase === "branch-l2-negative" ||
      phase === "negative-followup"
    ) {
      const t = setTimeout(() => setPhase("end"), 5500);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, videoFailed]);

  function advanceFromBranchPositive() {
    setPhase(character.level2 ? "positive-followup" : "end");
  }

  function advanceFromBranchNegative() {
    setPhase(character.negativeFollowup ? "negative-followup" : "end");
  }

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    setNeedsTap(false);
    if (!v.muted) setAudioEverActivated(true);
  }

  function clearPending() {
    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = null;
    }
    setPendingChoice(null);
  }

  function restart() {
    clearPending();
    setLastChoice(null);
    setPhase("intro");
  }

  function tryOther() {
    if (!lastChoice) return;
    clearPending();
    if (lastChoice.level === 1) {
      const other = lastChoice.branch === "positive" ? "negative" : "positive";
      setLastChoice({ level: 1, branch: other });
      setPhase(other === "positive" ? "branch-positive" : "branch-negative");
    } else {
      setLastChoice(null);
      setPhase("choice-2");
    }
  }

  function replayChoice() {
    if (!lastChoice) return;
    clearPending();
    const level = lastChoice.level;
    setLastChoice(null);
    setPhase(level === 1 ? "choice-1" : "choice-2");
  }

  function pick(level: 1 | 2, branch: "positive" | "negative") {
    if (pendingChoice) return;
    setPendingChoice(branch);
    setLastChoice({ level, branch });
    pendingTimerRef.current = setTimeout(() => {
      setPendingChoice(null);
      if (level === 1) {
        setPhase(branch === "positive" ? "branch-positive" : "branch-negative");
      } else {
        setPhase(branch === "positive" ? "branch-l2-positive" : "branch-l2-negative");
      }
    }, 2000);
  }

  const showMuteUI = !videoFailed && isVideoPhase(phase);
  const choiceContext: 1 | 2 | null =
    phase === "choice-1" ? 1 : phase === "choice-2" ? 2 : null;
  const optionPositive =
    choiceContext === 1
      ? character.optionPositive
      : character.level2?.options.positive ?? "";
  const optionNegative =
    choiceContext === 1
      ? character.optionNegative
      : character.level2?.options.negative ?? "";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="relative flex-1 overflow-hidden bg-black">
        {!videoFailed && displayScene && (
          <video
            ref={videoRef}
            key={displayScene}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc(character.id, displayScene)}
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            onEnded={() => {
              if (phase === "intro") setPhase("choice-1");
              else if (phase === "branch-positive") advanceFromBranchPositive();
              else if (phase === "branch-negative") advanceFromBranchNegative();
              else if (phase === "positive-followup") setPhase("choice-2");
              else if (
                phase === "branch-l2-positive" ||
                phase === "branch-l2-negative" ||
                phase === "negative-followup"
              )
                setPhase("end");
            }}
          />
        )}

        {videoFailed && (
          <div
            className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${character.gradient} p-6 text-center`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative flex flex-col items-center">
              <span className="mb-5 text-7xl drop-shadow-2xl">{character.avatar}</span>
              <p className="max-w-[280px] text-[15px] font-medium leading-relaxed text-white animate-fade-in">
                {displayText}
              </p>
            </div>
            <p className="absolute inset-x-0 bottom-4 text-center text-[12px] uppercase tracking-widest text-white/40">
              placeholder · add {displayScene}.mp4
            </p>
          </div>
        )}

        {/* Top-right controls (captions + mute) */}
        {showMuteUI && (
          <button
            type="button"
            onClick={() => setCaptionsOn((v) => !v)}
            className={`absolute top-3 right-14 z-20 inline-flex h-9 items-center gap-1 rounded-full bg-black/60 px-2.5 text-[14px] font-bold text-white backdrop-blur transition hover:bg-black/80 active:scale-95 ${
              captionsOn ? "" : "opacity-50"
            }`}
            aria-label={captionsOn ? "Hide captions" : "Show captions"}
            title={captionsOn ? "Hide captions" : "Show captions"}
          >
            CC
          </button>
        )}
        {showMuteUI && (
          <button
            type="button"
            onClick={toggleMute}
            className={`absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 active:scale-95 ${
              needsTap ? "ring-2 ring-white/70 animate-pulse" : ""
            }`}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45.05-.63ZM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71Zm-7.27-9L9.91 4.82 12 6.91v-4Zm-7.21.27L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21l1.27-1.27L4.52 3.27Z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4ZM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77Z" />
              </svg>
            )}
          </button>
        )}

        {/* "Tap to unmute" overlay — only on first video before audio is ever activated */}
        {needsTap && muted && !audioEverActivated && showMuteUI && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute inset-0 z-15 flex items-center justify-center bg-black/30 animate-fade-in"
          >
            <span className="flex items-center gap-2 rounded-full bg-black/85 px-5 py-3 text-[14px] font-medium text-white shadow-xl backdrop-blur">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" />
              </svg>
              Tap to enable sound
            </span>
          </button>
        )}

        {/* Subtitles */}
        {captionsOn && !videoFailed && isVideoPhase(phase) && subtitleText && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4 animate-fade-in">
            <p className="max-w-[88%] rounded-lg bg-black/70 px-3 py-1.5 text-center text-[14px] leading-snug text-white backdrop-blur-sm">
              {subtitleText}
            </p>
          </div>
        )}

        {/* Choice buttons (level 1 or 2) */}
        {isChoicePhase(phase) && choiceContext && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 pt-20 animate-slide-up">
            <p className="mb-1 px-1 text-[12px] uppercase tracking-widest text-white/70">
              {pendingChoice
                ? "Selected…"
                : choiceContext === 2
                ? "And then?"
                : "How will you respond?"}
            </p>
            {(pendingChoice === null || pendingChoice === "positive") && (
              <ChoiceButton
                tone="positive"
                onClick={() => pick(choiceContext, "positive")}
                label={optionPositive}
                selected={pendingChoice === "positive"}
                disabled={pendingChoice !== null}
              />
            )}
            {(pendingChoice === null || pendingChoice === "negative") && (
              <ChoiceButton
                tone="negative"
                onClick={() => pick(choiceContext, "negative")}
                label={optionNegative}
                selected={pendingChoice === "negative"}
                disabled={pendingChoice !== null}
              />
            )}
          </div>
        )}

        {/* End-of-branch overlay */}
        {phase === "end" && (
          <div className="absolute inset-0 z-30 flex flex-col justify-end overflow-y-auto bg-gradient-to-t from-black/95 via-black/80 to-black/30 p-6 pb-5 backdrop-blur-[3px] animate-fade-in">
            <div className="w-full animate-slide-up">
              <p className="text-[12px] uppercase tracking-[0.32em] text-coral">
                Scene complete
              </p>
              <p className="mt-3 text-[18px] leading-[1.4] text-white">
                {endMessage(lastChoice)}
              </p>

              <div className="mt-5 space-y-2">
                {lastChoice?.branch === "negative" ? (
                  <>
                    <button
                      type="button"
                      onClick={replayChoice}
                      className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--surface-accent-solid)] px-5 text-white shadow-[0_12px_40px_-12px_rgba(108,92,231,0.6)] transition active:scale-[0.98] hover:opacity-95"
                    >
                      <span className="text-[16px] font-semibold leading-none">
                        Try again
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path
                          d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <Link
                      href={`/simulation/${character.id}/summary`}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-white transition active:scale-[0.98] hover:bg-white/20"
                    >
                      <span className="text-[16px] font-semibold leading-none">
                        See the summary
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M12 2 14.6 8.6 22 9.2l-5.6 4.8 1.7 7.3L12 17.8l-6.1 3.5 1.7-7.3L2 9.2l7.4-.6L12 2Z" />
                      </svg>
                    </Link>
                  </>
                ) : chatEnabled ? (
                  <>
                    <Link
                      href={buildContinueChatHref(character.id, lastChoice)}
                      className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-[color:var(--surface-accent-solid)] px-5 text-white shadow-[0_12px_40px_-12px_rgba(108,92,231,0.6)] transition active:scale-[0.98] hover:opacity-95"
                    >
                      <span className="text-[16px] font-semibold leading-none">
                        Continue in chat
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white transition group-hover:translate-x-0.5">
                        <path
                          d="M5 12h14M13 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                    <Link
                      href={`/simulation/${character.id}/summary`}
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 text-white transition active:scale-[0.98] hover:bg-white/20"
                    >
                      <span className="text-[16px] font-semibold leading-none">
                        See the summary
                      </span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                        <path d="M12 2 14.6 8.6 22 9.2l-5.6 4.8 1.7 7.3L12 17.8l-6.1 3.5 1.7-7.3L2 9.2l7.4-.6L12 2Z" />
                      </svg>
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/simulation/${character.id}/summary`}
                    className="group flex h-14 items-center justify-center gap-2 rounded-2xl bg-[color:var(--surface-accent-solid)] px-5 text-white shadow-[0_12px_40px_-12px_rgba(108,92,231,0.6)] transition active:scale-[0.98] hover:opacity-95"
                  >
                    <span className="text-[16px] font-semibold leading-none">
                      See the summary
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 2 14.6 8.6 22 9.2l-5.6 4.8 1.7 7.3L12 17.8l-6.1 3.5 1.7-7.3L2 9.2l7.4-.6L12 2Z" />
                    </svg>
                  </Link>
                )}
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[14px]">
                {lastChoice && (
                  <>
                    <button
                      onClick={tryOther}
                      className="rounded-full px-3 py-1.5 text-white/65 transition hover:bg-white/10 hover:text-white"
                    >
                      {lastChoice.level === 2 ? "↺ Other reply" : "↺ Other path"}
                    </button>
                    <span className="text-white/35">·</span>
                  </>
                )}
                <button
                  onClick={restart}
                  className="rounded-full px-3 py-1.5 text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  Restart from intro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function buildContinueChatHref(
  characterId: string,
  last: LastChoice | null,
): string {
  const params = new URLSearchParams({ from: "interactive" });
  if (last) {
    if (last.level === 1) {
      params.set("b1", last.branch);
    } else {
      params.set("b1", "positive"); // level-2 only branches off the positive path
      params.set("b2", last.branch);
    }
  }
  return `/simulation/${characterId}/text-voice?${params.toString()}`;
}

function endMessage(last: LastChoice | null): string {
  if (!last) return "Ready to try again?";
  if (last.level === 1) {
    return last.branch === "positive"
      ? "Warm path done. Curious how the other one plays out?"
      : "Risky path done. What if you'd opened differently?";
  }
  return last.branch === "positive"
    ? "That landed well. Curious how the other reply would have gone?"
    : "That cooled things off. A softer reply might have kept it going.";
}

function ChoiceButton({
  label,
  onClick,
  selected = false,
  disabled = false,
}: {
  tone: "positive" | "negative";
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-2xl border px-4 py-3 pr-11 text-left text-[15px] font-medium leading-snug text-white backdrop-blur transition active:scale-[0.98] disabled:cursor-default disabled:active:scale-100 ${
        selected
          ? "border-[color:var(--border-focus)] bg-[color:var(--surface-accent-solid)]/45 shadow-lg shadow-[color:var(--surface-accent-solid)]/30"
          : "border-white/20 bg-white/10 hover:bg-white/20"
      }`}
    >
      {label}
      {selected && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center">
          <svg className="h-5 w-5 animate-spin text-white/90" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </button>
  );
}
