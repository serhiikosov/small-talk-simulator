"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import type { Character } from "@/lib/characters";
import { buildLiveSession } from "@/lib/summary";
import InterestBar from "./InterestBar";
import { useUIPrefs } from "./UIPrefs";
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
  const lastAutoPlayed = useRef<number>(
    initialMessages.length > 1 ? initialMessages.length - 1 : -1,
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const { interestVisible } = useUIPrefs();

  useEffect(() => {
    if (inputMode === "text") {
      const t = setTimeout(() => textInputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [inputMode]);

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

  useEffect(() => {
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (last?.role === "model" && lastAutoPlayed.current < lastIdx) {
      lastAutoPlayed.current = lastIdx;
      playMessage(lastIdx, last.text);
    }
  }, [messages, playMessage]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      try {
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply, voice: character.voice }),
        });
        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          audioCacheRef.current.set(modelReplyIdx, URL.createObjectURL(blob));
        }
      } catch {
        // ignore
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

  const header = (
    <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-[color:var(--border-subtle)]">
          <Image
            src={character.portrait}
            alt={character.name}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-none text-[color:var(--text-primary)]">
            {character.name}
          </p>
          <p className="mt-1 truncate text-[14px] leading-none text-[color:var(--text-tertiary)]">
            {inSummaryFlow
              ? "Conversation summary"
              : character.shortDescription.split("—")[0].trim()}
          </p>
        </div>
      </div>
      {endTransition === "chat" ? (
        <button
          onClick={finishConversation}
          className="inline-flex h-10 items-center rounded-full bg-[color:var(--surface-soft)] px-4 text-[14px] font-semibold text-[color:var(--text-secondary)] transition hover:bg-[color:var(--surface-accent-tonal)] hover:text-[color:var(--text-accent)] active:scale-95"
        >
          Finish
        </button>
      ) : null}
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--surface-soft)]">
              <svg className="h-5 w-5 animate-spin text-[color:var(--text-accent)]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-[17px] italic leading-relaxed text-[color:var(--text-primary)]">
              Looking back on this one…
            </p>
            <p className="text-[14px] text-[color:var(--text-tertiary)]">
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

      {interestVisible && (
        <div className="flex-shrink-0 px-4 pt-2 pb-1.5">
          <InterestBar value={interest} />
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-thin px-4 pb-3"
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
                <div className="relative mr-2 mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[color:var(--border-subtle)]">
                  <Image
                    src={character.portrait}
                    alt={character.name}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
                  isUser
                    ? "rounded-br-md bg-[color:var(--surface-accent-solid)] text-white shadow-[var(--shadow-elev)]"
                    : "rounded-bl-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-primary)]"
                }`}
              >
                <div>{m.text}</div>
                {!isUser && (
                  <button
                    onClick={() => toggleAudio(i, m.text)}
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-medium transition ${
                      isPlaying
                        ? "bg-[color:var(--surface-accent-tonal)] text-[color:var(--text-accent)]"
                        : "bg-white text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-accent-tonal)] hover:text-[color:var(--text-accent)]"
                    }`}
                  >
                    {isLoadingAudio ? (
                      <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    ) : isPlaying ? (
                      <span className="flex h-3 items-center gap-[2px] text-[color:var(--text-accent)]">
                        <span className="voice-bar h-3" />
                        <span className="voice-bar h-3" style={{ animationDelay: "0.15s" }} />
                        <span className="voice-bar h-3" style={{ animationDelay: "0.3s" }} />
                      </span>
                    ) : (
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 9v6h4l5 5V4L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z" />
                      </svg>
                    )}
                    {isPlaying ? "Playing" : isLoadingAudio ? "…" : "Play voice"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="relative mr-2 mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[color:var(--border-subtle)]">
              <Image
                src={character.portrait}
                alt={character.name}
                fill
                sizes="32px"
                className="object-cover"
              />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-4 py-3">
              <span className="inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--text-tertiary)] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--text-tertiary)] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--text-tertiary)]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[14px] text-rose-700">
          {error}
        </div>
      )}

      {!ended && !loading && hints && (
        <div
          key={`hints-${turnsUsed}`}
          className="flex-shrink-0 space-y-2 px-4 pb-3 animate-fade-in"
        >
          <p className="pl-1 text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-tertiary)]">
            Try saying
          </p>
          {hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => sendMessage(hint)}
              className="block w-full rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3.5 py-2.5 text-left text-[14px] leading-snug text-[color:var(--text-primary)] transition hover:border-[color:var(--border-focus)] hover:bg-[color:var(--surface-accent-tonal)] active:scale-[0.98]"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      <div
        className="relative flex-shrink-0 overflow-hidden border-t border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] transition-[min-height] duration-300 ease-out"
        style={{ minHeight: inputMode === "voice" ? 108 : 72 }}
      >
        {/* Voice mode */}
        <div
          aria-hidden={inputMode !== "voice"}
          className={`absolute inset-0 px-4 pb-3 pt-3 transition-all duration-300 ease-out ${
            inputMode === "voice"
              ? "opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 -translate-y-1 scale-[0.97]"
          }`}
        >
          <button
            type="button"
            onClick={() => setInputMode("text")}
            disabled={loading || inputMode !== "voice"}
            className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-secondary)] transition hover:border-[color:var(--border-focus)] hover:bg-[color:var(--surface-accent-tonal)] hover:text-[color:var(--text-accent)] active:scale-95 disabled:opacity-50"
            aria-label="Type instead"
            title="Type instead"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="6" width="18" height="12" rx="2.5" />
              <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
            </svg>
          </button>
          <div className="flex flex-col items-center gap-1.5">
            <VoiceRecorder
              size="sm"
              disabled={loading || inputMode !== "voice"}
              onTranscribed={(t) => sendMessage(t)}
            />
            <p className="text-[13px] font-medium text-[color:var(--text-tertiary)]">
              Tap to speak
            </p>
          </div>
        </div>

        {/* Text mode */}
        <form
          aria-hidden={inputMode !== "text"}
          className={`absolute inset-0 flex items-center px-3 transition-all duration-300 ease-out ${
            inputMode === "text"
              ? "opacity-100 translate-y-0 scale-100"
              : "pointer-events-none opacity-0 translate-y-1 scale-[0.97]"
          }`}
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <div className="flex w-full items-end gap-2">
            <div className="flex-1 rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] transition focus-within:border-[color:var(--border-focus)] focus-within:bg-white focus-within:shadow-[var(--shadow-field-focus)]">
              <textarea
                ref={textInputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                disabled={loading || inputMode !== "text"}
                placeholder="What do you say?"
                rows={1}
                className="block max-h-32 w-full resize-none bg-transparent px-3.5 py-2.5 text-[15px] text-[color:var(--text-primary)] placeholder:text-[color:var(--text-tertiary)] focus:outline-none disabled:opacity-50"
              />
            </div>
            <div className="relative h-11 w-11 shrink-0">
              {/* Send (visible when input has text) */}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`absolute inset-0 inline-flex items-center justify-center rounded-full bg-[color:var(--surface-accent-solid)] text-white shadow-[var(--shadow-action)] transition-all duration-200 ease-out active:scale-95 disabled:cursor-not-allowed ${
                  input.trim()
                    ? "opacity-100 scale-100"
                    : "pointer-events-none opacity-0 scale-90"
                }`}
                title="Send"
                aria-label="Send"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5Z" />
                </svg>
              </button>
              {/* Mic (visible when input empty — toggles back to voice) */}
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  setInputMode("voice");
                }}
                disabled={loading || inputMode !== "text"}
                className={`absolute inset-0 inline-flex items-center justify-center rounded-full bg-[color:var(--surface-accent-solid)] text-white shadow-[var(--shadow-action)] transition-all duration-200 ease-out active:scale-95 ${
                  !input.trim()
                    ? "opacity-100 scale-100"
                    : "pointer-events-none opacity-0 scale-90"
                }`}
                title="Switch to voice"
                aria-label="Switch to voice"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
