import Link from "next/link";
import { characters } from "@/lib/characters";

export default function HomePage() {
  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-thin px-5 pb-8 pt-3">
      <header className="mb-6 px-1">
        <p className="text-[11px] uppercase tracking-[0.32em] text-accent-400">
          Small Talk Simulator
        </p>
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight">
          Pick someone to<br />practice with today
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Realistic scenarios. Branching video or a text / voice chat with interest tracking.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/character/${c.id}`}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition active:scale-[0.98]"
          >
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.gradient} opacity-70`}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            <div className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between">
                <span className="text-5xl drop-shadow-lg">{c.avatar}</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white backdrop-blur">
                  {c.age} yrs
                </span>
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold">{c.name}</h2>
                <p className="mt-0.5 text-sm text-white/85">{c.shortDescription}</p>
              </div>
              <p className="mt-4 line-clamp-2 text-[13px] leading-relaxed text-white/80">
                {c.location}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm font-medium">
                <span className="text-white/90">Start the conversation</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur transition group-hover:bg-white/30 group-hover:translate-x-0.5">
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-auto pt-8 px-1 text-center text-[11px] text-slate-500">
        Powered by Google Gemini
      </div>
    </div>
  );
}
