import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Search, Sparkles, UserRound } from "lucide-react";

import PublicLayout from "../../components/public/PublicLayout";
import { API_BASE } from "../../config";
import { instructorService, type PublicInstructor } from "../../services/instructorService";

function imageUrl(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads/")) return `${API_BASE}${value}`;
  return value;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MD";
}

function InstructorPhoto({ instructor }: { instructor: PublicInstructor }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(instructor.publicPhotoUrl);
  if (!src || failed) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-4xl font-black text-white" aria-hidden="true">
        {initials(instructor.displayName)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${instructor.displayName}, MDPL instructor`}
      loading="lazy"
      onError={() => setFailed(true)}
      className="aspect-[4/3] w-full object-cover"
    />
  );
}

export default function PublicInstructorsPage() {
  const [instructors, setInstructors] = useState<PublicInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    instructorService.getPublicInstructors()
      .then((items) => {
        if (active) setInstructors(items);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return instructors;
    return instructors.filter((instructor) =>
      [instructor.displayName, instructor.city, instructor.state, instructor.publicBio]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized))
    );
  }, [instructors, query]);

  return (
    <PublicLayout>
      <section className="public-theme-section border-b border-slate-200/70 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-16 lg:px-8">
          <div className="mb-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.25em] text-orange-600">
            <span className="h-px w-10 bg-orange-600" />
            Instructors
          </div>
          <h1 className="mydojo-display max-w-4xl text-[clamp(2.4rem,8vw,5.5rem)] leading-[0.95] text-slate-950 dark:text-white">
            Approved MDPL Instructors
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-700 dark:text-white/70 sm:text-lg">
            Meet instructors selected by MDPL for public listing. Each profile is reviewed before appearing here.
          </p>
        </div>
      </section>

      <section className="public-theme-section">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-16 lg:px-8">
          <div className="relative mb-8 max-w-2xl">
            <label htmlFor="instructor-search" className="sr-only">Search instructors by name, city, or state</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              id="instructor-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, city, or state"
              className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-950 shadow-sm outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 dark:border-white/15 dark:bg-white/5 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite" aria-label="Loading instructor profiles">
              {[0, 1, 2].map((item) => <div key={item} className="h-96 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/10" />)}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-800 dark:border-red-400/20 dark:bg-red-950/20 dark:text-red-200">
              <p className="font-bold">We could not load instructor profiles right now. Please try again later.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
              <UserRound className="mx-auto size-10 text-orange-600" />
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                {query ? "No instructors match your search." : "Approved instructor profiles will appear here soon."}
              </h2>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((instructor, index) => (
                <article key={instructor.publicSlug || `${instructor.displayName}-${index}`} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
                  <div className="relative overflow-hidden">
                    <InstructorPhoto instructor={instructor} />
                    {instructor.isFeaturedPublic && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white shadow-lg">
                        <Sparkles className="size-3.5" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">{instructor.displayName}</h2>
                    {(instructor.city || instructor.state) && (
                      <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-white/60">
                        <MapPin className="size-4 text-orange-600" />
                        {[instructor.city, instructor.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {instructor.publicBio && <p className="mt-4 line-clamp-4 leading-7 text-slate-600 dark:text-white/70">{instructor.publicBio}</p>}
                    <Link to="/contact" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/25 dark:bg-orange-600 dark:hover:bg-orange-500">
                      Request training info
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
