import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/characters";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition active:scale-[0.99]"
    >
      <div className="relative aspect-[5/4] w-full">
        <Image
          src={character.portrait}
          alt={character.name}
          fill
          priority
          sizes="(min-width: 640px) 440px, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-white/70">
            {character.shortDescription}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h2 className="font-serif text-[28px] font-medium leading-none text-white drop-shadow">
              {character.name}
            </h2>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {character.age}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-white/90">
            Start the conversation
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:translate-x-0.5">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
