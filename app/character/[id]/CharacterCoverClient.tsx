"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Character } from "@/lib/characters";
import { useUIPrefs } from "@/components/UIPrefs";
import { characters } from "@/lib/characters";

export function CharacterCoverClient({ character }: { character: Character }) {
  const { viewMode } = useUIPrefs();
  if (viewMode === "fullscreen") return <FullscreenCover character={character} />;
  return <PhoneCover character={character} />;
}

function PhoneCover({ character }: { character: Character }) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      <Image
        src={character.portrait}
        alt={character.name}
        fill
        priority
        sizes="(min-width: 640px) 440px, 100vw"
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/85 to-transparent" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-1" />
        <div className="flex-shrink-0 px-5 pb-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
            {character.shortDescription}
          </p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <h2 className="text-[30px] font-semibold leading-[1.05] tracking-tight text-white">
              {character.name}
            </h2>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-white">
              {character.age}
            </span>
          </div>
          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/70">
            The scene
          </p>
          <p className="mt-px text-[14.5px] font-medium leading-[1.5] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
            {character.situation}
          </p>
        </div>
        <div className="flex-shrink-0 px-3 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-2xl border border-white/20 bg-white/15 px-4 text-[14px] font-semibold text-white backdrop-blur-xl transition active:scale-[0.97] hover:bg-white/25"
              aria-label="Back"
            >
              ← Back
            </Link>
            <Link
              href={`/simulation/${character.id}/interactive`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-[15px] font-semibold text-[color:var(--text-primary)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition active:scale-[0.98] hover:bg-white/95"
            >
              Start practice
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3.5v17l14-8.5-14-8.5Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FullscreenCover({ character }: { character: Character }) {
  const router = useRouter();
  function tryDifferent() {
    const others = characters.filter((c) => c.id !== character.id);
    if (!others.length) return;
    const pick = others[Math.floor(Math.random() * others.length)];
    router.push(`/character/${pick.id}`);
  }
  return (
    <div className="fs-cover">
      <div className="fs-cover-image">
        <Image
          src={character.portrait}
          alt={character.name}
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="fs-cover-vignette" />
      <div className="fs-cover-card">
        <div className="fs-cover-card-blur" aria-hidden>
          <Image src={character.portrait} alt="" fill sizes="440px" />
        </div>
        <div className="fs-cover-row">
          <h1 className="fs-cover-name">{character.name}</h1>
          <span className="fs-cover-duration">3 MIN</span>
        </div>
        <p className="fs-cover-shortdesc">{character.shortDescription}</p>
        <p className="fs-cover-situation">{character.situation}</p>
        <div className="fs-cover-help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5" />
            <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
          </svg>
          <span>Watch their reaction, pick your reply — get better at small talk</span>
        </div>
        <Link
          href={`/simulation/${character.id}/interactive`}
          className="fs-cover-cta-primary"
        >
          Start conversation
        </Link>
        <button type="button" onClick={tryDifferent} className="fs-cover-cta-ghost">
          Try a different scenario
        </button>
      </div>
    </div>
  );
}
