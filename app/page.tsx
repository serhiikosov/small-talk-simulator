"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const RANDOM_POOL = ["linda"];

export default function HomePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"locked" | "rolling">("locked");
  const opening = phase === "rolling";

  function reveal() {
    if (phase !== "locked") return;
    setPhase("rolling");
    setTimeout(() => {
      const pick = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
      router.push(`/character/${pick}`);
    }, 1100);
  }

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* Midnight background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(140% 90% at 50% 30%, #2A1B5A 0%, #150A30 55%, #0A0518 100%)",
        }}
      />

      {/* Stars / micro particles */}
      <Stars />

      {/* Warm glow halo behind the door */}
      <div
        aria-hidden
        className={`absolute left-1/2 top-1/2 h-[420px] w-[360px] -translate-x-1/2 -translate-y-[60%] rounded-full blur-3xl transition-opacity duration-500 ${
          opening ? "opacity-95" : "opacity-70"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(255,193,107,0.55) 0%, rgba(255,150,80,0.25) 40%, transparent 70%)",
        }}
      />

      {/* Floor light pool */}
      <div
        aria-hidden
        className={`absolute left-1/2 -translate-x-1/2 h-24 w-[78%] rounded-[100%] blur-2xl transition-opacity duration-500 ${
          opening ? "opacity-90" : "opacity-70"
        }`}
        style={{
          bottom: "26%",
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(255,193,107,0.7) 0%, rgba(255,150,80,0.0) 75%)",
        }}
      />

      {/* Door + arch */}
      <div className="absolute left-1/2 top-[44%] h-[58%] w-[62%] -translate-x-1/2 -translate-y-1/2">
        {/* Outer arched golden trim */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            borderTopLeftRadius: "9999px",
            borderTopRightRadius: "9999px",
            background:
              "linear-gradient(180deg, rgba(255,205,138,0.65) 0%, rgba(255,170,100,0.35) 60%, rgba(255,140,80,0.15) 100%)",
            boxShadow:
              "0 0 36px 6px rgba(255,180,100,0.35), 0 0 80px 14px rgba(255,160,90,0.18)",
          }}
        />

        {/* Inner arch area — bright warm interior visible through the gap */}
        <div
          className="absolute overflow-hidden"
          style={{
            inset: "5px",
            borderTopLeftRadius: "9999px",
            borderTopRightRadius: "9999px",
            background:
              "radial-gradient(80% 70% at 50% 55%, #FFE3B0 0%, #FFB266 35%, #C97A3A 70%, #6B3A1A 100%)",
          }}
        >
          {/* LEFT panel — slides left on open */}
          <div
            className="absolute left-0 top-0 bottom-0 transition-transform duration-[1100ms] ease-out"
            style={{
              width: "50.5%",
              transform: opening ? "translateX(-92%)" : "translateX(0)",
              background:
                "linear-gradient(90deg, #1A0F36 0%, #2C1B4E 70%, #3A2566 100%)",
              boxShadow:
                "inset -2px 0 6px rgba(0,0,0,0.45), 4px 0 18px rgba(0,0,0,0.55)",
            }}
          >
            <Panel side="left" />
          </div>

          {/* RIGHT panel — slides right on open */}
          <div
            className="absolute right-0 top-0 bottom-0 transition-transform duration-[1100ms] ease-out"
            style={{
              width: "50.5%",
              transform: opening ? "translateX(92%)" : "translateX(0)",
              background:
                "linear-gradient(270deg, #1A0F36 0%, #2C1B4E 70%, #3A2566 100%)",
              boxShadow:
                "inset 2px 0 6px rgba(0,0,0,0.45), -4px 0 18px rgba(0,0,0,0.55)",
            }}
          >
            <Panel side="right" />
          </div>
        </div>

        {/* Light spill beneath the door */}
        <div
          aria-hidden
          className={`absolute -bottom-1 left-[6%] right-[6%] h-[3px] transition-all duration-500 ${
            opening ? "opacity-100" : "opacity-95"
          }`}
          style={{
            background:
              "linear-gradient(90deg, transparent, #FFE0B5 18%, #FFFFFF 50%, #FFE0B5 82%, transparent)",
            boxShadow:
              "0 6px 18px rgba(255,193,107,0.85), 0 10px 30px rgba(255,193,107,0.55)",
            borderRadius: "9999px",
          }}
        />
      </div>

      {/* Drifting dust particles in the light */}
      <Dust />

      {/* Content overlay */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 pb-6 pt-7 text-center">
        <h2 className="text-[26px] font-semibold leading-[1.15] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          {opening ? "The door is opening…" : "Behind the door…"}
        </h2>
        <p className="mt-2.5 max-w-[280px] text-[14.5px] leading-[1.5] text-white/80">
          {opening
            ? "Someone's stepping into the scene."
            : "Tap to step in. Someone's waiting on the other side."}
        </p>

        <button
          type="button"
          onClick={reveal}
          disabled={phase !== "locked"}
          className="mt-5 inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-7 text-[15px] font-semibold text-[color:var(--text-primary)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition active:scale-[0.97] disabled:cursor-default disabled:opacity-70"
        >
          {opening ? "Opening…" : "Open the door"}
          {!opening && (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Panel({ side }: { side: "left" | "right" }) {
  // Subtle door-panel inset rectangle to give the door some craft
  const isLeft = side === "left";
  return (
    <>
      <div
        aria-hidden
        className="absolute"
        style={{
          top: "18%",
          bottom: "12%",
          [isLeft ? "left" : "right"]: "12%",
          [isLeft ? "right" : "left"]: "8%",
          borderRadius: "60px 60px 6px 6px",
          boxShadow:
            "inset 0 0 0 1px rgba(255,200,140,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      />
      {/* Door knob/handle */}
      <div
        aria-hidden
        className="absolute"
        style={{
          top: "54%",
          [isLeft ? "right" : "left"]: "14%",
          width: "5px",
          height: "5px",
          borderRadius: "9999px",
          background: "radial-gradient(circle, #FFD27A 0%, #B57F3F 70%)",
          boxShadow:
            "0 0 8px rgba(255,193,107,0.6), inset 0 0 0 0.5px rgba(0,0,0,0.4)",
        }}
      />
    </>
  );
}

function Stars() {
  // Hand-placed soft star positions — looks more intentional than random
  const stars = [
    { top: "8%", left: "12%", s: 1, o: 0.5 },
    { top: "14%", right: "18%", s: 1.5, o: 0.6, blur: true },
    { top: "5%", right: "38%", s: 1, o: 0.4 },
    { top: "22%", left: "6%", s: 1, o: 0.4 },
    { top: "11%", left: "62%", s: 1, o: 0.35 },
    { top: "30%", right: "10%", s: 1, o: 0.35 },
    { top: "18%", left: "48%", s: 0.8, o: 0.5 },
    { bottom: "30%", left: "5%", s: 1, o: 0.3 },
    { bottom: "22%", right: "5%", s: 1, o: 0.3 },
  ];
  return (
    <>
      {stars.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className={`pointer-events-none absolute rounded-full bg-white ${
            p.blur ? "blur-[0.5px]" : ""
          }`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            width: `${p.s * 4}px`,
            height: `${p.s * 4}px`,
            opacity: p.o,
          }}
        />
      ))}
    </>
  );
}

function Dust() {
  // A handful of warm motes drifting in the door light
  const motes = [
    { left: "44%", bottom: "22%", s: 3, delay: "0s" },
    { left: "52%", bottom: "30%", s: 2, delay: "1.2s" },
    { left: "46%", bottom: "36%", s: 2.5, delay: "2.4s" },
    { left: "54%", bottom: "26%", s: 2, delay: "0.6s" },
    { left: "48%", bottom: "42%", s: 1.6, delay: "1.8s" },
  ];
  return (
    <>
      {motes.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full mix-blend-screen"
          style={{
            left: m.left,
            bottom: m.bottom,
            width: `${m.s}px`,
            height: `${m.s}px`,
            background: "#FFE0B5",
            boxShadow: "0 0 6px rgba(255,193,107,0.9)",
            animation: `dustFloat 6s ease-in-out ${m.delay} infinite`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes dustFloat {
          0%,
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-30px) translateX(6px);
            opacity: 0.9;
          }
        }
      `}</style>
    </>
  );
}
