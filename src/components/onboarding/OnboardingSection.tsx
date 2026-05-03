import React from 'react';

interface OnboardingSectionProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  columns?: 1 | 2 | 3;
  gap?: string;
  className?: string;
}

export function OnboardingSection({
  children,
  title,
  description,
  columns = 2,
  gap = 'gap-6',
  className = '',
}: OnboardingSectionProps) {
  const gridClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-slate-900">{title}</h3>}
          {description && <p className="text-slate-500 text-sm">{description}</p>}
        </div>
      )}
      <div className={`grid ${gridClass} ${gap}`}>
        {children}
      </div>
    </div>
  );
}