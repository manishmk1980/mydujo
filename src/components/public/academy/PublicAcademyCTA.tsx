import { ArrowRight, Mail, Users } from "lucide-react";

export default function PublicAcademyCTA() {
  return (
    <section className="public-theme-section relative overflow-hidden px-4 py-14 transition-colors duration-500 sm:px-5 md:py-24 lg:px-8 lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,75,11,0.12),transparent_34%)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(255,75,11,0.22),transparent_34%)]" />

      <div className="relative mx-auto min-w-0 max-w-7xl">
        <div className="mx-auto min-w-0 max-w-4xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
            <span className="hidden h-px w-6 bg-orange-600 sm:block sm:w-10" />
            <span className="min-w-0">Final Call</span>
            <span className="hidden h-px w-6 bg-orange-600 sm:block sm:w-10" />
          </div>

          <h2 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,11vw,5rem)] leading-tight text-slate-950 dark:text-white">
            BRING YOUR ACADEMY INTO
            <span className="block text-orange-600">A UNIFIED ECOSYSTEM</span>
          </h2>

          <p className="public-theme-muted mx-auto mt-5 max-w-3xl break-words px-1 text-base font-medium leading-8 sm:mt-7 sm:text-lg">
            Join MyDojo to participate in a transparent, structured, and growth‑oriented martial arts platform.
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
              href="/contact"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl border border-slate-400/60 bg-white/65 px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white sm:w-auto sm:px-9 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              <Mail className="mr-2 shrink-0 sm:mr-3" size={18} strokeWidth={2.5} />
              Contact MDPL
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-14 sm:gap-5 md:grid-cols-3 md:gap-6">
            <div className="public-theme-surface min-w-0 rounded-2xl border p-5 text-left sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 text-orange-600 sm:mb-6 sm:h-14 sm:w-14">
                <Users size={26} strokeWidth={2} />
              </div>
              <h4 className="mb-2 break-words text-lg font-black text-slate-950 dark:text-white sm:mb-3 sm:text-xl">
                Community Network
              </h4>
              <p className="public-theme-muted break-words text-sm leading-relaxed sm:text-base">
                Connect with other academies, share best practices, and collaborate on regional events.
              </p>
            </div>

            <div className="public-theme-surface min-w-0 rounded-2xl border p-5 text-left sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 text-orange-600 sm:mb-6 sm:h-14 sm:w-14">
                <ArrowRight size={26} strokeWidth={2} />
              </div>
              <h4 className="mb-2 break-words text-lg font-black text-slate-950 dark:text-white sm:mb-3 sm:text-xl">
                Growth Pathway
              </h4>
              <p className="public-theme-muted break-words text-sm leading-relaxed sm:text-base">
                Access tools and insights designed to help your academy scale sustainably within the MDPL ecosystem.
              </p>
            </div>

            <div className="public-theme-surface min-w-0 rounded-2xl border p-5 text-left sm:p-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 text-orange-600 sm:mb-6 sm:h-14 sm:w-14">
                <Mail size={26} strokeWidth={2} />
              </div>
              <h4 className="mb-2 break-words text-lg font-black text-slate-950 dark:text-white sm:mb-3 sm:text-xl">
                Dedicated Support
              </h4>
              <p className="public-theme-muted break-words text-sm leading-relaxed sm:text-base">
                Receive guidance from the MDPL team throughout onboarding and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
