import { Play } from "lucide-react";

const filters = [
  { id: "all", label: "All" },
  { id: "students", label: "Students" },
  { id: "instructors", label: "Instructors" },
  { id: "events", label: "Events" },
  { id: "academy", label: "Academy" },
];

const cards = [
  {
    tag: "STUDENTS",
    title: "Student Progress Highlights",
    description:
      "Short stories of discipline, attendance, evaluation, and visible student growth.",
    gradient: "from-orange-500/90 to-amber-600/90",
    overlayColor: "bg-orange-500/20",
  },
  {
    tag: "INSTRUCTORS",
    title: "Instructor‑Led Training Moments",
    description:
      "Clips from structured sessions, skill‑building drills, and academy‑led learning.",
    gradient: "from-blue-500/90 to-cyan-600/90",
    overlayColor: "bg-blue-500/20",
  },
  {
    tag: "EVENTS",
    title: "Event & Tournament Highlights",
    description:
      "Moments from competitions, demonstrations, assessments, and community gatherings.",
    gradient: "from-emerald-500/90 to-teal-600/90",
    overlayColor: "bg-emerald-500/20",
  },
  {
    tag: "ACADEMY",
    title: "Academy Activity Recap",
    description:
      "A closer look at academy participation, structured sessions, and evolving community engagement.",
    gradient: "from-violet-500/90 to-purple-600/90",
    overlayColor: "bg-violet-500/20",
  },
  {
    tag: "DISCIPLINES",
    title: "Discipline Showcase",
    description:
      "Spotlight moments across martial arts disciplines supported in the MyDojo ecosystem.",
    gradient: "from-rose-500/90 to-pink-600/90",
    overlayColor: "bg-rose-500/20",
  },
  {
    tag: "COMMUNITY",
    title: "Community Engagement Stories",
    description:
      "Stories that reflect how students, instructors, and academies are connected through the platform.",
    gradient: "from-amber-500/90 to-yellow-600/90",
    overlayColor: "bg-amber-500/20",
  },
];

export default function PublicVideoGallery() {
  return (
    <section className="public-theme-section py-14 md:py-24 lg:py-32">
      <div className="mx-auto min-w-0 max-w-7xl px-4 sm:px-5">
        <div className="mb-10 flex min-w-0 flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end md:gap-8">
          <div className="min-w-0 max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-3 inline-block max-w-full rounded-full bg-orange-100 px-3 py-1.5 text-[9px] font-black uppercase leading-snug tracking-[0.22em] text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 sm:mb-4 sm:px-4 sm:text-[10px] sm:tracking-[0.3em]">
              MOVEMENT HIGHLIGHTS
            </div>

            <h2 className="mb-4 min-w-0 max-w-full break-words font-display text-[clamp(2.1rem,11vw,5rem)] font-black italic leading-[0.95] tracking-tight text-slate-900 dark:text-white sm:mb-6">
              <span className="text-slate-900 dark:text-white">MOVEMENT</span>
              <br />
              <span className="text-slate-500 dark:text-slate-400">HIGHLIGHTS</span>
            </h2>

            <p className="max-w-xl break-words text-base text-slate-700 dark:text-slate-300 md:text-lg">
              Stories, training moments, events, and academy journeys from the MyDojo ecosystem.
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex min-w-0 flex-wrap gap-2 md:max-w-md md:justify-end lg:max-w-none">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`min-w-0 shrink-0 rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wide transition-colors sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-widest ${filter.id === "all"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
              >
                <span className="whitespace-normal break-words">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.tag}
              className="group relative min-w-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/60 shadow-xl shadow-slate-950/5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/5 dark:shadow-black/20 dark:hover:shadow-black/40"
            >
              {/* Media block */}
              <div className="relative aspect-video overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-80`}
                />
                <div className={`absolute inset-0 ${card.overlayColor} mix-blend-overlay`} />

                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-xl transition-transform group-hover:scale-110">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-900 shadow-2xl">
                      <Play size={28} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>

                {/* Tag chip */}
                <div className="absolute left-4 top-4 z-10 max-w-[calc(100%-2rem)] sm:left-6 sm:top-6">
                  <span className="inline-block max-w-full rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase leading-tight tracking-wide text-slate-900 backdrop-blur-xl dark:bg-white/10 dark:text-white sm:px-4 sm:py-1.5 sm:text-[10px] sm:tracking-widest">
                    <span className="break-words">{card.tag}</span>
                  </span>
                </div>
              </div>

              {/* Content block */}
              <div className="min-w-0 p-5 sm:p-8">
                <h3 className="mb-3 break-words font-display text-xl font-black italic leading-tight text-slate-900 dark:text-white sm:mb-4 sm:text-2xl">
                  {card.title}
                </h3>
                <p className="break-words text-sm leading-relaxed text-slate-700 dark:text-slate-300 sm:text-base">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="mt-10 text-center sm:mt-14 md:mt-16">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Video content is illustrative; actual footage will be added as the platform grows.
          </p>
        </div>
      </div>
    </section>
  );
}