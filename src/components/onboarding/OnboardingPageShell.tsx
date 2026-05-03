import React from 'react';
import PublicLayout from '../public/PublicLayout';

interface OnboardingPageShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
}

/**
 * Public MDPL shell for onboarding flows (matches marketing site chrome).
 */
export function OnboardingPageShell({
  children,
  title,
  subtitle,
  maxWidth = 'max-w-4xl',
}: OnboardingPageShellProps) {
  return (
    <PublicLayout>
      <section className="relative min-w-0 px-3 pb-12 pt-4 sm:px-5 sm:pb-16 sm:pt-6 lg:px-8">
        <div className={`mx-auto min-w-0 ${maxWidth}`}>
          {(title || subtitle) && (
            <div className="mb-8 text-center">
              {title && (
                <h1 className="mydojo-display text-[clamp(1.5rem,5vw,2.25rem)] font-black text-slate-950 dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-white/70 sm:text-base">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    </PublicLayout>
  );
}