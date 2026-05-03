import { BookOpen, Calendar, ShieldCheck, Users, BarChart, Eye, FileText } from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Organized student records",
    description: "Centralized digital profiles for every student, tracking attendance, progression, and grading history.",
  },
  {
    icon: Users,
    title: "Instructor coordination",
    description: "Streamlined communication and role assignment across multiple instructors and training centers.",
  },
  {
    icon: Calendar,
    title: "Event and recognition visibility",
    description: "Showcase academy participation in tournaments, gradings, and community events to build credibility.",
  },
  {
    icon: ShieldCheck,
    title: "Trust-building public presence",
    description: "A professional academy profile that instills confidence in students, parents, and partners.",
  },
];

const boldBenefits = [
  {
    icon: Eye,
    title: "Public academy profile",
    description: "A dedicated, verified page showcasing your academy’s credentials, instructors, disciplines, and achievements.",
  },
  {
    icon: Users,
    title: "Student and instructor mapping",
    description: "Visual mapping of your academy’s ecosystem, showing relationships and roles at a glance.",
  },
  {
    icon: BarChart,
    title: "Attendance and progression readiness",
    description: "Tools to monitor student attendance and readiness for gradings, with automated notifications.",
  },
  {
    icon: Calendar,
    title: "Event participation visibility",
    description: "Highlight your academy’s involvement in MDPL‑sanctioned events, boosting community recognition.",
  },
  {
    icon: ShieldCheck,
    title: "Parent/community trust",
    description: "Transparent reporting and communication features designed to build trust with families and local communities.",
  },
  {
    icon: FileText,
    title: "Future role‑based dashboard support",
    description: "Planned platform capability for academy‑specific dashboards with advanced analytics and reporting.",
  },
];

export default function PublicAcademyBenefits() {
  return (
    <section id="benefits" className="relative overflow-hidden bg-[#f4eee9] py-14 transition-colors duration-500 dark:bg-[#0b101b] md:py-24 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.12),transparent_32%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.18),transparent_34%)]" />

      <div className="pointer-events-none absolute right-8 top-10 hidden select-none text-[13vw] font-black uppercase leading-none text-slate-950/[0.04] dark:text-white/[0.05] lg:block">
        BENEFITS
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl px-4 sm:px-5 lg:px-8">
        <div className="mb-12 md:mb-20 lg:mb-24">
          <div className="mb-8 grid grid-cols-1 gap-8 md:mb-12 md:gap-10 lg:mb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
                <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
                <span className="min-w-0">Why Academies Need MyDojo</span>
              </div>

              <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
                A digital foundation
                <span className="block text-orange-600">for modern academies</span>
              </h2>
            </div>

            <p className="min-w-0 break-words text-base font-medium leading-8 text-slate-700 dark:text-white/70 sm:text-lg">
              MyDojo provides the infrastructure academies need to operate transparently, coordinate effectively, and grow sustainably within the MDPL ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:p-7"
              >
                <div className="pointer-events-none absolute right-4 top-4 opacity-10 sm:right-6 sm:top-6">
                  <Icon size={72} strokeWidth={1.5} />
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/30 sm:mb-8 sm:h-16 sm:w-16">
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="mb-3 break-words text-xl font-black leading-tight text-slate-950 dark:text-white sm:mb-4 sm:text-2xl">{title}</h3>
                <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-white/70 sm:text-base">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-8 grid grid-cols-1 gap-8 md:mb-12 md:gap-10 lg:mb-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
                <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
                <span className="min-w-0">Academy Benefits</span>
              </div>

              <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
                Built for
                <span className="block text-orange-600">credibility and growth</span>
              </h2>
            </div>

            <p className="min-w-0 break-words text-base font-medium leading-8 text-slate-700 dark:text-white/70 sm:text-lg">
              From public visibility to internal coordination, MyDojo delivers tangible benefits that help academies thrive in a connected ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {boldBenefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group relative min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition hover:-translate-y-2 hover:border-orange-500/60 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:p-8"
              >
                <div className="pointer-events-none absolute right-4 top-4 opacity-10 sm:right-6 sm:top-6">
                  <Icon size={72} strokeWidth={1.5} />
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-xl shadow-orange-600/40 sm:mb-8 sm:h-16 sm:w-16">
                  <Icon size={28} strokeWidth={2} />
                </div>

                <h3 className="mb-3 break-words text-xl font-black leading-tight text-slate-950 dark:text-white sm:mb-4 sm:text-2xl">{title}</h3>
                <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-white/70 sm:text-base">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
