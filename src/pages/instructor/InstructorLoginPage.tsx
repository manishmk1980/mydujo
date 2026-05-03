import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import PublicLayout from '../../components/public/PublicLayout';

export default function InstructorLoginPage() {
  return (
    <PublicLayout>
      <section className="relative min-h-[calc(100dvh-5.5rem)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(234,88,12,0.14),transparent_32%)] dark:bg-[radial-gradient(circle_at_18%_20%,rgba(234,88,12,0.24),transparent_34%)]" />
        <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-lg flex-col justify-center px-4 py-14 sm:px-5 lg:px-8">
          <div className="rounded-[2rem] border border-slate-300 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/15 dark:bg-white/10 sm:p-10">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-orange-600 sm:text-xs sm:tracking-[0.28em]">
              MDPL · Instructor
            </p>
            <h1 className="mydojo-display text-3xl font-black italic tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Instructor Sign In
            </h1>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-600 dark:text-white/70">
              Instructor access is being prepared for academy and training operations.
            </p>
            <Link
              to="/join-mydojo"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-orange-500/80 bg-orange-600 px-6 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-700"
            >
              <ArrowLeft size={18} strokeWidth={2.5} className="shrink-0" />
              Back to MyDojo
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
