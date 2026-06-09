import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";
import heroPng from "@/assets/images/mydojo-hero1.png";
import heroWebp from "@/assets/images/mydojo-hero1.webp";
import { ResponsivePicture } from "@/components/ui/ResponsivePicture";

const heroTitleClamp = "text-[clamp(2.8rem,15vw,5.5rem)]";

export default function PublicHero() {
  return (
    <section className="relative overflow-hidden bg-[#f4eee9] pb-14 pt-4 transition-colors duration-500 dark:bg-[#111014] md:pb-20 md:pt-10 lg:min-h-screen lg:pb-24 lg:pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(234,88,12,0.24),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(120deg,#f4eee9_0%,#efe4da_42%,#d8d2cb_100%)] dark:bg-[radial-gradient(circle_at_15%_30%,rgba(234,88,12,0.28),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(120deg,#070911_0%,#12131a_46%,#201713_100%)]" />

      <div className="absolute inset-0 opacity-[0.14] dark:opacity-[0.22]">
        <div className="absolute left-[48%] top-[16%] h-[42rem] w-[42rem] rounded-full border border-slate-950/10 dark:border-white/10" />
        <div className="absolute left-[54%] top-[22%] h-[30rem] w-[30rem] rounded-full border border-slate-950/10 dark:border-white/10" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/10 to-transparent dark:from-black/60" />
      </div>

      <div className="pointer-events-none absolute right-8 top-28 hidden select-none text-[15vw] font-black uppercase leading-none text-slate-900/[0.05] dark:text-white/[0.055] lg:block">
        MDPL
      </div>

      <div className="relative mx-auto flex w-full min-w-0 max-w-7xl flex-col justify-center px-4 py-8 md:px-5 md:py-14 lg:min-h-[calc(100dvh-5.5rem)] lg:px-8 lg:py-20">
        <div className="grid min-w-0 w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
        <div className="min-w-0 max-w-6xl lg:max-w-none">
          <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase leading-snug tracking-[0.28em] text-orange-600 sm:mb-8 sm:gap-4 sm:text-xs sm:tracking-[0.45em]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-500/50">
              <ShieldCheck size={16} strokeWidth={2.5} />
            </span>
            <span className="min-w-0 max-w-full break-words">A Unified Sports Ecosystem</span>
          </div>

          <h1 className="mydojo-display min-w-0 max-w-full break-words leading-[0.95] text-slate-950 dark:text-white sm:leading-[0.92]">
            <span className={`block ${heroTitleClamp}`}>Building A</span>
            <span className={`block ${heroTitleClamp} text-orange-600`}>Unified Sports</span>
            <span className={`block ${heroTitleClamp}`}>Ecosystem</span>
          </h1>

          <p className="mt-6 max-w-3xl text-base font-bold leading-8 text-slate-900 dark:text-white/90 sm:mt-9 sm:text-lg sm:leading-9 md:text-xl">
            MyDojo by MDPL connects students, instructors, academies, supporters, and strategic stakeholders under one credible, transparent, and growth-oriented framework.
          </p>

          <div className="mt-8 flex w-full min-w-0 max-w-full flex-col gap-4 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-5">
            <a
              href="/join-mydojo"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white shadow-2xl shadow-orange-600/30 transition hover:-translate-y-1 hover:bg-orange-700 sm:w-auto sm:px-10 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              Join MyDojo
              <ArrowRight className="ml-3 shrink-0 sm:ml-4" size={20} strokeWidth={3} />
            </a>

            <a
              href="#fragmented-reality"
              className="inline-flex w-full min-w-0 items-center justify-center rounded-2xl border border-slate-400/60 bg-white/65 px-6 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-950 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-orange-500 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white sm:w-auto sm:px-10 sm:py-5 sm:text-sm sm:tracking-[0.18em]"
            >
              <PlayCircle className="mr-2 shrink-0 sm:mr-3" size={20} strokeWidth={2.5} />
              Explore Vision
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-slate-900/10 blur-2xl dark:from-orange-500/25 dark:to-black/40"
          />
          <ResponsivePicture
            webpSrc={heroWebp}
            fallbackSrc={heroPng}
            alt="Martial artists training together — MyDojo unified sports ecosystem"
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 42vw, (min-width: 640px) 70vw, 92vw"
            className="relative block w-full"
            imgClassName="mx-auto w-full max-h-[min(72vh,40rem)] rounded-[1.75rem] object-contain object-center shadow-2xl shadow-slate-900/15 ring-1 ring-slate-900/10 dark:shadow-black/40 dark:ring-white/10 lg:max-h-[min(78vh,44rem)]"
          />
        </div>
        </div>
      </div>
    </section>
  );
}
