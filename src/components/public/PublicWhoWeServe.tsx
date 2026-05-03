import { ArrowRight, Building2, GraduationCap, Handshake, ShieldCheck, UsersRound } from "lucide-react";

const audiences = [
  {
    icon: GraduationCap,
    title: "Students",
    subtitle: "Structured development pathways",
    text: "Students get a clearer journey for learning, discipline, grading, recognition, events, career exposure, and long-term growth.",
    points: ["Training pathway", "Progress visibility", "Events & recognition"],
    href: "/join-mydojo",
  },
  {
    icon: UsersRound,
    title: "Instructors",
    subtitle: "Identity, visibility, and support",
    text: "Instructors gain a stronger institutional presence, better student visibility, structured coordination, and a pathway for long-term welfare.",
    points: ["Instructor identity", "Center coordination", "Student tracking"],
    href: "/instructors",
  },
  {
    icon: Handshake,
    title: "Stakeholders",
    subtitle: "Credible participation vehicle",
    text: "Supporters, corporates, sports bodies, investors, fundraisers, and strategic partners get a credible platform to support the ecosystem at scale.",
    points: ["Governed participation", "Strategic collaboration", "National impact"],
    href: "/about",
  },
];

export default function PublicWhoWeServe() {
  return (
    <section id="who-we-serve" className="relative overflow-hidden bg-[#f4eee9] py-14 transition-colors duration-500 dark:bg-[#0b101b] md:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.12),transparent_32%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.18),transparent_34%)]" />

      <div className="pointer-events-none absolute right-8 top-10 hidden select-none text-[13vw] font-black uppercase leading-none text-slate-950/[0.04] dark:text-white/[0.05] lg:block">
        SERVE
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-14 md:gap-10 lg:mb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              <span className="h-px w-10 bg-orange-600" />
              Whom MyDojo Serves
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              One platform.
              <span className="block text-orange-600">Many roles.</span>
              <span className="block">Shared growth.</span>
            </h2>
          </div>

          <p className="text-lg font-medium leading-8 text-slate-700 dark:text-white/70">
            MyDojo is built for the full ecosystem — not just students or academies alone. It connects every important participant into one structured growth framework.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {audiences.map(({ icon: Icon, title, subtitle, text, points, href }, index) => (
            <a
              key={title}
              href={href}
              className={`group relative min-w-0 overflow-hidden rounded-[2rem] border p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-2xl sm:p-7 ${
                index === 1
                  ? "border-orange-500/50 bg-orange-600 text-white shadow-orange-600/25"
                  : "border-slate-200 bg-white/80 text-slate-950 hover:border-orange-500/60 dark:border-white/10 dark:bg-white/[0.06] dark:text-white"
              }`}
            >
              <div className="absolute right-6 top-6 opacity-10">
                <Icon size={110} strokeWidth={1.5} />
              </div>

              <div
                className={`mb-8 flex h-16 w-16 items-center justify-center rounded-2xl ${
                  index === 1
                    ? "bg-white text-orange-600"
                    : "bg-orange-600 text-white shadow-lg shadow-orange-600/30"
                }`}
              >
                <Icon size={30} strokeWidth={2.5} />
              </div>

              <div className={`text-xs font-black uppercase tracking-[0.24em] ${index === 1 ? "text-white/70" : "text-orange-600"}`}>
                {subtitle}
              </div>

              <h3 className="mt-3 break-words text-2xl font-black sm:text-3xl">
                {title}
              </h3>

              <p className={`mt-4 break-words leading-8 sm:mt-5 ${index === 1 ? "text-white/82" : "text-slate-600 dark:text-white/65"}`}>
                {text}
              </p>

              <div className="mt-6 grid gap-2 sm:mt-7 sm:gap-3">
                {points.map((point) => (
                  <div key={point} className={`flex min-w-0 items-start gap-3 text-sm font-bold ${index === 1 ? "text-white/85" : "text-slate-700 dark:text-white/70"}`}>
                    <ShieldCheck size={17} className={`mt-0.5 shrink-0 ${index === 1 ? "text-white" : "text-orange-600"}`} />
                    <span className="min-w-0 break-words">{point}</span>
                  </div>
                ))}
              </div>

              <div className={`mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] ${index === 1 ? "text-white" : "text-orange-600"}`}>
                Explore Role
                <ArrowRight size={18} strokeWidth={3} className="transition group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white/75 p-7 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
              <Building2 size={30} strokeWidth={2.5} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-950 dark:text-white">
                Built for academies, councils, centers, and future institutional collaboration.
              </h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-white/65">
                As the platform grows, MyDojo can support academy-level coordination, regional representation, stakeholder participation, and structured community communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
