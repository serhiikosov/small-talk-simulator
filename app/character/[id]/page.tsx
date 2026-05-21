import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();

  return (
    <div className="relative h-full min-h-0 overflow-hidden">
      {/* Background photo — fills the entire tool card */}
      <Image
        src={character.portrait}
        alt={character.name}
        fill
        priority
        sizes="(min-width: 640px) 440px, 100vw"
        className="object-cover"
      />

      {/* Darkening only behind the text area at the bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/95 via-black/85 to-transparent" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Spacer pushes content to the bottom, keeping the portrait visible */}
        <div className="flex-1" />

        {/* Info — text sits directly on the gradient-darkened photo */}
        <div className="flex-shrink-0 px-5 pb-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/85">
            {character.shortDescription}
          </p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <h2 className="text-[30px] font-semibold leading-[1.05] tracking-tight text-white">
              {character.name}
            </h2>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-white">
              {character.age}
            </span>
          </div>

          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/70">
            The scene
          </p>
          <p className="mt-px text-[14.5px] font-medium leading-[1.5] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
            {character.situation}
          </p>
        </div>

        {/* CTA row */}
        <div className="flex-shrink-0 px-3 pb-3 pt-2">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-2xl border border-white/20 bg-white/15 px-4 text-[14px] font-semibold text-white backdrop-blur-xl transition active:scale-[0.97] hover:bg-white/25"
              aria-label="Back"
            >
              ← Back
            </Link>
            <Link
              href={`/simulation/${character.id}/interactive`}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-[15px] font-semibold text-[color:var(--text-primary)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] transition active:scale-[0.98] hover:bg-white/95"
            >
              Start practice
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3.5v17l14-8.5-14-8.5Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
