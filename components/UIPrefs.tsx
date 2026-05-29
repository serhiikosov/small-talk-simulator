"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ViewMode = "phone" | "fullscreen";

type UIPrefs = {
  interestVisible: boolean;
  setInterestVisible: (v: boolean) => void;
  chatEnabled: boolean;
  setChatEnabled: (v: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
};

const UIPrefsContext = createContext<UIPrefs | null>(null);

export function useUIPrefs() {
  const ctx = useContext(UIPrefsContext);
  if (!ctx) {
    throw new Error("useUIPrefs must be used inside <UIPrefsProvider>");
  }
  return ctx;
}

const VIEW_MODE_KEY = "sts.viewMode";

export function UIPrefsProvider({ children }: { children: React.ReactNode }) {
  const [interestVisible, setInterestVisible] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [viewMode, setViewModeState] = useState<ViewMode>("fullscreen");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VIEW_MODE_KEY);
      if (raw === "phone" || raw === "fullscreen") setViewModeState(raw);
    } catch {}
  }, []);

  function setViewMode(m: ViewMode) {
    setViewModeState(m);
    try {
      window.localStorage.setItem(VIEW_MODE_KEY, m);
    } catch {}
  }

  return (
    <UIPrefsContext.Provider
      value={{
        interestVisible,
        setInterestVisible,
        chatEnabled,
        setChatEnabled,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </UIPrefsContext.Provider>
  );
}

export function DevToggles() {
  const {
    interestVisible,
    setInterestVisible,
    chatEnabled,
    setChatEnabled,
    viewMode,
    setViewMode,
  } = useUIPrefs();
  return (
    <aside className="absolute right-4 top-4 z-20 flex flex-col gap-2 rounded-2xl border border-[color:var(--border-subtle)] bg-white/85 px-3 py-2.5 text-[12px] shadow-[var(--shadow-elev)] backdrop-blur-md">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text-quaternary)]">
        Preview toggles
      </p>
      <label className="flex cursor-pointer items-center gap-2 text-[color:var(--text-secondary)]">
        <input
          type="checkbox"
          checked={interestVisible}
          onChange={(e) => setInterestVisible(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[color:var(--surface-accent-solid)]"
        />
        Show Interest bar
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-[color:var(--text-secondary)]">
        <input
          type="checkbox"
          checked={chatEnabled}
          onChange={(e) => setChatEnabled(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[color:var(--surface-accent-solid)]"
        />
        Enable chat after scene
      </label>
      <div className="mt-1 flex items-center gap-0.5 rounded-full border border-black/10 bg-white p-0.5 text-[11px]">
        <button
          type="button"
          onClick={() => setViewMode("phone")}
          className={`flex-1 rounded-full px-2.5 py-1 font-medium transition ${
            viewMode === "phone"
              ? "bg-[color:var(--surface-accent-solid)] text-white"
              : "text-[color:var(--text-secondary)] hover:bg-black/5"
          }`}
        >
          Phone
        </button>
        <button
          type="button"
          onClick={() => setViewMode("fullscreen")}
          className={`flex-1 rounded-full px-2.5 py-1 font-medium transition ${
            viewMode === "fullscreen"
              ? "bg-[color:var(--surface-accent-solid)] text-white"
              : "text-[color:var(--text-secondary)] hover:bg-black/5"
          }`}
        >
          Fullscreen
        </button>
      </div>
    </aside>
  );
}
