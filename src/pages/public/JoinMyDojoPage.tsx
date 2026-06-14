import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import PublicLayout from "../../components/public/PublicLayout";

type PathCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
  featured?: boolean;
};

const features: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: ShieldCheck,
    title: "Trusted Platform",
    description: "Secure, reliable, and built for the martial arts community.",
  },
  {
    icon: Users,
    title: "For Everyone",
    description: "Students, instructors, and academies — all in one powerful platform.",
  },
  {
    icon: TrendingUp,
    title: "Track & Grow",
    description: "Track progress, attendance, and achievements with ease.",
  },
  {
    icon: Trophy,
    title: "Empowering Martial Artists",
    description: "Connecting dojos and martial artists through one unified platform.",
  },
];

const buttonBase =
  "group/button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-center text-sm font-black transition duration-200";
const primaryButton =
  `${buttonBase} bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 hover:shadow-orange-600/30`;
const secondaryButton =
  `${buttonBase} border border-slate-300 bg-white/70 text-slate-950 hover:border-orange-500 hover:text-orange-600 dark:border-white/20 dark:bg-white/[0.04] dark:text-white dark:hover:border-orange-500 dark:hover:text-orange-400`;

function PathCard({ icon: Icon, title, description, children, featured = false }: PathCardProps) {
  return (
    <article
      className={[
        "group relative flex min-w-0 flex-col rounded-[1.75rem] border bg-white/90 p-6 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(15,23,42,0.13)] dark:bg-white/[0.06] sm:p-7",
        featured
          ? "border-orange-300/80 ring-1 ring-orange-200/60 dark:border-orange-500/50 dark:ring-orange-500/20"
          : "border-slate-200/80 dark:border-white/10",
      ].join(" ")}
    >
      {featured ? (
        <div className="absolute right-5 top-5 rounded-full bg-orange-50 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
          Start here
        </div>
      ) : null}

      <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-orange-50 text-orange-600 shadow-inner shadow-orange-100 transition duration-300 group-hover:scale-105 dark:bg-orange-500/15 dark:text-orange-400 dark:shadow-none">
        <Icon size={30} strokeWidth={2.3} />
      </div>

      <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-3 min-h-[4.5rem] flex-1 text-sm font-semibold leading-6 text-slate-600 dark:text-white/70">
        {description}
      </p>

      <div className="mt-6 space-y-3 border-t border-slate-200/80 pt-5 dark:border-white/10">{children}</div>
    </article>
  );
}

function CtaArrow() {
  return <ArrowRight size={17} strokeWidth={2.8} className="shrink-0 transition group-hover/button:translate-x-1" />;
}

export default function JoinMyDojoPage() {
  return (
    <PublicLayout>
      <section className="relative isolate overflow-hidden px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-14 lg:pt-14">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(145deg,#fffaf5_0%,#ffffff_47%,#fff8f2_100%)] dark:bg-[linear-gradient(145deg,#0b101b_0%,#111827_52%,#15100d_100%)]" />
        <div className="pointer-events-none absolute -left-32 top-10 -z-10 size-[26rem] rounded-full bg-orange-200/25 blur-3xl dark:bg-orange-600/10" />
        <div className="pointer-events-none absolute -right-24 top-36 -z-10 size-[30rem] rounded-full border-[3rem] border-orange-100/40 dark:border-orange-500/[0.06]" />
        <div className="pointer-events-none absolute left-8 top-20 -z-10 hidden h-72 w-24 -rotate-12 rounded-full border border-orange-300/20 lg:block" />

        <div className="mx-auto w-full max-w-7xl">
          <header className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-orange-600 shadow-sm backdrop-blur dark:border-orange-500/25 dark:bg-white/[0.06] dark:text-orange-400 sm:text-xs">
              <span className="h-px w-7 bg-orange-500" />
              Join MyDojo
              <span className="h-px w-7 bg-orange-500" />
            </div>

            <h1 className="mt-5 text-[clamp(2.6rem,7vw,5.2rem)] font-black leading-[0.98] tracking-[-0.06em] text-slate-950 dark:text-white">
              Join <span className="text-orange-600 dark:text-orange-500">MDPL MyDojo</span>
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-7 text-slate-600 dark:text-white/70 sm:text-lg">
              Whether you&apos;re starting your martial arts journey, continuing as a student, or joining as an
              instructor — choose your path below.
            </p>
          </header>

          <div className="mt-9 grid grid-cols-1 gap-5 md:grid-cols-2 lg:mt-11 lg:grid-cols-3 lg:gap-6">
            <PathCard
              icon={UserPlus}
              title="New Student"
              description="Create your student profile, enroll in an academy, and begin your martial arts journey."
              featured
            >
              <Link to="/register/student" className={primaryButton}>
                Register as Student
                <CtaArrow />
              </Link>
            </PathCard>

            <PathCard
              icon={GraduationCap}
              title="Existing Student"
              description="Sign in to access your classes, attendance, events, progress, and more."
            >
              <Link to="/student/login" className={secondaryButton}>
                Student Sign In
                <CtaArrow />
              </Link>
            </PathCard>

            <PathCard
              icon={Building2}
              title="Instructor / Academy"
              description="Manage your classes and students or apply to teach with MDPL MyDojo."
            >
              <Link to="/instructor/login" className={secondaryButton}>
                Instructor Sign In
                <CtaArrow />
              </Link>
              <Link to="/register/instructor" className={primaryButton}>
                Apply as Instructor
                <CtaArrow />
              </Link>
            </PathCard>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-y-6 rounded-[1.75rem] border border-slate-200/70 bg-white/65 px-5 py-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:grid-cols-2 sm:px-7 lg:grid-cols-4 lg:gap-y-0 lg:px-8">
            {features.map(({ icon: Icon, title, description }, index) => (
              <div
                key={title}
                className={`flex min-w-0 gap-3 lg:px-5 ${index > 0 ? "lg:border-l lg:border-slate-200/80 lg:dark:border-white/10" : ""}`}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
                  <Icon size={20} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-950 dark:text-white">{title}</h3>
                  <p className="mt-1 text-xs font-medium leading-5 text-slate-600 dark:text-white/60">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
