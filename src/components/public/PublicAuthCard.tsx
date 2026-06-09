import type { ReactNode } from "react";

type PublicAuthCardProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

export default function PublicAuthCard({
  children,
  className = "",
  eyebrow,
  title,
  description,
}: PublicAuthCardProps) {
  const base =
    "relative min-w-0 rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-2xl shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/40 sm:p-8";

  return (
    <div className={`${base} ${className}`.trim()}>
      {eyebrow || title || description ? (
        <div className="mb-6 min-w-0">
          {eyebrow ? (
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-orange-600">
              {eyebrow}
            </div>
          ) : null}
          {title ? (
            <h2 className="break-words text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-2 break-words text-sm font-medium leading-6 text-slate-600 dark:text-white/70 sm:text-base sm:leading-7">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}
