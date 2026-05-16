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
      <div className="flex items-center justify-between px-5 pt-3 pb-2">
        <Link
          href="/"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white/90 transition hover:bg-white/15 active:scale-95"
          aria-label="Назад"
        >
          ←
        </Link>
        <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400">
          Профіль
        </span>
        <span className="w-9" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-32">
        <FormatSelector characterId={character.id} selected={selectedFormat} />

        <section
          className={`mt-5 overflow-hidden rounded-3xl bg-gradient-to-br ${character.gradient} p-6`}
        >
          <div className="flex items-center gap-4">
            <span className="text-6xl drop-shadow-lg">{character.avatar}</span>
            <div>
              <h1 className="text-2xl font-semibold leading-tight">
                {character.name}, {character.age}
              </h1>
              <p className="text-sm text-white/85">{character.shortDescription}</p>
            </div>
          </div>
        </section>

        <section className="mt-5 space-y-4">
          <InfoBlock label="Локація" icon="📍">{character.location}</InfoBlock>
          <InfoBlock label="Ситуація" icon="🎬">{character.situation}</InfoBlock>
          <InfoBlock label="Про персонажа" icon="👤">
            {character.fullDescription}
          </InfoBlock>
        </section>
      </div>

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

function InfoBlock({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
      <h2 className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-accent-400">
        <span>{icon}</span> {label}
      </h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-slate-200">{children}</p>
    </div>
  );
}
