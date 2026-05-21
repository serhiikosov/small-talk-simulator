"use client";

import { useRef, useState } from "react";

type Props = {
  disabled?: boolean;
  onTranscribed: (text: string) => void;
  size?: "sm" | "lg";
};

export default function VoiceRecorder({
  disabled,
  onTranscribed,
  size = "sm",
}: Props) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" });
        setProcessing(true);
        try {
          const fd = new FormData();
          fd.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: fd });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Transcribe failed");
          if (data.text && data.text.trim()) {
            onTranscribed(data.text.trim());
          } else {
            setError("Couldn't recognize that");
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Error");
        } finally {
          setProcessing(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Microphone access denied",
      );
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled || processing}
        onClick={recording ? stop : start}
        className={`relative inline-flex shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
          size === "lg" ? "h-20 w-20" : "h-14 w-14"
        } ${
          recording
            ? size === "lg"
              ? "bg-rose-500 text-white shadow-[0_0_0_10px_rgba(244,63,94,0.18)]"
              : "bg-rose-500 text-white shadow-[0_0_0_6px_rgba(244,63,94,0.18)]"
            : processing
            ? "bg-[color:var(--surface-accent-solid)]/80 text-white shadow-[0_10px_30px_-10px_rgba(108,92,231,0.55)]"
            : size === "lg"
            ? "bg-[color:var(--surface-accent-solid)] text-white shadow-[0_18px_50px_-12px_rgba(108,92,231,0.55)] ring-4 ring-[color:var(--surface-accent-solid)]/15 ring-offset-4 ring-offset-[color:var(--surface-bg)] hover:opacity-95"
            : "bg-[color:var(--surface-accent-solid)] text-white shadow-[0_10px_30px_-10px_rgba(108,92,231,0.55)] ring-2 ring-[color:var(--surface-accent-solid)]/20 ring-offset-2 ring-offset-[color:var(--surface-bg)] hover:opacity-95"
        } disabled:cursor-not-allowed disabled:opacity-40`}
        title={recording ? "Stop" : "Record voice"}
      >
        {processing ? (
          <svg
            className={`animate-spin ${size === "lg" ? "h-8 w-8" : "h-6 w-6"}`}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".2" strokeWidth="3" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : recording ? (
          <svg
            className={size === "lg" ? "h-7 w-7" : "h-5 w-5"}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg
            className={size === "lg" ? "h-8 w-8" : "h-6 w-6"}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
          </svg>
        )}
        {recording && (
          <span
            className={`absolute inline-flex ${
              size === "lg" ? "-top-1 right-2 h-4 w-4" : "-top-0.5 -right-0.5 h-3 w-3"
            }`}
          >
            <span className="absolute inset-0 inline-flex animate-ping rounded-full bg-rose-400 opacity-75" />
            <span
              className={`relative inline-flex rounded-full bg-rose-500 ${
                size === "lg" ? "h-4 w-4" : "h-3 w-3"
              }`}
            />
          </span>
        )}
      </button>
      {error && (
        <span className="absolute -top-7 right-0 whitespace-nowrap rounded-md bg-rose-500/15 px-2 py-0.5 text-[14px] text-rose-600">
          {error}
        </span>
      )}
    </div>
  );
}
