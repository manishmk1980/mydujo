import { AlertTriangle, Compass, Handshake, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: AlertTriangle,
    title: "Disconnected Efforts",
    text: "Talent, instructors, academies, and supporters often work in separate pockets. This limits visibility, collaboration, and scalable growth.",
  },
  {
    icon: Compass,
    title: "Unclear Student Pathways",
    text: "Students need transparent routes for training, grading, events, recognition, career exposure, and long-term progression.",
  },
  {
    icon: ShieldAlert,
    title: "Instructor Vulnerability",
    text: "Independent instructors often lack institutional identity, welfare support, structured visibility, and a stronger collective platform.",
  },
  {
    icon: Handshake,
    title: "Unchannelled Support",
    text: "Supporters, corporates, investors, and sports stakeholders need a credible system through which they can contribute with confidence.",
  },
];

export default function PublicFragmentedReality() {
  return (
    <section id="fragmented-reality" className="relative overflow-hidden bg-slate-50 py-14 transition-colors duration-500 dark:bg-slate-900 md:py-24 lg:py-28">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.035] dark:opacity-[0.055]">
        <span className="mydojo-display text-[14vw] leading-none text-slate-950 dark:text-white">
          REALITY
        </span>
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mb-10 max-w-4xl md:mb-14 lg:mb-16">
          <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
            <span className="h-px w-10 bg-orange-600" />
            The Fragmented Reality
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            Talent exists.
            <span className="block text-orange-600">Structure is missing.</span>
          </h2>

          <p className="mt-7 max-w-3xl text-lg font-medium leading-8 text-slate-700 dark:text-white/70">
            MyDojo begins with a simple truth: the ecosystem has passion, skill, and intent,
            but it needs a unified digital and institutional framework to grow with clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {problems.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group min-w-0 rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-950/10 dark:border-white/10 dark:bg-white/[0.06] sm:p-7"
            >
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                <Icon size={26} strokeWidth={2.5} />
              </div>

              <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
                {title}
              </h3>

              <p className="mt-4 break-words leading-7 text-slate-600 dark:text-white/65">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
