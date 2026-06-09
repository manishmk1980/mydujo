import type { LucideIcon } from "lucide-react";
import { GraduationCap, Shield, UserCog, UserPlus } from "lucide-react";

import PublicLayout from "../../components/public/PublicLayout";
import PublicRoleCard, { type PublicRoleCardVariant } from "../../components/public/PublicRoleCard";

type RoleCardDef = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  ctaLabel: string;
  variant?: PublicRoleCardVariant;
  badge?: string;
};

const signInCards: RoleCardDef[] = [
  {
    title: "Admin sign in",
    description:
      "For MDPL super admins and authorized admin users managing platform operations.",
    icon: Shield,
    href: "/admin/login",
    ctaLabel: "Admin sign in",
  },
  {
    title: "Instructor sign in",
    description:
      "For instructors managing students, classes, attendance, academy activity, and training records.",
    icon: UserCog,
    href: "/instructor/login",
    ctaLabel: "Instructor sign in",
  },
  {
    title: "Student sign in",
    description:
      "For students accessing their profile, fee requests, attendance, events, and progression records.",
    icon: GraduationCap,
    href: "/student/login",
    ctaLabel: "Student sign in",
  },
];

const registerCards: RoleCardDef[] = [
  {
    title: "Student registration",
    description:
      "New students: create your academy enrollment profile and submit it for admin review.",
    icon: UserPlus,
    href: "/register/student",
    ctaLabel: "Register as student",
    variant: "primary",
    badge: "Most popular",
  },
  {
    title: "Instructor registration",
    description:
      "Apply to teach with MDPL MyDojo — a short public form to start the review process.",
    icon: UserCog,
    href: "/register/instructor",
    ctaLabel: "Apply as instructor",
    badge: "Application review",
  },
];

export default function JoinMyDojoPage() {
  return (
    <PublicLayout>
      <section className="relative min-h-0 overflow-hidden px-4 pb-16 pt-6 sm:px-5 sm:pb-20 sm:pt-10 lg:min-h-[calc(100dvh-5.5rem)] lg:px-8 lg:pb-24 lg:pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(234,88,12,0.18),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.28),transparent_30%)] dark:bg-[radial-gradient(circle_at_15%_18%,rgba(234,88,12,0.26),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.06),transparent_30%)]" />

        <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2]">
          <div className="absolute left-[46%] top-[12%] h-[42rem] w-[42rem] rounded-full border border-slate-950/10 dark:border-white/10" />
          <div className="absolute left-[54%] top-[20%] h-[30rem] w-[30rem] rounded-full border border-slate-950/10 dark:border-white/10" />
        </div>

        <div className="pointer-events-none absolute right-6 top-20 hidden select-none text-[14vw] font-black uppercase leading-none text-slate-900/[0.045] dark:text-white/[0.05] lg:block">
          MDPL
        </div>

        <div className="relative z-10 mx-auto flex w-full min-w-0 max-w-7xl flex-col justify-center lg:py-6">
          <div className="grid w-full min-w-0 grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-14">
            <div className="min-w-0">
              <div className="mb-5 inline-flex max-w-full flex-wrap items-center gap-3 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-[10px] font-black uppercase leading-snug tracking-[0.22em] text-orange-600 shadow-sm backdrop-blur-xl dark:border-white/15 dark:bg-white/10 sm:mb-6 sm:text-xs sm:tracking-[0.28em]">
                <span className="h-px w-8 bg-orange-600" />
                Join MyDojo
              </div>

              <h1 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2rem,10vw,5rem)] font-black italic leading-[0.95] tracking-tight text-slate-950 dark:text-white sm:text-[clamp(2.4rem,9vw,5.25rem)]">
                Start your
                <span className="block text-orange-600">martial arts</span>
                journey
              </h1>

              <p className="mt-6 max-w-xl break-words text-base font-bold leading-8 text-slate-700 dark:text-white/80 sm:mt-7 sm:text-lg">
                Choose the path that matches your role — sign in or register as a student, instructor, or admin.
              </p>

              <div className="mt-8 hidden gap-5 lg:grid lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-600">
                    Existing user
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-white/75">
                    Already have an account? Pick your portal and sign in.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-600">
                    New to MyDojo
                  </div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700 dark:text-white/75">
                    Register as a student or apply as an instructor for review.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-6">
              <div>
                <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-slate-600 dark:text-white/70 sm:text-xs sm:tracking-[0.32em]">
                  <span className="h-px w-8 bg-slate-400 dark:bg-white/30" />
                  Sign in
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                  {signInCards.map((card) => (
                    <PublicRoleCard
                      key={card.href}
                      title={card.title}
                      description={card.description}
                      icon={card.icon}
                      href={card.href}
                      ctaLabel={card.ctaLabel}
                      variant={card.variant}
                      badge={card.badge}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-slate-600 dark:text-white/70 sm:text-xs sm:tracking-[0.32em]">
                  <span className="h-px w-8 bg-slate-400 dark:bg-white/30" />
                  Register
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  {registerCards.map((card) => (
                    <PublicRoleCard
                      key={card.href}
                      title={card.title}
                      description={card.description}
                      icon={card.icon}
                      href={card.href}
                      ctaLabel={card.ctaLabel}
                      variant={card.variant}
                      badge={card.badge}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
