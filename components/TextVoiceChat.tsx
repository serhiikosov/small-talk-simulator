"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Character } from "@/lib/characters";
import InterestBar from "./InterestBar";
import VoiceRecorder from "./VoiceRecorder";

type Message = { role: "user" | "model"; text: string };

const MAX_USER_TURNS = 3;

export default function TextVoiceChat({ character }: { character: Character }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: character.firstLine },
  ]);
  const [input, setInput] = useState("");
  const [interest, setInterest] = useState(50);
  const [turnsUsed, setTurnsUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hints, setHints] = useState<[string, string] | null>(
    character.initialHints,
  );

  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [loadingAudioIdx, setLoadingAudioIdx] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<number, string>>(new Map());
  const lastAutoPlayed = useRef<number>(-1);

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

      const newInterest = Math.max(0, Math.min(100, interest + data.interestDelta));
      setInterest(newInterest);
      setMessages((m) => [...m, { role: "model", text: data.reply }]);
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
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  }

  const turnsLeft = MAX_USER_TURNS - turnsUsed;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InterestBar value={interest} />

      <div className="flex items-center justify-between px-5 pb-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {character.name} онлайн
        </span>
        <span className="rounded-full bg-white/5 px-2 py-0.5">
          реплік: <span className="font-mono text-slate-200">{Math.max(0, turnsLeft)}</span>/{MAX_USER_TURNS}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-2.5 overflow-y-auto scrollbar-thin px-5 pb-3"
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
                <div className="mr-2 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
                  {character.avatar}
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                  isUser
                    ? "rounded-br-md bg-accent-500 text-white"
                    : "rounded-bl-md bg-white/10 text-slate-100"
                }`}
              >
                <div>{m.text}</div>
                {!isUser && (
                  <button
                    onClick={() => toggleAudio(i, m.text)}
                    className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition ${
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
                    {isPlaying ? "Грає" : isLoadingAudio ? "..." : "Озвучити"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start animate-fade-in">
            <div className="mr-2 mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
              {character.avatar}
            </div>
            <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-2.5">
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
          className="space-y-1.5 px-4 pb-2 animate-fade-in"
        >
          <p className="pl-1 text-[10px] uppercase tracking-widest text-slate-500">
            💡 Підказки
          </p>
          {hints.map((hint, i) => (
            <button
              key={i}
              onClick={() => sendMessage(hint)}
              className="block w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-left text-[13px] leading-snug text-slate-200 transition hover:border-accent-400/60 hover:bg-accent-500/10 active:scale-[0.98]"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      {!ended ? (
        <form
          className="flex items-end gap-2 border-t border-white/5 bg-slate-950/80 px-4 py-3 backdrop-blur"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
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
              disabled={loading || ended}
              placeholder="Напиши або скажи..."
              rows={1}
              className="block max-h-32 w-full resize-none bg-transparent px-4 py-3 text-[14px] text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
            />
          </div>
          {input.trim() ? (
            <button
              type="submit"
              disabled={loading || ended}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-500 text-white shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)] transition active:scale-95 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:shadow-none"
              title="Надіслати"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11.5 21 3l-8.5 18-2-7.5L3 11.5Z" />
              </svg>
            </button>
          ) : (
            <VoiceRecorder
              disabled={loading || ended}
              onTranscribed={(t) => sendMessage(t)}
            />
          )}
        </form>
      ) : (
        <div className="mx-4 mb-4 mt-2 flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-center animate-fade-in">
          <p className="text-[12px] text-slate-400">Розмову завершено</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-white">{interest}</span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <div className="flex w-full gap-2">
            <Link
              href={`/simulation/${character.id}/text-voice`}
              className="flex-1 rounded-full border border-white/15 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-white/10 active:scale-[0.98]"
            >
              Ще раз
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-full bg-accent-500 px-3 py-2 text-[13px] font-semibold text-white transition hover:bg-accent-400 active:scale-[0.98]"
            >
              Меню
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
