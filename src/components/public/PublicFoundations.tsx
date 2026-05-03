import { Gem, HandHeart, Layers3, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    text: "A transparent framework where participation, recognition, and growth are built on trust.",
  },
  {
    icon: Sparkles,
    title: "Discipline",
    text: "A culture of consistency, respect, effort, and measurable progress across every level.",
  },
  {
    icon: Gem,
    title: "Quality",
    text: "Structured standards for training, governance, digital records, and institutional credibility.",
  },
  {
    icon: UsersRound,
    title: "Unity",
    text: "Bringing students, instructors, centers, supporters, and stakeholders under one shared direction.",
  },
  {
    icon: HandHeart,
    title: "Growth with Welfare",
    text: "A model where expansion also supports instructor security, student development, and ecosystem wellbeing.",
  },
  {
    icon: Layers3,
    title: "Inclusiveness",
    text: "Respecting different styles, regions, backgrounds, and roles while building a common platform.",
  },
];

export default function PublicFoundations() {
  return (
    <section id="foundations" className="relative overflow-hidden bg-slate-50 py-14 transition-colors duration-500 dark:bg-slate-900 md:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.055]">
        <span className="mydojo-display text-[13vw] leading-none text-slate-950 dark:text-white">
          FOUNDATION
        </span>
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-14 md:gap-10 lg:mb-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              <span className="h-px w-10 bg-orange-600" />
              Built on Strong Foundations
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              Mission, vision,
              <span className="block text-orange-600">and values</span>
            </h2>
          </div>

          <p className="text-lg font-medium leading-8 text-slate-700 dark:text-white/70">
            MyDojo is designed as more than a digital product. It is a disciplined institutional foundation for organizing, strengthening, and expanding the ecosystem with credibility.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              Mission
            </div>
            <h3 className="text-3xl font-black leading-tight text-slate-950 dark:text-white">
              Organize, strengthen, and expand the movement.
            </h3>
            <p className="mt-5 leading-8 text-slate-600 dark:text-white/65">
              To organize, strengthen, and expand martial arts development through digital systems, governance structures, collaboration, and long-term ecosystem growth.
            </p>
          </div>

          <div className="rounded-[2rem] border border-orange-500/40 bg-orange-600 p-8 text-white shadow-2xl shadow-orange-600/25">
            <div className="mb-6 text-xs font-black uppercase tracking-[0.28em] text-white/70">
              Vision
            </div>
            <h3 className="text-3xl font-black leading-tight">
              Build a trusted, unified, growth-oriented platform.
            </h3>
            <p className="mt-5 leading-8 text-white/80">
              To build one of India’s most trusted and unified platforms for disciplined martial arts growth, creating national and international impact through structure and inclusion.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-[2rem] border border-slate-200 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 dark:border-white/10 dark:bg-white/[0.06]"
            >
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-600">
                <Icon size={26} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                {title}
              </h3>

              <p className="mt-4 leading-7 text-slate-600 dark:text-white/65">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
