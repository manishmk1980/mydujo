import PublicLayout from "../../components/public/PublicLayout";

export default function EventsPage() {
  return (
    <PublicLayout>
      <section className="public-theme-section mx-auto min-w-0 max-w-7xl px-4 pb-14 pt-10 sm:px-5 md:pb-24 md:pt-14 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-[10px] font-black uppercase leading-snug tracking-[0.22em] text-orange-600 sm:mb-6 sm:gap-4 sm:text-xs sm:tracking-[0.28em]">
          <span className="h-px w-8 shrink-0 bg-orange-600 sm:w-10" />
          <span className="min-w-0">Events</span>
        </div>

        <h1 className="mydojo-display min-w-0 max-w-full break-words text-[clamp(2.1rem,9vw,4.25rem)] leading-tight text-slate-950 dark:text-white md:text-[clamp(2.25rem,7vw,5rem)]">
          Gradings, tournaments, functions, and prize ceremonies
        </h1>

        <p className="mt-6 max-w-3xl break-words text-base font-medium leading-8 text-slate-700 dark:text-white/70 sm:mt-8 sm:text-lg">
          This page will include grading events, academy functions, tournaments, prize ceremonies, and event updates.
        </p>
      </section>
    </PublicLayout>
  );
}
