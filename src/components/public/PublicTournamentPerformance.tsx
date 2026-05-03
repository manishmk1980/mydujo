import { Target, Users, Shield } from "lucide-react";

const stats = [
  {
    label: "Multi‑Discipline",
    value: "Coverage Vision",
    icon: Target,
    color: "text-orange-500",
    bg: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    label: "Role‑Based Platform",
    value: "Student + Instructor + Admin",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    label: "Transparent Progression",
    value: "Attendance & Evaluation Records",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

const roadmap = [
  {
    year: "2026",
    initiative: "Public Website Revamp",
    focus: "Brand & ecosystem foundation",
    status: "In Progress",
    statusColor: "bg-orange-500",
  },
  {
    year: "2026",
    initiative: "Academy Profiles",
    focus: "Verified academy visibility",
    status: "Planned",
    statusColor: "bg-slate-300 dark:bg-slate-700",
  },
  {
    year: "2026",
    initiative: "Instructor Profiles",
    focus: "Instructor‑led credibility",
    status: "Planned",
    statusColor: "bg-slate-300 dark:bg-slate-700",
  },
  {
    year: "2026",
    initiative: "Student Progression",
    focus: "Attendance, evaluation, discipline records",
    status: "Planned",
    statusColor: "bg-slate-300 dark:bg-slate-700",
  },
  {
    year: "2026",
    initiative: "Events & Recognition",
    focus: "Participation and visibility framework",
    status: "Planned",
    statusColor: "bg-slate-300 dark:bg-slate-700",
  },
];

export default function PublicTournamentPerformance() {
  return (
    <section className="public-theme-section py-14 md:py-24 lg:py-32">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-5">
        <div className="mb-10 md:mb-14 lg:mb-16">
          <div className="mb-3 inline-block max-w-full rounded-full bg-orange-100 px-3 py-1.5 text-[9px] font-black uppercase leading-snug tracking-[0.22em] text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 sm:px-4 sm:text-[10px] sm:tracking-[0.3em]">
            ECOSYSTEM MILESTONES
          </div>

          <div className="flex flex-col justify-between gap-8 md:gap-12 lg:flex-row">
            <div className="min-w-0 max-w-2xl">
              <h2 className="mb-4 min-w-0 max-w-full break-words font-display text-[clamp(2.1rem,11vw,5rem)] font-black italic leading-[0.95] tracking-tight text-slate-900 dark:text-white md:mb-6">
                <span className="text-slate-900 dark:text-white">PLATFORM</span>
                <br />
                <span className="text-slate-500 dark:text-slate-400">MILESTONES</span>
              </h2>
              <p className="break-words text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
                MDPL is building the foundation for transparent academy participation, student progression, event visibility, and structured recognition.
              </p>
            </div>

            <div className="flex min-w-0 flex-col gap-4 md:gap-6 lg:w-96">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex min-w-0 items-center gap-4 rounded-2xl ${stat.bg} p-5 sm:gap-5 sm:p-6`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-14 sm:w-14 ${stat.bg} ${stat.color}`}
                    >
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <div className="break-words text-lg font-black tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                        {stat.label}
                      </div>
                      <div className="mt-0.5 break-words text-xs font-medium leading-snug text-slate-600 dark:text-slate-300 sm:text-sm">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile milestone cards */}
        <div className="grid gap-4 md:hidden">
          {roadmap.map((row, idx) => (
            <div
              key={idx}
              className="min-w-0 rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-md dark:border-white/10 dark:bg-white/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 gap-y-3">
                <div className="text-2xl font-black italic text-slate-900 dark:text-white">{row.year}</div>
                <span
                  className={`inline-flex max-w-full shrink-0 whitespace-normal break-words rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white sm:px-4 sm:text-xs sm:tracking-widest ${row.statusColor}`}
                >
                  {row.status}
                </span>
              </div>
              <h3 className="mt-3 break-words text-lg font-bold text-slate-900 dark:text-white">{row.initiative}</h3>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300">{row.focus}</p>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60 shadow-xl dark:border-white/10 dark:bg-white/5 md:block">
          <div className="grid grid-cols-12 border-b border-slate-200/80 bg-slate-50/80 px-6 py-4 dark:border-white/10 dark:bg-slate-900/30 lg:px-8 lg:py-5">
            <div className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white lg:col-span-3 lg:text-sm">
              YEAR
            </div>
            <div className="col-span-4 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white lg:text-sm">
              INITIATIVE
            </div>
            <div className="col-span-4 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white lg:text-sm">
              FOCUS
            </div>
            <div className="col-span-2 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white lg:text-sm">
              STATUS
            </div>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-white/10">
            {roadmap.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 items-start gap-3 px-6 py-5 transition hover:bg-slate-50/50 lg:items-center lg:gap-4 lg:px-8 lg:py-6 dark:hover:bg-white/5"
              >
                <div className="col-span-2 lg:col-span-3">
                  <div className="text-2xl font-black italic text-slate-900 dark:text-white lg:text-3xl">{row.year}</div>
                </div>
                <div className="col-span-4 min-w-0">
                  <div className="break-words text-base font-bold text-slate-900 dark:text-white lg:text-lg">
                    {row.initiative}
                  </div>
                </div>
                <div className="col-span-4 min-w-0">
                  <div className="break-words text-xs text-slate-600 dark:text-slate-300 lg:text-sm">{row.focus}</div>
                </div>
                <div className="col-span-2 min-w-0">
                  <span
                    className={`inline-block max-w-full whitespace-normal break-words rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white lg:px-4 lg:text-xs lg:tracking-widest ${row.statusColor}`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400 sm:mt-8 sm:text-sm">
          <p className="mx-auto max-w-3xl break-words px-1">
            This roadmap reflects our commitment to a transparent, role‑based ecosystem—no artificial medals, only measurable progress.
          </p>
        </div>
      </div>
    </section>
  );
}
