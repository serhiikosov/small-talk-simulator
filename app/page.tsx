import { characters } from "@/lib/characters";
import CharacterCard from "@/components/CharacterCard";

type Locked = {
  id: string;
  name: string;
  age: number;
  avatar: string;
  scenario: string;
  gradient: string;
};

const LOCKED_CHARACTERS: Locked[] = [
  {
    id: "sarah",
    name: "Sarah",
    age: 35,
    avatar: "💼",
    scenario: "Job interview at a startup",
    gradient: "from-emerald-500/30 via-teal-500/20 to-cyan-500/30",
  },
  {
    id: "tom",
    name: "Tom",
    age: 29,
    avatar: "🍻",
    scenario: "Your ex's new partner at a party",
    gradient: "from-fuchsia-500/30 via-purple-500/20 to-indigo-500/30",
  },
  {
    id: "maya",
    name: "Maya",
    age: 41,
    avatar: "🎓",
    scenario: "Senior researcher at a conference",
    gradient: "from-yellow-500/30 via-amber-500/20 to-orange-500/30",
  },
  {
    id: "daniel",
    name: "Daniel",
    age: 48,
    avatar: "🛋️",
    scenario: "First session with a therapist",
    gradient: "from-slate-400/30 via-zinc-400/20 to-stone-400/30",
  },
];

export default function HomePage() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin px-5 pb-10 pt-3">
      <header className="mb-6 px-1">
        <p className="text-[11px] uppercase tracking-[0.32em] text-accent-400">
          Small Talk Simulator
        </p>
        <h1 className="mt-1.5 font-serif text-[28px] font-medium leading-[1.15] text-white">
          Pick someone to<br />practice with today
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Real scenarios, real feedback. Tap to start.
        </p>
      </header>

      <section className="space-y-4">
        {characters.map((c) => (
          <CharacterCard key={c.id} character={c} />
        ))}
      </section>

      <div className="mb-3 mt-8 flex items-center gap-3 px-1">
        <span className="inline-flex h-px flex-1 bg-white/10" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
          coming soon
        </span>
        <span className="inline-flex h-px flex-1 bg-white/10" />
      </div>

      <section className="space-y-2.5">
        {LOCKED_CHARACTERS.map((c) => (
          <div
            key={c.id}
            aria-disabled
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 opacity-70"
          >
            <div
              className={`relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient}`}
            >
              <span className="text-2xl grayscale-[0.3]">{c.avatar}</span>
              <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-950 bg-slate-800 text-[10px] text-slate-300">
                🔒
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] font-medium text-slate-200">
                  {c.name}
                </span>
                <span className="text-[11px] text-slate-500">{c.age}</span>
              </div>
              <p className="truncate text-[12px] text-slate-400">
                {c.scenario}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              Soon
            </span>
          </div>
        ))}
      </section>

      <div className="mt-8 px-1 text-center text-[10px] text-slate-500">
        Powered by Google Gemini · Veo
      </div>
    </div>
  );
}
