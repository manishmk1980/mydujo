import React from 'react';
import { LucideIcon } from 'lucide-react';

interface OnboardingHeroProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export function OnboardingHero({
  icon: Icon,
  title,
  subtitle,
  iconBgColor = 'bg-[var(--mdpl-accent-soft)]',
  iconColor = 'text-[color:var(--mdpl-accent)]',
}: OnboardingHeroProps) {
  return (
    <div className="mb-8 text-center sm:mb-10">
      {Icon && (
        <div className={`mb-4 inline-flex items-center justify-center rounded-2xl p-3 sm:p-4 ${iconBgColor} ${iconColor}`}>
          <Icon className="size-7 sm:size-8" />
        </div>
      )}
      <h1 className="px-1 text-2xl font-black leading-tight text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
      {subtitle && (
        <p className="mx-auto mt-2 max-w-2xl px-1 text-sm leading-relaxed text-slate-500 dark:text-white/70 sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}