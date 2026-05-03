import { Building2, MapPin, Users, Target, Globe, BarChart, PieChart, FileText, Calendar, UserCheck, Shield } from "lucide-react";

const academyTypes = [
  {
    icon: Building2,
    title: "Established academies",
    description: "Well‑known centers with multiple instructors, looking to digitize operations and increase visibility.",
  },
  {
    icon: MapPin,
    title: "Independent training centers",
    description: "Single‑location schools seeking a credible platform to attract students and coordinate events.",
  },
  {
    icon: Users,
    title: "Multi‑branch academies",
    description: "Academies operating across multiple cities, needing unified management and reporting.",
  },
  {
    icon: Target,
    title: "Discipline‑specific schools",
    description: "Specialized training centers focused on a single martial art, wanting to join a broader ecosystem.",
  },
  {
    icon: Globe,
    title: "Growing local academies",
    description: "Emerging centers aiming to build reputation and connect with regional/national networks.",
  },
];

const dashboardModules = [
  { icon: Building2, label: "Academy profile", status: "Available" },
  { icon: Users, label: "Students", status: "Planned" },
  { icon: UserCheck, label: "Instructors", status: "Planned" },
  { icon: Calendar, label: "Attendance", status: "Planned" },
  { icon: BarChart, label: "Events", status: "Planned" },
  { icon: PieChart, label: "Evaluations", status: "Roadmap" },
  { icon: FileText, label: "Reports", status: "Roadmap" },
  { icon: Shield, label: "Compliance", status: "Future" },
];

export default function PublicAcademyVisibility() {
  return (
    <section className="public-theme-bg relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute left-0 top-10 hidden select-none text-[14vw] font-black uppercase leading-none text-slate-950/[0.035] dark:text-white/[0.04] lg:block">
        Visibility
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl">
        <div className="mb-12 md:mb-20 lg:mb-24">
          <div className="mb-8 max-w-4xl md:mb-12 lg:mb-14">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
              <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
              <span className="min-w-0">Who This Is For</span>
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              Designed for
              <span className="block text-orange-600">every type of academy</span>
            </h2>

            <p className="public-theme-muted mt-5 max-w-3xl break-words text-base font-medium leading-8 sm:mt-6 sm:text-lg">
              Whether you run a single‑discipline dojo or a multi‑branch network, MyDojo provides the tools to strengthen your digital presence and operational coordination.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {academyTypes.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="public-theme-surface group relative min-w-0 overflow-hidden rounded-[2rem] border p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 sm:p-8"
              >
                <div className="pointer-events-none absolute right-4 top-4 opacity-10 sm:right-6 sm:top-6">
                  <Icon size={80} strokeWidth={1.5} />
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-600/40 sm:mb-8 sm:h-16 sm:w-16">
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="mb-3 break-words text-xl font-black leading-tight text-slate-950 dark:text-white sm:mb-4 sm:text-2xl">{title}</h3>
                <p className="public-theme-muted break-words text-sm leading-relaxed sm:text-base">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-8 max-w-4xl md:mb-12 lg:mb-14">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
              <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
              <span className="min-w-0">Future Academy Dashboard Vision</span>
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              A unified dashboard
              <span className="block text-orange-600">for academy management</span>
            </h2>

            <p className="public-theme-muted mt-5 max-w-3xl break-words text-base font-medium leading-8 sm:mt-6 sm:text-lg">
              This page reflects the public platform direction. Dashboard features will be introduced progressively as the MDPL system matures.
            </p>
          </div>

          <div className="public-theme-surface min-w-0 overflow-hidden rounded-[2.5rem] border p-5 shadow-2xl backdrop-blur-xl sm:p-8 md:p-10">
            <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-4 md:grid-cols-4 md:gap-6">
              {dashboardModules.map(({ icon: Icon, label, status }) => (
                <div
                  key={label}
                  className="group flex min-w-0 flex-col items-center rounded-2xl border border-slate-200/60 bg-white/50 p-4 text-center transition hover:border-orange-500/60 hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 sm:p-6"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 text-orange-600 sm:mb-4 sm:h-14 sm:w-14">
                    <Icon size={26} strokeWidth={2} />
                  </div>
                  <h4 className="mb-2 min-w-0 break-words text-base font-black text-slate-950 dark:text-white sm:text-lg">{label}</h4>
                  <span
                    className={`inline-block max-w-full whitespace-normal break-words rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide sm:px-3 sm:text-xs sm:tracking-wider ${
                      status === "Available"
                        ? "bg-green-500/20 text-green-700 dark:text-green-400"
                        : status === "Planned"
                          ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                          : status === "Roadmap"
                            ? "bg-purple-500/20 text-purple-700 dark:text-purple-400"
                            : "bg-slate-500/20 text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-600/10 to-transparent p-5 sm:p-8">
              <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Progressive feature rollout</h3>
              <p className="public-theme-muted mt-2 max-w-3xl break-words text-sm leading-relaxed sm:mt-3 sm:text-base">
                The dashboard vision is part of MDPL’s long‑term commitment to providing academies with powerful, intuitive tools. Features will be released based on ecosystem readiness and academy feedback.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
