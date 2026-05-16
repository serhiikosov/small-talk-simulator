"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/characters";

type Phase = "intro" | "choice" | "branch-positive" | "branch-negative" | "end";
type Scene = "intro" | "positive" | "negative";

function videoSrc(characterId: string, scene: Scene) {
  return `/videos/${characterId}/${scene}.mp4`;
}

export default function InteractiveScene({ character }: { character: Character }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [videoFailed, setVideoFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [lastBranch, setLastBranch] = useState<"positive" | "negative" | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentScene: Scene =
    phase === "branch-positive"
      ? "positive"
      : phase === "branch-negative"
      ? "negative"
      : "intro";

  const currentText =
    phase === "branch-positive"
      ? character.positiveReply
      : phase === "branch-negative"
      ? character.negativeReply
      : character.firstLine;

  // Auto-play on scene change. Try with sound first, fall back to muted.
  useEffect(() => {
    if (videoFailed) return;
    if (phase === "choice" || phase === "end") return;
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    setMuted(false);
    setNeedsTap(false);
    const p = v.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        v.muted = true;
        setMuted(true);
        setNeedsTap(true);
        v.play().catch(() => {});
      });
    }
  }, [currentScene, phase, videoFailed]);

  // Fallback timers when no video files
  useEffect(() => {
    if (!videoFailed) return;
    if (phase === "intro") {
      const t = setTimeout(() => setPhase("choice"), 4500);
      return () => clearTimeout(t);
    }
    if (phase === "branch-positive" || phase === "branch-negative") {
      const t = setTimeout(() => setPhase("end"), 5500);
      return () => clearTimeout(t);
    }
  }, [phase, videoFailed]);

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    setNeedsTap(false);
  }

  function restart() {
    setLastBranch(null);
    setPhase("intro");
  }

  function tryOtherBranch() {
    if (!lastBranch) return;
    setPhase(lastBranch === "positive" ? "branch-negative" : "branch-positive");
  }

  function pickPositive() {
    setLastBranch("positive");
    setPhase("branch-positive");
  }

  function pickNegative() {
    setLastBranch("negative");
    setPhase("branch-negative");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
      <div className="relative flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
        {!videoFailed && (
          <video
            ref={videoRef}
            key={currentScene}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc(character.id, currentScene)}
            playsInline
            preload="auto"
            onError={() => setVideoFailed(true)}
            onEnded={() => {
              if (phase === "intro") setPhase("choice");
              else if (phase === "branch-positive" || phase === "branch-negative")
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
                {currentText}
              </p>
            </div>
            <p className="absolute inset-x-0 bottom-4 text-center text-[10px] uppercase tracking-widest text-white/40">
              placeholder · додай {currentScene}.mp4
            </p>
          </div>
        )}

        {/* Top-right mute toggle (only while a video is playing) */}
        {!videoFailed && (phase === "intro" || phase === "branch-positive" || phase === "branch-negative") && (
          <button
            type="button"
            onClick={toggleMute}
            className={`absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80 active:scale-95 ${
              needsTap ? "ring-2 ring-white/70 animate-pulse" : ""
            }`}
            aria-label={muted ? "Увімкнути звук" : "Вимкнути звук"}
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

        {/* "Tap to unmute" centered overlay if autoplay-with-sound was blocked */}
        {needsTap && muted && (phase === "intro" || phase === "branch-positive" || phase === "branch-negative") && (
          <button
            type="button"
            onClick={toggleMute}
            className="absolute inset-0 z-15 flex items-center justify-center bg-black/30 animate-fade-in"
          >
            <span className="flex items-center gap-2 rounded-full bg-black/85 px-5 py-3 text-[13px] font-medium text-white shadow-xl backdrop-blur">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" />
              </svg>
              Тапни щоб увімкнути звук
            </span>
          </button>
        )}

        {/* Choice buttons over video bottom */}
        {phase === "choice" && (
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/75 to-transparent p-4 pt-20 animate-slide-up">
            <p className="mb-1 px-1 text-[11px] uppercase tracking-widest text-white/70">
              Як відповіси?
            </p>
            <ChoiceButton
              tone="positive"
              onClick={pickPositive}
              label={character.optionPositive}
            />
            <ChoiceButton
              tone="negative"
              onClick={pickNegative}
              label={character.optionNegative}
            />
          </div>
        )}

        {/* End-of-branch overlay */}
        {phase === "end" && (
          <div className="absolute inset-0 z-30 flex items-end bg-gradient-to-t from-black/95 via-black/70 to-black/40 p-4 backdrop-blur-[2px] animate-fade-in">
            <div className="w-full rounded-2xl border border-white/10 bg-slate-900/95 p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                Сценарій завершено
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-200">
                {lastBranch === "positive"
                  ? "Тепла гілка пройдена. Цікаво, як піде інша?"
                  : lastBranch === "negative"
                  ? "Ризикована гілка пройдена. А якщо обрати інакше?"
                  : "Готовий спробувати ще раз?"}
              </p>
              <div className="mt-4 flex gap-2">
                {lastBranch && (
                  <button
                    onClick={tryOtherBranch}
                    className="flex-1 rounded-full bg-accent-500 px-3 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-400 active:scale-[0.98]"
                  >
                    Інша гілка
                  </button>
                )}
                <button
                  onClick={restart}
                  className="flex-1 rounded-full border border-white/15 px-3 py-2.5 text-[13px] font-medium text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  З початку
                </button>
              </div>
              <Link
                href="/"
                className="mt-2 block rounded-full px-3 py-2 text-[12px] font-medium text-slate-400 transition hover:text-slate-200"
              >
                ← До персонажів
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  onClick,
}: {
  tone: "positive" | "negative";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-[16px] font-medium leading-snug text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.98]"
    >
      {label}
    </button>
  );
}
