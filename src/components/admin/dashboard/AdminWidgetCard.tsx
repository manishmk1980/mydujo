import type { ReactNode } from 'react';

type AdminWidgetCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function AdminWidgetCard({
  title,
  subtitle,
  children,
  className = '',
}: AdminWidgetCardProps) {
  return (
    <section
      className={[
        'rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-950/5',
        className,
      ].join(' ')}
    >
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>

        {subtitle ? (
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}