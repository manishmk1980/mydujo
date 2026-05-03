import { Building2, Handshake, Network, ShieldCheck, UsersRound } from "lucide-react";

const principles = [
  {
    icon: UsersRound,
    title: "Diversity as Strength",
    text: "MyDojo respects different martial arts styles, instructors, centers, and regional identities while creating a unified operating layer.",
  },
  {
    icon: ShieldCheck,
    title: "Shared Principles",
    text: "The platform encourages common standards of discipline, quality, transparency, and student safety without erasing specific traditions.",
  },
  {
    icon: Handshake,
    title: "Collaboration Over Conflict",
    text: "The goal is to reduce segment friction and create a cooperative framework where serious contributors can grow together.",
  },
  {
    icon: Building2,
    title: "Institutional Alignment",
    text: "MyDojo is designed to remain compatible with tournament bodies, councils, academy structures, and future governance needs.",
  },
];

const bridgeItems = ["Styles", "Instructors", "Centers", "Students", "Events", "Stakeholders"];

export default function PublicHarmonization() {
  return (
    <section
      id="harmonization"
      className="public-theme-section relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(255,75,11,0.10),transparent_32%)] dark:bg-[radial-gradient(circle_at_18%_25%,rgba(255,75,11,0.18),transparent_32%)]" />

      <div className="relative mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
            <span className="h-px w-10 bg-orange-600" />
            Harmonization, Not Rivalry
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            Different styles.
            <span className="block text-orange-600">One shared future.</span>
          </h2>

          <p className="public-theme-muted mt-6 max-w-3xl text-lg font-medium leading-8">
            MyDojo is not built to replace traditions. It is built to organize the ecosystem around shared visibility, structured growth, and collaborative progress.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {principles.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="public-theme-surface min-w-0 rounded-[2rem] border p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25">
                  <Icon size={26} strokeWidth={2.5} />
                </div>

                <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">{title}</h3>
                <p className="public-theme-muted mt-4 break-words leading-7">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="public-theme-surface min-w-0 rounded-[2rem] border p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25">
            <Network size={30} strokeWidth={2.6} />
          </div>

          <h3 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,4.5rem)] leading-tight text-slate-950 dark:text-white">
            Bridge the
            <span className="block text-orange-600">ecosystem</span>
          </h3>

          <p className="public-theme-muted mt-6 leading-8">
            MyDojo creates a bridge between people, practices, institutions, and opportunities — helping the ecosystem move together without forcing uniformity.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {bridgeItems.map((item) => (
              <div
                key={item}
                className="public-theme-surface flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-xs font-black sm:px-4 sm:py-4 sm:text-sm"
              >
                <ShieldCheck size={17} className="shrink-0 text-orange-600" />
                <span className="min-w-0 whitespace-normal break-words">{item}</span>
              </div>
            ))}
          </div>

          <div className="public-theme-surface mt-8 rounded-2xl border p-5">
            <div className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-orange-600">
              Guiding Idea
            </div>
            <p className="text-base font-black leading-7 text-slate-950 dark:text-white">
              Collaboration is stronger than fragmentation when backed by structure, visibility, and shared accountability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
