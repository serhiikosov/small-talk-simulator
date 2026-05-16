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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <Link
          href={`/character/${id}?format=interactive`}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/90 transition hover:bg-white/15 active:scale-95"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
            Video scenario
          </p>
          <p className="text-sm font-medium text-white">
            {character.avatar} {character.name}
          </p>
        </div>
        <span className="w-9" />
      </div>
      <InteractiveScene character={character} />
    </div>
  );
}
