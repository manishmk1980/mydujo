import { CheckCircle2, Layers3, Network, Scale, ShieldCheck } from "lucide-react";

const shifts = [
  {
    icon: Layers3,
    label: "Unified Framework",
    before: "Isolated academies and scattered local efforts",
    after: "A structured, consistent platform for coordinated growth",
  },
  {
    icon: Network,
    label: "Digital Backbone",
    before: "Manual records, informal communication, and limited visibility",
    after: "A connected system for students, instructors, centers, and administrators",
  },
  {
    icon: ShieldCheck,
    label: "Institutional Credibility",
    before: "Individual effort without enough formal recognition",
    after: "A credible platform that improves trust, transparency, and participation",
  },
  {
    icon: Scale,
    label: "Governance Alignment",
    before: "Unclear coordination across regions, styles, and stakeholders",
    after: "A governance-ready structure built for scale, quality, and accountability",
  },
];

export default function PublicUnification() {
  return (
    <section id="unification" className="relative overflow-hidden bg-[#f4eee9] py-14 transition-colors duration-500 dark:bg-[#0b101b] md:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(234,88,12,0.12),transparent_30%)] dark:bg-[radial-gradient(circle_at_82%_18%,rgba(234,88,12,0.2),transparent_34%)]" />

      <div className="pointer-events-none absolute right-8 top-10 hidden select-none text-[13vw] font-black uppercase leading-none text-slate-950/[0.04] dark:text-white/[0.05] lg:block">
        UNITY
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-32">
            <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.28em] text-orange-600">
              <span className="h-px w-10 bg-orange-600" />
              From Fragmentation to Unification
            </div>

            <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
              One ecosystem.
              <span className="block text-orange-600">Many stakeholders.</span>
              <span className="block">Shared direction.</span>
            </h2>

            <p className="mt-7 text-lg font-medium leading-8 text-slate-700 dark:text-white/70">
              MyDojo creates a common operating layer where students, instructors, academies,
              supporters, and strategic stakeholders can participate through one credible structure.
            </p>

            <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white/75 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] sm:p-7">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                  <CheckCircle2 size={24} strokeWidth={2.5} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">
                    The MyDojo Shift
                  </h3>
                  <p className="mt-2 break-words leading-7 text-slate-600 dark:text-white/65">
                    Not a parallel fragmented body — a digital and institutional framework designed
                    to improve coordination, trust, and long-term growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            {shifts.map(({ icon: Icon, label, before, after }, index) => (
              <div
                key={label}
                className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 dark:border-white/10 dark:bg-white/[0.06] sm:p-7"
              >
                <div className="mb-6 flex min-w-0 flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30">
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 sm:text-xs sm:tracking-[0.24em]">
                        Shift 0{index + 1}
                      </div>
                      <h3 className="mt-1 break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
                        {label}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="min-w-0 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950/50">
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-slate-400 dark:text-white/35">
                      Before
                    </div>
                    <p className="mt-3 break-words font-semibold leading-7 text-slate-600 dark:text-white/60">
                      {before}
                    </p>
                  </div>

                  <div className="min-w-0 rounded-2xl bg-orange-600 p-5 text-white shadow-lg shadow-orange-600/20">
                    <div className="text-xs font-black uppercase tracking-[0.22em] text-white/60">
                      With MyDojo
                    </div>
                    <p className="mt-3 break-words font-semibold leading-7 text-white">
                      {after}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
