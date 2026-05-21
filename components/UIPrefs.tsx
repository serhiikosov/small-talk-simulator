"use client";

import { createContext, useContext, useState } from "react";

type UIPrefs = {
  interestVisible: boolean;
  setInterestVisible: (v: boolean) => void;
  chatEnabled: boolean;
  setChatEnabled: (v: boolean) => void;
};

const UIPrefsContext = createContext<UIPrefs | null>(null);

export function useUIPrefs() {
  const ctx = useContext(UIPrefsContext);
  if (!ctx) {
    throw new Error("useUIPrefs must be used inside <UIPrefsProvider>");
  }
  return ctx;
}

export function UIPrefsProvider({ children }: { children: React.ReactNode }) {
  const [interestVisible, setInterestVisible] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  return (
    <UIPrefsContext.Provider
      value={{
        interestVisible,
        setInterestVisible,
        chatEnabled,
        setChatEnabled,
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
  } = useUIPrefs();
  return (
    <aside className="absolute right-4 top-4 z-20 flex flex-col gap-2 rounded-2xl border border-[color:var(--border-subtle)] bg-white/80 px-3 py-2.5 text-[12px] shadow-[var(--shadow-elev)] backdrop-blur-md">
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
    </aside>
  );
}
