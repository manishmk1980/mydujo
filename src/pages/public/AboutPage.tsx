import { ArrowRight, Eye, Gem, HandHeart, Landmark, Layers3, ShieldCheck, Sparkles, Target, UsersRound } from "lucide-react";

import PublicLayout from "../../components/public/PublicLayout";

const values = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    text: "A transparent framework where trust, recognition, and participation are protected.",
  },
  {
    icon: Sparkles,
    title: "Discipline",
    text: "A culture of consistency, effort, respect, and measurable progress.",
  },
  {
    icon: Gem,
    title: "Quality",
    text: "Standards for training, records, governance, and institutional credibility.",
  },
  {
    icon: UsersRound,
    title: "Unity",
    text: "Bringing students, instructors, academies, supporters, and stakeholders together.",
  },
  {
    icon: HandHeart,
    title: "Growth with Welfare",
    text: "Expansion that also supports instructor welfare, student development, and ecosystem wellbeing.",
  },
  {
    icon: Layers3,
    title: "Inclusiveness",
    text: "Respecting different styles, regions, identities, and roles while building one common platform.",
  },
];

const timeline = [
  {
    year: "Origin",
    title: "A fragmented ecosystem",
    text: "Passion and talent exist across the country, but efforts often remain disconnected and under-recognized.",
  },
  {
    year: "Vision",
    title: "A unified framework",
    text: "MDPL / MyDojo is created to organize students, instructors, academies, and stakeholders into a structured ecosystem.",
  },
  {
    year: "Phase 1",
    title: "Digital foundation",
    text: "The initial phase focuses on website, platform, enrollment, instructor integration, data structure, and regional coordination.",
  },
  {
    year: "Future",
    title: "National-scale growth",
    text: "The long-term direction is a credible, governed, transparent, and growth-oriented sports ecosystem.",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 pb-14 pt-10 sm:px-5 md:pb-24 md:pt-16 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(234,88,12,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_18%_22%,rgba(234,88,12,0.22),transparent_34%)]" />
        <div className="pointer-events-none absolute right-8 top-28 hidden select-none text-[15vw] font-black uppercase leading-none text-slate-950/[0.04] dark:text-white/[0.05] lg:block">
          ABOUT
        </div>

        <div className="relative mx-auto min-w-0 max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase leading-snug tracking-[0.28em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs">
            <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
            <span className="min-w-0">About MyDojo</span>
          </div>

          <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
            <div className="min-w-0">
              <h1 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.8rem,12vw,5.5rem)] leading-[0.95] text-slate-950 dark:text-white">
                The digital backbone
                <span className="block text-orange-600">for disciplined</span>
                sports growth
              </h1>

              <p className="mt-6 max-w-3xl break-words text-base font-medium leading-8 text-slate-700 dark:text-white/72 sm:mt-8 sm:text-lg">
                MyDojo by MDPL is a unified sports ecosystem designed to connect students, instructors, academies, supporters, and strategic stakeholders through one credible, transparent, and growth-oriented framework.
              </p>

              <div className="mt-8 flex w-full min-w-0 flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                <a
                  href="/join-mydojo"
                  className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-1 hover:bg-orange-700 sm:w-auto sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
                >
                  Join MyDojo
                  <ArrowRight className="ml-2 shrink-0 sm:ml-3" size={18} strokeWidth={3} />
                </a>

                <a
                  href="/academy"
                  className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl border border-slate-300 bg-white/70 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500 hover:text-orange-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:w-auto sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
                >
                  Explore Academy
                </a>
              </div>
            </div>

            <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-2xl shadow-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 sm:mb-8 sm:h-16 sm:w-16">
                <Landmark size={32} strokeWidth={2.5} />
              </div>

              <h2 className="break-words text-2xl font-black leading-tight text-slate-950 dark:text-white sm:text-3xl">
                Why MyDojo exists
              </h2>

              <p className="mt-4 break-words leading-8 text-slate-600 dark:text-white/65 sm:mt-5">
                The ecosystem has talent, passion, and dedication, but it needs structure, visibility, coordination, welfare, and institutional credibility. MyDojo exists to bridge that gap.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4">
                {["Unified digital identity", "Structured student pathways", "Instructor visibility and welfare", "Stakeholder-ready governance"].map((item) => (
                  <div
                    key={item}
                    className="flex min-w-0 items-start gap-3 rounded-2xl bg-slate-50 p-3.5 text-sm font-bold text-slate-800 dark:bg-slate-950/50 dark:text-white/80 sm:p-4 sm:text-base"
                  >
                    <ShieldCheck size={18} className="mt-0.5 shrink-0 text-orange-600" />
                    <span className="min-w-0 break-words">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-theme-section px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white sm:h-14 sm:w-14">
              <Target size={26} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:text-xs sm:tracking-[0.28em]">
              Mission
            </div>
            <h2 className="mt-3 break-words text-2xl font-black leading-tight text-slate-950 dark:text-white sm:mt-4 sm:text-3xl">
              Organize, strengthen, and expand the movement.
            </h2>
            <p className="mt-4 break-words leading-8 text-slate-600 dark:text-white/65 sm:mt-5">
              To organize, strengthen, and expand martial arts development through digital systems, governance structures, collaboration, and long-term ecosystem growth.
            </p>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-orange-500/40 bg-orange-600 p-6 text-white shadow-2xl shadow-orange-600/25 sm:p-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-600 sm:h-14 sm:w-14">
              <Eye size={26} />
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70 sm:text-xs sm:tracking-[0.28em]">
              Vision
            </div>
            <h2 className="mt-3 break-words text-2xl font-black leading-tight sm:mt-4 sm:text-3xl">
              Build a trusted, unified, growth-oriented platform.
            </h2>
            <p className="mt-4 break-words leading-8 text-white/82 sm:mt-5">
              To build one of India’s most trusted and unified platforms for disciplined martial arts growth, creating national and international impact through structure and inclusion.
            </p>
          </div>
        </div>
      </section>

      <section className="public-theme-section px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto min-w-0 max-w-7xl">
          <div className="mb-8 max-w-3xl md:mb-12 lg:mb-14">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
              <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
              <span className="min-w-0">Core Values</span>
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              Principles that guide the platform
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="min-w-0 rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 dark:border-white/10 dark:bg-white/[0.06] sm:p-7"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600/10 text-orange-600 sm:mb-7 sm:h-14 sm:w-14">
                  <Icon size={26} strokeWidth={2.5} />
                </div>
                <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{title}</h3>
                <p className="mt-3 break-words leading-7 text-slate-600 dark:text-white/65 sm:mt-4">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-theme-section px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto min-w-0 max-w-7xl">
          <div className="mb-8 max-w-3xl md:mb-12 lg:mb-14">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
              <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
              <span className="min-w-0">History & Direction</span>
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              From scattered effort to structured growth
            </h2>
          </div>

          <div className="grid gap-4 sm:gap-5 md:gap-6">
            {timeline.map((item) => (
              <div
                key={item.title}
                className="grid min-w-0 grid-cols-1 gap-4 rounded-[2rem] border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:p-7 md:grid-cols-[minmax(0,7rem)_1fr] md:items-center md:gap-6 lg:grid-cols-[minmax(0,10rem)_1fr]"
              >
                <div className="break-words text-2xl font-black text-orange-600 sm:text-3xl">{item.year}</div>
                <div className="min-w-0">
                  <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{item.title}</h3>
                  <p className="mt-2 break-words leading-7 text-slate-600 dark:text-white/65 sm:mt-3">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-theme-section px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto min-w-0 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-950/25 dark:bg-white/[0.06] dark:shadow-black/40 sm:gap-8 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-12">
            <div className="min-w-0">
              <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-orange-500 sm:mb-5 sm:text-xs sm:tracking-[0.28em]">
                Governance Philosophy
              </div>
              <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight">
                Structure without erasing tradition
              </h2>
              <p className="mt-5 max-w-3xl break-words text-base font-medium leading-8 text-white/70 sm:mt-6 sm:text-lg">
                MyDojo is designed to respect different martial arts styles and regional identities while creating a shared digital and institutional framework for transparency, quality, coordination, and future governance.
              </p>
            </div>

            <a
              href="/join-mydojo"
              className="inline-flex w-full min-w-0 shrink-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-1 hover:bg-orange-700 sm:w-auto sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              Join the Movement
              <ArrowRight className="ml-2 shrink-0 sm:ml-3" size={18} strokeWidth={3} />
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
