"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/characters";

type Phase = "intro" | "choice" | "branch-positive" | "branch-negative" | "end";

function videoSrc(characterId: string, scene: "intro" | "positive" | "negative") {
  return `/videos/${characterId}/${scene}.mp4`;
}

export default function InteractiveScene({ character }: { character: Character }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (phase !== "intro" || !videoFailed) return;
    const t = setTimeout(() => setPhase("choice"), 4500);
    return () => clearTimeout(t);
  }, [phase, videoFailed]);

  useEffect(() => {
    if (phase !== "branch-positive" && phase !== "branch-negative") return;
    if (!videoFailed) return;
    const t = setTimeout(() => setPhase("end"), 5500);
    return () => clearTimeout(t);
  }, [phase, videoFailed]);

  const currentScene: "intro" | "positive" | "negative" =
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

  return (
    <div className="flex h-full flex-col px-5 pb-6">
      <div className="relative mt-2 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
        {!videoFailed && (
          <video
            ref={videoRef}
            key={currentScene}
            className="h-full w-full object-cover"
            src={videoSrc(character.id, currentScene)}
            autoPlay
            playsInline
            controls={false}
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
            className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${character.gradient} p-6 text-center`}
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

        {phase === "choice" && (
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 pt-12 animate-slide-up">
            <ChoiceButton
              tone="positive"
              onClick={() => setPhase("branch-positive")}
              label={character.optionPositive}
            />
            <ChoiceButton
              tone="negative"
              onClick={() => setPhase("branch-negative")}
              label={character.optionNegative}
            />
          </div>
        )}
      </div>

      {phase === "end" && (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-center animate-fade-in">
          <p className="text-sm text-slate-300">
            Сценарій завершено. Спробуй інший варіант або іншого персонажа.
          </p>
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => setPhase("intro")}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Спробувати ще раз
            </button>
            <Link
              href="/"
              className="rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-400 active:scale-[0.98]"
            >
              До персонажів
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ChoiceButton({
  tone,
  label,
  onClick,
}: {
  tone: "positive" | "negative";
  label: string;
  onClick: () => void;
}) {
  const styles =
    tone === "positive"
      ? "bg-emerald-500/95 hover:bg-emerald-400 shadow-emerald-500/30"
      : "bg-rose-500/95 hover:bg-rose-400 shadow-rose-500/30";
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-3 text-left text-[13px] font-medium text-white shadow-lg backdrop-blur transition active:scale-[0.98] ${styles}`}
    >
      {label}
    </button>
  );
}
