import Image from "next/image";
import Link from "next/link";
import type { Character } from "@/lib/characters";

export default function CharacterCard({ character }: { character: Character }) {
  return (
    <Link
      href={`/character/${character.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-elev)] transition active:scale-[0.99] hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={character.portrait}
          alt={character.name}
          fill
          priority
          sizes="(min-width: 640px) 440px, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
            {character.shortDescription}
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h2 className="text-[24px] font-semibold leading-none tracking-tight text-white drop-shadow">
              {character.name}
            </h2>
            <span className="rounded-full bg-white/25 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {character.age}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[14px] font-medium text-[color:var(--text-secondary)]">
          Start the conversation
        </span>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--cta-bg)] text-white transition group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </Link>
  );
}
