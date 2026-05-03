import React from 'react';

interface OnboardingFormCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  padding?: string;
  className?: string;
}

export function OnboardingFormCard({
  children,
  title,
  subtitle,
  padding = 'p-8',
  className = '',
}: OnboardingFormCardProps) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900/25 ${className}`}
    >
      {(title || subtitle) && (
        <div className="border-b border-slate-100 bg-slate-50 px-8 py-6">
          {title && <h2 className="text-xl font-black text-slate-900">{title}</h2>}
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  );
}