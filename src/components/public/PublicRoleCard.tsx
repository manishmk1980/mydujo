import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export type PublicRoleCardVariant = "primary" | "default";

type PublicRoleCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  ctaLabel: string;
  variant?: PublicRoleCardVariant;
  badge?: string;
};

export default function PublicRoleCard({
  title,
  description,
  icon: Icon,
  href,
  ctaLabel,
  variant = "default",
  badge,
}: PublicRoleCardProps) {
  const isPrimary = variant === "primary";

  const cardClass = [
    "group relative flex min-w-0 flex-col rounded-[2rem] border p-6 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 sm:p-8",
    isPrimary
      ? "border-orange-500/40 bg-orange-600 text-white shadow-2xl shadow-orange-600/30 hover:bg-orange-700"
      : "border-slate-200/80 bg-white/90 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.06]",
  ].join(" ");

  const iconWrapperClass = isPrimary
    ? "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white shadow-lg sm:mb-8 sm:h-16 sm:w-16"
    : "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/25 sm:mb-8 sm:h-16 sm:w-16";

  const titleClass = isPrimary
    ? "break-words text-2xl font-black sm:text-3xl"
    : "break-words text-xl font-black text-slate-950 dark:text-white sm:text-2xl";

  const descClass = isPrimary
    ? "mt-3 flex-1 break-words text-sm font-semibold leading-7 text-white/90 sm:mt-4 sm:text-base"
    : "mt-3 flex-1 break-words text-sm font-semibold leading-6 text-slate-600 dark:text-white/70 sm:mt-4 sm:text-base sm:leading-7";

  const ctaClass = isPrimary
    ? "mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]"
    : "mt-6 inline-flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-orange-600 sm:mt-8 sm:gap-3 sm:text-xs sm:tracking-[0.18em]";

  const badgeClass = isPrimary
    ? "inline-flex rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white"
    : "inline-flex rounded-full bg-orange-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";

  return (
    <Link to={href} className={cardClass}>
      {badge ? <div className={`mb-4 self-start ${badgeClass}`}>{badge}</div> : null}

      <div className={iconWrapperClass}>
        <Icon size={30} strokeWidth={2.5} />
      </div>

      <h3 className={titleClass}>{title}</h3>

      <p className={descClass}>{description}</p>

      <div className={ctaClass}>
        {ctaLabel}
        <ArrowRight size={18} strokeWidth={3} className="shrink-0 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
