import { Target, Users, Cpu } from "lucide-react";

const roles = [
  {
    title: "Platform Leadership",
    description:
      "Guides the MDPL vision, public platform direction, partnerships, and long‑term ecosystem strategy.",
    icon: Target,
    gradient: "from-orange-500 to-amber-600",
  },
  {
    title: "Academy & Instructor Coordination",
    description:
      "Supports academy onboarding, instructor participation, structured operations, and community alignment.",
    icon: Users,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "Technology & Governance",
    description:
      "Focuses on secure systems, role‑based access, transparent data, and scalable digital infrastructure.",
    icon: Cpu,
    gradient: "from-emerald-500 to-teal-600",
  },
];

export default function PublicManagementTeam() {
  return (
    <section className="public-theme-section py-14 md:py-24 lg:py-32">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-5">
        <div className="mb-10 flex min-w-0 flex-col justify-between gap-8 md:mb-16 md:gap-10 lg:flex-row lg:items-end">
          <div className="min-w-0 max-w-2xl">
            <div className="mb-3 inline-block max-w-full rounded-full bg-orange-100 px-3 py-1.5 text-[9px] font-black uppercase leading-snug tracking-[0.22em] text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 sm:mb-4 sm:px-4 sm:text-[10px] sm:tracking-[0.3em]">
              MYDOJO MANAGEMENT TEAM
            </div>

            <h2 className="mb-4 min-w-0 max-w-full md:mb-6">
              <span className="font-display text-[clamp(2.1rem,9vw,3.25rem)] font-black italic leading-[0.98] tracking-tight text-slate-900 dark:text-white md:hidden">
                Management Team
              </span>
              <span className="hidden font-display text-[clamp(2.1rem,11vw,5rem)] font-black italic leading-[0.95] tracking-tight text-slate-900 dark:text-white md:block">
                <span className="text-slate-900 dark:text-white">MyDojo Management</span>
                <br />
                <span className="text-slate-500 dark:text-slate-400">Team</span>
              </span>
            </h2>
          </div>
          <div className="min-w-0 max-w-xl">
            <p className="break-words text-base leading-relaxed text-slate-700 dark:text-slate-300 md:text-lg">
              Built by a team focused on discipline, transparency, technology, and long‑term growth for the martial arts ecosystem.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.title}
                className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-xl shadow-slate-950/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/20 dark:hover:shadow-black/40 sm:p-8"
              >
                <div
                  className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${role.gradient} opacity-10 blur-3xl transition-opacity group-hover:opacity-20`}
                />

                <div className="relative mb-5 md:mb-6">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} text-white shadow-lg sm:h-16 sm:w-16`}
                  >
                    <Icon size={28} strokeWidth={2} />
                  </div>
                </div>

                <h3 className="mb-3 break-words font-display text-xl font-black italic leading-tight text-slate-900 dark:text-white sm:mb-4 sm:text-2xl">
                  {role.title}
                </h3>

                <p className="mb-6 break-words text-sm text-slate-700 dark:text-slate-300 sm:mb-8 sm:text-base">
                  {role.description}
                </p>

                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600" />
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-4xl md:mt-16 lg:mt-20">
          <div className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-white/60 shadow-xl dark:border-white/10 dark:from-slate-900/30 dark:to-slate-900/10 lg:flex-row">
            <div className="flex items-center justify-center bg-orange-100/50 p-8 dark:bg-orange-900/20 sm:p-10 lg:w-1/3">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-600 text-white shadow-2xl sm:h-24 sm:w-24">
                <Target size={40} strokeWidth={2} />
              </div>
            </div>
            <div className="min-w-0 flex-1 p-6 sm:p-10">
              <h4 className="mb-3 break-words text-xl font-black text-slate-900 dark:text-white sm:mb-4 sm:text-2xl">
                Leadership details will be published as the official MDPL public profile matures.
              </h4>
              <p className="break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                We believe in showcasing real contributions over placeholder personas. As the platform grows, verified team profiles will be added with transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
