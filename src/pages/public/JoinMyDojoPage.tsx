import { ArrowRight, GraduationCap, Shield, UserCog, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";

import PublicLayout from "../../components/public/PublicLayout";

function loginCardClassName(variant: "neutral" | "accent") {
  const base =
    "group flex min-w-0 flex-col rounded-[2rem] border p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 sm:p-8";
  if (variant === "accent") {
    return `${base} border-[color:var(--mdpl-accent)] text-white shadow-2xl mdpl-onboarding-accent-bg hover:opacity-[0.96]`;
  }
  return `${base} border-slate-300 bg-white/75 hover:border-[color:var(--mdpl-accent)] dark:border-white/15 dark:bg-white/10`;
}

export default function JoinMyDojoPage() {
  return (
    <PublicLayout>
      <section className="relative min-h-0 overflow-hidden lg:min-h-[calc(100dvh-5.5rem)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,var(--mdpl-accent-soft),transparent_32%)]" />
        <div className="relative z-10 mx-auto flex min-h-0 w-full min-w-0 max-w-7xl flex-col justify-center px-4 py-10 sm:px-5 sm:py-12 lg:px-8 lg:py-14">
          <div className="grid w-full min-w-0 grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-10">
            <div className="min-w-0">
              <div className="mb-5 inline-flex max-w-full flex-wrap rounded-full border border-[color:var(--mdpl-border)] bg-white/70 px-3 py-1.5 text-[10px] font-black uppercase leading-snug tracking-[0.22em] text-[color:var(--mdpl-accent)] backdrop-blur-xl dark:bg-white/10 sm:mb-6 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.28em]">
                Join MyDojo
              </div>

              <h1 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(1.85rem,10.5vw,5.5rem)] font-black italic leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-[clamp(2.4rem,12vw,5.5rem)]">
                Start your
                <span className="block text-[color:var(--mdpl-accent)]">martial arts</span>
                journey
              </h1>

              <p className="mt-5 max-w-xl break-words text-base font-bold leading-8 text-slate-700 dark:text-white/75 sm:mt-7 sm:text-lg">
                Pick the path that matches your role: register as a student or instructor, or sign in to the portal you
                already use.
              </p>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-6">
                <Link to="/admin/login" className={loginCardClassName("neutral")}>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mdpl-onboarding-accent-bg sm:mb-8 sm:h-16 sm:w-16">
                    <Shield size={30} strokeWidth={2.5} />
                  </div>

                  <h2 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Admin sign in</h2>

                  <p className="mt-3 flex-1 break-words text-sm font-semibold leading-6 text-slate-600 dark:text-white/70 sm:mt-4 sm:text-base sm:leading-7">
                    For MDPL super admins and authorized admin users managing platform operations.
                  </p>

                  <div className="mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--mdpl-accent)] sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
                    Admin sign in <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                  </div>
                </Link>

                <Link to="/instructor/login" className={loginCardClassName("neutral")}>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mdpl-onboarding-accent-bg sm:mb-8 sm:h-16 sm:w-16">
                    <UserCog size={30} strokeWidth={2.5} />
                  </div>

                  <h2 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
                    Instructor sign in
                  </h2>

                  <p className="mt-3 flex-1 break-words text-sm font-semibold leading-6 text-slate-600 dark:text-white/70 sm:mt-4 sm:text-base sm:leading-7">
                    For instructors managing students, classes, attendance, academy activity, and training records.
                  </p>

                  <div className="mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--mdpl-accent)] sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
                    Instructor sign in <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                  </div>
                </Link>

                <Link to="/student/login" className={loginCardClassName("neutral")}>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mdpl-onboarding-accent-bg sm:mb-8 sm:h-16 sm:w-16">
                    <GraduationCap size={30} strokeWidth={2.5} />
                  </div>

                  <h2 className="break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl">Student sign in</h2>

                  <p className="mt-3 flex-1 break-words text-sm font-semibold leading-6 text-slate-600 dark:text-white/70 sm:mt-4 sm:text-base sm:leading-7">
                    For students accessing their profile, fee requests, attendance, events, and progression records.
                  </p>

                  <div className="mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--mdpl-accent)] sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
                    Student sign in <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                  </div>
                </Link>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <Link to="/register/student" className={loginCardClassName("accent")}>
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-[color:var(--mdpl-accent)] shadow-lg sm:mb-8 sm:h-16 sm:w-16">
                    <UserPlus size={30} strokeWidth={2.5} />
                  </div>

                  <h2 className="break-words text-2xl font-black sm:text-3xl">Student registration</h2>

                  <p className="mt-3 max-w-2xl break-words text-sm font-semibold leading-7 text-white/90 sm:mt-4 sm:text-base">
                    New students: create your academy enrollment profile and submit it for admin review.
                  </p>

                  <div className="mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
                    Register as student <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                  </div>
                </Link>

                <Link
                  to="/register/instructor"
                  className={`${loginCardClassName("neutral")} border-[color:var(--mdpl-accent)]/40 bg-white/90 dark:bg-white/[0.08]`}
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg mdpl-onboarding-accent-bg sm:mb-8 sm:h-16 sm:w-16">
                    <UserCog size={30} strokeWidth={2.5} />
                  </div>

                  <h2 className="break-words text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
                    Instructor registration
                  </h2>

                  <p className="mt-3 max-w-2xl break-words text-sm font-semibold leading-7 text-slate-600 dark:text-white/70 sm:mt-4 sm:text-base">
                    Apply to teach with MDPL MyDojo — a short public form to start the review process.
                  </p>

                  <div className="mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[color:var(--mdpl-accent)] sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]">
                    Apply as instructor <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
