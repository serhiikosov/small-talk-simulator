"use client";

import { createContext, useContext, useState } from "react";

export type Phase =
  | "intro"
  | "choice-1"
  | "branch-positive"
  | "branch-negative"
  | "positive-followup"
  | "choice-2"
  | "branch-l2-positive"
  | "branch-l2-negative"
  | "negative-followup"
  | "end";

export const PHASE_LABEL: Record<Phase, string> = {
  intro: "LVL1-INTRO",
  "choice-1": "LVL1-CHOICE",
  "branch-positive": "LVL2-POSITIVE",
  "branch-negative": "LVL2-NEGATIVE",
  "positive-followup": "LVL2-FOLLOW",
  "choice-2": "LVL2-CHOICE",
  "branch-l2-positive": "LVL3-POSITIVE",
  "branch-l2-negative": "LVL3-NEGATIVE",
  "negative-followup": "LVL2-RETRY",
  end: "END",
};

export const PHASE_ORDER: Phase[] = [
  "intro",
  "choice-1",
  "branch-positive",
  "choice-2",
  "branch-negative",
  "branch-l2-positive",
  "branch-l2-negative",
];

type Ctx = {
  active: boolean;
  phase: Phase;
  setPhase: (p: Phase) => void;
  setActive: (a: boolean) => void;
  characterId: string | null;
  setCharacterId: (id: string | null) => void;
};

const SceneControllerContext = createContext<Ctx | null>(null);

export function useSceneController() {
  const ctx = useContext(SceneControllerContext);
  if (!ctx) {
    throw new Error("useSceneController must be used inside <SceneControllerProvider>");
  }
  return ctx;
}

export function SceneControllerProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [characterId, setCharacterId] = useState<string | null>(null);
  return (
    <SceneControllerContext.Provider
      value={{ active, phase, setPhase, setActive, characterId, setCharacterId }}
    >
      {children}
    </SceneControllerContext.Provider>
  );
}
