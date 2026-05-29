"use client";

import Link from "next/link";
import { useUIPrefs } from "@/components/UIPrefs";

export function PhoneTopBar({
  id,
  shortDescription,
}: {
  id: string;
  shortDescription: string;
}) {
  const { viewMode } = useUIPrefs();
  if (viewMode === "fullscreen") return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
      <Link
        href={`/character/${id}`}
        className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-base text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
        aria-label="Back"
      >
        ←
      </Link>
      <span className="pointer-events-auto max-w-[260px] truncate rounded-full border border-white/15 bg-black/35 px-4 py-2 text-center text-[14px] font-semibold text-white backdrop-blur-md">
        {shortDescription.split("—")[0].trim()}
      </span>
      <span className="h-10 w-10" />
    </div>
  );
}
