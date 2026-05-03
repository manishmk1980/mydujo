import { CheckCircle, FileText, MapPin, UserCheck, Users, Calendar } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Register Interest",
    description: "Express your academy’s interest through the MDPL portal. Provide basic contact and location details.",
    icon: FileText,
  },
  {
    number: "02",
    title: "Academy Verification",
    description: "MDPL team reviews your submission, validates credentials, and confirms eligibility.",
    icon: CheckCircle,
  },
  {
    number: "03",
    title: "Profile Setup",
    description: "Create your public academy profile with branding, disciplines, instructor list, and facility details.",
    icon: MapPin,
  },
  {
    number: "04",
    title: "Instructor & Student Mapping",
    description: "Connect your instructors and students to the platform, establishing digital identities for each.",
    icon: Users,
  },
  {
    number: "05",
    title: "Event and Progression Visibility",
    description: "Start showcasing participation in events, gradings, and tracking student progression publicly.",
    icon: Calendar,
  },
];

export default function PublicAcademyOnboarding() {
  return (
    <section className="public-theme-section relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute right-0 top-10 hidden select-none text-[14vw] font-black uppercase leading-none text-slate-950/[0.035] dark:text-white/[0.04] lg:block">
        Onboarding
      </div>

      <div className="relative mx-auto min-w-0 max-w-7xl">
        <div className="mb-8 max-w-4xl md:mb-12 lg:mb-14">
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
            <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
            <span className="min-w-0">Academy Onboarding Flow</span>
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            From interest to
            <span className="block text-orange-600">active participation</span>
          </h2>

          <p className="public-theme-muted mt-5 max-w-3xl break-words text-base font-medium leading-8 sm:mt-6 sm:text-lg">
            A clear, step‑by‑step process that guides your academy into the MyDojo ecosystem, ensuring a smooth transition and immediate value.
          </p>
        </div>

        <div className="relative pl-1 sm:pl-0">
          <div className="absolute bottom-0 left-8 top-0 hidden w-0.5 bg-gradient-to-b from-orange-500/40 via-orange-500/20 to-transparent sm:block md:left-1/2 md:-translate-x-1/2" />

          <div className="grid gap-8 md:gap-12 lg:gap-16">
            {steps.map(({ number, title, description, icon: Icon }, index) => (
              <div
                key={number}
                className={`relative flex min-w-0 flex-col md:flex-row md:items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="relative z-10 mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-800 text-white shadow-2xl shadow-orange-600/40 sm:mb-0 sm:h-16 sm:w-16 md:h-20 md:w-20">
                  <div className="absolute -inset-3 rounded-full border-2 border-orange-500/30 sm:-inset-4" />
                  <Icon size={28} strokeWidth={2} />
                </div>

                <div
                  className={`public-theme-surface min-w-0 flex-1 overflow-hidden rounded-[2rem] border p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500/60 sm:p-8 ${
                    index % 2 === 0 ? "md:ml-10 lg:ml-12" : "md:mr-10 lg:mr-12"
                  }`}
                >
                  <div className="mb-3 flex min-w-0 items-center gap-3 sm:mb-4 sm:gap-4">
                    <span className="shrink-0 text-3xl font-black text-orange-600 sm:text-4xl">{number}</span>
                    <div className="h-px min-w-0 flex-1 bg-gradient-to-r from-orange-600/40 to-transparent" />
                  </div>

                  <h3 className="break-words text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">{title}</h3>
                  <p className="public-theme-muted mt-3 max-w-3xl break-words leading-8 sm:mt-4">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-orange-500/30 bg-gradient-to-br from-orange-600/10 to-transparent p-6 text-center sm:mt-16 sm:p-8 md:mt-20 md:p-10">
          <h3 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
            Ready to start your academy’s digital journey?
          </h3>
          <p className="public-theme-muted mx-auto mt-3 max-w-2xl break-words text-sm sm:mt-4 sm:text-base">
            The onboarding process is designed to be straightforward and supported by the MDPL team at every step.
          </p>
          <a
            href="/join-mydojo"
            className="mx-auto mt-6 inline-flex w-full max-w-sm min-w-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-xs font-black uppercase tracking-[0.14em] text-white shadow-2xl shadow-orange-600/30 transition hover:-translate-y-1 hover:bg-orange-700 sm:mt-8 sm:max-w-none sm:w-auto sm:px-10 sm:py-4 sm:text-sm sm:tracking-[0.18em]"
          >
            Begin Registration
            <UserCheck className="ml-2 shrink-0 sm:ml-4" size={20} strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
