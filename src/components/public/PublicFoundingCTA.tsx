import { ArrowRight, Handshake, Lightbulb, ShieldCheck, Trophy } from "lucide-react";

const cards = [
  {
    icon: Lightbulb,
    title: "The Opportunity",
    text: "Participate at the true founding stage of a transformative, quality-driven national sports movement.",
  },
  {
    icon: ShieldCheck,
    title: "The Impact",
    text: "Help create a stronger, safer, and more uniformly governed legacy for students, instructors, and academies.",
  },
  {
    icon: Handshake,
    title: "Your Role",
    text: "Join as a founding instructor, advisor, academy partner, institutional supporter, investor, or corporate sponsor.",
  },
  {
    icon: Trophy,
    title: "The Next Step",
    text: "Collaborate with MyDojo Private Limited to build a credible sports ecosystem with long-term national potential.",
  },
];

export default function PublicFoundingCTA() {
  return (
    <section
      id="founding-movement"
      className="public-theme-section relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,75,11,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(255,75,11,0.22),transparent_34%)]" />

      <div className="relative mx-auto min-w-0 max-w-7xl">
        <div className="mx-auto min-w-0 max-w-4xl text-center">
          <div className="mb-6 flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
            <span className="h-px w-10 bg-orange-600" />
            Final Call
            <span className="h-px w-10 bg-orange-600" />
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            Shape the future
            <span className="block text-orange-600">of the sport</span>
          </h2>

          <p className="public-theme-muted mx-auto mt-7 max-w-3xl text-lg font-medium leading-8">
            MyDojo is being built as a credible, unified, and growth-oriented platform for the next generation of martial arts development. The founding stage is the time to shape its direction, standards, network, and impact.
          </p>

          <div className="mt-8 flex w-full min-w-0 flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
            <a
              href="/join-mydojo"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-1 hover:bg-orange-700 sm:w-auto sm:px-9 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              Join MyDojo
              <ArrowRight className="ml-2 shrink-0 sm:ml-3" size={18} strokeWidth={3} />
            </a>

            <a
              href="#unification"
              className="public-theme-surface inline-flex w-full min-w-0 items-center justify-center rounded-2xl border px-6 py-4 text-xs font-black uppercase tracking-[0.14em] transition hover:-translate-y-1 hover:border-orange-500 hover:text-orange-600 sm:w-auto sm:px-9 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              Explore Vision
            </a>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="public-theme-surface min-w-0 rounded-[2rem] border p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 sm:p-7"
            >
              <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25">
                <Icon size={26} strokeWidth={2.5} />
              </div>

              <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{title}</h3>
              <p className="public-theme-muted mt-4 break-words leading-7">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 min-w-0 rounded-[2rem] bg-orange-600 p-6 text-white shadow-2xl shadow-orange-600/25 sm:mt-14 sm:p-8 lg:flex lg:items-center lg:justify-between lg:p-12">
          <div>
            <div className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-white/70">
              Founding Stage Invitation
            </div>

            <h3 className="max-w-3xl break-words text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
              Build with us before the ecosystem becomes mainstream.
            </h3>

            <p className="mt-5 max-w-3xl leading-8 text-white/82">
              Whether you are an instructor, academy owner, supporter, corporate partner, investor, advisor, or sports stakeholder — this is the stage where your role can help define the structure.
            </p>
          </div>

          <a
            href="/join-mydojo"
            className="mt-6 inline-flex w-full min-w-0 items-center justify-center rounded-2xl bg-white px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-orange-600 transition hover:-translate-y-1 hover:bg-slate-100 sm:mt-8 sm:w-auto sm:px-8 sm:py-5 sm:text-sm sm:tracking-[0.18em] lg:mt-0"
          >
            Start Here
            <ArrowRight className="ml-2 shrink-0 sm:ml-3" size={18} strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
