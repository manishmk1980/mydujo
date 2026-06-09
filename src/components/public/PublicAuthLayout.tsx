import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import PublicLayout from "./PublicLayout";

type PublicAuthLayoutProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  sidePanel?: ReactNode;
  backHref?: string;
  backLabel?: string;
  watermark?: string;
};

export default function PublicAuthLayout({
  eyebrow,
  title,
  description,
  children,
  sidePanel,
  backHref = "/",
  backLabel = "Back to site",
  watermark = "MDPL",
}: PublicAuthLayoutProps) {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden px-4 pb-16 pt-6 sm:px-5 sm:pb-20 sm:pt-10 lg:min-h-[calc(100dvh-5.5rem)] lg:px-8 lg:pb-24 lg:pt-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_22%,rgba(234,88,12,0.18),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.28),transparent_30%)] dark:bg-[radial-gradient(circle_at_12%_22%,rgba(234,88,12,0.26),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.06),transparent_30%)]" />

        <div className="absolute inset-0 opacity-[0.12] dark:opacity-[0.2]">
          <div className="absolute left-[44%] top-[10%] h-[40rem] w-[40rem] rounded-full border border-slate-950/10 dark:border-white/10" />
          <div className="absolute left-[52%] top-[18%] h-[28rem] w-[28rem] rounded-full border border-slate-950/10 dark:border-white/10" />
        </div>

        <div className="pointer-events-none absolute right-6 top-20 hidden select-none text-[14vw] font-black uppercase leading-none text-slate-900/[0.045] dark:text-white/[0.05] lg:block">
          {watermark}
        </div>

        <div className="relative mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-10 lg:grid lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-14 lg:py-6">
          <div className="min-w-0">
            <Link
              to={backHref}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm backdrop-blur-xl transition hover:border-orange-500 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white/80 dark:hover:text-orange-400 sm:text-[11px] sm:tracking-[0.28em]"
            >
              <ArrowLeft size={14} strokeWidth={2.8} />
              {backLabel}
            </Link>

            {eyebrow ? (
              <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase leading-snug tracking-[0.28em] text-orange-600 sm:text-xs sm:tracking-[0.45em]">
                <span className="h-px w-10 bg-orange-600" />
                <span className="break-words">{eyebrow}</span>
              </div>
            ) : null}

            <h1 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,9vw,4.5rem)] leading-[0.95] text-slate-950 dark:text-white sm:text-[clamp(2.6rem,8vw,5rem)]">
              {title}
            </h1>

            {description ? (
              <p className="mt-6 max-w-xl break-words text-base font-bold leading-8 text-slate-700 dark:text-white/80 sm:text-lg">
                {description}
              </p>
            ) : null}

            {sidePanel ? <div className="mt-8 hidden lg:block">{sidePanel}</div> : null}
          </div>

          <div className="min-w-0">
            {children}

            {sidePanel ? <div className="mt-6 lg:hidden">{sidePanel}</div> : null}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
