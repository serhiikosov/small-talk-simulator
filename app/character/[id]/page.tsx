import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import FormatSelector from "@/components/FormatSelector";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string }>;
};

export default async function CharacterPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { format } = await searchParams;
  const character = getCharacter(id);
  if (!character) notFound();

  const selectedFormat: "interactive" | "text-voice" =
    format === "text-voice" ? "text-voice" : "interactive";

  return (
    <div className="flex h-full flex-col">
      {/* Translucent floating back button — sits on top of the portrait */}
      <div className="absolute left-4 top-12 z-20 sm:top-14">
        <Link
          href="/"
          aria-label="Back"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-lg text-white backdrop-blur transition hover:bg-black/60 active:scale-95"
        >
          ←
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin pb-32">
        {/* Hero portrait with cinematic name overlay */}
        <div className="relative">
          <div className="relative aspect-[4/5] w-full overflow-hidden">
            <Image
              src={character.portrait}
              alt={character.name}
              fill
              priority
              sizes="(min-width: 640px) 440px, 100vw"
              className="object-cover"
            />
            {/* Top fade so the back button stays readable */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
            {/* Bottom fade for the name caption */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/70">
              {character.shortDescription}
            </p>
            <div className="mt-1 flex items-baseline gap-3">
              <h1 className="font-serif text-[44px] font-medium leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {character.name}
              </h1>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                {character.age} yrs
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pt-6">
          {/* Format toggle — secondary choice */}
          <FormatSelector characterId={character.id} selected={selectedFormat} />

          {/* The scene — primary context */}
          <section className="mt-6">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-accent-400">
              <span>🎬</span> The scene
            </p>
            <p className="font-serif text-[16px] leading-[1.55] text-slate-100">
              {character.situation}
            </p>
          </section>

          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
              ready when you are
            </span>
            <span className="inline-flex h-px flex-1 bg-white/10" />
          </div>
        </div>
      </div>

      {/* Sticky Start CTA */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent px-5 pb-7 pt-10 sm:pb-9">
        <Link
          href={`/simulation/${character.id}/${selectedFormat}`}
          className="pointer-events-auto flex items-center justify-center gap-2 rounded-full bg-accent-500 px-8 py-4 text-base font-semibold text-white shadow-[0_10px_40px_-10px_rgba(139,92,246,0.7)] transition active:scale-[0.98] hover:bg-accent-400"
        >
          Start
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3.5v17l14-8.5-14-8.5Z" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
