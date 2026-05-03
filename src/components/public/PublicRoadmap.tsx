import { ArrowRight, Database, Globe2, Network, Rocket } from "lucide-react";

const phases = [
  {
    number: "01",
    label: "Phase 01",
    title: "Platform Foundation",
    text: "Stabilize the public website, role-based platform structure, student registration, and basic digital identity flow.",
    icon: Rocket,
  },
  {
    number: "02",
    label: "Phase 02",
    title: "Academy & Instructor Integration",
    text: "Map academies, instructors, disciplines, locations, strengths, and operational responsibilities into one structured system.",
    icon: Network,
  },
  {
    number: "03",
    label: "Phase 03",
    title: "Records & Communication",
    text: "Establish unified digital forms, structured data records, center mapping, student records, and community communication networks.",
    icon: Database,
  },
  {
    number: "04",
    label: "Phase 04",
    title: "Council Activation",
    text: "Create the first coordination layer for state, district, and regional representation as the ecosystem expands.",
    icon: Globe2,
  },
];

export default function PublicRoadmap() {
  return (
    <section
      id="roadmap"
      className="public-theme-section relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28"
    >
      <div className="pointer-events-none absolute left-0 top-10 hidden select-none text-[14vw] font-black uppercase leading-none text-slate-950/[0.035] dark:text-white/[0.04] lg:block">
        Roadmap
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl">
        <div className="mb-8 max-w-4xl md:mb-12 lg:mb-14">
          <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
            <span className="h-px w-10 bg-orange-600" />
            Phase 1 Roadmap
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            The first stage is about
            <span className="block text-orange-600">building the base</span>
          </h2>

          <p className="public-theme-muted mt-6 max-w-3xl text-lg font-medium leading-8">
            Phase 1 focuses on the foundation: digital presence, structured records, academy mapping, instructor alignment, and the first layer of institutional coordination.
          </p>
        </div>

        <div className="grid gap-4 md:gap-6">
          {phases.map(({ number, label, title, text, icon: Icon }) => (
            <div
              key={number}
              className="public-theme-surface relative min-w-0 overflow-hidden rounded-[2rem] border p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 sm:p-8 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-7"
            >
              <div className="mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25 sm:h-16 sm:w-16 md:mb-0">
                <Icon size={30} strokeWidth={2.5} />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:text-xs sm:tracking-[0.28em]">
                  {label}
                </div>

                <h3 className="mt-2 break-words text-2xl font-black text-slate-950 dark:text-white sm:mt-3 sm:text-3xl">
                  {title}
                </h3>

                <p className="public-theme-muted mt-3 max-w-4xl break-words leading-8 sm:mt-4">
                  {text}
                </p>
              </div>

              <div className="pointer-events-none mt-3 text-right text-5xl font-black text-slate-950/[0.05] dark:text-white/[0.06] md:mt-0 md:static md:self-center md:text-7xl">
                {number}
              </div>
            </div>
          ))}
        </div>

        <div className="public-theme-surface mt-8 min-w-0 rounded-[2rem] border p-6 shadow-xl backdrop-blur-xl sm:mt-12 sm:p-8 md:mt-14 lg:flex lg:items-center lg:justify-between lg:p-10">
          <div>
            <div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              Next Movement
            </div>

            <h3 className="max-w-4xl break-words text-2xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl md:text-4xl">
              Phase 1 creates the launchpad for long-term institutional growth.
            </h3>

            <p className="public-theme-muted mt-5 max-w-4xl leading-8">
              Once the digital base and founding network are in place, MyDojo can expand into structured regional representation, deeper stakeholder participation, and stronger academy-level adoption.
            </p>
          </div>

          <a
            href="/join-mydojo"
            className="mt-6 inline-flex w-full min-w-0 shrink-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/25 transition hover:-translate-y-1 hover:bg-orange-700 sm:mt-8 sm:w-auto sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em] lg:mt-0"
          >
            Join Phase 1
            <ArrowRight className="ml-2 shrink-0 sm:ml-3" size={18} strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
