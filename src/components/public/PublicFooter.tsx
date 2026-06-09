import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="public-footer-bg px-4 py-12 transition-colors duration-500 sm:px-5 md:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-8 sm:gap-10 md:gap-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] lg:gap-12 lg:px-8">
        <div className="min-w-0">
          <a href="/" className="inline-block md:inline-flex md:rounded-2xl md:bg-white md:px-4 md:py-3 md:shadow-lg md:shadow-slate-950/10">
            <img
              src="/brand/mdpl-logo.svg"
              alt="MDPL MyDojo"
              className="h-10 w-auto max-w-[11rem] object-contain object-left sm:h-12 md:h-14 md:max-w-none"
            />
          </a>

          <p className="public-theme-muted mt-5 max-w-md break-words text-sm font-medium leading-7 sm:mt-6">
            MyDojo by MyDojo Private Limited is a unified sports ecosystem for students,
            instructors, academies, supporters, and strategic stakeholders.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            {[
              { label: "Facebook", icon: Facebook },
              { label: "Instagram", icon: Instagram },
              { label: "YouTube", icon: Youtube },
            ].map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="public-theme-surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition hover:border-orange-500 hover:text-orange-500 sm:h-11 sm:w-11"
              >
                <Icon size={18} strokeWidth={2.4} />
              </a>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mydojo-nav-text text-sm text-orange-600">Public Pages</h3>

          <div className="public-theme-muted mt-5 grid gap-2 text-sm font-bold sm:mt-6 sm:gap-3">
            <a href="/about" className="break-words hover:text-orange-500">
              About MyDojo
            </a>
            <a href="/academy" className="break-words hover:text-orange-500">
              Academy
            </a>
            <a href="/disciplines" className="break-words hover:text-orange-500">
              Disciplines
            </a>
            <a href="/instructors" className="break-words hover:text-orange-500">
              Instructors
            </a>
            <a href="/events" className="break-words hover:text-orange-500">
              Events
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mydojo-nav-text text-sm text-orange-600">Actions</h3>

          <div className="public-theme-muted mt-5 grid gap-2 text-sm font-bold sm:mt-6 sm:gap-3">
            <a href="/join-mydojo" className="break-words hover:text-orange-500">
              Join MyDojo
            </a>
            <a href="/register/student" className="break-words hover:text-[color:var(--mdpl-accent)]">
              Register With Us
            </a>
            <a href="/login" className="break-words hover:text-orange-500">
              Registered User Sign In
            </a>
            <a href="/admin/login" className="break-words hover:text-orange-500">
              Admin Login
            </a>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mydojo-nav-text text-sm text-orange-600">Contact</h3>

          <div className="public-theme-muted mt-5 space-y-3 text-sm font-bold sm:mt-6 sm:space-y-4">
            <a
              href="mailto:mydojo.pvt.ltd@gmail.com"
              className="flex min-w-0 items-start gap-3 hover:text-orange-500"
            >
              <Mail size={18} className="mt-0.5 shrink-0" />
              <span className="min-w-0 break-all">mydojo.pvt.ltd@gmail.com</span>
            </a>

            <div className="flex min-w-0 items-start gap-3">
              <Phone size={18} className="shrink-0" />
              <span className="min-w-0 break-words">
                <a href="tel:+919934157090" className="hover:text-orange-500">9934157090</a>
                {" / "}
                <a href="tel:+919122466212" className="hover:text-orange-500">9122466212</a>
              </span>
            </div>

            <div className="flex min-w-0 items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <address className="min-w-0 break-words not-italic leading-6">
                H/NO-736, BLOCK-B, LOHAR LINE, NEAR GUDRI, Sonari (East Singhbhum),
                East Singhbhum, East Singhbhum - 831011, Jharkhand
              </address>
            </div>
          </div>

          <div className="public-theme-surface mt-6 min-w-0 rounded-2xl border p-4 sm:mt-8 sm:p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 sm:text-xs sm:tracking-[0.24em]">
              Full Name
            </div>
            <p className="public-theme-muted mt-2 break-words text-sm font-bold leading-6">
              MY DUJO PRIVATE LIMITED
            </p>
          </div>
        </div>
      </div>

      <div className="public-theme-muted mx-auto mt-10 flex min-w-0 max-w-7xl flex-col gap-3 border-t border-slate-200/30 pt-6 text-[10px] font-bold uppercase tracking-[0.14em] sm:mt-12 sm:gap-4 sm:pt-8 sm:text-xs sm:tracking-[0.18em] lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p className="min-w-0 break-words">© {new Date().getFullYear()} MyDojo Private Limited. All rights reserved.</p>
        <p className="min-w-0 break-words">Built for disciplined sports ecosystem growth.</p>
      </div>
    </footer>
  );
}
