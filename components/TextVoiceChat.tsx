"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Character } from "@/lib/characters";
import { buildLiveSession } from "@/lib/summary";
import InterestBar from "./InterestBar";
import VoiceRecorder from "./VoiceRecorder";
import ConversationSummary from "./ConversationSummary";

type Message = {
  role: "user" | "model";
  text: string;
  interestLevel?: number;
};
type Branch = "positive" | "negative";

const MAX_USER_TURNS = 3;

function lindaLine(character: Character, scene: string, fallback: string): string {
  return character.subtitles?.[scene] ?? fallback;
}

function buildInitialMessages(
  character: Character,
  fromInteractive: boolean,
  b1: Branch | null,
  b2: Branch | null,
): Message[] {
  const msgs: Message[] = [
    {
      role: "model",
      text: lindaLine(character, "intro", character.firstLine),
      interestLevel: 50,
    },
  ];
  if (!fromInteractive || !b1) return msgs;

  if (b1 === "positive") {
    msgs.push({ role: "user", text: character.optionPositive });
    msgs.push({
      role: "model",
      text: lindaLine(character, "positive", character.positiveReply),
      interestLevel: 65,
    });
    if (b2 && character.level2) {
      msgs.push({
        role: "model",
        text: lindaLine(
          character,
          character.level2.connectorVideo,
          "Do you have anything like that?",
        ),
        interestLevel: 65,
      });
      msgs.push({ role: "user", text: character.level2.options[b2] });
      msgs.push({
        role: "model",
        text: lindaLine(
          character,
          character.level2.videos[b2],
          character.level2.replies[b2],
        ),
        interestLevel: b2 === "positive" ? 78 : 38,
      });
    }
  } else {
    msgs.push({ role: "user", text: character.optionNegative });
    msgs.push({
      role: "model",
      text: lindaLine(character, "negative", character.negativeReply),
      interestLevel: 28,
    });
    if (character.negativeFollowup) {
      msgs.push({
        role: "model",
        text: lindaLine(
          character,
          character.negativeFollowup.video,
          character.negativeFollowup.reply,
        ),
        interestLevel: 25,
      });
    }
  }
  return msgs;
}

function deriveInitialInterest(
  fromInteractive: boolean,
  b1: Branch | null,
  b2: Branch | null,
): number {
  if (!fromInteractive || !b1) return 50;
  if (b1 === "negative") return 25;
  if (!b2) return 65;
  return b2 === "positive" ? 78 : 38;
}

function deriveInitialHints(
  character: Character,
  fromInteractive: boolean,
  b1: Branch | null,
  b2: Branch | null,
): [string, string] | null {
  if (!fromInteractive || !b1) return character.initialHints;
  if (!character.continueHints) return null;
  const key = b2 ? `${b1}-${b2}` : b1;
  return character.continueHints[key] ?? null;
}

export default function TextVoiceChat({ character }: { character: Character }) {
  const searchParams = useSearchParams();
  const fromInteractive = searchParams?.get("from") === "interactive";
  const b1 = (searchParams?.get("b1") as Branch | null) ?? null;
  const b2 = (searchParams?.get("b2") as Branch | null) ?? null;

  const initialMessages = useMemo(
    () => buildInitialMessages(character, fromInteractive, b1, b2),
    [character, fromInteractive, b1, b2],
  );
  const initialInterest = useMemo(
    () => deriveInitialInterest(fromInteractive, b1, b2),
    [fromInteractive, b1, b2],
  );
  const initialHints = useMemo(
    () => deriveInitialHints(character, fromInteractive, b1, b2),
    [character, fromInteractive, b1, b2],
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [interest, setInterest] = useState(initialInterest);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<[string, string] | null>(initialHints);
  const [endTransition, setEndTransition] = useState<"chat" | "fading" | "reflecting" | "summary">("chat");
  const [endReason, setEndReason] = useState<"natural" | "manual">("natural");
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [loadingAudioIdx, setLoadingAudioIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  // Skip auto-play for history messages that came from the interactive scene.
  const lastAutoPlayed = useRef<number>(
    initialMessages.length > 1 ? initialMessages.length - 1 : -1,
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const playMessage = useCallback(
    async (idx: number, text: string) => {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingIdx(null);
      setLoadingAudioIdx(idx);
      try {
        let url = audioCacheRef.current.get(idx);
        if (!url) {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: character.voice }),
          });
          if (!res.ok) throw new Error("tts failed");
          const blob = await res.blob();
          url = URL.createObjectURL(blob);
          audioCacheRef.current.set(idx, url);
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        setLoadingAudioIdx(null);
        setPlayingIdx(idx);
        audio.onended = () => setPlayingIdx((p) => (p === idx ? null : p));
        audio.onpause = () => setPlayingIdx((p) => (p === idx ? null : p));
        await audio.play();
      } catch {
        setLoadingAudioIdx(null);
        setPlayingIdx(null);
      }
    },
    [character.voice],
  );

  // Auto-play latest model message
  useEffect(() => {
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (last?.role === "model" && lastAutoPlayed.current < lastIdx) {
      lastAutoPlayed.current = lastIdx;
      playMessage(lastIdx, last.text);
    }
  }, [messages, playMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Smooth transition from chat to summary when the conversation ends.
  // Schedule all stages once when `ended` flips to true. Do NOT include
  // `endTransition` in deps — its updates would re-run this effect and the
  // cleanup would cancel the later setTimeouts before they fired.
  useEffect(() => {
    if (!ended) return;
    const start = endReason === "manual" ? 400 : 1600;
    const t1 = setTimeout(() => setEndTransition("fading"), start);
    const t2 = setTimeout(() => setEndTransition("reflecting"), start + 800);
    const t3 = setTimeout(() => setEndTransition("summary"), start + 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [ended, endReason]);

  function finishConversation() {
    if (ended) return;
    setEndReason("manual");
    setEnded(true);
  }

  function toggleAudio(idx: number, text: string) {
    if (playingIdx === idx) {
      audioRef.current?.pause();
      setPlayingIdx(null);
      return;
    }
    playMessage(idx, text);
  }

  async function sendMessage(text: string) {
    const clean = text.trim();
    if (!clean || loading || ended || turnsUsed >= MAX_USER_TURNS) return;
    setError(null);

    const nextMessages: Message[] = [...messages, { role: "user", text: clean }];
    const modelReplyIdx = nextMessages.length;
    setMessages(nextMessages);
    setInput("");
    setHints(null);
    setLoading(true);

    const turnsLeft = MAX_USER_TURNS - (turnsUsed + 1);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          history: messages.filter((m, i) => !(i === 0 && m.role === "model")),
          userMessage: clean,
          currentInterest: interest,
          turnsLeft,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat error");

      // Pre-fetch the TTS so text + audio appear together. Loader stays
      // visible during this fetch; on cache hit playMessage skips the
      // network call and plays immediately when useEffect fires.
      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: data.reply,
            voice: character.voice,
          }),
        });
        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          audioCacheRef.current.set(
            modelReplyIdx,
            URL.createObjectURL(blob),
          );
        }
      } catch {
        // ignore — message still reveals, just without preloaded audio
      }

      const newInterest = Math.max(0, Math.min(100, interest + data.interestDelta));
      setInterest(newInterest);
      setMessages((m) => [
        ...m,
        { role: "model", text: data.reply, interestLevel: newInterest },
      ]);
      setTurnsUsed((t) => t + 1);

      const willEnd =
        data.endConversation || newInterest <= 20 || turnsLeft <= 0;
      if (willEnd) {
        setEnded(true);
        setHints(null);
      } else if (Array.isArray(data.hints) && data.hints.length === 2) {
        setHints([data.hints[0], data.hints[1]]);
      } else {
        setHints(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const turnsLeft = MAX_USER_TURNS - turnsUsed;

  function restartConversation() {
    audioRef.current?.pause();
    audioRef.current = null;
    audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioCacheRef.current = new Map();
    lastAutoPlayed.current = -1;
    setMessages([{ role: "model", text: character.firstLine }]);
    setInput("");
    setInterest(50);
    setTurnsUsed(0);
    setLoading(false);
    setEnded(false);
    setError(null);
    setHints(character.initialHints);
    setPlayingIdx(null);
    setLoadingAudioIdx(null);
    setEndTransition("chat");
    setEndReason("natural");
  }

  const inSummaryFlow =
    endTransition === "reflecting" || endTransition === "summary";

  const headerTitle = inSummaryFlow ? "Summary" : "Conversation";

  const header = (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-3 pb-2">
      <div className="justify-self-start">
        <Link
          href={`/character/${character.id}?format=text-voice`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/90 transition hover:bg-white/15 active:scale-95"
          aria-label="Back"
        >
          ←
        </Link>
      </div>
      <div className="text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
          {headerTitle}
        </p>
        <div className="mt-0.5 flex items-center justify-center gap-1.5">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15">
            <Image
              src={character.portrait}
              alt={character.name}
              fill
              sizes="20px"
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium text-white">
            {character.name}, {character.age}
          </span>
        </div>
      </div>
      <div className="justify-self-end">
        {endTransition === "chat" ? (
          <button
            onClick={finishConversation}
            className="inline-flex h-9 items-center rounded-full border border-rose-400/40 bg-rose-500/10 px-3 text-[12px] font-medium text-rose-200 transition hover:bg-rose-500/20 hover:text-rose-100 active:scale-95"
            aria-label="Finish conversation"
            title="Finish conversation"
          >
            Finish
          </button>
        ) : (
          <span className="block h-9 w-9" />
        )}
      </div>
    </header>
  );

  if (endTransition === "summary") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex min-h-0 flex-1 flex-col animate-fade-in-slow">
          <ConversationSummary
            session={buildLiveSession(messages)}
            characterId={character.id}
            characterName={character.name}
            onRestart={restartConversation}
          />
        </div>
      </div>
    );
  }

  if (endTransition === "reflecting") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        {header}
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 animate-fade-in">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
              <svg className="h-5 w-5 animate-spin text-coral" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <p className="font-serif text-[18px] italic leading-relaxed text-slate-200">
              Looking back on this one…
            </p>
            <p className="text-[13px] text-slate-400">
              Pulling out the moments worth remembering.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col transition-opacity duration-700 ${
        endTransition === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {header}
      <InterestBar value={interest} />

      <div className="flex items-center justify-between gap-3 px-5 pb-3 text-[10px] uppercase tracking-[0.22em] text-slate-500">
        <span className="truncate">{character.shortDescription}</span>
        <span className="inline-flex items-center gap-1.5">
          {Array.from({ length: MAX_USER_TURNS }).map((_, i) => {
            const filled = i < turnsUsed;
            const active = i === turnsUsed && !ended;
            return (
              <span
                key={i}
                className={`block h-1.5 w-1.5 rounded-full transition ${
                  filled
                    ? "bg-coral"
                    : active
                    ? "bg-white/40"
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-thin px-5 pb-4"
      >
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          const isPlaying = playingIdx === i;
          const isLoadingAudio = loadingAudioIdx === i;
          return (
            <div
              key={i}
              className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              {!isUser && (
                <div className="relative mr-2 mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
                  <Image
                    src={character.portrait}
                    alt={character.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-[16px] leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-br-md bg-accent-500 text-white"
                    : "rounded-bl-md bg-white/10 text-slate-100"
                }`}
              >
                <div>{m.text}</div>
                {!isUser && (
                  <button
                    onClick={() => toggleAudio(i, m.text)}
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] transition ${
                      isPlaying
                        ? "bg-accent-500/30 text-accent-400"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                    }`}
                  >
                    {isLoadingAudio ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    ) : isPlaying ? (
                      <span className="flex h-3 items-center gap-[2px] text-accent-400">
                        <span className="voice-bar h-3" />
                        <span className="voice-bar h-3" style={{ animationDelay: "0.15s" }} />
                        <span className="voice-bar h-3" style={{ animationDelay: "0.3s" }} />
                      </span>
                    ) : (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" />
                      </svg>
                    )}
                    {isPlaying ? "Playing" : isLoadingAudio ? "..." : "Play voice"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="relative mr-2 mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
              <Image
                src={character.portrait}
                alt={character.name}
                fill
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-5 mb-2 rounded-xl bg-rose-500/15 px-3 py-2 text-[12px] text-rose-200">
          {error}
        </div>
      )}

      {!ended && !loading && hints && (
        <div
          key={`hints-${turnsUsed}`}
          className="relative z-10 space-y-2 px-4 pb-3 animate-fade-in"
        >
          <p className="pl-1 text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Try saying
          </p>
          {hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => sendMessage(hint)}
              className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-[15px] leading-snug text-slate-200 transition hover:border-accent-400/60 hover:bg-accent-500/10 active:scale-[0.98]"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {inputMode === "voice" ? (
        <div className="relative bg-slate-950/85 px-4 pb-7 pt-7 backdrop-blur">
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent to-slate-950/85" />
          <div className="flex flex-col items-center gap-3">
            <VoiceRecorder
              size="lg"
              disabled={loading}
              onTranscribed={(t) => sendMessage(t)}
            />
            <p className="text-[12px] tracking-wide text-slate-400">
              Tap to speak
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            disabled={loading}
            className="absolute bottom-6 right-4 inline-flex h-10 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3.5 text-[12px] font-medium text-slate-300 backdrop-blur transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Type instead"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 5H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 12H4V7h16v10Zm-7-2h-2v-2h2v2Zm0-3h-2v-2h2v2Zm-3 3H8v-2h2v2Zm-3 0H5v-2h2v2Zm9 0h-2v-2h2v2Zm3 0h-2v-2h2v2Zm0-3h-2v-2h2v2Zm-3 0h-2v-2h2v2Zm-6-3H5V8h2v2Zm3 0H8V8h2v2Zm3 0h-2V8h2v2Zm3 0h-2V8h2v2Zm3 0h-2V8h2v2Z" />
            </svg>
            Type
          </button>
        </div>
      ) : (
        <form
          className="relative bg-slate-950/85 px-4 pb-4 pt-3 backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-b from-transparent to-slate-950/85" />
          <button
            type="button"
            onClick={() => {
              setInput("");
              setInputMode("voice");
            }}
            disabled={loading}
            className="mb-2 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/12 bg-white/5 px-3 text-[12px] font-medium text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Back to voice"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
            </svg>
            Voice
          </button>
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 focus-within:border-accent-400 focus-within:bg-white/8">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={loading}
                autoFocus
                placeholder="What do you say?"
                rows={1}
                className="block max-h-32 w-full resize-none bg-transparent px-4 py-4 text-[16px] text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)] transition active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
              title="Send"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5Z" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
