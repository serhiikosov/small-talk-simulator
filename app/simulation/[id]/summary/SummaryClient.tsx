"use client";

import { useRouter } from "next/navigation";
import ConversationSummary from "@/components/ConversationSummary";
import { getSampleSession } from "@/lib/summary";
import { useUIPrefs } from "@/components/UIPrefs";

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
  const { chatEnabled } = useUIPrefs();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-shrink-0 items-center gap-3 border-b border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] px-4 py-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface-accent-tonal)] text-lg">
          {characterAvatar}
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-accent)] leading-none">
            Summary
          </p>
          <p className="mt-1 text-[15px] font-semibold leading-none text-[color:var(--text-primary)]">
            {characterName}
          </p>
        </div>
      </div>
      <ConversationSummary
        session={getSampleSession(characterId)}
        characterId={characterId}
        characterName={characterName}
        onRestart={() =>
          router.push(
            chatEnabled
              ? `/simulation/${characterId}/text-voice`
              : `/simulation/${characterId}/interactive`,
          )
        }
      />
    </div>
  );
}
