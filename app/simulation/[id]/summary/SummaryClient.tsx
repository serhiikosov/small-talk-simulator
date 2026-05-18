"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ConversationSummary from "@/components/ConversationSummary";
import { getSampleSession } from "@/lib/summary";

export default function SummaryClient({
  characterId,
  characterName,
  characterAvatar,
}: {
  characterId: string;
  characterName: string;
  characterAvatar: string;
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <Link
          href={`/character/${characterId}`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/90 transition hover:bg-white/15 active:scale-95"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
            Summary
          </p>
          <p className="text-sm font-medium text-white">
            {characterAvatar} {characterName}
          </p>
        </div>
        <span className="w-9" />
      </div>
      <ConversationSummary
        session={getSampleSession(characterId)}
        characterId={characterId}
        characterName={characterName}
        onRestart={() => router.push(`/simulation/${characterId}/text-voice`)}
      />
    </div>
  );
}
