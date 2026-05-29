"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUIPrefs, DevToggles } from "./UIPrefs";
import { LessonChrome } from "./LessonChrome";
import { PhaseScrubber } from "./PhaseScrubber";
import { getCharacter } from "@/lib/characters";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { viewMode } = useUIPrefs();
  if (viewMode === "fullscreen") {
    return (
      <div className="fs-page">
        <DevToggles />
        <PhaseScrubber />
        <FullscreenTopBar />
        <main className="fs-main">{children}</main>
      </div>
    );
  }
  return (
    <div className="rg-page">
      <DevToggles />
      <PhaseScrubber />
      <div className="rg-phone">
        <div className="rg-island" aria-hidden />
        <StatusBar />
        <LessonNav />
        <LessonProgress />
        <main className="rg-main">
          <LessonChrome>{children}</LessonChrome>
        </main>
      </div>
    </div>
  );
}

function FullscreenTopBar() {
  const pathname = usePathname() ?? "/";
  const characterId = extractCharacterId(pathname);
  const character = characterId ? getCharacter(characterId) : undefined;
  const title = character?.shortDescription
    ? capitalize(character.shortDescription)
    : "Pick a scenario";
  const showBack = pathname !== "/";
  const backHref = pathname.startsWith("/simulation/")
    ? `/character/${characterId ?? ""}`
    : "/";
  return (
    <div className="fs-topbar">
      <div className="fs-topbar-inner">
        {showBack ? (
          <Link href={backHref} className="fs-back" aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <div className="fs-back-placeholder" />
        )}
        <div className="fs-topbar-text">
          <p className="fs-eyebrow">Small Talk Game</p>
          <p className="fs-title" title={title}>
            {title}
          </p>
        </div>
        <div className="fs-back-placeholder" />
      </div>
    </div>
  );
}

function extractCharacterId(pathname: string): string | null {
  const m1 = pathname.match(/^\/character\/([^/]+)/);
  if (m1) return m1[1];
  const m2 = pathname.match(/^\/simulation\/([^/]+)/);
  if (m2) return m2[1];
  return null;
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

function StatusBar() {
  return (
    <div className="rg-statusbar">
      <div className="rg-statusbar-left">
        <span className="opacity-60">◁</span> TestFlight
      </div>
      <div className="rg-statusbar-right">
        <svg width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden>
          <rect x="0.5" y="6.5" width="3" height="4" rx="0.7" fill="#0A0A12" />
          <rect x="5" y="4" width="3" height="7" rx="0.7" fill="#0A0A12" />
          <rect x="9.5" y="1.5" width="3" height="9" rx="0.7" fill="#0A0A12" opacity="0.35" />
          <rect x="14" y="-1" width="3" height="12" rx="0.7" fill="#0A0A12" opacity="0.35" />
        </svg>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden>
          <path
            d="M8 2C11.3 2 14.3 3.2 16 5L14.3 6.7C13 5.3 10.6 4.3 8 4.3 5.4 4.3 3 5.3 1.7 6.7L0 5C1.7 3.2 4.7 2 8 2Z"
            fill="#0A0A12"
          />
          <path
            d="M8 6C9.7 6 11.2 6.7 12 7.5L10.3 9.2C9.8 8.7 9 8.3 8 8.3 7 8.3 6.2 8.7 5.7 9.2L4 7.5C4.8 6.7 6.3 6 8 6Z"
            fill="#0A0A12"
          />
        </svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none" aria-hidden>
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="#0A0A12" opacity="0.45" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="#0A0A12" />
          <rect x="23.5" y="4" width="2" height="4" rx="0.8" fill="#0A0A12" opacity="0.45" />
        </svg>
      </div>
    </div>
  );
}

function LessonNav() {
  return (
    <div className="rg-nav">
      <button className="rg-icon-btn" aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <div className="rg-toggle-pill">
        <div className="rg-seg active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
          Read
        </div>
        <div className="rg-seg">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0118 0v5a2 2 0 01-2 2h-1v-7h3" />
            <path d="M3 12v5a2 2 0 002 2h1v-7H3" />
          </svg>
          Listen
        </div>
      </div>
      <button className="rg-icon-btn" aria-label="More">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
    </div>
  );
}

function LessonProgress() {
  return (
    <div className="rg-progress" aria-hidden>
      <i /><i /><i /><i /><i />
    </div>
  );
}
