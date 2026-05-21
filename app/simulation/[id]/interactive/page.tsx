import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import InteractiveScene from "@/components/InteractiveScene";

type Props = { params: Promise<{ id: string }> };

export default async function InteractivePage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Floating chrome over the video — back button left, pill chip center */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
        <Link
          href={`/character/${id}`}
          className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-base text-white backdrop-blur-md transition hover:bg-black/55 active:scale-95"
          aria-label="Back"
        >
          ←
        </Link>
        <span className="pointer-events-auto max-w-[260px] truncate rounded-full border border-white/15 bg-black/35 px-4 py-2 text-center text-[14px] font-semibold text-white backdrop-blur-md">
          {character.shortDescription.split("—")[0].trim()}
        </span>
        <span className="h-10 w-10" />
      </div>
      <InteractiveScene character={character} />
    </div>
  );
}
