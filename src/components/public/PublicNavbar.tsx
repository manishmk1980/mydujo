import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { usePublicTheme } from "../../context/PublicThemeContext";

const navItems = [
  { label: "About MyDojo", href: "/about" },
  { label: "Academy", href: "/academy" },
  { label: "Disciplines", href: "/disciplines" },
  { label: "Instructors", href: "/instructors" },
  { label: "Events", href: "/events" },
];

const signInItems = [
  { label: "Student Sign In", href: "/student/login" },
  { label: "Instructor Sign In", href: "/instructor/login" },
  { label: "Admin Sign In", href: "/admin" },
];

function navLinkIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function signInIsActive(pathname: string) {
  return signInItems.some((item) => navLinkIsActive(pathname, item.href));
}

const headerFixedClass =
  "fixed left-0 right-0 top-[3px] z-[999] border-b border-slate-200/80 bg-white/88 px-3 py-2 text-slate-950 shadow-lg shadow-slate-950/5 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-[#0b101b]/95 dark:text-white dark:shadow-black/30 md:px-5 md:py-2.5";

export default function PublicNavbar() {
  const { isDark, toggleTheme } = usePublicTheme();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logoClass =
    "h-9 w-auto max-w-[min(38vw,9.5rem)] object-contain object-left sm:h-10 sm:max-w-[11rem] md:h-11 md:max-w-none";

  const navShellClass =
    "hidden h-11 items-center rounded-full border border-slate-300/80 bg-white/72 p-0.5 shadow-sm backdrop-blur-xl dark:border-white/15 dark:bg-white/10 lg:flex";

  const navLinkBase =
    "mydojo-nav-text flex h-9 items-center rounded-full px-5 text-[10px] transition hover:bg-orange-600 hover:text-white";

  const navLinkInactive = "text-slate-800 dark:text-white";

  const navLinkActive = "bg-orange-600 text-white dark:bg-orange-600 dark:text-white";

  const iconButtonClass =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-slate-900 shadow-sm backdrop-blur-xl transition-colors hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:text-orange-400 md:h-10 md:w-10";

  const mobilePanelClass =
    "absolute inset-x-0 top-full z-[998] max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto border-b border-t border-slate-200/80 bg-white/95 px-4 py-3 text-slate-950 shadow-lg shadow-slate-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b101b]/96 dark:text-white dark:shadow-black/30 lg:hidden";

  const mobileLinkClass = (active: boolean) =>
    [
      "mydojo-nav-text block min-w-0 break-words rounded-2xl px-4 py-2.5 text-[11px] transition",
      active
        ? "bg-orange-600 text-white"
        : "text-slate-800 hover:bg-orange-600 hover:text-white dark:text-white",
    ].join(" ");

  const joinCtaClass =
    "inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-full bg-orange-600 px-2.5 text-[9px] font-black uppercase tracking-wide text-white shadow-xl shadow-orange-600/30 transition-colors hover:bg-orange-700 min-[360px]:px-3.5 min-[360px]:text-[10px] sm:px-6 sm:text-[11px] sm:tracking-[0.18em]";

  const signInActive = signInIsActive(pathname);

  return (
    <header className={headerFixedClass}>
      <div className="relative w-full min-w-0 max-w-full">
        <div className="mx-auto flex min-w-0 max-w-7xl items-center justify-between gap-1.5 sm:gap-3 md:gap-4">
          <a
            href="/"
            className="flex min-w-0 max-w-[42%] shrink items-center py-0.5 transition hover:opacity-95 sm:max-w-none md:px-1"
          >
            <img src="/brand/mdpl-logo.svg" alt="MDPL MyDojo" className={logoClass} />
          </a>

          <nav className={navShellClass} aria-label="Primary">
            {navItems.map((item) => {
              const active = navLinkIsActive(pathname, item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`${navLinkBase} ${active ? navLinkActive : navLinkInactive}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            <button
              type="button"
              className={`${iconButtonClass} lg:hidden`}
              aria-expanded={mobileOpen}
              aria-controls="public-nav-mobile"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={20} strokeWidth={2.6} /> : <Menu size={20} strokeWidth={2.6} />}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className={iconButtonClass}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={20} strokeWidth={2.6} /> : <Moon size={20} strokeWidth={2.6} />}
            </button>

            <div className="group relative hidden sm:block">
              <button
                type="button"
                className={[
                  "mydojo-nav-text inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm backdrop-blur-xl transition-colors",
                  signInActive
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "border-slate-300 bg-white/80 text-slate-900 hover:border-orange-600 hover:text-orange-600 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-orange-500 dark:hover:text-orange-400",
                ].join(" ")}
                aria-haspopup="true"
              >
                Sign In
                <ChevronDown size={13} strokeWidth={3} className="shrink-0" />
              </button>

              <div className="invisible absolute right-0 top-full z-[1000] mt-3 w-60 translate-y-2 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-2xl shadow-slate-950/12 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:border-white/10 dark:bg-[#0b101b] dark:shadow-black/40">
                {signInItems.map((item) => {
                  const active = navLinkIsActive(pathname, item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className={[
                        "block rounded-xl px-4 py-3 text-sm font-bold transition",
                        active
                          ? "bg-orange-600 text-white"
                          : "text-slate-700 hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-orange-400",
                      ].join(" ")}
                    >
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>

            <a href="/join-mydojo" className={`${joinCtaClass} max-[359px]:min-w-0`}>
              <span className="max-[359px]:hidden">Join MyDojo</span>
              <span className="hidden max-[359px]:inline">Join</span>
              <ArrowRight size={14} strokeWidth={3} className="hidden shrink-0 sm:inline" />
            </a>
          </div>
        </div>

        {mobileOpen ? (
          <nav id="public-nav-mobile" className={mobilePanelClass} aria-label="Mobile primary">
            <div className="mx-auto flex min-w-0 max-w-7xl flex-col gap-2">
              {navItems.map((item) => {
                const active = navLinkIsActive(pathname, item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={mobileLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}

              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/5">
                <p className="mydojo-nav-text px-3 pb-2 pt-1 text-[10px] text-orange-600">
                  Sign In
                </p>

                <div className="flex flex-col gap-1">
                  {signInItems.map((item) => {
                    const active = navLinkIsActive(pathname, item.href);
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        className={mobileLinkClass(active)}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </a>
                    );
                  })}
                </div>
              </div>

              <a
                href="/join-mydojo"
                className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-orange-600/25"
              >
                Join MyDojo
                <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
              </a>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}